# SubWallet + Polkadot Frontend Integration Steps

**Date:** December 5, 2025  
**Wallet:** SubWallet  
**Testnet:** Paseo (not Rococo - deprecated)  
**Status:** Planning Phase

---

## Overview

This document outlines the step-by-step process to integrate SubWallet with the PolkStellar frontend for Polkadot contract interactions. SubWallet will be used alongside Freighter (Stellar) for dual-chain operations.

---

## Prerequisites

- ✅ Polkadot contract deployed on Paseo testnet
- ✅ Contract address saved
- ✅ Contract ABI available
- ✅ SubWallet installed in browser
- ✅ Paseo testnet configured in SubWallet

---

## Phase 1: Environment & Dependencies Setup

### Step 1.1: Install Polkadot Dependencies

**What:** Add required Polkadot libraries to `package.json`

**Libraries needed:**
- `@polkadot/api` - Polkadot blockchain API
- `@polkadot/api-contract` - Smart contract interactions
- `@polkadot/extension-dapp` - Wallet extension communication
- `@polkadot/util` - Utility functions
- `@polkadot/util-crypto` - Cryptographic utilities

**Command:**
```bash
pnpm add @polkadot/api @polkadot/api-contract @polkadot/extension-dapp @polkadot/util @polkadot/util-crypto
```

### Step 1.2: Create Environment Configuration

**What:** Add Polkadot configuration to environment

**File:** Create `.env.local` in `/frontend/` (or update existing)

**Variables needed:**
```
VITE_POLKADOT_RPC_URL=wss://paseo-rpc.dwellir.com
VITE_POLKADOT_CONTRACT_ADDRESS=<deployed_contract_address>
VITE_POLKADOT_NETWORK=paseo
```

**Note:** 
- Use Paseo RPC endpoint (not Rococo)
- Contract address from deployment
- Network name for identification

### Step 1.3: Create Contract ABI File

**What:** Extract and save contract ABI as JSON

**File:** Create `/frontend/src/contracts/polkadot-abi.json`

**Source:** Generated from contract build
```bash
# After building contract:
# contracts/polkadot/project-registry/target/ink/project_registry.json
```

**Contains:**
- Contract metadata
- Function signatures
- Event definitions
- Type information

---

## Phase 2: Wallet Context Extension

### Step 2.1: Extend WalletContext for Dual Wallets

**What:** Modify `WalletContext.tsx` to support both Stellar and Polkadot wallets

**Current state:**
- Only handles Freighter (Stellar)
- Single wallet connection

**Changes needed:**
- Add Polkadot wallet state (connected, address, account)
- Add SubWallet connection logic
- Add separate connect/disconnect for Polkadot
- Keep Stellar wallet logic separate

**New interface structure:**
```typescript
interface WalletContextType {
  // Stellar wallet
  stellar: {
    isConnected: boolean;
    address: string;
    isConnecting: boolean;
    error: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
  };
  
  // Polkadot wallet
  polkadot: {
    isConnected: boolean;
    address: string;
    isConnecting: boolean;
    error: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
  };
}
```

### Step 2.2: Implement SubWallet Connection

**What:** Add SubWallet detection and connection logic

**Logic:**
1. Detect if SubWallet extension is installed
2. Request wallet permissions
3. Get available accounts
4. Store selected account address
5. Handle connection errors

**Key functions:**
- `web3Enable()` - Enable wallet extension
- `web3Accounts()` - Get available accounts
- `web3FromAddress()` - Get signer for account

### Step 2.3: Add Polkadot API Instance

**What:** Create and manage Polkadot API connection

**Logic:**
1. Create WsProvider with Paseo RPC URL
2. Initialize ApiPromise
3. Keep connection alive
4. Handle reconnection on failure

**Lifecycle:**
- Create on wallet connect
- Destroy on wallet disconnect
- Reuse for multiple calls

---

## Phase 3: Update Layout Component

### Step 3.1: Add Polkadot Connect Button

**What:** Add "Connect Polkadot Wallet" button to navbar

**Current button:** "Connect Stellar Wallet"

**New button:**
- Show when Polkadot not connected
- Display connected address when connected
- Allow disconnect
- Show loading state during connection

**Placement:** Next to Stellar button in navbar

**Styling:** 
- Polkadot color scheme (purple/pink)
- Match Stellar button style
- Show both wallet statuses

### Step 3.2: Update Wallet Status Display

**What:** Show both wallet connection statuses

**Display:**
- Stellar: "Connected: 0x1234...5678" (green)
- Polkadot: "Connected: 1ABC2def..." (purple)
- Or: "Connect Stellar" / "Connect Polkadot" (if not connected)

**Mobile:** Stack vertically or use dropdown

---

