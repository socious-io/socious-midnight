// Escrow Contract Deployment Script
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import logger from './logger.js';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { getZswapNetworkId, getLedgerNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { nativeToken, Transaction } from '@midnight-ntwrk/ledger';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import { createBalancedTx } from '@midnight-ntwrk/midnight-js-types';
import * as Rx from 'rxjs';
import * as fs from 'fs/promises';
// Import contract from the local package
import { Contract, witnesses } from 'socious-midnight';
// Genesis wallet seed for standalone network
const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';
// Configuration for standalone network
const CONFIG = {
    indexer: 'http://localhost:8088/api/v1',
    indexerWS: 'ws://localhost:8088/api/v1/graphql/subscription',
    node: 'ws://localhost:9944',
    proofServer: 'http://localhost:6300',
};
async function waitForFunds(wallet) {
    return Rx.firstValueFrom(wallet.state().pipe(Rx.throttleTime(5_000), Rx.tap((state) => {
        const applyGap = state.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = state.syncProgress?.lag.sourceGap ?? 0n;
        logger.info(`Waiting for sync. Backend lag: ${sourceGap}, wallet lag: ${applyGap}`);
    }), Rx.filter((state) => state.syncProgress?.synced === true), Rx.map((s) => s.balances[nativeToken()] ?? 0n), Rx.filter((balance) => balance > 0n)));
}
async function main() {
    logger.info('========================================');
    logger.info('   Midnight Escrow Contract Deployment');
    logger.info('   Network: STANDALONE (LOCAL)');
    logger.info('========================================\n');
    logger.info('Configuration:');
    logger.info(`- Indexer: ${CONFIG.indexer}`);
    logger.info(`- Node: ${CONFIG.node}`);
    logger.info(`- Proof Server: ${CONFIG.proofServer}`);
    logger.info('');
    try {
        // Build wallet with genesis seed (has initial funds in standalone)
        logger.info('Building wallet with genesis seed...');
        const wallet = await WalletBuilder.buildFromSeed(CONFIG.indexer, CONFIG.indexerWS, CONFIG.proofServer, CONFIG.node, GENESIS_MINT_WALLET_SEED, getZswapNetworkId(), 'info');
        wallet.start();
        const state = await Rx.firstValueFrom(wallet.state());
        logger.info('✓ Wallet created');
        logger.info(`  Wallet address: ${state.address}`);
        // Wait for funds
        const balance = await waitForFunds(wallet);
        logger.info(`  Balance: ${balance.toString()}`);
        logger.info('');
        // Create providers
        logger.info('Creating providers...');
        const publicDataProvider = indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS);
        const zkConfigProvider = new NodeZkConfigProvider(CONFIG.node);
        const proofProvider = httpClientProofProvider(CONFIG.proofServer);
        const privateStateProvider = await levelPrivateStateProvider({
            privateStateStoreName: 'escrow-private-state',
        });
        // Create wallet provider
        const walletProvider = {
            coinPublicKey: state.coinPublicKey,
            encryptionPublicKey: state.encryptionPublicKey,
            balanceTx: async (tx, newCoins) => {
                return wallet
                    .balanceTransaction(ZswapTransaction.deserialize(tx.serialize(getLedgerNetworkId()), getZswapNetworkId()), newCoins)
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
        logger.info('✓ Providers created\n');
        // Deploy contract
        logger.info('Deploying contract...');
        logger.info('This may take a moment while generating proofs...');
        const escrow = new Contract(witnesses);
        const deployed = await deployContract(providers, {
            contract: escrow,
            privateStateId: 'escrow-private-state',
            initialPrivateState: {},
        });
        const contractAddress = deployed.deployTxData.public.contractAddress;
        logger.info('✓ Contract deployed!\n');
        logger.info('========================================');
        logger.info('   DEPLOYMENT SUCCESSFUL');
        logger.info('========================================');
        logger.info(`CONTRACT ADDRESS: ${contractAddress}`);
        logger.info('========================================\n');
        // Save deployment info
        await fs.writeFile('./deployment.json', JSON.stringify({
            contractAddress,
            walletAddress: state.address,
            network: 'standalone',
            deployedAt: new Date().toISOString(),
            config: CONFIG,
        }, null, 2));
        logger.info('Deployment info saved to deployment.json');
        // Clean up
        await wallet.close();
        process.exit(0);
    }
    catch (error) {
        logger.error(`\n❌ Deployment failed: ${error}`);
        if (error.message?.includes('ECONNREFUSED')) {
            logger.error('\n📝 Make sure the Midnight node and indexer are running:');
            logger.error('   docker compose -f standalone.yml up -d');
        }
        process.exit(1);
    }
}
// Run deployment
main().catch((error) => {
    logger.error(`Fatal error: ${error}`);
    process.exit(1);
});
//# sourceMappingURL=deploy-escrow.js.map