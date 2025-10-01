/**
 * Main export for Escrow Contract API
 * Import this package in your web app:
 *
 * @example
 * ```typescript
 * import { EscrowContractAPI, createEscrowAPI, TESTNET_CONFIG } from '@socious-midnight/escrow-cli';
 * ```
 */
// Export the browser API
export { EscrowContractAPI, createEscrowAPI, hexToBytes32, hexToPublicKey, createCoinInfo, TESTNET_CONFIG, DEFAULT_TESTNET_CONTRACT_ADDRESS } from './browser-api';
// Re-export the contract namespace for access to generated types
export * as EscrowContract from '../../contract/src/managed/escrow/contract/index.cjs';
// Export wallet types
export { MIDNIGHT_DECIMAL_FACTOR } from './wallet-types';
//# sourceMappingURL=index-exports.js.map