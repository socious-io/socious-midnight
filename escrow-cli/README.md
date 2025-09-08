# Escrow CLI for Midnight Network

This CLI tool helps you deploy and interact with the Escrow smart contract on the Midnight Network.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure your environment:

```bash
cp .env.example .env
```

3. Edit `.env` and add your wallet seed:

```
WALLET_SEED=your-64-character-hex-wallet-seed-here
```

**⚠️ IMPORTANT SECURITY NOTES:**

- NEVER commit your `.env` file to version control
- NEVER share your wallet seed with anyone
- Keep your seed secure and backed up

## Usage

### Check Wallet Balance

```bash
npm run build
node dist/escrow-cli/src/check-wallet.js
```

### Deploy to Testnet

```bash
npm run build
npm run deploy-testnet
```

### Using Environment Variables Directly

You can also set the wallet seed directly in your shell:

```bash
export WALLET_SEED="your-wallet-seed-here"
npm run deploy-testnet
```

## Network Configuration

The CLI is configured to use Midnight testnet-02:

- Indexer: https://indexer.testnet-02.midnight.network/api/v1/graphql
- WebSocket: wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws
- RPC Node: https://rpc.testnet-02.midnight.network
- Proof Server: http://localhost:6300 (must be running locally)

## Prerequisites

- Local proof server running on port 6300
- Wallet with tDUST tokens (get from Midnight Discord)
- Node.js v18 or higher

## Deployment Info

After successful deployment, contract details are saved to `deployment-testnet.json`.
