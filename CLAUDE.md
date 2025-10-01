# Midnight Escrow Contract - Development Context

## CRITICAL UPDATE: Deployment Process (2025-09-03)

### Correct Deployment Pattern from escrow-cli

The project includes an `escrow-cli` directory with the proper deployment pattern. Use this instead of creating new deployment scripts.

### Key Files for Deployment:

1. **`/escrow-cli/src/index.ts`** - Contains the correct deployment pattern
2. **`/escrow-cli/standalone.yml`** - Docker compose for local development
3. **`/escrow-cli/package.json`** - Has scripts for testnet and standalone deployment

### Deployment Dependencies (from escrow-cli):

```typescript
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
```

### Infrastructure Setup:

For local development, use Docker Compose with:

- **Proof Server**: `midnightnetwork/proof-server:4.0.0` (port 6300)
- **Indexer**: `midnightntwrk/indexer-standalone:2.1.1` (port 8088)
- **Node**: `midnightnetwork/midnight-node:0.12.0` (port 9944)

### Deployment Commands (from escrow-cli):

```bash
# First, compile the contract
cd contract
npm run compact
npm run build

# Then deploy using escrow-cli
cd ../escrow-cli

# For TESTNET deployment:
npm run build  # Build TypeScript first
node dist/deploy-testnet.js  # Run the compiled JavaScript

# Alternative: Use the deploy-testnet.cjs file directly
node deploy-testnet.cjs

# For STANDALONE (local) deployment:
docker compose -f standalone.yml up -d  # Start local infrastructure
npm run build
node dist/standalone.js

# Or use the package.json scripts:
npm run standalone  # For local deployment
npm run testnet-remote  # For testnet deployment
```

### Important Notes:

1. The escrow contract compiles successfully with Maps and proper types
2. The contract doesn't require witness functions (localSecretKey was removed)
3. Use escrow-cli pattern for deployment, not the contract/src/deploy.ts
4. Make sure Docker is running for standalone deployment
5. **TESTNET STATUS (2025-09-07)**:
   - Fixed endpoint URLs to match working example-counter format
   - Wallet balance confirmed: 999701357 tDUST
   - Correct endpoints:
     - Indexer: `https://indexer.testnet-02.midnight.network/api/v1/graphql`
     - WS: `wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws`
     - Node: `https://rpc.testnet-02.midnight.network`

# Midnight Escrow Contract - Development Context

## Project Overview

Transforming a simple counter contract into a multi-party escrow contract for the Midnight Network blockchain.

## Current Status

- **Date**: 2025-10-01
- **Stage**: Contract deployed with working browser DApp example
- **Latest**:
  - Contract deployed at: `02005a47f7e241f8fab6f4029fba7d644072ee1f503f8b0aeafd931745df02c3aa3f`
  - Added example-dapp with React + Vite + Lace wallet integration
  - Environment variable configuration for contract address
  - Browser API with proper zkConfig POST request
  - CLI test script confirms contract is indexed and working

## Requirements

1. **Three-party escrow system**:
   - **Contributor**: Initiates escrow and can release funds to organization
   - **Organization**: Recipient of funds when escrow is completed
   - **Admin**: Arbitrator who can intervene in disputes

2. **Core Functions Needed**:
   - `createEscrow()`: Initialize new escrow with parties and amount by organization
   - `release()`: Organization or admin due dispute releases funds to contributer
   - `adminRefund()`: Admin refunds to organization (dispute resolution)

3. **Multi-user Support**: Contract must support multiple concurrent escrows

## Technical Challenges Encountered

### 1. Compact Language Syntax Issues

- **Problem**: Documentation at https://docs.midnight.network/develop/reference/compact/ not loading properly
- **Attempted type names**: `Unsigned<16>`, `Uint<16>` - both incorrect
- **Counter type**: Doesn't have `.value()` method as expected
- **Map type**: Not directly supported as initially attempted

### 2. Current Contract Structure Attempts

#### Attempt 1: Map-based approach (FAILED)

```compact
export ledger escrows: Map<Unsigned<16>, EscrowData>;
```

