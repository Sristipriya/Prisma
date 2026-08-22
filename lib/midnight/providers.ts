import { Contract } from '../../contracts/managed/payroll/contract/index.js';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FinalizedTransaction, Transaction, SignatureEnabled, Proof, Binding } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { toHex, fromHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

setNetworkId('preprod');

const compiledPayrollContract = CompiledContract.make('payroll', Contract as any).pipe(CompiledContract.withWitnesses({} as never));

function inMemoryPrivateStateProvider() {
  let contractAddress: any = null;
  const signingKeys = new Map();
  return {
    setContractAddress(address: any) { contractAddress = address; },
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

async function setupProviders(api: any) {
  let config: any = null;
  try { if (typeof api?.getConfiguration === 'function') config = await api.getConfiguration(); } catch (e) {}
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
    if (typeof api?.getShieldedAddresses === 'function') {
      const addrs = await api.getShieldedAddresses();
      coinPublicKey = addrs?.shieldedCoinPublicKey || addrs?.coinPublicKey || '';
      encryptionPublicKey = addrs?.shieldedEncryptionPublicKey || addrs?.encryptionPublicKey || '';
    } else if (typeof api?.state === 'function') {
      const st = await api.state();
      coinPublicKey = st?.shieldedCoinPublicKey || st?.coinPublicKey || '';
      encryptionPublicKey = st?.shieldedEncryptionPublicKey || st?.encryptionPublicKey || '';
    }
  } catch (e) {}

  const dummyHexKey = '0000000000000000000000000000000000000000000000000000000000000000';
  if (!coinPublicKey || coinPublicKey.length < 8) coinPublicKey = dummyHexKey;
  if (!encryptionPublicKey || encryptionPublicKey.length < 8) encryptionPublicKey = dummyHexKey;

  const privateStateProvider = inMemoryPrivateStateProvider();
  const zkConfigProvider = new FetchZkConfigProvider(window.location.origin, fetch.bind(window));
  const proofProvider = httpClientProofProvider(config.proverServerUri || 'http://127.0.0.1:6300', zkConfigProvider);
  const publicDataProvider = indexerPublicDataProvider(config.indexerUri, config.indexerWsUri, window.WebSocket as any);

  const walletProvider = {
    getCoinPublicKey: () => coinPublicKey,
    getEncryptionPublicKey: () => encryptionPublicKey,
    balanceTx: async (tx: UnboundTransaction, ttl?: Date) => {
      const serializedTx = toHex(tx.serialize());
      let balanceFn = api.balanceUnsealedTransaction || api.balanceTransaction || api.balanceTx;
      if (typeof balanceFn !== 'function') throw new Error(`1AM Wallet does not expose a balance method.`);
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

  return { privateStateProvider, zkConfigProvider, proofProvider, publicDataProvider, walletProvider, midnightProvider };
}

export async function deployPayrollContract(api: any, amount: number, employeeName: string) {
  const providers = await setupProviders(api);
  const budget = BigInt(Math.floor(amount));

  const deployedContract = await deployContract(providers as any, {
    privateStateId: 'payroll-deploy',
    compiledContract: compiledPayrollContract as any,
    args: [budget],
    initialPrivateState: {} as any
  } as any);

  return { contract: deployedContract, address: deployedContract.deployTxData.public.contractAddress, providers };
}

export async function withdrawFromPayrollContract(api: any, contractAddress: string, amount: number) {
  const providers = await setupProviders(api);
  const deployedContract = await findDeployedContract(providers as any, {
    contractAddress,
    compiledContract: compiledPayrollContract as any,
    privateStateId: 'payroll-withdraw',
    initialPrivateState: {} as any
  });

  const spendAmount = BigInt(Math.floor(amount));
  const tx = await deployedContract.callTx.spend(spendAmount);
  return { txHash: tx.public.txHash };
}

export async function deployVendorContract(api: any, amount: number, vendorName: string) {
  const providers = await setupProviders(api);
  const budget = BigInt(Math.floor(amount));
  
  const deployedContract = await deployContract(providers as any, {
    privateStateId: 'vendor-deploy',
    compiledContract: compiledPayrollContract as any,
    args: [budget],
    initialPrivateState: {} as any
  } as any);

  return { contract: deployedContract, address: deployedContract.deployTxData.public.contractAddress, providers };
}
