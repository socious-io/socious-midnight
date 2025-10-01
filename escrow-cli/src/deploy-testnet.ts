// Escrow Contract Testnet Deployment Script
import 'dotenv/config';
import logger from './logger.js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { getZswapNetworkId, getLedgerNetworkId, setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { nativeToken, Transaction } from '@midnight-ntwrk/ledger';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import { createBalancedTx } from '@midnight-ntwrk/midnight-js-types';
import * as Rx from 'rxjs';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import contract from the compiled files
import { Contract } from '../../contract/src/managed/escrow/contract/index.cjs';
import { witnesses } from '../../contract/src/witnesses.js';

// Testnet Configuration
const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  node: 'https://rpc.testnet-02.midnight.network',
  proofServer: 'https://midnight-proofserver.socious.io',
};

// Generate random seed for new wallet or use existing one
function _generateSeed(): string {
  const bytes = crypto.randomBytes(32);
  return bytes.toString('hex');
}

async function waitForSync(wallet: any) {
  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.tap((state: any) => {
        const applyGap = state.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = state.syncProgress?.lag.sourceGap ?? 0n;
        if (sourceGap > 0n || applyGap > 0n) {
          logger.info(`  Sync progress - Backend lag: ${sourceGap}, wallet lag: ${applyGap}`);
        }
      }),
      Rx.filter((state: any) => state.syncProgress?.synced === true),
      Rx.take(1),
    ),
  );
}

async function main() {
  // Set network ID to TestNet
  setNetworkId(NetworkId.TestNet);

  logger.info('========================================');
  logger.info('   Midnight Escrow Contract Deployment');
  logger.info('   Network: TESTNET');
  logger.info('========================================\n');

  logger.info('Configuration:');
  logger.info(`- Indexer: ${TESTNET_CONFIG.indexer}`);
  logger.info(`- Node: ${TESTNET_CONFIG.node}`);
  logger.info(`- Proof Server: ${TESTNET_CONFIG.proofServer}`);
  logger.info('');

  try {
    // Get wallet seed from environment variable
    const walletSeed = process.env.WALLET_SEED;
    if (!walletSeed) {
      logger.error('❌ Error: WALLET_SEED environment variable is not set');
      logger.error('\nPlease set your wallet seed:');
      logger.error('  export WALLET_SEED="your-wallet-seed-here"');
      logger.error('\nOr create a .env file with:');
      logger.error('  WALLET_SEED=your-wallet-seed-here');
      process.exit(1);
    }

    logger.info('Using wallet seed from environment variable');

    // Build wallet
    logger.info('\nBuilding wallet...');
    const wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      walletSeed,
      getZswapNetworkId(),
      'info',
    );

    wallet.start();

    // Wait for initial sync
    logger.info('Waiting for wallet to sync with testnet...');
    await waitForSync(wallet);

    const state = await Rx.firstValueFrom(wallet.state());
    logger.info('✓ Wallet synced and ready');
    logger.info(`  Wallet address: ${state.address}`);

    // Check current balance
    logger.info('\nChecking wallet balance...');
    let balance: bigint = state.balances[nativeToken()] ?? 0n;
    logger.info(`  Current balance: ${balance.toString()} tDUST`);

    if (balance === 0n) {
      logger.info('\n⚠️  Wallet has no funds!');
      logger.info('    Please fund your wallet with testnet tokens.');
      logger.info(`    Wallet address: ${state.address}`);
      logger.info('\n    You can request testnet tokens from:');
      logger.info('    https://discord.gg/midnightnetwork');
      logger.info('\n    Exiting. Please run this script again after funding the wallet.');
      process.exit(0);
    }

    logger.info('\n✓ Wallet has sufficient funds to proceed');
    logger.info(`  Balance: ${balance.toString()} tDUST`);
    logger.info('');

    // Create providers
    logger.info('Creating providers...');
    const publicDataProvider = indexerPublicDataProvider(TESTNET_CONFIG.indexer, TESTNET_CONFIG.indexerWS);
    const zkConfigPath = path.resolve(__dirname, '..', '..', 'contract', 'src', 'managed', 'escrow');
    const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
    const proofProvider = httpClientProofProvider(TESTNET_CONFIG.proofServer);
    const privateStateProvider = await levelPrivateStateProvider({
      privateStateStoreName: 'escrow-private-state-testnet',
    });

    // Create wallet provider
    const walletProvider = {
      coinPublicKey: state.coinPublicKey,
      encryptionPublicKey: state.encryptionPublicKey,
      balanceTx: async (tx: any, newCoins: any) => {
        return wallet
          .balanceTransaction(
            ZswapTransaction.deserialize(tx.serialize(getLedgerNetworkId()), getZswapNetworkId()),
            newCoins,
          )
          .then((tx: any) => wallet.proveTransaction(tx))
          .then((zswapTx: any) => Transaction.deserialize(zswapTx.serialize(getZswapNetworkId()), getLedgerNetworkId()))
          .then(createBalancedTx);
      },
      submitTx: async (tx: any) => {
        return wallet.submitTransaction(tx);
      },
    };

    const providers = {
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      privateStateProvider,
      walletProvider,
      midnightProvider: walletProvider,
    };

    logger.info('✓ Providers created\n');

    // Deploy contract
    logger.info('Deploying contract to testnet...');
    logger.info('This may take several minutes while generating proofs...');

    const escrow = new Contract(witnesses);
    const deployed = await deployContract(providers as any, {
      contract: escrow,
      privateStateId: 'escrow-private-state-testnet',
      initialPrivateState: {},
    });

    const contractAddress = deployed.deployTxData.public.contractAddress;
    const txId = deployed.deployTxData.public.txId;
    const blockHeight = deployed.deployTxData.public.blockHeight;

    logger.info('✓ Contract deployed!\n');

    logger.info('========================================');
    logger.info('   DEPLOYMENT SUCCESSFUL');
    logger.info('========================================');
    logger.info(`CONTRACT ADDRESS: ${contractAddress}`);
    logger.info(`Transaction ID: ${txId}`);
    logger.info(`Block Height: ${blockHeight}`);
    logger.info('========================================\n');

    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      transactionId: txId,
      blockHeight,
      walletAddress: state.address,
      network: 'testnet',
      deployedAt: new Date().toISOString(),
      config: TESTNET_CONFIG,
    };

    await fs.writeFile(
      './deployment-testnet.json',
      JSON.stringify(deploymentInfo, null, 2),
    );
    logger.info('Deployment info saved to deployment-testnet.json');

    // Note: We only save metadata. The actual deployed contract object with callTx methods
    // will be reconstructed in the browser using the contract instance + providers.
    // This is sufficient for browser-side reconstruction without needing the indexer.
    logger.info('\nView your contract on the explorer:');
    logger.info(`https://explorer.testnet.midnight.network/contracts/${contractAddress}`);

    // Clean up
    await wallet.close();

    process.exit(0);
  } catch (error: any) {
    logger.error(`\n❌ Deployment failed: ${error}`);
    if (error.message?.includes('ECONNREFUSED')) {
      logger.error('\n📝 Make sure the proof server is running:');
      logger.error(`   It should be accessible at ${TESTNET_CONFIG.proofServer}`);
    }
    if (error.message?.includes('insufficient funds')) {
      logger.error('\n💰 Insufficient funds in wallet.');
      logger.error('   Request testnet tokens from https://discord.gg/midnightnetwork');
    }
    process.exit(1);
  }
}

// Run deployment
main().catch((error) => {
  logger.error(`Fatal error: ${error}`);
  process.exit(1);
});
