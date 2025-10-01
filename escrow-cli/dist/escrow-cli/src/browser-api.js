/**
 * Browser-compatible API for Escrow Contract
 * Designed for use with Lace wallet in web applications
 */
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
// Import the generated contract
import * as Escrow from '../../contract/src/managed/escrow/contract/index.cjs';
// Re-export generated types for convenience
export { Escrow };
/**
 * Escrow Contract API wrapper for browser usage
 */
export class EscrowContractAPI {
    contract;
    providers;
    contractAddress;
    witnesses;
    constructor(providers, contractAddress, witnesses = {}, deployedContract) {
        this.providers = providers;
        this.contractAddress = contractAddress;
        this.witnesses = witnesses;
        if (deployedContract) {
            this.contract = deployedContract;
        }
    }
    /**
     * Connect to an existing deployed escrow contract
     * Skip if already initialized with deployed contract
     */
    async connect() {
        if (this.contract) {
            return; // Already connected via constructor
        }
        const escrowContractInstance = new Escrow.Contract(this.witnesses);
        this.contract = await findDeployedContract(this.providers, {
            contractAddress: this.contractAddress,
            contract: escrowContractInstance,
            privateStateId: 'escrowPrivateState',
            initialPrivateState: {}, // Set if your contract requires specific private state
        });
    }
    /**
     * Create a new escrow
     * @returns The escrow ID and transaction data
     */
    async createEscrow(params) {
        if (!this.contract) {
            throw new Error('Contract not connected. Call connect() first.');
        }
        const finalizedCreate = await this.contract.callTx.create(params.contributor, params.feeAddress, params.org, params.fee, params.coin);
        // The create circuit returns the escrow ID
        const escrowId = finalizedCreate.contractCallResult;
        return {
            escrowId,
            txData: finalizedCreate.public,
        };
    }
    /**
     * Release funds from an escrow
     */
    async releaseEscrow(escrowId) {
        if (!this.contract) {
            throw new Error('Contract not connected. Call connect() first.');
        }
        const finalizedRelease = await this.contract.callTx.release(BigInt(escrowId));
        return finalizedRelease.public;
    }
    /**
     * Query the contract's ledger state
     */
    async getLedgerState() {
        const contractState = await this.providers.publicDataProvider.queryContractState(this.contractAddress);
        if (!contractState) {
            return null;
        }
        return Escrow.ledger(contractState.data);
    }
    /**
     * Get all escrows from the contract
     */
    async getAllEscrows() {
        const ledgerState = await this.getLedgerState();
        if (!ledgerState)
            return [];
        const escrows = [];
        // Iterate through the escrows Map
        for (const [id, escrowData] of ledgerState.escrows) {
            const state = escrowData.state === 0 ? 'active' : escrowData.state === 1 ? 'released' : 'refunded';
            escrows.push({
                id: Number(id),
                org: escrowData.org,
                contributor: escrowData.contributor,
                feeAddress: escrowData.fee_address,
                fee: escrowData.fee,
                state,
                coin: escrowData.coin,
            });
        }
        return escrows;
    }
    /**
     * Get a specific escrow by ID
     */
    async getEscrowById(escrowId) {
        const ledgerState = await this.getLedgerState();
        if (!ledgerState)
            return null;
        if (!ledgerState.escrows.member(BigInt(escrowId))) {
            return null;
        }
        const escrowData = ledgerState.escrows.lookup(BigInt(escrowId));
        const state = escrowData.state === 0 ? 'active' : escrowData.state === 1 ? 'released' : 'refunded';
        return {
            id: escrowId,
            org: escrowData.org,
            contributor: escrowData.contributor,
            feeAddress: escrowData.fee_address,
            fee: escrowData.fee,
            state,
            coin: escrowData.coin,
        };
    }
}
/**
 * Helper function to create an EscrowContractAPI instance
 * Use this after connecting wallet and configuring providers
 *
 * @param deployedContract - Optional: Pass a deployed contract object to skip indexer lookup
 */
export async function createEscrowAPI(providers, contractAddress, witnesses = {}, deployedContract) {
    const api = new EscrowContractAPI(providers, contractAddress, witnesses, deployedContract);
    await api.connect();
    return api;
}
/**
 * Load deployed contract from saved file and create API instance
 * This allows using the contract immediately without waiting for indexer
 */
export async function loadDeployedContract(providers, deployedContractPath, witnesses = {}) {
    // Load the saved deployed contract data
    const response = await fetch(deployedContractPath);
    const deployedData = await response.json();
    // Reconstruct the deployed contract object
    const deployed = {
        deployTxData: deployedData.deployTxData,
    };
    const api = new EscrowContractAPI(providers, deployedData.contractAddress, witnesses, deployed);
    return api;
}
/**
 * Helper to convert a hex string to Bytes32 (Uint8Array)
 */
export function hexToBytes32(hex) {
    if (hex.startsWith('0x')) {
        hex = hex.slice(2);
    }
    if (hex.length !== 64) {
        throw new Error('Hex string must be exactly 32 bytes (64 hex characters)');
    }
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}
/**
 * Helper to convert a hex string to ZswapCoinPublicKey format
 */
export function hexToPublicKey(hex) {
    return { bytes: hexToBytes32(hex) };
}
/**
 * Helper to create a CoinInfo object
 */
export function createCoinInfo(nonce, value, color) {
    return {
        // @ts-ignore - Type mismatch with CoinInfo but works at runtime
        nonce: hexToBytes32(nonce),
        // @ts-ignore - Type mismatch with CoinInfo but works at runtime
        color: color ? hexToBytes32(color) : new Uint8Array(32), // Default to zero bytes
        value,
    };
}
/**
 * Testnet configuration
 */
export const TESTNET_CONFIG = {
    indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
    node: 'https://rpc.testnet-02.midnight.network',
    proofServer: 'https://midnight-proofserver.socious.io',
};
/**
 * Default deployed contract address on testnet (can be overridden)
 */
export const DEFAULT_TESTNET_CONTRACT_ADDRESS = '02005a47f7e241f8fab6f4029fba7d644072ee1f503f8b0aeafd931745df02c3aa3f';
//# sourceMappingURL=browser-api.js.map