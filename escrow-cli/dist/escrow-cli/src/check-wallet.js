// Simple wallet balance checker for Midnight testnet
import 'dotenv/config';
import logger from './logger.js';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { getZswapNetworkId, setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { nativeToken } from '@midnight-ntwrk/ledger';
import * as Rx from 'rxjs';
// Testnet Configuration
const TESTNET_CONFIG = {
    indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
    node: 'https://rpc.testnet-02.midnight.network',
    proofServer: 'http://localhost:6300',
};
// Function to wait for wallet sync
async function waitForSync(wallet) {
    return Rx.firstValueFrom(wallet.state().pipe(Rx.throttleTime(2_000), Rx.tap((state) => {
        const applyGap = state.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = state.syncProgress?.lag.sourceGap ?? 0n;
        if (sourceGap > 0n || applyGap > 0n) {
            logger.info(`  Sync progress - Backend lag: ${sourceGap}, wallet lag: ${applyGap}`);
        }
    }), Rx.filter((state) => state.syncProgress?.synced === true), Rx.take(1)));
}
async function main() {
    // Set network ID to TestNet
    setNetworkId(NetworkId.TestNet);
    logger.info('========================================');
    logger.info('   Midnight Wallet Balance Checker');
    logger.info('   Network: TESTNET-02');
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
        logger.info('Checking wallet balance...\n');
        // Build wallet
        logger.info('Building wallet...');
        const wallet = await WalletBuilder.buildFromSeed(TESTNET_CONFIG.indexer, TESTNET_CONFIG.indexerWS, TESTNET_CONFIG.proofServer, TESTNET_CONFIG.node, walletSeed, getZswapNetworkId(), 'info');
        wallet.start();
        // Wait for initial sync
        logger.info('Waiting for wallet to sync with testnet...');
        await waitForSync(wallet);
        const state = await Rx.firstValueFrom(wallet.state());
        logger.info('✓ Wallet synced!\n');
        logger.info('========================================');
        logger.info('   WALLET INFORMATION');
        logger.info('========================================');
        logger.info(`Wallet address: ${state.address}`);
        // Check current balance
        const balance = state.balances[nativeToken()] ?? 0n;
        logger.info(`Balance: ${balance.toString()} tDUST`);
        if (balance === 0n) {
            logger.info('\n⚠️  Wallet has no funds!');
            logger.info('    You can request testnet tokens from:');
            logger.info('    https://discord.gg/midnightnetwork');
        }
        else {
            logger.info('\n✓ Wallet has funds and is ready for deployment');
        }
        logger.info('========================================\n');
        // Print transaction history if any
        if (state.transactionHistory && state.transactionHistory.length > 0) {
            logger.info(`Recent transactions: ${state.transactionHistory.length}`);
            state.transactionHistory.slice(0, 5).forEach((tx, index) => {
                logger.info(`  ${index + 1}. TxID: ${tx.txId || 'N/A'}`);
            });
        }
        // Clean up
        await wallet.close();
        logger.info('\nWallet closed.');
        process.exit(0);
    }
    catch (error) {
        logger.error(`\n❌ Error: ${error.message}`);
        if (error.message?.includes('ECONNREFUSED')) {
            logger.error('\n📝 Make sure the proof server is running:');
            logger.error(`   It should be accessible at ${TESTNET_CONFIG.proofServer}`);
        }
        if (error.message?.includes('Failed to fetch')) {
            logger.error('\n📝 Network connection issue. Please check:');
            logger.error('   - Your internet connection');
            logger.error('   - The testnet endpoints are accessible');
        }
        process.exit(1);
    }
}
// Run the balance checker
main().catch((error) => {
    logger.error(`Fatal error: ${error}`);
    process.exit(1);
});
//# sourceMappingURL=check-wallet.js.map