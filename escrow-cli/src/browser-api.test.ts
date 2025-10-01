/**
 * Tests for the Escrow Contract Browser API
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

// Mock the Midnight dependencies - must be before imports
vi.mock('@midnight-ntwrk/midnight-js-contracts', () => ({
  findDeployedContract: vi.fn().mockResolvedValue({
    callTx: {
      create: vi.fn().mockResolvedValue({
        contractCallResult: 1n,
        public: {
          txId: 'mock-tx-id-123',
          blockHeight: 1000n,
        },
      }),
      release: vi.fn().mockResolvedValue({
        public: {
          txId: 'mock-tx-id-456',
          blockHeight: 1001n,
        },
      }),
    },
    deployTxData: {
      public: {
        contractAddress: '020071b65c62afee02899fe65d5b8b775488968c4122db1926130b5685c73341108d',
      },
    },
  }),
}));

vi.mock('../../contract/src/managed/escrow/contract/index.cjs', () => ({
  Contract: vi.fn().mockImplementation(() => ({})),
  ledger: vi.fn().mockReturnValue({
    last_escrow_id: 5n,
    escrows: {
      size: () => 2n,
      member: (id: bigint) => id <= 2n,
      lookup: (id: bigint) => ({
        org: new Uint8Array(32),
        contributor: { bytes: new Uint8Array(32) },
        fee_address: { bytes: new Uint8Array(32) },
        fee: 10n,
        state: 0, // active
        coin: {
          nonce: new Uint8Array(32),
          color: new Uint8Array(32),
          value: 1000n,
        },
      }),
      [Symbol.iterator]: function* () {
        yield [
          1n,
          {
            org: new Uint8Array(32),
            contributor: { bytes: new Uint8Array(32) },
            fee_address: { bytes: new Uint8Array(32) },
            fee: 10n,
            state: 0,
            coin: {
              nonce: new Uint8Array(32),
              color: new Uint8Array(32),
              value: 1000n,
            },
          },
        ];
        yield [
          2n,
          {
            org: new Uint8Array(32),
            contributor: { bytes: new Uint8Array(32) },
            fee_address: { bytes: new Uint8Array(32) },
            fee: 20n,
            state: 1, // released
            coin: {
              nonce: new Uint8Array(32),
              color: new Uint8Array(32),
              value: 2000n,
            },
          },
        ];
      },
    },
    instance: 1n,
  }),
}));

// Import the API after mocks are set up
import {
  EscrowContractAPI,
  createEscrowAPI,
  hexToBytes32,
  hexToPublicKey,
  createCoinInfo,
  TESTNET_CONFIG,
  TESTNET_CONTRACT_ADDRESS,
} from './browser-api';
import type { EscrowProviders, CreateEscrowParams } from './browser-api';

describe('EscrowContractAPI', () => {
  let mockProviders: EscrowProviders;
  let api: EscrowContractAPI;

  beforeAll(() => {
    // Mock providers
    mockProviders = {
      publicDataProvider: {
        queryContractState: vi.fn().mockResolvedValue({
          data: {}, // Mock contract state data
        }),
      },
      privateStateProvider: {},
      zkConfigProvider: {},
      proofProvider: {},
      walletProvider: {} as any,
      midnightProvider: {} as any,
    } as any;
  });

  describe('Helper Functions', () => {
    it('should convert hex to bytes32', () => {
      const hex = '0x' + '12'.repeat(32);
      const bytes = hexToBytes32(hex);

      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(32);
      expect(bytes[0]).toBe(0x12);
    });

    it('should throw error for invalid hex length', () => {
      expect(() => hexToBytes32('0x1234')).toThrow('Hex string must be exactly 32 bytes');
    });

    it('should convert hex to public key format', () => {
      const hex = '0x' + 'ab'.repeat(32);
      const pubKey = hexToPublicKey(hex);

      expect(pubKey).toHaveProperty('bytes');
      expect(pubKey.bytes).toBeInstanceOf(Uint8Array);
      expect(pubKey.bytes.length).toBe(32);
    });

    it('should create coin info object', () => {
      const nonce = '0x' + '01'.repeat(32);
      const value = 1000n;
      const coin = createCoinInfo(nonce, value);

      expect(coin).toHaveProperty('nonce');
      expect(coin).toHaveProperty('color');
      expect(coin).toHaveProperty('value');
      expect(coin.value).toBe(value);
      expect(coin.nonce).toBeInstanceOf(Uint8Array);
    });

    it('should create coin info with custom color', () => {
      const nonce = '0x' + '01'.repeat(32);
      const color = '0x' + 'ff'.repeat(32);
      const value = 2000n;
      const coin = createCoinInfo(nonce, value, color);

      expect(coin.color[0]).toBe(0xff);
    });
  });

  describe('Contract Connection', () => {
    beforeAll(async () => {
      api = new EscrowContractAPI(mockProviders, TESTNET_CONTRACT_ADDRESS);
    });

    it('should create API instance', () => {
      expect(api).toBeInstanceOf(EscrowContractAPI);
    });

    it('should connect to contract', async () => {
      await expect(api.connect()).resolves.not.toThrow();
    });

    it('should throw error when calling methods before connect', async () => {
      const newApi = new EscrowContractAPI(mockProviders, TESTNET_CONTRACT_ADDRESS);

      await expect(newApi.createEscrow({} as any)).rejects.toThrow('Contract not connected');
      await expect(newApi.releaseEscrow(1)).rejects.toThrow('Contract not connected');
    });
  });

  describe('Escrow Operations', () => {
    beforeAll(async () => {
      api = new EscrowContractAPI(mockProviders, TESTNET_CONTRACT_ADDRESS);
      await api.connect();
    });

    it('should create a new escrow', async () => {
      const params: CreateEscrowParams = {
        contributor: { bytes: new Uint8Array(32) },
        feeAddress: { bytes: new Uint8Array(32) },
        org: new Uint8Array(32),
        fee: 10n,
        coin: {
          nonce: new Uint8Array(32),
          color: new Uint8Array(32),
          value: 1000n,
        },
      };

      const result = await api.createEscrow(params);

      expect(result).toHaveProperty('escrowId');
      expect(result).toHaveProperty('txData');
      expect(result.escrowId).toBe(1n);
      expect(result.txData.txId).toBe('mock-tx-id-123');
    });

    it('should release an escrow', async () => {
      const txData = await api.releaseEscrow(1);

      expect(txData).toHaveProperty('txId');
      expect(txData.txId).toBe('mock-tx-id-456');
    });

    it('should accept bigint escrow ID for release', async () => {
      const txData = await api.releaseEscrow(1n);

      expect(txData).toHaveProperty('txId');
      expect(txData.txId).toBe('mock-tx-id-456');
    });
  });

  describe('Query Operations', () => {
    beforeAll(async () => {
      api = new EscrowContractAPI(mockProviders, TESTNET_CONTRACT_ADDRESS);
      await api.connect();
    });

    it('should get ledger state', async () => {
      const state = await api.getLedgerState();

      expect(state).toBeDefined();
      expect(state.last_escrow_id).toBe(5n);
      expect(state.escrows.size()).toBe(2n);
    });

    it('should get all escrows', async () => {
      const escrows = await api.getAllEscrows();

      expect(escrows).toBeInstanceOf(Array);
      expect(escrows.length).toBe(2);
      expect(escrows[0].id).toBe(1);
      expect(escrows[0].state).toBe('active');
      expect(escrows[1].id).toBe(2);
      expect(escrows[1].state).toBe('released');
    });

    it('should get escrow by ID', async () => {
      const escrow = await api.getEscrowById(1);

      expect(escrow).toBeDefined();
      expect(escrow.id).toBe(1);
      expect(escrow.state).toBe('active');
      expect(escrow.fee).toBe(10n);
      expect(escrow.coin.value).toBe(1000n);
    });

    it('should return null for non-existent escrow', async () => {
      const escrow = await api.getEscrowById(999);

      expect(escrow).toBeNull();
    });

    it('should handle empty contract state', async () => {
      mockProviders.publicDataProvider.queryContractState = vi.fn().mockResolvedValue(null);

      const state = await api.getLedgerState();
      expect(state).toBeNull();

      const escrows = await api.getAllEscrows();
      expect(escrows).toEqual([]);

      const escrow = await api.getEscrowById(1);
      expect(escrow).toBeNull();
    });
  });

  describe('createEscrowAPI Helper', () => {
    it('should create and connect API in one call', async () => {
      const connectedApi = await createEscrowAPI(mockProviders, TESTNET_CONTRACT_ADDRESS);

      expect(connectedApi).toBeInstanceOf(EscrowContractAPI);

      // Should be able to call methods immediately
      const params: CreateEscrowParams = {
        contributor: { bytes: new Uint8Array(32) },
        feeAddress: { bytes: new Uint8Array(32) },
        org: new Uint8Array(32),
        fee: 10n,
        coin: {
          nonce: new Uint8Array(32),
          color: new Uint8Array(32),
          value: 1000n,
        },
      };

      await expect(connectedApi.createEscrow(params)).resolves.toBeDefined();
    });

    it('should accept custom witnesses', async () => {
      const customWitnesses = { localSecretKey: () => new Uint8Array(32) };
      const connectedApi = await createEscrowAPI(mockProviders, TESTNET_CONTRACT_ADDRESS, customWitnesses);

      expect(connectedApi).toBeInstanceOf(EscrowContractAPI);
    });
  });

  describe('Network Configuration', () => {
    it('should have correct testnet configuration', () => {
      expect(TESTNET_CONFIG).toHaveProperty('indexer');
      expect(TESTNET_CONFIG).toHaveProperty('indexerWS');
      expect(TESTNET_CONFIG).toHaveProperty('node');
      expect(TESTNET_CONFIG).toHaveProperty('proofServer');

      expect(TESTNET_CONFIG.indexer).toContain('testnet-02');
      expect(TESTNET_CONFIG.indexerWS).toContain('wss://');
    });

    it('should have correct contract address format', () => {
      expect(TESTNET_CONTRACT_ADDRESS).toMatch(/^[0-9a-f]+$/);
      expect(TESTNET_CONTRACT_ADDRESS.length).toBeGreaterThan(0);
    });
  });
});