## Phase 4: Implement Polkadot Contract Service

### Step 4.1: Create Contract Instance Manager

**What:** Initialize and manage contract instance in `polkadot.ts`

**Logic:**
1. Load contract ABI from JSON file
2. Create ContractPromise instance
3. Expose for use in other functions
4. Handle contract not deployed error

**File:** `/frontend/src/lib/polkadot.ts`

### Step 4.2: Implement Wallet Connection Function

**What:** Replace placeholder `connectPolkadotWallet()` with real implementation

**Function:**
```typescript
export async function connectPolkadotWallet(): Promise<string | null>
```

**Logic:**
1. Call `web3Enable('PolkStellar')`
2. Check if extension installed
3. Get accounts via `web3Accounts()`
4. Return first account address
5. Handle errors (extension not found, no accounts)

### Step 4.3: Implement isPolkadotConnected Check

**What:** Replace placeholder `isPolkadotConnected()` with real check

**Function:**
```typescript
export async function isPolkadotConnected(): Promise<boolean>
```

**Logic:**
1. Check if SubWallet extension available
2. Check if accounts exist
3. Return boolean

---

## Phase 5: Implement Contract Write Operations

### Step 5.1: Implement registerProject

**What:** Register project metadata on Polkadot

**Function signature:**
```typescript
export async function registerProject(
  projectId: string,
  title: string,
  descriptionHash: string,
  milestoneCount: number,
  signerAddress: string
): Promise<string> // Returns tx hash
```

**Logic:**
1. Get signer from `web3FromAddress()`
2. Create transaction via `contract.tx.registerProject()`
3. Sign and send transaction
4. Wait for confirmation
5. Return transaction hash
6. Handle errors (insufficient gas, invalid params)

**Gas limit:** Use `-1` for automatic estimation

### Step 5.2: Implement submitDeliverable

**What:** Submit work deliverable hash to Polkadot

**Function signature:**
```typescript
export async function submitDeliverable(
  projectId: string,
  milestoneId: number,
  deliverableHash: string,
  signerAddress: string
): Promise<string> // Returns tx hash
```

**Logic:**
1. Get signer
2. Create transaction via `contract.tx.submitDeliverable()`
3. Sign and send
4. Wait for confirmation
5. Return tx hash

### Step 5.3: Implement markApproved

**What:** Mark milestone as approved (CRITICAL - called BEFORE Stellar release)

**Function signature:**
```typescript
export async function markApproved(
  projectId: string,
  milestoneId: number,
  signerAddress: string
): Promise<string> // Returns tx hash
```

**Logic:**
1. Get signer
2. Create transaction via `contract.tx.markApproved()`
3. Sign and send
4. Wait for confirmation
5. Return tx hash

**Important:** This must succeed before calling Stellar `release_milestone()`

---

## Phase 6: Implement Contract Read Operations

### Step 6.1: Implement getProjectMetadata

**What:** Query project metadata from Polkadot

**Function signature:**
```typescript
export async function getProjectMetadata(
  projectId: string
): Promise<PolkadotProject | null>
```

**Logic:**
1. Create query via `contract.query.getProject()`
2. Parse result
3. Return typed object or null

### Step 6.2: Implement getDeliverable

**What:** Query deliverable record from Polkadot

**Function signature:**
```typescript
export async function getDeliverable(
  projectId: string,
  milestoneId: number
): Promise<DeliverableRecord | null>
```

**Logic:**
1. Create query via `contract.query.getDeliverable()`
2. Parse result
3. Return typed object or null

### Step 6.3: Implement getMilestoneStatus

**What:** Query milestone status from Polkadot

**Function signature:**
```typescript
export async function getMilestoneStatus(
  projectId: string,
  milestoneId: number
): Promise<{ submitted: boolean; approved: boolean; deliverableHash?: string }>
```

**Logic:**
1. Query milestone from contract
2. Extract status fields
3. Return status object

---

## Phase 7: Update Frontend Components

### Step 7.1: Update ClientDashboard

**What:** Show Polkadot contract data alongside Stellar data

**Changes:**
- Display project metadata from Polkadot
- Show deliverable submission status
- Show approval status
- Display transaction hashes for both chains

### Step 7.2: Update FreelancerDashboard

**What:** Show Polkadot contract data for freelancer view

**Changes:**
- Display submitted deliverables
- Show approval status
- Display milestone status from Polkadot

### Step 7.3: Create Dual-Chain Status Component

**What:** New component showing both chain statuses

**Display:**
- Stellar: Financial status (funded, released)
- Polkadot: Metadata status (submitted, approved)
- Last sync time
- Error indicators

---

## Phase 8: Error Handling & Recovery

### Step 8.1: Add Transaction Error Handling

