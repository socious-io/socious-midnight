import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
}

export type ImpureCircuits<T> = {
  create(context: __compactRuntime.CircuitContext<T>,
         contributor_0: { bytes: Uint8Array },
         fee_address_0: { bytes: Uint8Array },
         org_0: Uint8Array,
         fee_0: bigint,
         coin_0: { nonce: Uint8Array, color: Uint8Array, value: bigint }): __compactRuntime.CircuitResults<T, bigint>;
  release(context: __compactRuntime.CircuitContext<T>, id_0: bigint): __compactRuntime.CircuitResults<T, []>;
}

export type PureCircuits = {
}

export type Circuits<T> = {
  create(context: __compactRuntime.CircuitContext<T>,
         contributor_0: { bytes: Uint8Array },
         fee_address_0: { bytes: Uint8Array },
         org_0: Uint8Array,
         fee_0: bigint,
         coin_0: { nonce: Uint8Array, color: Uint8Array, value: bigint }): __compactRuntime.CircuitResults<T, bigint>;
  release(context: __compactRuntime.CircuitContext<T>, id_0: bigint): __compactRuntime.CircuitResults<T, []>;
}

export type Ledger = {
  readonly last_escrow_id: bigint;
  escrows: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): { org: Uint8Array,
                             contributor: { bytes: Uint8Array },
                             fee_address: { bytes: Uint8Array },
                             fee: bigint,
                             state: number,
                             coin: { nonce: Uint8Array,
                                     color: Uint8Array,
                                     value: bigint
                                   }
                           };
    [Symbol.iterator](): Iterator<[bigint, { org: Uint8Array,
  contributor: { bytes: Uint8Array },
  fee_address: { bytes: Uint8Array },
  fee: bigint,
  state: number,
  coin: { nonce: Uint8Array, color: Uint8Array, value: bigint }
}]>
  };
  readonly instance: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
