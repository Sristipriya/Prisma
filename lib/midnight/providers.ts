import { Contract } from '../../contracts/managed/payroll/contract/index.js';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FinalizedTransaction, Transaction, SignatureEnabled, Proof, Binding } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { toHex, fromHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import { deployContract, findDeployedContract, createCircuitCallTxInterface, createCallTxOptions, createUnprovenCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

setNetworkId('preprod');

// 'payroll' matches the keys served at /payroll/keys/spend.prover + spend.verifier
const compiledPayrollContract = CompiledContract.make('payroll', Contract as any).pipe(
  CompiledContract.withWitnesses({} as never)
);

// Deployed Preprod contract address — Midnight SDK requires NO 0x prefix
export const PREPROD_CONTRACT_ADDRESS =
  '6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f';

function inMemoryPrivateStateProvider() {
  let contractAddress: string = '';
  const store = new Map<string, any>();     // key: `${contractAddress}:${stateId}`
  const signingKeys = new Map<string, any>();

  const key = (id: string) => `${contractAddress}:${id}`;

  return {
    setContractAddress(address: any) {
      contractAddress = address ?? '';
    },
    get: async (stateId: string) => {
      const v = store.get(key(stateId));
      return v !== undefined ? v : null;
    },
    set: async (stateId: string, state: any) => {
      store.set(key(stateId), state);
    },
    remove: async (stateId: string) => {
      store.delete(key(stateId));
    },
    clear: async () => {
      store.clear();
    },
    setSigningKey: async (addr: any, k: any) => { signingKeys.set(addr, k); },
    getSigningKey: async (addr: any) => signingKeys.get(addr) ?? null,
    removeSigningKey: async (addr: any) => { signingKeys.delete(addr); },
    clearSigningKeys: async () => { signingKeys.clear(); },
    // Export/import stubs (newer SDK versions may call these)
    exportPrivateStates: async () => ({ states: [] } as any),
    importPrivateStates: async () => ({ imported: 0, skipped: 0 } as any),
    exportSigningKeys: async () => ({ keys: [] } as any),
    importSigningKeys: async () => ({ imported: 0, skipped: 0 } as any),
  } as any;
}

async function setupProviders(api: any) {
  // Get network config from the 1AM wallet — it knows its own Proofstation URL
  let config: any = null;
  try {
    if (typeof api?.getConfiguration === 'function') config = await api.getConfiguration();
  } catch (e) {}

  // Fallback: 1AM Preprod API endpoints (matches wallet screenshot)
  // 1AM PROOFSTATION is active inside the wallet — proof generation is handled
  // automatically when calling balanceUnsealedTransaction, no separate proof server needed.
  if (!config) {
    config = {
      indexerUri: 'https://api-preprod.1am.xyz/api/v4/graphql',
      indexerWsUri: 'wss://api-preprod.1am.xyz/api/v4/graphql/ws',
      nodeUri: 'wss://rpc.preprod.midnight.network',
      // proverServerUri is intentionally omitted — 1AM Proofstation runs inside the wallet
    };
  }

  // Get shielded keys from wallet
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

  // FetchZkConfigProvider appends /keys/${circuitName}.prover, so we pass origin + /payroll
  const zkConfigProvider = new FetchZkConfigProvider(window.location.origin + '/payroll', fetch.bind(window) as any);

  // WALLET-DELEGATED proof provider:
  // Instead of calling the external HTTP /check endpoint (which has a v4/v5 payload mismatch),
  // we delegate proof generation to the 1AM wallet's built-in Proofstation.
  // The wallet internally calls its own version-aligned prover for us.
  const proofProvider = {
    async proveTx(unprovenTx: any, _config?: any) {
      // Serialize the unproven tx
      const serializedTx = toHex(unprovenTx.serialize());
      // Try proveTransaction first (1AM DApp connector method)
      const proveFn =
        api.proveTransaction ||
        api.prove ||
        api.proveUnsealedTransaction;
      if (typeof proveFn === 'function') {
        const received = await proveFn.call(api, serializedTx);
        const rawTx =
          typeof received === 'string'
            ? received
            : received?.tx || received?.serializedTx || serializedTx;
        return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
          'signature', 'proof', 'binding', fromHex(rawTx)
        );
      }
      // Fallback: try balanceUnsealedTransaction which some wallet versions combine prove+balance
      const balanceFn = api.balanceUnsealedTransaction || api.balanceTransaction;
      if (typeof balanceFn === 'function') {
        const received = await balanceFn.call(api, serializedTx);
        const rawTx =
          typeof received === 'string'
            ? received
            : received?.tx || received?.serializedTx || serializedTx;
        return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
          'signature', 'proof', 'binding', fromHex(rawTx)
        );
      }
      throw new Error('1AM Wallet does not expose a proveTransaction/balanceUnsealedTransaction method. Make sure the 1AM wallet extension is installed and unlocked.');
    },
  } as any;

  const publicDataProvider = indexerPublicDataProvider(
    config.indexerUri || 'https://api-preprod.1am.xyz/api/v4/graphql',
    config.indexerWsUri || 'wss://api-preprod.1am.xyz/api/v4/graphql/ws',
    window.WebSocket as any
  );

  const walletProvider = {
    getCoinPublicKey: () => coinPublicKey,
    getEncryptionPublicKey: () => encryptionPublicKey,
    balanceTx: async (tx: UnboundTransaction, _ttl?: Date) => {
      const serializedTx = toHex(tx.serialize());
      const balanceFn = api.balanceUnsealedTransaction || api.balanceTransaction || api.balanceTx;
      if (typeof balanceFn !== 'function') {
        throw new Error('1AM Wallet does not expose a balance method.');
      }
      const received = await balanceFn.call(api, serializedTx);
      const rawTx =
        typeof received === 'string'
          ? received
          : received?.tx || received?.serializedTx || serializedTx;
      return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
        'signature',
        'proof',
        'binding',
        fromHex(rawTx)
      );
    },
  };

  const midnightProvider = {
    submitTx: async (tx: FinalizedTransaction) => {
      await api.submitTransaction(toHex(tx.serialize()));
      const txIdentifiers = tx.identifiers();
      return txIdentifiers[0];
    },
  };

  return {
    privateStateProvider,
    zkConfigProvider,
    proofProvider,
    publicDataProvider,
    walletProvider,
    midnightProvider,
  };
}