**What:** Handle common transaction failures

**Errors to handle:**
- Insufficient gas
- Invalid parameters
- Network timeout
- User rejected transaction
- Contract not found
- Account not authorized

**Recovery:**
- Show user-friendly error messages
- Suggest actions (increase gas, retry, etc.)
- Log errors for debugging

### Step 8.2: Add Retry Logic

**What:** Implement exponential backoff for failed transactions

**Logic:**
- Retry up to 3 times
- Wait 1s, 2s, 4s between retries
- Show retry status to user
- Allow manual retry

### Step 8.3: Add Connection Recovery

**What:** Handle wallet disconnection during transaction

**Logic:**
- Detect wallet disconnection
- Pause pending transactions
- Show reconnection prompt
- Resume on reconnection

---

## Phase 9: Testing

### Step 9.1: Test SubWallet Connection

**What:** Verify wallet connection works

**Test cases:**
- [ ] SubWallet installed and enabled
- [ ] Can get account address
- [ ] Can disconnect and reconnect
- [ ] Error handling when extension not found

### Step 9.2: Test Contract Interactions

**What:** Verify contract calls work

**Test cases:**
- [ ] registerProject succeeds
- [ ] submitDeliverable succeeds
- [ ] markApproved succeeds
- [ ] Query functions return correct data
- [ ] Error handling for invalid inputs

### Step 9.3: Test Dual-Chain Flow

**What:** Verify Stellar + Polkadot work together

**Test cases:**
- [ ] Create project on both chains
- [ ] Fund on Stellar, verify on Polkadot
- [ ] Submit work on both chains
- [ ] Approve on Polkadot, release on Stellar
- [ ] Query reconciliation works

---

## Phase 10: Deployment & Configuration

### Step 10.1: Configure Paseo Testnet

**What:** Ensure Paseo is properly configured

**Checklist:**
- [ ] Paseo RPC endpoint in `.env`
- [ ] Contract address in `.env`
- [ ] Contract ABI in correct location
- [ ] SubWallet configured for Paseo

### Step 10.2: Update Documentation

**What:** Document the integration

**Files to create/update:**
- [ ] SubWallet setup guide
- [ ] Polkadot integration guide
- [ ] Dual-chain flow documentation
- [ ] Troubleshooting guide

### Step 10.3: Deploy to Staging

**What:** Deploy to staging environment

**Steps:**
- [ ] Build frontend
- [ ] Deploy to staging server
- [ ] Test all flows
- [ ] Verify both wallets work

---

## Summary of Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `frontend/package.json` | Add Polkadot dependencies | P0 |
| `frontend/.env.local` | Add Polkadot config | P0 |
| `frontend/src/context/WalletContext.tsx` | Extend for dual wallets | P0 |
| `frontend/src/components/Layout.tsx` | Add Polkadot button | P1 |
| `frontend/src/lib/polkadot.ts` | Implement all functions | P0 |
| `frontend/src/contracts/polkadot-abi.json` | Add contract ABI | P0 |
| `frontend/src/pages/ClientDashboard.tsx` | Show Polkadot data | P1 |
| `frontend/src/pages/FreelancerDashboard.tsx` | Show Polkadot data | P1 |

---

## Estimated Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|-----------------|
| Phase 1 | Dependencies & Config | 30 min |
| Phase 2 | Wallet Context | 1 hour |
| Phase 3 | Layout Updates | 30 min |
| Phase 4 | Contract Manager | 1 hour |
| Phase 5 | Write Operations | 2 hours |
| Phase 6 | Read Operations | 1 hour |
| Phase 7 | UI Components | 2 hours |
| Phase 8 | Error Handling | 1 hour |
| Phase 9 | Testing | 2 hours |
| Phase 10 | Deployment | 1 hour |
| **Total** | | **~12 hours** |

---

## Key Technical Notes

### SubWallet vs Polkadot.js
- **SubWallet:** More user-friendly, supports multiple chains
- **Polkadot.js:** More developer-friendly, more features
- **Choice:** SubWallet for better UX

### Paseo Testnet
- **Endpoint:** `wss://paseo-rpc.dwellir.com`
- **Chain ID:** 0
- **Status:** Active testnet (Rococo is deprecated)
- **Faucet:** Available for test DOT

### Contract ABI
- Generated during `cargo contract build`
- Located in: `target/ink/project_registry.json`
- Contains all contract metadata and function signatures

### Gas Estimation
- Use `-1` for automatic gas estimation
- Polkadot will estimate required gas
- User approves before transaction

---

## Next Action

**Do NOT implement yet.** This is the planning document.

When ready to implement, start with **Phase 1: Environment & Dependencies Setup**.

---

**Last Updated:** December 5, 2025
