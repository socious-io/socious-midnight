/**
 * Browser-compatible API for Escrow Contract
 * Designed for use with Lace wallet in web applications
 */
import type { MidnightProviders, FinalizedTxData } from '@midnight-ntwrk/midnight-js-types';
import type { CoinInfo } from '@midnight-ntwrk/ledger';
import * as Escrow from '../../contract/src/managed/escrow/contract/index.cjs';
export { Escrow };
export interface EscrowPrivateState {
}
export type EscrowProviders = MidnightProviders<any, 'escrowPrivateState', EscrowPrivateState>;
export interface CreateEscrowParams {
    contributor: {
        bytes: Uint8Array;
    };
    feeAddress: {
        bytes: Uint8Array;
    };
    org: Uint8Array;
    fee: bigint;
    coin: CoinInfo;
}
/**
 * Configuration for connecting to Midnight network
 */
export interface NetworkConfig {
    indexer: string;
    indexerWS: string;
    node: string;
    proofServer: string;
}
/**
 * Escrow Contract API wrapper for browser usage
 */
export declare class EscrowContractAPI {
    private contract;
    private providers;
    private contractAddress;
    private witnesses;
    constructor(providers: EscrowProviders, contractAddress: string, witnesses?: any);
    /**
     * Connect to an existing deployed escrow contract
     */
    connect(): Promise<void>;
    /**
     * Create a new escrow
     * @returns The escrow ID and transaction data
     */
    createEscrow(params: CreateEscrowParams): Promise<{
        escrowId: bigint;
        txData: FinalizedTxData;
    }>;
    /**
     * Release funds from an escrow
     */
    releaseEscrow(escrowId: number | bigint): Promise<FinalizedTxData>;
    /**
     * Query the contract's ledger state
     */
    getLedgerState(): Promise<any>;
    /**
     * Get all escrows from the contract
     */
    getAllEscrows(): Promise<Array<{
        id: number;
        org: Uint8Array;
        contributor: {
            bytes: Uint8Array;
        };
        feeAddress: {
            bytes: Uint8Array;
        };
        fee: bigint;
        state: 'active' | 'released' | 'refunded';
        coin: CoinInfo;
    }>>;
    /**
     * Get a specific escrow by ID
     */
    getEscrowById(escrowId: number): Promise<any | null>;
}
/**
 * Helper function to create an EscrowContractAPI instance
 * Use this after connecting wallet and configuring providers
 */
export declare function createEscrowAPI(providers: EscrowProviders, contractAddress: string, witnesses?: any): Promise<EscrowContractAPI>;
/**
 * Helper to convert a hex string to Bytes32 (Uint8Array)
 */
export declare function hexToBytes32(hex: string): Uint8Array;
/**
 * Helper to convert a hex string to ZswapCoinPublicKey format
 */
export declare function hexToPublicKey(hex: string): {
    bytes: Uint8Array;
};
/**
 * Helper to create a CoinInfo object
 */
export declare function createCoinInfo(nonce: string, value: bigint, color?: string): CoinInfo;
/**
 * Testnet configuration
 */
export declare const TESTNET_CONFIG: NetworkConfig;
/**
 * Deployed contract address on testnet
 */
export declare const TESTNET_CONTRACT_ADDRESS = "020071b65c62afee02899fe65d5b8b775488968c4122db1926130b5685c73341108d";
