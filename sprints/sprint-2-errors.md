# Sprint 2 - Stellar SDK Integration Errors

## Summary
During Sprint 2, we encountered several issues integrating the `@stellar/stellar-sdk` v14 with the Vite-based React frontend. The main challenge was understanding the SDK's module structure and how to properly import Soroban RPC classes.

---

## Error Timeline

### Error 1: Initial SDK Import Failure
**Error:** `Cannot read properties of undefined (reading 'Server')`

**Cause:** Attempted to use `StellarSdk.SorobanRpc.Server` but `SorobanRpc` was `undefined`.

**Code that failed:**
```typescript
import * as StellarSdk from '@stellar/stellar-sdk';
const server = new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL);
```

**Console output:**
```
SorobanRpc available: undefined
```

---

### Error 2: Dynamic Import Failure
**Error:** `Failed to import Stellar SDK: {}`

**Cause:** Attempted lazy loading with dynamic import, but it failed silently with an empty error object.

**Code that failed:**
```typescript
async function getStellarSdk() {
  stellarSdk = await import('@stellar/stellar-sdk');
  server = new stellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL);
}
```

---

### Error 3: Empty Error Object `{}`
**Error:** Console shows `Create project error: {}` with no useful message.

**Cause:** The error thrown by the SDK doesn't have a `message` property, and `JSON.stringify()` on certain error types returns `{}`.

---

## Root Cause Analysis

### Stellar SDK v14 Module Structure
In `@stellar/stellar-sdk` version 14.x, the package structure changed:

- **Main package** (`@stellar/stellar-sdk`): Contains `Contract`, `TransactionBuilder`, `Address`, `xdr`, etc.
- **RPC subpath** (`@stellar/stellar-sdk/rpc`): Contains `Server`, `Api`, `assembleTransaction`

The old pattern `StellarSdk.SorobanRpc.Server` no longer works because `SorobanRpc` is not exported from the main package.

### Correct Import Pattern
```typescript
// Main SDK imports
import {
  Contract,
  TransactionBuilder,
  Address,
  xdr,
  nativeToScVal,
  scValToNative,
  Account,
} from '@stellar/stellar-sdk';

// RPC imports (separate subpath)
import { Server, Api, assembleTransaction } from '@stellar/stellar-sdk/rpc';
```

---

## Solutions Applied

### 1. Separated Imports
Changed from namespace import to named imports from correct subpaths.

### 2. Improved Error Handling
```typescript
catch (err: any) {
  const errorMessage = err?.message || 
    err?.toString() || 
    (typeof err === 'object' ? JSON.stringify(err) : 'Unknown error');
  return { success: false, error: errorMessage };
}
```

### 3. Added Debug Logging
```typescript
console.log('Server:', typeof Server);
console.log('Api:', typeof Api);
console.log('Contract:', typeof Contract);
```

---

## Current Status

**Pending verification:** The imports have been corrected to use the proper subpath imports. Need to verify:
1. `Server` is now a function (constructor)
2. `Api` is now an object with `isSimulationError`, `isSimulationSuccess`
3. Transaction simulation and signing work correctly

---

## Lessons Learned

1. **Check SDK version and changelog** - Major version updates often change module structure
2. **Empty error objects** - Some libraries throw non-standard errors; always log the full error object
3. **Vite bundling** - Dynamic imports may behave differently than expected with certain packages
4. **Console logging at module load** - Helps verify imports are working before function calls

---

---

## Error 4: assembleTransaction Type Mismatch
**Error:** `TypeError: expected a 'Transaction', got: [object Object]`

**Cause:** The `assembleTransaction` function from `@stellar/stellar-sdk/rpc` expects a specific `Transaction` type, but there was a type mismatch between the main SDK's `TransactionBuilder.build()` output and what the RPC module expected.

**Attempted solutions:**
1. Using `server.prepareTransaction()` - same error (it uses `assembleTransaction` internally)
2. Manual transaction rebuild with soroban data - worked!

**Working solution:**
```typescript
// Instead of using assembleTransaction, manually rebuild:
const successSim = simulated as Api.SimulateTransactionSuccessResponse;

const preparedTx = new TransactionBuilder(account, {
  fee: totalFee,
  networkPassphrase: NETWORK_PASSPHRASE,
})
  .addOperation(opWithAuth)
  .setSorobanData(successSim.transactionData.build())
  .setTimeout(30)
  .build();
```

