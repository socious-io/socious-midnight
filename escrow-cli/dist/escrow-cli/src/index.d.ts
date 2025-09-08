import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { Contract as EscrowContract, type Ledger as EscrowLedger } from '../../contract/src/managed/escrow/contract/index.cjs';
export type EscrowPrivateState = Record<string, never>;
export declare function createWalletAndProviders(config: {
    indexer: string;
    node: string;
    proofServer: string;
}): Promise<{
    wallet: import("@midnight-ntwrk/wallet-api").Wallet & import("@midnight-ntwrk/wallet").Resource;
    providers: {
        publicDataProvider: import("@midnight-ntwrk/midnight-js-types").PublicDataProvider;
        zkConfigProvider: NodeZkConfigProvider<string>;
        proofProvider: import("@midnight-ntwrk/midnight-js-types").ProofProvider<string>;
        privateStateProvider: import("@midnight-ntwrk/midnight-js-types").PrivateStateProvider<string, any>;
        walletProvider: import("@midnight-ntwrk/wallet-api").Wallet & import("@midnight-ntwrk/wallet").Resource;
    };
}>;
export declare function deployEscrow(providers: any): Promise<import("@midnight-ntwrk/midnight-js-contracts").DeployedContract<EscrowContract<unknown, {}>>>;
export declare function getContractState(ledger: EscrowLedger): {
    lastEscrowId: bigint;
    escrows: {
        isEmpty(): boolean;
        size(): bigint;
        member(key_0: bigint): boolean;
        lookup(key_0: bigint): {
            org: Uint8Array;
            contributor: {
                bytes: Uint8Array;
            };
            fee_address: {
                bytes: Uint8Array;
            };
            fee: bigint;
            state: number;
            coin: {
                nonce: Uint8Array;
                color: Uint8Array;
                value: bigint;
            };
        };
        [Symbol.iterator](): Iterator<[bigint, {
            org: Uint8Array;
            contributor: {
                bytes: Uint8Array;
            };
            fee_address: {
                bytes: Uint8Array;
            };
            fee: bigint;
            state: number;
            coin: {
                nonce: Uint8Array;
                color: Uint8Array;
                value: bigint;
            };
        }]>;
    };
    instance: bigint;
};
