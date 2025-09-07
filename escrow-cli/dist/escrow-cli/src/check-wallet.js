// Simple wallet balance checker for Midnight testnet
import 'dotenv/config';
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
            console.log(`  Sync progress - Backend lag: ${sourceGap}, wallet lag: ${applyGap}`);
        }
    }), Rx.filter((state) => state.syncProgress?.synced === true), Rx.take(1)));
}
async function main() {
    // Set network ID to TestNet
    setNetworkId(NetworkId.TestNet);
    console.log('========================================');
    console.log('   Midnight Wallet Balance Checker');
    console.log('   Network: TESTNET-02');
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
        console.log('Checking wallet balance...\n');
        // Build wallet
        console.log('Building wallet...');
        const wallet = await WalletBuilder.buildFromSeed(TESTNET_CONFIG.indexer, TESTNET_CONFIG.indexerWS, TESTNET_CONFIG.proofServer, TESTNET_CONFIG.node, walletSeed, getZswapNetworkId(), 'info');
        wallet.start();
        // Wait for initial sync
        console.log('Waiting for wallet to sync with testnet...');
        await waitForSync(wallet);
        const state = await Rx.firstValueFrom(wallet.state());
        console.log('✓ Wallet synced!\n');
        console.log('========================================');
        console.log('   WALLET INFORMATION');
        console.log('========================================');
        console.log('Wallet address:', state.address);
        // Check current balance
        const balance = state.balances[nativeToken()] ?? 0n;
        console.log('Balance:', balance.toString(), 'tDUST');
        if (balance === 0n) {
            console.log('\n⚠️  Wallet has no funds!');
            console.log('    You can request testnet tokens from:');
            console.log('    https://discord.gg/midnightnetwork');
        }
        else {
            console.log('\n✓ Wallet has funds and is ready for deployment');
        }
        console.log('========================================\n');
        // Print transaction history if any
        if (state.transactionHistory && state.transactionHistory.length > 0) {
            console.log('Recent transactions:', state.transactionHistory.length);
            state.transactionHistory.slice(0, 5).forEach((tx, index) => {
                console.log(`  ${index + 1}. TxID: ${tx.txId || 'N/A'}`);
            });
        }
        // Clean up
        await wallet.close();
        console.log('\nWallet closed.');
        process.exit(0);
    }
    catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.message?.includes('ECONNREFUSED')) {
            console.error('\n📝 Make sure the proof server is running:');
            console.error('   It should be accessible at', TESTNET_CONFIG.proofServer);
        }
        if (error.message?.includes('Failed to fetch')) {
            console.error('\n📝 Network connection issue. Please check:');
            console.error('   - Your internet connection');
            console.error('   - The testnet endpoints are accessible');
        }
        process.exit(1);
    }
}
// Run the balance checker
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=check-wallet.js.map