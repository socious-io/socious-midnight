// Escrow Contract Deployment and Interaction
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
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
    console.log('Deploying Escrow contract...');
    // Create contract instance (no witnesses required)
    const escrow = new EscrowContract({});
    // Deploy contract
    const deployed = await deployContract(providers, {
        contract: escrow,
        privateStateId: 'escrow-private-state',
        initialPrivateState: {}, // Empty state since no witnesses
    });
    console.log('Contract deployed successfully!');
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
    const TEST_MNEMONIC = 'test test test test test test test test test test test junk';
    const CONFIG = {
        indexer: process.env.INDEXER_URL || 'http://localhost:8088/api/v1',
        node: process.env.NODE_URL || 'ws://localhost:9944',
        proofServer: process.env.PROOF_SERVER_URL || 'http://localhost:6300',
    };
    console.log('========================================');
    console.log('   Midnight Escrow Contract Deployment');
    console.log('   Network: STANDALONE (LOCAL)');
    console.log('========================================\n');
    console.log('Configuration:');
    console.log('- Indexer:', CONFIG.indexer);
    console.log('- Node:', CONFIG.node);
    console.log('- Proof Server:', CONFIG.proofServer);
    console.log();
    try {
        // Create wallet and providers
        console.log('Creating wallet and providers...');
        const { wallet, providers } = await createWalletAndProviders(CONFIG);
        console.log('✓ Wallet and providers created\n');
        const walletState = wallet.state();
        const walletAddress = await new Promise((resolve) => {
            walletState.subscribe((state) => {
                resolve(state.address);
            });
        });
        console.log('  Wallet address:', walletAddress);
        // Get balance
        try {
            const balances = await new Promise((resolve) => {
                walletState.subscribe((state) => {
                    resolve(state.balances);
                });
            });
            console.log('  Balance:', balances);
        }
        catch (e) {
            console.log('  Balance: Unable to fetch (node may be initializing)');
        }
        console.log();
        // Deploy contract
        console.log('Deploying contract...');
        console.log('This may take a moment while generating proofs...');
        const deployed = await deployEscrow(providers);
        const contractAddress = deployed.deployedContractAddress || deployed.contractAddress || 'unknown';
        console.log('✓ Contract deployed!\n');
        console.log('========================================');
        console.log('   DEPLOYMENT SUCCESSFUL');
        console.log('========================================');
        console.log('CONTRACT ADDRESS:', contractAddress);
        console.log('========================================\n');
        // Save deployment info
        await fs.writeFile('../deployment.json', JSON.stringify({
            contractAddress,
            walletAddress,
            network: 'standalone',
            deployedAt: new Date().toISOString(),
            config: CONFIG,
        }, null, 2));
        console.log('Deployment info saved to deployment.json');
        // Clean up
        await wallet.close();
        return contractAddress;
    }
    catch (error) {
        console.error('\n❌ Deployment failed:', error);
        if (error.message?.includes('ECONNREFUSED')) {
            console.error('\n📝 Make sure the Midnight node and indexer are running:');
            console.error('   cd ../escrow-cli && docker compose -f standalone.yml up -d');
        }
        process.exit(1);
    }
}
// Run if executed directly
if (require.main === module) {
    main()
        .then((address) => {
        console.log('\n✅ CONTRACT ADDRESS:', address);
        process.exit(0);
    })
        .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map