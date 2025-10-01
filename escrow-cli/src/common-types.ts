import { type ImpureCircuitId, type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '../../contract/src/managed/escrow/contract/index.cjs';

export interface EscrowPrivateState {
  // Add any private state fields if needed
}

// @ts-ignore - Type constraint issue with Contract class
export type EscrowCircuits = ImpureCircuitId<typeof Contract>;

export const EscrowPrivateStateId = 'escrowPrivateState';

// @ts-ignore - Type constraint issue with Contract class
export type EscrowProviders = MidnightProviders<EscrowCircuits, typeof EscrowPrivateStateId, EscrowPrivateState>;

export type EscrowContract = typeof Contract;

// @ts-ignore - Type constraint issue with Contract class
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
