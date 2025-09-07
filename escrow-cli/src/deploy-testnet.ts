// Escrow Contract Testnet Deployment Script
import 'dotenv/config';
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
  proofServer: 'http://localhost:6300', // Using local proof server
};

// Generate random seed for new wallet or use existing one
function generateSeed(): string {
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
          console.log(`  Sync progress - Backend lag: ${sourceGap}, wallet lag: ${applyGap}`);
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
  
  console.log('========================================');
  console.log('   Midnight Escrow Contract Deployment');
  console.log('   Network: TESTNET');
  console.log('========================================\n');

  console.log('Configuration:');
  console.log('- Indexer:', TESTNET_CONFIG.indexer);
  console.log('- Node:', TESTNET_CONFIG.node);
  console.log('- Proof Server:', TESTNET_CONFIG.proofServer);
  console.log();

  try {
    // Get wallet seed from environment variable
    const walletSeed = process.env.WALLET_SEED;
    if (!walletSeed) {
      console.error('❌ Error: WALLET_SEED environment variable is not set');
      console.error('\nPlease set your wallet seed:');
      console.error('  export WALLET_SEED="your-wallet-seed-here"');
      console.error('\nOr create a .env file with:');
      console.error('  WALLET_SEED=your-wallet-seed-here');
      process.exit(1);
    }
    
    console.log('Using wallet seed from environment variable');

    // Build wallet
    console.log('\nBuilding wallet...');
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
    console.log('Waiting for wallet to sync with testnet...');
    await waitForSync(wallet);
    
    const state = await Rx.firstValueFrom(wallet.state());
    console.log('✓ Wallet synced and ready');
    console.log('  Wallet address:', state.address);
    
    // Check current balance
    console.log('\nChecking wallet balance...');
    let balance: bigint = state.balances[nativeToken()] ?? 0n;
    console.log('  Current balance:', balance.toString(), 'tDUST');
    
    if (balance === 0n) {
      console.log('\n⚠️  Wallet has no funds!');
      console.log('    Please fund your wallet with testnet tokens.');
      console.log('    Wallet address:', state.address);
      console.log('\n    You can request testnet tokens from:');
      console.log('    https://discord.gg/midnightnetwork');
      console.log('\n    Exiting. Please run this script again after funding the wallet.');
      process.exit(0);
    }

    console.log('\n✓ Wallet has sufficient funds to proceed');
    console.log('  Balance:', balance.toString(), 'tDUST');
    console.log();

    // Create providers
    console.log('Creating providers...');
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

    console.log('✓ Providers created\n');

    // Deploy contract
    console.log('Deploying contract to testnet...');
    console.log('This may take several minutes while generating proofs...');

    const escrow = new Contract(witnesses);
    const deployed = await deployContract(providers as any, {
      contract: escrow,
      privateStateId: 'escrow-private-state-testnet',
      initialPrivateState: {},
    });

    const contractAddress = deployed.deployTxData.public.contractAddress;
    const txId = deployed.deployTxData.public.txId;
    const blockHeight = deployed.deployTxData.public.blockHeight;

    console.log('✓ Contract deployed!\n');

    console.log('========================================');
    console.log('   DEPLOYMENT SUCCESSFUL');
    console.log('========================================');
    console.log('CONTRACT ADDRESS:', contractAddress);
    console.log('Transaction ID:', txId);
    console.log('Block Height:', blockHeight);
    console.log('========================================\n');

    // Save deployment info
    await fs.writeFile(
      './deployment-testnet.json',
      JSON.stringify(
        {
          contractAddress,
          transactionId: txId,
          blockHeight,
          walletAddress: state.address,
          network: 'testnet',
          deployedAt: new Date().toISOString(),
          config: TESTNET_CONFIG,
        },
        null,
        2,
      ),
    );
    console.log('Deployment info saved to deployment-testnet.json');
    console.log('\nView your contract on the explorer:');
    console.log(`https://explorer.testnet.midnight.network/contracts/${contractAddress}`);

    // Clean up
    await wallet.close();

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Deployment failed:', error);
    if (error.message?.includes('ECONNREFUSED')) {
      console.error('\n📝 Make sure the proof server is running:');
      console.error('   It should be accessible at', TESTNET_CONFIG.proofServer);
    }
    if (error.message?.includes('insufficient funds')) {
      console.error('\n💰 Insufficient funds in wallet.');
      console.error('   Request testnet tokens from https://discord.gg/midnightnetwork');
    }
    process.exit(1);
  }
}

// Run deployment
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
