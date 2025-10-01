/**
 * Main export for Escrow Contract API
 * Import this package in your web app:
 *
 * @example
 * ```typescript
 * import { EscrowContractAPI, createEscrowAPI, TESTNET_CONFIG } from '@socious-midnight/escrow-cli';
 * ```
 */
export { EscrowContractAPI, createEscrowAPI, hexToBytes32, hexToPublicKey, createCoinInfo, TESTNET_CONFIG, DEFAULT_TESTNET_CONTRACT_ADDRESS, type EscrowProviders, type CreateEscrowParams, type NetworkConfig, type EscrowPrivateState } from './browser-api';
export * as EscrowContract from '../../contract/src/managed/escrow/contract/index.cjs';
export { type MidnightWalletApi, type MidnightState, type MidnightProvider, type MidnightWallet, MIDNIGHT_DECIMAL_FACTOR } from './wallet-types';
