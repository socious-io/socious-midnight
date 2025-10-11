# Midnight Escrow DApp Example

This is a React + Vite example application demonstrating how to integrate the Midnight escrow contract with a browser wallet (Lace).

## Features

- Connect Lace wallet to Midnight testnet
- Create escrow with user-provided DUST amount and contributor address
- View all escrows from the contract
- Release escrows to contributors
- Query contract ledger state

## Prerequisites

1. **Lace Wallet**: Install Lace browser extension from https://www.lace.io/
2. **Testnet Funds**: Request testnet tokens from Midnight Discord
3. **Contract Deployed**: The escrow contract must be deployed to testnet

## Setup

```bash
# From the example-dapp directory
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage

1. Open the app in your browser (default: http://localhost:5173)
2. Click "Connect Lace Wallet" and authorize the connection
3. Fill in the form:
   - **DUST Amount** (required): Amount to escrow in smallest units
   - **Contributor Address** (required): 32-byte hex address (64 hex chars) of the contributor who will receive funds
   - **Organization ID** (optional): 32-byte identifier for the organization
   - **Fee Address** (optional): Address to receive fees
   - **Fee Amount**: Fee to charge (default: 10)
4. Click "Create Escrow" to submit the transaction
5. View created escrows in the list below
6. Click "Release Escrow" to release funds to the contributor

## Configuration

The app is configured to use:

- **Network**: Midnight Testnet
- **Contract Address**: `020071b65c62afee02899fe65d5b8b775488968c4122db1926130b5685c73341108d`
- **Indexer**: `https://indexer.testnet-02.midnight.network/api/v1/graphql`
- **Node**: `https://rpc.testnet-02.midnight.network`
- **Proof Server**: `https://midnight-proofserver.socious.io`

To customize these settings, edit `src/EscrowDApp.tsx` or use environment variables (see `.env.example`).

## Project Structure

```
example-dapp/
├── src/
│   ├── EscrowDApp.tsx      # Main escrow component with wallet integration
│   ├── App.tsx             # App entry point
│   └── main.tsx            # React entry
├── vite.config.ts          # Vite configuration with path aliases
├── tsconfig.app.json       # TypeScript config
└── package.json
```

## API Integration

The app imports from the escrow-cli browser API:

```typescript
import {
  EscrowContractAPI,
  createEscrowAPI,
  hexToPublicKey,
  hexToBytes32,
  createCoinInfo,
} from '../../escrow-cli/src/browser-api';
```

## Important Notes

- All addresses must be exactly 32 bytes (64 hex characters)
- DUST amounts are in smallest units (1 DUST = 1,000,000 smallest units)
- Wallet must be synced before creating transactions
- Proof generation may take several seconds
- Make sure Lace wallet is set to Testnet network

## Troubleshooting

**Wallet not found**: Install Lace wallet browser extension

**Connection failed**: Ensure Lace is configured for Testnet network

**Insufficient funds**: Request testnet tokens from Midnight Discord (#testnet-faucet)

**Transaction failed**: Check browser console for detailed error messages

**Import errors**: Ensure parent directories (escrow-cli, contract) are properly compiled