- Maps aren't supported with this syntax in Compact

#### Attempt 2: Single escrow with Counter state (FAILED)

```compact
export ledger state: Counter; // Using Counter to track state
assert(state.value() == 1, "Escrow is not active");
```

- Counter doesn't have `.value()` method

#### Attempt 3: Boolean flags approach (IN PROGRESS)

```compact
export ledger isActive: Boolean;
export ledger isReleased: Boolean;
export ledger isRefunded: Boolean;
```

- This might work but limits to single active escrow

## Known Working Syntax

From the counter example:

```compact
pragma language_version >= 0.16 && <= 0.17;
import CompactStandardLibrary;

export ledger round: Counter;

export circuit increment(): [] {
  round.increment(1);
}
```

## Key Learnings

1. **Ledger variables**: Simple types like `Counter`, `Bytes<32>`, `Boolean`, `Field`
2. **Counter operations**: `.increment(n)`, `.decrement(n)`, `.reset()`
3. **Circuits**: Don't use type annotations in parameters like traditional languages
4. **Assertions**: Use `assert(condition, "error message")`

## Files Modified

1. `/contract/src/escrow.compact` - Main contract (needs fixing)
2. `/contract/src/witnesses.ts` - TypeScript interfaces
3. `/contract/src/index.ts` - Updated exports
4. `/contract/package.json` - Build scripts updated
5. `/contract/src/test/escrow-simulator.ts` - Test simulator
6. `/contract/src/test/escrow.test.ts` - Test suite

## Next Steps

1. **Research proper Compact syntax**:
   - Find working examples of multi-item storage
   - Understand how to handle multiple concurrent escrows
   - Learn correct type system usage

2. **Possible solutions for multi-escrow**:
   - Use indexed naming (escrow1_contributor, escrow2_contributor, etc.)
   - Implement escrow queue system
   - Use external indexing with escrow IDs

3. **Compilation command**:

   ```bash
   cd contract && npm run compact
   ```

4. **After successful compilation**:
   ```bash
   npm run build
   npm run test
   ```

## Alternative Approach Consideration

Since Compact doesn't easily support complex data structures, consider:

1. **Single Active Escrow Model**: Only one escrow can be active at a time
2. **Escrow ID System**: Each escrow gets unique ID, store current active ID
3. **External State Management**: Use private state for complex mappings

## Resources Needed

- Working Compact language examples with complex state
- Documentation on Map/Array usage in Compact
- Examples of multi-user contracts in Midnight

## Error Messages to Resolve

```
Exception: escrow.compact line 30 char 15:
  operation value undefined for ledger field type Counter
```

## Commands for Testing

```bash
# Compile contract
cd contract && npm run compact

# Build TypeScript
npm run build

# Run tests
npm run test

# Full rebuild
npm run compact && npm run build && npm run test
```

## Browser DApp Setup

The `example-dapp` directory contains a working React + Vite application for interacting with the escrow contract.

### Quick Start:

```bash
cd example-dapp
npm install
cp .env.example .env  # Configure contract address
npm run dev
```

### Configuration:

Edit `.env` file:
```
VITE_CONTRACT_ADDRESS=02005a47f7e241f8fab6f4029fba7d644072ee1f503f8b0aeafd931745df02c3aa3f
```

### Key Features:

- Lace wallet integration via `window.midnight.mnLace`
- Environment-based contract configuration
- zkConfig fetched via POST request (not GET)
- Private state storage in browser IndexedDB
- Create and release escrow operations
- View all active escrows

### Important Fix:

The zkConfig provider MUST use POST request:
```typescript
const zkConfigProvider: ZKConfigProvider = {
  getZkConfig: async (contractAddress: string) => {
    const response = await fetch(`${nodeUrl}/api/v1/zk-config/${contractAddress}`, {
      method: 'POST',  // REQUIRED - GET returns 405
    });
    return await response.json();
  },
};
```

## Testing Contract Connection

Use the CLI test script to verify contract is indexed:

```bash
cd escrow-cli
npx tsx src/test-join.ts
```

This should connect to the contract in ~1-2 seconds, proving the contract is properly indexed.
