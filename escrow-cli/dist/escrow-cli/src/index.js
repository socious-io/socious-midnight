// Escrow Contract Deployment and Interaction
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
// import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import logger from './logger.js';
// Import the compiled escrow contract
import { Contract as EscrowContract, } from '../../contract/src/managed/escrow/contract/index.cjs';
import * as fs from 'fs/promises';
// Helper to create wallet and providers
export async function createWalletAndProviders(config) {
    // Create wallet using WalletBuilder
    const testSeed = 'a7dff47c1eb77b2b5aa05a93f328940092f56a54d77a5027f91d7c6012249608'; // Your testnet seed
    const indexerWsUri = config.indexer.replace('http', 'ws').replace('/api/v1', '/api/v1/graphql/subscription');
    const wallet = await WalletBuilder.build(config.indexer, indexerWsUri, config.proofServer, config.node, testSeed, 'standalone', // network ID for local
    'info');
    // Start the wallet
    wallet.start();
    // Create other providers
    const publicDataProvider = indexerPublicDataProvider(config.indexer, indexerWsUri);
    const zkConfigProvider = new NodeZkConfigProvider(config.node);
    const proofProvider = httpClientProofProvider(config.proofServer);
    const privateStateProvider = await levelPrivateStateProvider({
        privateStateStoreName: 'escrow-private-state',
    });
    return {
        wallet,
        providers: {
            publicDataProvider,
            zkConfigProvider,
            proofProvider,
            privateStateProvider,
            walletProvider: wallet,
        },
    };
}
// Deploy function
export async function deployEscrow(providers) {
    logger.info('Deploying Escrow contract...');
    // Create contract instance (no witnesses required)
    const escrow = new EscrowContract({});
    // Deploy contract
    const deployed = await deployContract(providers, {
        contract: escrow,
        privateStateId: 'escrow-private-state',
        initialPrivateState: {}, // Empty state since no witnesses
    });
    logger.info('Contract deployed successfully!');
    return deployed;
}
// Helper to get contract state
export function getContractState(ledger) {
    return {
        lastEscrowId: ledger.last_escrow_id,
        escrows: ledger.escrows,
        instance: ledger.instance,
    };
}
// Main deployment execution
async function main() {
    // Use local standalone configuration
    // const TEST_MNEMONIC = 'test test test test test test test test test test test junk'; // Reserved for future use
    const CONFIG = {
        indexer: process.env.INDEXER_URL || 'http://localhost:8088/api/v1',
        node: process.env.NODE_URL || 'ws://localhost:9944',
        proofServer: process.env.PROOF_SERVER_URL || 'https://midnight-proofserver.socious.io',
    };
    logger.info('========================================');
    logger.info('   Midnight Escrow Contract Deployment');
    logger.info('   Network: STANDALONE (LOCAL)');
    logger.info('========================================\n');
    logger.info('Configuration:');
    logger.info(`- Indexer: ${CONFIG.indexer}`);
    logger.info(`- Node: ${CONFIG.node}`);
    logger.info(`- Proof Server: ${CONFIG.proofServer}`);
    try {
        // Create wallet and providers
        logger.info('Creating wallet and providers...');
        const { wallet, providers } = await createWalletAndProviders(CONFIG);
        logger.info('✓ Wallet and providers created');
        const walletState = wallet.state();
        const walletAddress = await new Promise((resolve) => {
            walletState.subscribe((state) => {
                resolve(state.address);
            });
        });
        logger.info(`  Wallet address: ${walletAddress}`);
        // Get balance
        try {
            const balances = await new Promise((resolve) => {
                walletState.subscribe((state) => {
                    resolve(state.balances);
                });
            });
            logger.info(`  Balance: ${balances}`);
        }
        catch {
            logger.warn('  Balance: Unable to fetch (node may be initializing)');
        }
        // Deploy contract
        logger.info('Deploying contract...');
        logger.info('This may take a moment while generating proofs...');
        const deployed = await deployEscrow(providers);
        const contractAddress = deployed.deployedContractAddress || deployed.contractAddress || 'unknown';
        logger.info('✓ Contract deployed!');
        logger.info('========================================');
        logger.info('   DEPLOYMENT SUCCESSFUL');
        logger.info('========================================');
        logger.info(`CONTRACT ADDRESS: ${contractAddress}`);
        logger.info('========================================');
        // Save deployment info
        await fs.writeFile('../deployment.json', JSON.stringify({
            contractAddress,
            walletAddress,
            network: 'standalone',
            deployedAt: new Date().toISOString(),
            config: CONFIG,
        }, null, 2));
        logger.info('Deployment info saved to deployment.json');
        // Clean up
        await wallet.close();
        return contractAddress;
    }
    catch (error) {
        logger.error(`❌ Deployment failed: ${error.message}`);
        if (error.message?.includes('ECONNREFUSED')) {
            logger.error('📝 Make sure the Midnight node and indexer are running:');
            logger.error('   cd ../escrow-cli && docker compose -f standalone.yml up -d');
        }
        process.exit(1);
    }
}
// Run if executed directly
if (require.main === module) {
    main()
        .then((address) => {
        logger.info(`✅ CONTRACT ADDRESS: ${address}`);
        process.exit(0);
    })
        .catch((error) => {
        logger.error(`Fatal error: ${error}`);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map