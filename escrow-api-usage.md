# Using Escrow Contract API in Your Web App

## Quick Start with Lace Wallet

```typescript
// In your web app (React, Vue, etc.)
import { configureProviders } from '@midnight-ntwrk/midnight-js';
import {
  EscrowContractAPI,
  createEscrowAPI,
  TESTNET_CONFIG,
  hexToPublicKey,
  hexToBytes32,
  createCoinInfo,
} from '@socious-midnight/escrow-cli/browser';

// Step 1: Connect Lace wallet
async function connectLaceWallet() {
  const laceDappConnector = (window as any).lace;

  if (!laceDappConnector) {
    throw new Error('Please install Lace wallet');
  }

  // This prompts user to unlock and connect
  const wallet = await laceDappConnector.enable();

  // Configure providers with testnet endpoints
  const providers = await configureProviders(wallet, TESTNET_CONFIG);

  return { wallet, providers };
}

// Step 2: Connect to the escrow contract
async function setupEscrowContract() {
  const { wallet, providers } = await connectLaceWallet();

  // Contract address on testnet
  const contractAddress = '020071b65c62afee02899fe65d5b8b775488968c4122db1926130b5685c73341108d';

  // Create API instance and connect
  const escrowAPI = await createEscrowAPI(providers, contractAddress);

  return { escrowAPI, wallet };
}

// Step 3: Use the contract
async function main() {
  const { escrowAPI, wallet } = await setupEscrowContract();

  // Create a new escrow
  const createParams = {
    contributor: hexToPublicKey('0x' + '11'.repeat(32)), // 32 bytes
    feeAddress: hexToPublicKey('0x' + '22'.repeat(32)), // 32 bytes
    org: hexToBytes32('0x' + '33'.repeat(32)), // 32 bytes
    fee: 10n,
    coin: createCoinInfo(
      '0x' + '44'.repeat(32), // nonce
      1000n, // value in smallest units
    ),
  };

  const { escrowId, txData } = await escrowAPI.createEscrow(createParams);
  console.log(`Created escrow ${escrowId} in tx ${txData.txId}`);

  // Query escrows
  const allEscrows = await escrowAPI.getAllEscrows();
  console.log('Total escrows:', allEscrows.length);

  // Release an escrow
  const releaseTx = await escrowAPI.releaseEscrow(escrowId);
  console.log(`Released escrow in tx ${releaseTx.txId}`);
}

// Run the example
main().catch(console.error);
```

## React Component Example

```tsx
import React, { useState, useEffect } from 'react';
import { EscrowContractAPI, createEscrowAPI, TESTNET_CONFIG } from '@socious-midnight/escrow-cli/browser';

function EscrowDApp() {
  const [api, setApi] = useState<EscrowContractAPI | null>(null);
  const [escrows, setEscrows] = useState([]);
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    try {
      const lace = (window as any).lace;
      const wallet = await lace.enable();

      const providers = await configureProviders(wallet, TESTNET_CONFIG);
      const contractAddress = '020071b65c62afee02899fe65d5b8b775488968c4122db1926130b5685c73341108d';

      const escrowAPI = await createEscrowAPI(providers, contractAddress);
      setApi(escrowAPI);
      setConnected(true);

      // Load escrows
      const allEscrows = await escrowAPI.getAllEscrows();
      setEscrows(allEscrows);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const createEscrow = async () => {
    if (!api) return;

    // Your escrow parameters
    const params = {
      // ... set your parameters
    };

    const result = await api.createEscrow(params);
    console.log('Created escrow:', result.escrowId);

    // Refresh list
    const updated = await api.getAllEscrows();
    setEscrows(updated);
  };

  return (
    <div>
      {!connected ? (
        <button onClick={connectWallet}>Connect Lace Wallet</button>
      ) : (
        <div>
          <h2>Escrows ({escrows.length})</h2>
          <button onClick={createEscrow}>Create Escrow</button>
          {/* Display escrows */}
        </div>
      )}
    </div>
  );
}
```

## Important Notes

1. **Wallet Setup**: User must have Lace wallet installed and set to Testnet
2. **Proof Server**: Ensure proof server is configured (local or remote)
3. **Sync**: Wait for wallet to sync before creating transactions
4. **Types**: All byte arrays must be exactly 32 bytes (64 hex characters)

## Contract Address

Testnet: `020071b65c62afee02899fe65d5b8b775488968c4122db1926130b5685c73341108d`
