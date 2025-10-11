import 'dotenv/config';
import logger from './logger.js';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { getZswapNetworkId, setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { nativeToken } from '@midnight-ntwrk/ledger';
import * as Rx from 'rxjs';
import * as path from 'path';
import { fileURLToPath } from 'url';
// Import contract from the compiled files
import { Contract } from '../../contract/src/managed/escrow/contract/index.cjs';
import { witnesses } from '../../contract/src/witnesses.js';
// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Testnet Configuration
const TESTNET_CONFIG = {
    indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
    node: 'https://rpc.testnet-02.midnight.network',
    proofServer: 'https://midnight-proofserver.socious.io',
};
// Contract address to test
const CONTRACT_ADDRESS = '02005a47f7e241f8fab6f4029fba7d644072ee1f503f8b0aeafd931745df02c3aa3f';
async function waitForSync(wallet) {
    return Rx.firstValueFrom(wallet.state().pipe(Rx.throttleTime(5_000), Rx.tap((state) => {
        const applyGap = state.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = state.syncProgress?.lag.sourceGap ?? 0n;
        if (sourceGap > 0n || applyGap > 0n) {
            logger.info(`  Sync progress - Backend lag: ${sourceGap}, wallet lag: ${applyGap}`);
        }
    }), Rx.filter((state) => state.syncProgress?.synced === true), Rx.take(1)));
}
async function main() {
    setNetworkId(NetworkId.TestNet);
    logger.info('========================================');
    logger.info('   Test Join Escrow Contract');
    logger.info('========================================\\n');
    try {
        const walletSeed = process.env.WALLET_SEED;
        if (!walletSeed) {
            logger.error('❌ Error: WALLET_SEED environment variable is not set');
            process.exit(1);
        }
        logger.info('Building wallet...');
        const wallet = await WalletBuilder.buildFromSeed(TESTNET_CONFIG.indexer, TESTNET_CONFIG.indexerWS, TESTNET_CONFIG.proofServer, TESTNET_CONFIG.node, walletSeed, getZswapNetworkId(), 'info');
        wallet.start();
        logger.info('Waiting for wallet to sync...');
        await waitForSync(wallet);
        const state = await Rx.firstValueFrom(wallet.state());
        logger.info(`✓ Wallet synced: ${state.address}`);
        const balance = state.balances[nativeToken()] ?? 0n;
        logger.info(`  Balance: ${balance.toString()} tDUST`);
        // Create providers
        logger.info('\\nCreating providers...');
        const publicDataProvider = indexerPublicDataProvider(TESTNET_CONFIG.indexer, TESTNET_CONFIG.indexerWS);
        const zkConfigPath = path.resolve(__dirname, '..', '..', 'contract', 'src', 'managed', 'escrow');
        const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
        const proofProvider = httpClientProofProvider(TESTNET_CONFIG.proofServer);
        const privateStateProvider = await levelPrivateStateProvider({
            privateStateStoreName: 'escrow-test-join',
        });
        const providers = {
            publicDataProvider,
            zkConfigProvider,
            proofProvider,
            privateStateProvider,
        };
        logger.info('✓ Providers created\\n');
        // Try to join the contract
        logger.info(`Attempting to join contract at: ${CONTRACT_ADDRESS}`);
        logger.info('This may take a moment...');
        const escrow = new Contract(witnesses);
        const found = await findDeployedContract(providers, {
            contractAddress: CONTRACT_ADDRESS,
            contract: escrow,
            privateStateId: 'escrow-test-join',
            initialPrivateState: {},
        });
        logger.info('\\n========================================');
        logger.info('   SUCCESS!');
        logger.info('========================================');
        logger.info(`Joined contract at: ${found.deployTxData.public.contractAddress}`);
        logger.info(`Transaction ID: ${found.deployTxData.public.txId}`);
        logger.info(`Block Height: ${found.deployTxData.public.blockHeight}`);
        logger.info('========================================\\n');
        await wallet.close();
        process.exit(0);
    }
    catch (error) {
        logger.error(`\\n❌ Failed to join contract: ${error.message}`);
        logger.error(error.stack);
        process.exit(1);
    }
}
main().catch((error) => {
    logger.error(`Fatal error: ${error}`);
    process.exit(1);
});
//# sourceMappingURL=test-join.js.map