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

## Related Files
- `/frontend/src/lib/escrow-contract.ts` - Contract interaction functions
- `/frontend/src/context/WalletContext.tsx` - Wallet state management
- `/frontend/src/pages/ClientDashboard.tsx` - UI that calls contract functions

## Contract Details
- **Contract ID:** `CCKCGYGFMTYRAHHNOVMBMGKAP6S4XSWL3TEJJH2D4JCZWBJRIZBUXZII`
- **Network:** Stellar Testnet
- **RPC URL:** `https://soroban-testnet.stellar.org`
