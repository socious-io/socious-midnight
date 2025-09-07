#!/usr/bin/env node
// Escrow Contract Testnet Deployment - CommonJS version

const { deployContract } = require('@midnight-ntwrk/midnight-js-contracts');
const { indexerPublicDataProvider } = require('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
const { NodeZkConfigProvider } = require('@midnight-ntwrk/midnight-js-node-zk-config-provider');
const { httpClientProofProvider } = require('@midnight-ntwrk/midnight-js-http-client-proof-provider');
const { levelPrivateStateProvider } = require('@midnight-ntwrk/midnight-js-level-private-state-provider');
const { WalletBuilder } = require('@midnight-ntwrk/wallet');
const { getZswapNetworkId, getLedgerNetworkId } = require('@midnight-ntwrk/midnight-js-network-id');
const { nativeToken, Transaction } = require('@midnight-ntwrk/ledger');
const { Transaction: ZswapTransaction } = require('@midnight-ntwrk/zswap');
const { createBalancedTx } = require('@midnight-ntwrk/midnight-js-types');
const Rx = require('rxjs');
const fs = require('fs/promises');
const crypto = require('crypto');

// Import the compiled escrow contract
const { Contract: EscrowContract } = require('../contract/src/managed/escrow/contract/index.cjs');
const { witnesses } = require('../contract/src/witnesses.js');

// Testnet Configuration
const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet.midnight.network/api/v1',
  indexerWS: 'wss://indexer.testnet.midnight.network/api/v1/graphql/subscription',
  node: 'wss://rpc.testnet.midnight.network',
  proofServer: 'http://localhost:6300', // Using local proof server
};

// Generate random seed for new wallet or use existing one
function generateSeed() {
  const bytes = crypto.randomBytes(32);
  return bytes.toString('hex');
}

async function waitForFunds(wallet) {
  console.log('Waiting for wallet to sync with testnet...');
  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.tap((state) => {
        const applyGap = state.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = state.syncProgress?.lag.sourceGap ?? 0n;
        console.log(`Sync progress - Backend lag: ${sourceGap}, wallet lag: ${applyGap}`);
      }),
      Rx.filter((state) => state.syncProgress?.synced === true),
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.tap((balance) => {
        if (balance === 0n) {
          console.log('Wallet synced but no funds detected.');
          console.log('Please fund your wallet with testnet tokens.');
        }
      }),
      Rx.filter((balance) => balance > 0n),
    ),
  );
}

async function main() {
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
    // Use the provided wallet seed with existing tDUST
    const walletSeed = 'a7dff47c1eb77b2b5aa05a93f328940092f56a54d77a5027f91d7c6012249608';
    console.log('Using wallet seed with existing tDUST balance');
    
    // Build wallet
    console.log('\nBuilding wallet...');
    const wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      walletSeed,
      getZswapNetworkId(),
      'info'
    );
    
    wallet.start();
    
    const state = await Rx.firstValueFrom(wallet.state());
    console.log('✓ Wallet created');
    console.log('  Wallet address:', state.address);
    console.log();
    
    // Check balance
    let balance = state.balances[nativeToken()] ?? 0n;
    if (balance === 0n) {
      console.log('⚠️  Wallet has no funds!');
      console.log('    Please fund your wallet with testnet tokens.');
      console.log('    Wallet address:', state.address);
      console.log('\n    You can request testnet tokens from:');
      console.log('    https://discord.gg/midnightnetwork');
      console.log('\n    Waiting for funds...');
      
      balance = await waitForFunds(wallet);
    }
    
    console.log('  Balance:', balance.toString(), 'tDUST');
    console.log();
    
    // Create providers
    console.log('Creating providers...');
    const publicDataProvider = indexerPublicDataProvider(TESTNET_CONFIG.indexer, TESTNET_CONFIG.indexerWS);
    const zkConfigProvider = new NodeZkConfigProvider(TESTNET_CONFIG.node);
    const proofProvider = httpClientProofProvider(TESTNET_CONFIG.proofServer);
    const privateStateProvider = await levelPrivateStateProvider({
      privateStateStoreName: 'escrow-private-state-testnet',
    });
    
    // Create wallet provider
    const walletProvider = {
      coinPublicKey: state.coinPublicKey,
      encryptionPublicKey: state.encryptionPublicKey,
      balanceTx: async (tx, newCoins) => {
        return wallet
          .balanceTransaction(
            ZswapTransaction.deserialize(tx.serialize(getLedgerNetworkId()), getZswapNetworkId()),
            newCoins,
          )
          .then((tx) => wallet.proveTransaction(tx))
          .then((zswapTx) => Transaction.deserialize(zswapTx.serialize(getZswapNetworkId()), getLedgerNetworkId()))
          .then(createBalancedTx);
      },
      submitTx: async (tx) => {
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
    
    const escrow = new EscrowContract(witnesses);
    const deployed = await deployContract(providers, {
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
      JSON.stringify({
        contractAddress,
        transactionId: txId,
        blockHeight,
        walletAddress: state.address,
        network: 'testnet',
        deployedAt: new Date().toISOString(),
        config: TESTNET_CONFIG,
      }, null, 2)
    );
    console.log('Deployment info saved to deployment-testnet.json');
    console.log('\nView your contract on the explorer:');
    console.log(`https://explorer.testnet.midnight.network/contracts/${contractAddress}`);
    
    // Clean up
    await wallet.close();
    
    process.exit(0);
    
  } catch (error) {
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
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});