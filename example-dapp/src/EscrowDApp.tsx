import { useState } from 'react';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { ZKConfigProvider } from '@midnight-ntwrk/midnight-js-types';

// Import from socious-midnight package (same as web-app-v2)
import {
  EscrowContractAPI,
  createEscrowAPI,
  addressToPublicKey, // NEW: Handles Bech32m addresses (mn1...)
  hexToBytes32,
  createCoinInfo,
  TESTNET_CONFIG,
  type CreateEscrowParams,
} from 'socious-midnight/escrow-cli/src/browser-api';

// Get contract address from environment variable
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  throw new Error('VITE_CONTRACT_ADDRESS is not set in .env file');
}

interface Escrow {
  id: number;
  org: Uint8Array;
  contributor: { bytes: Uint8Array };
  feeAddress: { bytes: Uint8Array };
  fee: bigint;
  state: 'active' | 'released' | 'refunded';
  coin: any;
}

export default function EscrowDApp() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [escrowAPI, setEscrowAPI] = useState<EscrowContractAPI | null>(null);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form inputs
  const [dustAmount, setDustAmount] = useState('');
  const [contributorAddress, setContributorAddress] = useState('');
  const [orgId, setOrgId] = useState('');
  const [feeAddress, setFeeAddress] = useState('');
  const [fee, setFee] = useState('10');

  const connectWallet = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if Midnight Lace wallet is available
      const midnight = (window as any).midnight;
      if (!midnight?.mnLace) {
        throw new Error('Midnight Lace wallet not found. Please install Lace wallet extension.');
      }

      // Enable wallet (prompts user to connect)
      const walletAPI = await midnight.mnLace.enable();
      console.log('[Wallet] Wallet API obtained');

      // Get wallet state
      const state = await walletAPI.state();
      setWalletAddress(state.address);

      // Set up providers (same as web-app-v2)
      const indexerUrl = TESTNET_CONFIG.indexer;
      const indexerWsUrl = TESTNET_CONFIG.indexerWS;
      const nodeUrl = TESTNET_CONFIG.node;
      const proofServerUrl = TESTNET_CONFIG.proofServer;

      console.log('[Providers] Creating providers...');
      const publicDataProvider = indexerPublicDataProvider(indexerUrl, indexerWsUrl);

      // Browser-compatible ZK config provider
      const zkConfigProvider = {
        getZkConfig: async (contractAddress: string) => {
          const response = await fetch(`${nodeUrl}/api/v1/zk-config/${contractAddress}`, {
            method: 'POST',
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch ZK config: ${response.statusText}`);
          }
          return await response.json();
        },
      };

      const proofProvider = httpClientProofProvider(proofServerUrl);
      const privateStateProvider = await levelPrivateStateProvider({
        privateStateStoreName: 'example-escrow-private-state',
      });

      const providers = {
        publicDataProvider,
        zkConfigProvider,
        proofProvider,
        privateStateProvider,
        walletProvider: walletAPI,
      };

      console.log('[API] Creating escrow API...');
      console.log('[API] Contract address:', CONTRACT_ADDRESS);

      // Create EscrowContractAPI directly without connect() - more efficient approach
      console.log('[API] Creating EscrowContractAPI directly (no connect() needed)...');
      console.log('[API] Methods like createEscrow(), releaseEscrow(), getAllEscrows() work directly');
      
      const { EscrowContractAPI } = await import('socious-midnight/escrow-cli/src/browser-api');
      const api = new EscrowContractAPI(providers as any, CONTRACT_ADDRESS, {});
      
      console.log('[API] EscrowContractAPI created successfully!');
      
      // Test that publicDataProvider can access the contract
      try {
        const ledgerState = await api.getLedgerState();
        console.log('[API] Contract access verified, ledger state:', ledgerState);
        
        if (ledgerState === null) {
          console.log('[API] ✅ Contract is accessible but has no escrows yet (this is normal)');
        } else {
          console.log('[API] ✅ Contract has escrows:', ledgerState.escrows?.size || 0);
        }
      } catch (queryError) {
        console.warn('[API] Contract query failed, but API is still functional:', queryError instanceof Error ? queryError.message : String(queryError));
      }

      console.log('[API] Escrow API created successfully!');
      setEscrowAPI(api);
      setConnected(true);

      // Load existing escrows
      await loadEscrows(api);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEscrows = async (api: EscrowContractAPI) => {
    try {
      const allEscrows = await api.getAllEscrows();
      setEscrows(allEscrows);
    } catch (err: any) {
      console.error('Failed to load escrows:', err);
    }
  };

  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escrowAPI) return;

    setLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!dustAmount || !contributorAddress) {
        throw new Error('DUST amount and contributor address are required');
      }

      const amount = BigInt(dustAmount);
      if (amount <= 0n) {
        throw new Error('DUST amount must be greater than 0');
      }

      // Prepare escrow parameters with proper Midnight address parsing
      const params: CreateEscrowParams = {
        contributor: addressToPublicKey(contributorAddress), // Accepts Bech32m (mn1...) or hex
        feeAddress: feeAddress ? addressToPublicKey(feeAddress) : addressToPublicKey('0x' + '22'.repeat(32)),
        org: orgId ? hexToBytes32(orgId) : hexToBytes32('0x' + '33'.repeat(32)), // Default org ID
        fee: BigInt(fee),
        coin: createCoinInfo(
          '0x' + '44'.repeat(32), // Random nonce - in production, use proper nonce
          amount,
        ),
      };

      // Create escrow
      const result = await escrowAPI.createEscrow(params);

      alert(`Escrow created successfully!\nEscrow ID: ${result.escrowId}\nTransaction: ${result.txData.txId}`);

      // Reload escrows
      await loadEscrows(escrowAPI);

      // Clear form
      setDustAmount('');
      setContributorAddress('');
      setOrgId('');
      setFeeAddress('');
    } catch (err: any) {
      setError(err.message || 'Failed to create escrow');
      console.error('Create escrow error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseEscrow = async (escrowId: number) => {
    if (!escrowAPI) return;

    setLoading(true);
    setError('');

    try {
      const result = await escrowAPI.releaseEscrow(escrowId);
      alert(`Escrow released successfully!\nTransaction: ${result.txId}`);

      // Reload escrows
      await loadEscrows(escrowAPI);
    } catch (err: any) {
      setError(err.message || 'Failed to release escrow');
      console.error('Release escrow error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert Uint8Array to hex
  const bytesToHex = (bytes: Uint8Array): string => {
    return (
      '0x' +
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Midnight Escrow DApp</h1>

      {error && (
        <div
          style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      {!connected ? (
        <div>
          <p>Connect your Lace wallet to interact with the escrow contract.</p>
          <button
            onClick={connectWallet}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Connecting...' : 'Connect Lace Wallet'}
          </button>
        </div>
      ) : (
        <div>
          <div
            style={{
              backgroundColor: '#e7f3ff',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          >
            <strong>Connected:</strong> {walletAddress}
            <br />
            <strong>Contract:</strong> {CONTRACT_ADDRESS}
          </div>

          {/* Create Escrow Form */}
          <div
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
            }}
          >
            <h2>Create New Escrow</h2>
            <form onSubmit={handleCreateEscrow}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  DUST Amount (required) *
                </label>
                <input
                  type="number"
                  value={dustAmount}
                  onChange={(e) => setDustAmount(e.target.value)}
                  placeholder="e.g., 1000"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
                <small>Enter amount in smallest units (1 DUST = 1000000 smallest units)</small>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Contributor Address (required) *
                </label>
                <input
                  type="text"
                  value={contributorAddress}
                  onChange={(e) => setContributorAddress(e.target.value)}
                  placeholder="mn1... (Midnight Bech32m address)"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
                <small>Midnight address in Bech32m format (starts with 'mn1') or hex</small>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Organization ID (optional)</label>
                <input
                  type="text"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  placeholder="0x3333333333333333333333333333333333333333333333333333333333333333"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Fee Address (optional)</label>
                <input
                  type="text"
                  value={feeAddress}
                  onChange={(e) => setFeeAddress(e.target.value)}
                  placeholder="mn1... (Midnight Bech32m address)"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
                <small>Midnight address (optional, defaults to platform fee address)</small>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Fee Amount</label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                {loading ? 'Creating...' : 'Create Escrow'}
              </button>
            </form>
          </div>

          {/* Escrows List */}
          <div>
            <h2>Active Escrows ({escrows.length})</h2>
            {escrows.length === 0 ? (
              <p>No escrows found.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {escrows.map((escrow) => (
                  <div
                    key={escrow.id}
                    style={{
                      border: '1px solid #ddd',
                      padding: '15px',
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <h3>Escrow #{escrow.id}</h3>
                    <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                      <div>
                        <strong>Status:</strong>{' '}
                        <span
                          style={{
                            color: escrow.state === 'active' ? 'green' : escrow.state === 'released' ? 'blue' : 'gray',
                          }}
                        >
                          {escrow.state.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <strong>Amount:</strong> {escrow.coin.value.toString()} DUST
                      </div>
                      <div>
                        <strong>Fee:</strong> {escrow.fee.toString()}
                      </div>
                      <div style={{ wordBreak: 'break-all' }}>
                        <strong>Contributor:</strong> {bytesToHex(escrow.contributor.bytes)}
                      </div>
                      <div style={{ wordBreak: 'break-all' }}>
                        <strong>Organization:</strong> {bytesToHex(escrow.org)}
                      </div>
                      {escrow.state === 'active' && (
                        <button
                          onClick={() => handleReleaseEscrow(escrow.id)}
                          disabled={loading}
                          style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            fontSize: '14px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Release Escrow
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
