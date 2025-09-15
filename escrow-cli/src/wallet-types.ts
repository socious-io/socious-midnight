/**
 * Midnight DApp Connector Types
 * Based on https://docs.midnight.network/develop/reference/midnight-api/dapp-connector/
 */

export interface MidnightWalletApi {
  state: () => Promise<MidnightState>;
  balanceTransaction: (tx: any, options?: any) => Promise<any>;
  proveTransaction: (tx: any) => Promise<any>;
  balanceAndProveTransaction: (tx: any, options?: any) => Promise<any>;
  submitTransaction: (provenTx: any) => Promise<string>;
}

export interface MidnightState {
  address: string;
  publicKey?: string;
  network: string;
  balance?: {
    value: string;
    currency: string;
  };
}

export interface MidnightProvider {
  api: MidnightWalletApi;
  name: string;
  icon: string;
  version?: string;
  enable?: () => Promise<void>;
  isEnabled?: () => Promise<boolean>;
}

export interface MidnightWallet {
  name: string;
  icon: string;
  type: 'midnight';
}

// Extend Window interface for Midnight wallet
declare global {
  interface Window {
    midnight?: {
      [key: string]: MidnightProvider;
    };
  }
}

export const MIDNIGHT_DECIMAL_FACTOR = 1_000_000_000; // 9 decimals for tDUST