---

## Error 5: Transaction Failed On-Chain
**Error:** `Transaction status: FAILED` with no clear error message

**Cause:** The contract requires `client.require_auth()` but the authorization entries from simulation were not being included in the final transaction.

**Solution:** Extract auth from simulation result and attach to operation:
```typescript
const auth = successSim.result?.auth || [];
const opWithAuth = contract.call('create_project', ...args);
if (auth.length > 0) {
  (opWithAuth as any).auth = auth;
}
```

---

## Error 6: Bad Sequence Number (txBadSeq)
**Error:** `{"result":{"_switch":{"name":"txBadSeq","value":-5}}}`

**Cause:** The account sequence number becomes stale between:
1. Initial account fetch
2. Simulation
3. Transaction rebuild
4. Signing
5. Submission

By the time the transaction is submitted, the sequence number may have been used by another transaction or simply expired.

**Solution:** Re-fetch the account right before building the final transaction:
```typescript
// After simulation, before building final tx:
const freshAccount = await rpcServer.getAccount(clientAddress);
const preparedTx = new TransactionBuilder(freshAccount, { ... });
```

---

## Summary of Working Flow

1. **Fetch account** - get initial sequence
2. **Build transaction** - with contract operation
3. **Simulate** - get soroban data and auth entries
4. **Re-fetch account** - get fresh sequence number
5. **Rebuild transaction** - with soroban data, auth, and updated fees
6. **Sign with Freighter** - user approves
7. **Submit** - send to network
8. **Poll for result** - wait for confirmation

---

## Related Files
- `/frontend/src/lib/escrow-contract.ts` - Contract interaction functions
- `/frontend/src/context/WalletContext.tsx` - Wallet state management
- `/frontend/src/pages/ClientDashboard.tsx` - UI that calls contract functions

## Contract Details
- **Contract ID:** `CCKCGYGFMTYRAHHNOVMBMGKAP6S4XSWL3TEJJH2D4JCZWBJRIZBUXZII`
- **Network:** Stellar Testnet
- **RPC URL:** `https://soroban-testnet.stellar.org`

## Key Learnings

1. **SDK v14 module structure** - RPC classes are in `@stellar/stellar-sdk/rpc`
2. **Don't use assembleTransaction** - Manual rebuild is more reliable with Vite bundling
3. **Always include auth** - Soroban contracts with `require_auth()` need auth entries
4. **Fresh sequence numbers** - Re-fetch account before final transaction build
5. **Detailed logging** - Essential for debugging blockchain transactions

---

## SOLUTION: Use Generated TypeScript Bindings

After multiple attempts to manually build transactions, the **recommended approach** from Stellar docs is to use generated TypeScript bindings.

### Generate Bindings
```bash
stellar contract bindings typescript \
  --network testnet \
  --contract-id CCKCGYGFMTYRAHHNOVMBMGKAP6S4XSWL3TEJJH2D4JCZWBJRIZBUXZII \
  --output-dir packages/escrow

cd packages/escrow
npm install && npm run build
```

### Use the Generated Client
```typescript
import { Client, networks } from '../../packages/escrow/src';
import freighterApi from '@stellar/freighter-api';

const client = new Client({
  ...networks.testnet,
  rpcUrl: 'https://soroban-testnet.stellar.org',
});

// Create project - much simpler!
const tx = await client.create_project({
  client: clientAddress,
  freelancer: freelancerAddress,
  milestone_amounts: [BigInt(500), BigInt(500)],
});

// Sign and send
const result = await tx.signAndSend({
  signTransaction: async (xdr: string) => {
    const { signedTxXdr } = await freighterApi.signTransaction(xdr, {
      networkPassphrase: networks.testnet.networkPassphrase,
    });
    return signedTxXdr;
  },
});

console.log('Project ID:', result.result);
```

### Benefits of Generated Bindings
1. **Type-safe** - Full TypeScript types for all contract functions
2. **Handles complexity** - Auth, simulation, fees all handled automatically
3. **Error handling** - Contract errors mapped to readable messages
4. **Maintained** - Official Stellar tooling, kept up to date

### Files Created
- `/frontend/packages/escrow/` - Generated NPM package
- `/frontend/src/lib/escrow-client.ts` - Wrapper using generated client
