// Deployment script for Midnight Escrow Contract
import { Contract as EscrowContract } from "./managed/escrow/contract/index.cjs";
import logger from "./logger.js";

// Simple deployment function - to be integrated with escrow-cli pattern
export async function deployEscrow() {
  logger.info("Deploying Escrow contract...");

  // Create contract instance with no witnesses (none required by generated code)
  const escrow = new EscrowContract({});

  logger.info("Contract instance created. Ready for deployment.");
  logger.info(
    "Note: This contract should be deployed using the escrow-cli deployment pattern."
  );
  logger.info(
    "See /escrow-cli/src/index.ts for the full deployment implementation."
  );

  return escrow;
}

// Export the contract for use in other modules
export { EscrowContract };
