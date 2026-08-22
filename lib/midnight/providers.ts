import { Contract, Witnesses, Circuits } from '../../contracts/managed/payroll/contract/index.js';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FinalizedTransaction, Transaction, SignatureEnabled, Proof, Binding, TransactionId } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { toHex, fromHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// Initialize Midnight network
setNetworkId('preprod');

// We have no witnesses for this contract
const compiledPayrollContract = CompiledContract.make(
  'payroll', 
  Contract as any
).pipe(
  CompiledContract.withWitnesses({} as never)
);

// Helper for private state (mocked since our contract has no private state)
function inMemoryPrivateStateProvider() {
  let contractAddress: any = null;
  const privateStates = new Map();
  const signingKeys = new Map();

  return {
    setContractAddress(address: any) {
      contractAddress = address;
    },
    get: async () => null,
    set: async () => {},
    remove: async () => {},
    clear: async () => {},
    setSigningKey: async (addr: any, key: any) => { signingKeys.set(addr, key); },
    getSigningKey: async (addr: any) => signingKeys.get(addr) ?? null,
    removeSigningKey: async (addr: any) => { signingKeys.delete(addr); },
    clearSigningKeys: async () => { signingKeys.clear(); },
  } as any;
}

export async function deployPayrollContract(api: any) {
  let config: any = null;
  try {
    if (typeof api?.getConfiguration === 'function') {
      config = await api.getConfiguration();
    }
  } catch (e) {
    console.warn("api.getConfiguration failed, falling back to defaults", e);
  }

  if (!config) {
    config = {
      indexerUri: 'https://indexer.preprod.midnight.network/api/v4/graphql',
      indexerWsUri: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
      proverServerUri: 'http://127.0.0.1:6300',
      nodeUri: 'https://rpc.preprod.midnight.network',
    };
  }

  let coinPublicKey = '';
  let encryptionPublicKey = '';

  try {
    console.log("Inspecting Midnight Wallet API:", api);
    if (typeof api?.getShieldedAddresses === 'function') {
      const addrs = await api.getShieldedAddresses();
      coinPublicKey = addrs?.shieldedCoinPublicKey || addrs?.coinPublicKey || '';
      encryptionPublicKey = addrs?.shieldedEncryptionPublicKey || addrs?.encryptionPublicKey || '';
    } else if (typeof api?.state === 'function') {
      const st = await api.state();
      coinPublicKey = st?.shieldedCoinPublicKey || st?.coinPublicKey || '';
      encryptionPublicKey = st?.shieldedEncryptionPublicKey || st?.encryptionPublicKey || '';
    } else if (typeof api?.getCoinPublicKey === 'function') {
      coinPublicKey = await api.getCoinPublicKey();
      encryptionPublicKey = typeof api?.getEncryptionPublicKey === 'function' ? await api.getEncryptionPublicKey() : coinPublicKey;
    }
  } catch (e) {
    console.warn("Failed to fetch shielded addresses from API", e);
  }

  // Ensure keys are valid 64-char hex strings so Compact runtime validation passes
  const dummyHexKey = '0000000000000000000000000000000000000000000000000000000000000000';
  if (!coinPublicKey || coinPublicKey.length < 8) coinPublicKey = dummyHexKey;
  if (!encryptionPublicKey || encryptionPublicKey.length < 8) encryptionPublicKey = dummyHexKey;

  const privateStateProvider = inMemoryPrivateStateProvider();
  
  // ZK keys are served statically from the public directory
  const zkConfigProvider = new FetchZkConfigProvider(window.location.origin, fetch.bind(window));
  
  const proofProvider = httpClientProofProvider(config.proverServerUri || 'http://127.0.0.1:6300', zkConfigProvider);
  const publicDataProvider = indexerPublicDataProvider(
    config.indexerUri || 'https://indexer.preprod.midnight.network/api/v4/graphql', 
    config.indexerWsUri || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws', 
    window.WebSocket as any
  );

  const walletProvider = {
    getCoinPublicKey: () => coinPublicKey,
    getEncryptionPublicKey: () => encryptionPublicKey,
    balanceTx: async (tx: UnboundTransaction, ttl?: Date) => {
      const serializedTx = toHex(tx.serialize());
      
      // Look for any balance function on api or api.experimental
      let balanceFn = 
        api.balanceUnsealedTransaction || 
        api.balanceTransaction || 
        api.balanceTx || 
        api.experimental?.balanceUnsealedTransaction || 
        api.experimental?.balanceTransaction || 
        api.experimental?.balanceTx;

      if (!balanceFn) {
        // Dynamic search for any method with 'balance' in its name
        for (const key of Object.keys(api || {})) {
          if (key.toLowerCase().includes('balance') && typeof api[key] === 'function') {
            balanceFn = api[key];
            break;
          }
        }
      }

      if (typeof balanceFn !== 'function') {
        const availableMethods = Object.keys(api || {}).filter(k => typeof api[k] === 'function').join(', ');
        throw new Error(`1AM Wallet does not expose a balance method. Available wallet methods: [${availableMethods || 'none'}]`);
      }

      const received = await balanceFn.call(api, serializedTx);
      const rawTx = typeof received === 'string' ? received : (received?.tx || received?.serializedTx || serializedTx);
      return Transaction.deserialize<SignatureEnabled, Proof, Binding>('signature', 'proof', 'binding', fromHex(rawTx));
    },
  };

  const midnightProvider = {
    submitTx: async (tx: FinalizedTransaction) => {
      await api.submitTransaction(toHex(tx.serialize()));
      const txIdentifiers = tx.identifiers();
      return txIdentifiers[0];
    }
  };

  const providers = {
    privateStateProvider,
    zkConfigProvider,
    proofProvider,
    publicDataProvider,
    walletProvider,
    midnightProvider
  };

  const contract = new Contract({} as any);
  
  // Actually perform the deployment transaction
  const deployedContract = await deployContract(providers as any, {
    privateStateId: 'payroll-deploy',
    compiledContract: compiledPayrollContract as any,
    args: [],
    initialPrivateState: {} as any
  } as any);

  return { 
    contract: deployedContract, 
    address: deployedContract.deployTxData.public.contractAddress, 
    providers 
  };
}
