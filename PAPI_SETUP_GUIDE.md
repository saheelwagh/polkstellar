# PolkadotAPI (papi) Setup Guide

**Date:** December 5, 2025  
**SDK:** PolkadotAPI (papi) with Ink! SDK  
**Reference:** https://papi.how/sdks/ink-sdk/

---

## Overview

We're using **PolkadotAPI (papi)**, a modern Polkadot SDK that provides type-safe contract interactions. The workflow involves:

1. Installing papi CLI
2. Adding the Paseo network
3. Generating contract descriptors from your Ink! contract ABI
4. Using generated types in your frontend code

---

## Step 1: Install papi CLI

```bash
cd frontend
pnpm install
```

The `@polkadot-api/sdk-ink` package is already in `package.json`.

---

## Step 2: Add Paseo Network

```bash
pnpm papi add -w wss://paseo-rpc.dwellir.com paseo
```

This creates a descriptor for the Paseo testnet at `polkadot-api/descriptors`.

---

## Step 3: Generate Contract Descriptors

You need to generate TypeScript types from your contract's ABI/metadata file.

### Get the Contract Metadata

The compiled contract metadata is at:
```
contracts/polkadot/ProjectRegistry/target/ink/ProjectRegistry.json
```

### Generate Descriptors

```bash
pnpm papi ink add ./path/to/ProjectRegistry.json
```

This generates:
- `polkadot-api/descriptors/contracts.ts` (or similar)
- Type-safe contract interface

---

## Step 4: Update polkadot.ts

Once descriptors are generated, update `frontend/src/lib/polkadot.ts`:

Replace placeholder code like:
```typescript
// const contract = sdk.getContract(contracts.projectRegistry, CONTRACT_ADDRESS);
```

With actual generated descriptor:
```typescript
import { contracts } from '@polkadot-api/descriptors';
const contract = sdk.getContract(contracts.projectRegistry, CONTRACT_ADDRESS);
```

---

## Contract Interaction Pattern

### Write Operations (Transactions)

```typescript
import { contracts } from '@polkadot-api/descriptors';
import { web3FromAddress } from '@polkadot/extension-dapp';

const sdk = await getInkSdk();
const contract = sdk.getContract(contracts.projectRegistry, CONTRACT_ADDRESS);

// Get signer from SubWallet
const injector = await web3FromAddress(signerAddress);

// Call contract method
const tx = contract.send.registerProject(
  { signer: injector.signer },
  projectId,
  title,
  descriptionHash,
  milestoneCount
);

// Wait for finalization
const result = await tx.run();
console.log('Transaction hash:', result.txHash);
```

### Read Operations (Queries)

```typescript
const contract = sdk.getContract(contracts.projectRegistry, CONTRACT_ADDRESS);

// Query contract state
const project = await contract.query.getProject(projectId);
console.log('Project:', project);
```

---

## Key Differences from @polkadot/api

| Feature | @polkadot/api | papi |
|---------|---------------|------|
| **Type Safety** | Manual ABI parsing | Full TypeScript types |
| **Setup** | Manual API creation | Automatic via descriptors |
| **Contract Calls** | `contract.tx.method()` | `contract.send.method()` |
| **Queries** | `contract.query.method()` | `contract.query.method()` |
| **Signer** | `api.setSigner()` | Passed to `send()` |

---

## Environment Setup

Create `.env.local`:

```
VITE_POLKADOT_RPC_URL=wss://paseo-rpc.dwellir.com
VITE_POLKADOT_CONTRACT_ADDRESS=<your_deployed_contract_address>
VITE_POLKADOT_NETWORK=paseo
```

---

## Troubleshooting

### "Cannot find module '@polkadot-api/descriptors'"

Run:
```bash
pnpm papi ink add ./path/to/ProjectRegistry.json
```

### "Contract descriptors not yet generated"

The contract functions will throw this error until you generate descriptors. This is intentional - it prevents runtime errors.

### "Contract address not configured"

Ensure `VITE_POLKADOT_CONTRACT_ADDRESS` is set in `.env.local`.

---

## Next Steps

1. ✅ Install dependencies: `pnpm install`
2. ⏳ Add Paseo network: `pnpm papi add -w wss://paseo-rpc.dwellir.com paseo`
3. ⏳ Generate contract descriptors: `pnpm papi ink add ./contracts/polkadot/ProjectRegistry/target/ink/ProjectRegistry.json`
4. ⏳ Update contract functions in `polkadot.ts` with generated imports
5. ⏳ Test wallet connection
6. ⏳ Extend WalletContext for dual wallets
7. ⏳ Add Polkadot button to navbar

---

## Resources

- **papi Documentation:** https://papi.how/
- **Ink! SDK:** https://papi.how/sdks/ink-sdk/
- **SubWallet Docs:** https://docs.subwallet.app/
- **Paseo Testnet:** https://paseo.subscan.io/

---

**Last Updated:** December 5, 2025
