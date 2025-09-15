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
    constructor(providers, contractAddress, witnesses = {}) {
        this.providers = providers;
        this.contractAddress = contractAddress;
        this.witnesses = witnesses;
    }
    /**
     * Connect to an existing deployed escrow contract
     */
    async connect() {
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
            escrows.push({
                id: Number(id),
                org: escrowData.org,
                contributor: escrowData.contributor,
                feeAddress: escrowData.fee_address,
                fee: escrowData.fee,
                state: escrowData.state === 0 ? 'active' : escrowData.state === 1 ? 'released' : 'refunded',
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
        return {
            id: escrowId,
            org: escrowData.org,
            contributor: escrowData.contributor,
            feeAddress: escrowData.fee_address,
            fee: escrowData.fee,
            state: escrowData.state === 0 ? 'active' : escrowData.state === 1 ? 'released' : 'refunded',
            coin: escrowData.coin,
        };
    }
}
/**
 * Helper function to create an EscrowContractAPI instance
 * Use this after connecting wallet and configuring providers
 */
export async function createEscrowAPI(providers, contractAddress, witnesses = {}) {
    const api = new EscrowContractAPI(providers, contractAddress, witnesses);
    await api.connect();
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
        nonce: hexToBytes32(nonce),
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
    proofServer: 'http://localhost:6300', // Assumes local proof server
};
/**
 * Deployed contract address on testnet
 */
export const TESTNET_CONTRACT_ADDRESS = '020071b65c62afee02899fe65d5b8b775488968c4122db1926130b5685c73341108d';
//# sourceMappingURL=browser-api.js.map