/**
 * callPayrollCircuit — Calls the `spend` circuit on the already-deployed Preprod contract.
 * This is the LIVE circuit call used for the demo.
 *
 * @param api - 1AM/Lace wallet API object
 * @param amount - Amount to spend (as a number; will be converted to bigint)
 * @param onStep - Optional progress callback for the UI step log
 * @returns { txHash: string }
 */
export async function callPayrollCircuit(
  api: any,
  amount: number,
  onStep?: (msg: string) => void
): Promise<{ txHash: string }> {
  const log = (msg: string) => { onStep?.(msg); console.log('[Prisma ZK]', msg); };

  log('Setting up Midnight SDK providers…');
  const providers = await setupProviders(api);

  // Initialize the local in-memory private state
  providers.privateStateProvider.setContractAddress(PREPROD_CONTRACT_ADDRESS);
  await providers.privateStateProvider.set('payroll-spend-demo', {});

  log(`Connecting to deployed contract at ${PREPROD_CONTRACT_ADDRESS.slice(0, 18)}…`);

  const spendAmount = BigInt(Math.max(1, Math.floor(amount)));

  // Build the unproven call transaction directly (no indexer fetch needed)
  const callOptions = createCallTxOptions(
    compiledPayrollContract as any,
    'spend',
    PREPROD_CONTRACT_ADDRESS,
    'payroll-spend-demo',
    undefined,
    [spendAmount]
  );
  log(`Building ZK transaction for spend(${spendAmount})…`);
  const txData = await createUnprovenCallTx(providers as any, callOptions as any);

  // Serialize the unproven tx to hex
  const actualUnprovenTx = (txData as any).private.unprovenTx;
  const hexUnproven = toHex(actualUnprovenTx.serialize());

  // The 1AM wallet's balanceUnsealedTransaction handles BOTH:
  //   1. ZK proof generation via built-in Proofstation (takes ~25 seconds)
  //   2. Coin balancing (adding tDUST to cover fees)
  // This is ONE call — do NOT call proofProvider.proveTx separately.
  log('Sending to 1AM Proofstation for ZK proof + balancing…');
  const balanceFn =
    api.balanceUnsealedTransaction ||
    api.balanceTransaction ||
    api.balanceTx;

  if (typeof balanceFn !== 'function') {
    throw new Error('1AM wallet does not expose balanceUnsealedTransaction. Make sure the wallet extension is installed and unlocked.');
  }

  const balancedRaw = await balanceFn.call(api, hexUnproven);
  const hexBalanced =
    typeof balancedRaw === 'string'
      ? balancedRaw
      : balancedRaw?.tx || balancedRaw?.serializedTx;

  if (!hexBalanced) {
    throw new Error('Wallet balanceUnsealedTransaction returned an unexpected result: ' + JSON.stringify(balancedRaw));
  }

  // Submit the proven+balanced transaction
  log('Submitting proven transaction to Preprod network…');
  const submitResult = await api.submitTransaction(hexBalanced);

  // Extract txHash from the submission result
  const txHash: string =
    typeof submitResult === 'string'
      ? submitResult
      : submitResult?.txHash || submitResult?.id || submitResult?.transactionId || hexBalanced.slice(0, 64);

  log(`Transaction submitted! Hash: ${txHash}`);
  return { txHash };
}

