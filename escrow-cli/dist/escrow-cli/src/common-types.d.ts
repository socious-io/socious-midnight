import { type ImpureCircuitId, type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '../../contract/src/managed/escrow/contract/index.cjs';
export interface EscrowPrivateState {
}
export type EscrowCircuits = ImpureCircuitId<typeof Contract>;
export declare const EscrowPrivateStateId = "escrowPrivateState";
export type EscrowProviders = MidnightProviders<EscrowCircuits, typeof EscrowPrivateStateId, EscrowPrivateState>;
export type EscrowContract = typeof Contract;
export type DeployedEscrowContract = DeployedContract<EscrowContract> | FoundContract<EscrowContract>;
export interface EscrowData {
    id: number;
    org: string;
    contributor: string;
    feeAddress: string;
    fee: bigint;
    state: 'active' | 'released' | 'refunded';
    coinValue: bigint;
}
export interface CreateEscrowParams {
    contributor: string;
    feeAddress: string;
    org: string;
    fee: bigint;
    amount: bigint;
}
