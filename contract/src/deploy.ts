// Deployment script for Midnight Escrow Contract
import { Contract as EscrowContract } from './managed/escrow/contract/index.cjs';

// Simple deployment function - to be integrated with escrow-cli pattern
export async function deployEscrow() {
  console.log('Deploying Escrow contract...');
  
  // Create contract instance with no witnesses (none required by generated code)
  const escrow = new EscrowContract({});
  
  console.log('Contract instance created. Ready for deployment.');
  console.log('Note: This contract should be deployed using the escrow-cli deployment pattern.');
  console.log('See /escrow-cli/src/index.ts for the full deployment implementation.');
  
  return escrow;
}

// Export the contract for use in other modules
export { EscrowContract };