/**
 * deployPayrollContract — Deploys a fresh payroll contract (used from payroll page).
 */
export async function deployPayrollContract(
  api: any,
  amount: number,
  _employeeName: string
): Promise<{ contract: any; address: string; providers: any }> {
  const providers = await setupProviders(api);
  const budget = BigInt(Math.max(1, Math.floor(amount)));

  const deployedContract = await deployContract(providers as any, {
    privateStateId: 'payroll-deploy',
    compiledContract: compiledPayrollContract as any,
    args: [budget],
    initialPrivateState: {} as any,
  } as any);

  return {
    contract: deployedContract,
    address: deployedContract.deployTxData.public.contractAddress,
    providers,
  };
}

/**
 * deployVendorContract — Deploys a vendor settlement contract.
 */
export async function deployVendorContract(
  api: any,
  amount: number,
  _vendorName: string
): Promise<{ contract: any; address: string; providers: any }> {
  const providers = await setupProviders(api);
  const budget = BigInt(Math.max(1, Math.floor(amount)));

  const deployedContract = await deployContract(providers as any, {
    privateStateId: 'vendor-deploy',
    compiledContract: compiledPayrollContract as any,
    args: [budget],
    initialPrivateState: {} as any,
  } as any);

  return {
    contract: deployedContract,
    address: deployedContract.deployTxData.public.contractAddress,
    providers,
  };
}

/**
 * withdrawFromPayrollContract — Calls the spend() circuit to withdraw unlocked funds.
 * Used by the worker portal page.
 */
export async function withdrawFromPayrollContract(
  api: any,
  contractAddress: string,
  amount: number
): Promise<{ txHash: string }> {
  const providers = await setupProviders(api);

  providers.privateStateProvider.setContractAddress(contractAddress);
  await providers.privateStateProvider.set('payroll-withdraw', {});

  const deployedContract = await findDeployedContract(providers as any, {
    contractAddress,
    compiledContract: compiledPayrollContract as any,
    privateStateId: 'payroll-withdraw',
    initialPrivateState: {} as any,
  });

  const spendAmount = BigInt(Math.max(1, Math.floor(amount)));
  const txResult = await deployedContract.callTx.spend(spendAmount);
  const txHash: string = (txResult?.public as any)?.txHash ?? 'unknown';
  return { txHash };
}
