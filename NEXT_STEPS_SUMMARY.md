# Next Steps Summary - SubWallet + Polkadot Integration

**Date:** December 5, 2025  
**Status:** Planning Complete - Ready for Implementation  
**Wallet:** SubWallet  
**Testnet:** Paseo

---

## Quick Overview

You're going with **SubWallet** for Polkadot integration on **Paseo testnet** (not Rococo).

The next steps are organized into **10 phases** with clear tasks and priorities.

---

## The 10 Phases at a Glance

| Phase | Focus | Time | Priority |
|-------|-------|------|----------|
| 1 | Dependencies & Config | 30 min | P0 |
| 2 | Wallet Context (dual wallets) | 1 hour | P0 |
| 3 | Add Polkadot button to navbar | 30 min | P1 |
| 4 | Contract instance manager | 1 hour | P0 |
| 5 | Write operations (register, submit, approve) | 2 hours | P0 |
| 6 | Read operations (queries) | 1 hour | P0 |
| 7 | Update dashboards | 2 hours | P1 |
| 8 | Error handling & recovery | 1 hour | P0 |
| 9 | Testing | 2 hours | P0 |
| 10 | Deployment & docs | 1 hour | P1 |

**Total Estimated Time:** ~12 hours

---

## Phase 1: Dependencies & Config (30 min)

### 1.1 Install Polkadot Libraries
```bash
pnpm add @polkadot/api @polkadot/api-contract @polkadot/extension-dapp @polkadot/util @polkadot/util-crypto
```

### 1.2 Create `.env.local`
```
VITE_POLKADOT_RPC_URL=wss://paseo-rpc.dwellir.com
VITE_POLKADOT_CONTRACT_ADDRESS=<your_deployed_address>
VITE_POLKADOT_NETWORK=paseo
```

### 1.3 Add Contract ABI
- Extract from: `contracts/polkadot/project-registry/target/ink/project_registry.json`
- Save to: `frontend/src/contracts/polkadot-abi.json`

---

## Phase 2: Wallet Context Extension (1 hour)

### Current State
- Only supports Freighter (Stellar)
- Single wallet connection

### Changes Needed
- Extend `WalletContext.tsx` to support dual wallets
- Add Polkadot wallet state (separate from Stellar)
- Implement SubWallet connection logic
- Keep both wallets independent

### New Structure
```typescript
interface WalletContextType {
  stellar: { isConnected, address, connect(), disconnect() };
  polkadot: { isConnected, address, connect(), disconnect() };
}
```

---

## Phase 3: Add Polkadot Button (30 min)

### Update `Layout.tsx`
- Add "Connect Polkadot Wallet" button next to Stellar button
- Show connected address when connected
- Use Polkadot color scheme (purple/pink)
- Match Stellar button styling

### Display
- Stellar: Green button with address
- Polkadot: Purple button with address
- Show both statuses simultaneously

---

## Phase 4: Contract Instance Manager (1 hour)

### In `polkadot.ts`
- Load contract ABI from JSON file
- Create ContractPromise instance
- Expose for use in other functions
- Handle errors (contract not deployed)

---

## Phase 5: Write Operations (2 hours)

### Implement 3 Functions

**1. registerProject()**
- Register project metadata on Polkadot
- Called after creating project on Stellar
- Returns transaction hash

**2. submitDeliverable()**
- Submit work deliverable hash
- Called after submitting on Stellar
- Returns transaction hash

**3. markApproved()** ⚠️ CRITICAL
- Mark milestone as approved
- **MUST be called BEFORE Stellar release**
- Returns transaction hash
- This is the dual-chain sync point

---

## Phase 6: Read Operations (1 hour)

### Implement 3 Functions

**1. getProjectMetadata()**
- Query project metadata from Polkadot
- Returns project details

**2. getDeliverable()**
- Query deliverable record
- Returns deliverable info

**3. getMilestoneStatus()**
- Query milestone status
- Returns: { submitted, approved, deliverableHash }

---

## Phase 7: Update Dashboards (2 hours)

### ClientDashboard
- Show Polkadot metadata alongside Stellar financial data
- Display deliverable submission status
- Show approval status
- Display both chain transaction hashes

### FreelancerDashboard
- Show submitted deliverables from Polkadot
- Show approval status
- Display milestone status

### New Component
- Create dual-chain status component
- Show Stellar + Polkadot status together
- Display last sync time

---

## Phase 8: Error Handling (1 hour)

### Handle Common Errors
- Insufficient gas
- Invalid parameters
- Network timeout
- User rejected transaction
- Contract not found

### Recovery Strategies
- Exponential backoff retry (1s, 2s, 4s)
- User-friendly error messages
- Manual retry option
- Connection recovery

---

## Phase 9: Testing (2 hours)

### Test Cases

**Wallet Connection**
- [ ] SubWallet detected and enabled
- [ ] Can get account address
- [ ] Can disconnect/reconnect
- [ ] Error handling when extension not found

**Contract Interactions**
- [ ] registerProject succeeds
- [ ] submitDeliverable succeeds
- [ ] markApproved succeeds
- [ ] Query functions return correct data
- [ ] Error handling for invalid inputs

**Dual-Chain Flow**
- [ ] Create project on both chains
- [ ] Fund on Stellar, verify on Polkadot
- [ ] Submit work on both chains
- [ ] Approve on Polkadot, release on Stellar
- [ ] Query reconciliation works

---

## Phase 10: Deployment (1 hour)

### Checklist
- [ ] Paseo RPC endpoint in `.env`
- [ ] Contract address in `.env`
- [ ] Contract ABI in correct location
- [ ] SubWallet configured for Paseo
- [ ] Build frontend
- [ ] Deploy to staging
- [ ] Test all flows

---

## Files to Modify

| File | Changes | Phase |
|------|---------|-------|
| `package.json` | Add dependencies | 1 |
| `.env.local` | Add config | 1 |
| `polkadot-abi.json` | Add ABI | 1 |
| `WalletContext.tsx` | Dual wallet support | 2 |
| `Layout.tsx` | Add Polkadot button | 3 |
| `polkadot.ts` | Implement all functions | 4-6 |
| `ClientDashboard.tsx` | Show Polkadot data | 7 |
| `FreelancerDashboard.tsx` | Show Polkadot data | 7 |

---

## Key Technical Details

### SubWallet
- More user-friendly than Polkadot.js
- Supports multiple chains
- Better for end users

### Paseo Testnet
- **RPC:** `wss://paseo-rpc.dwellir.com`
- **Status:** Active (Rococo is deprecated)
- **Faucet:** Available for test DOT

### Contract ABI
- Generated from `cargo contract build`
- Contains all function signatures
- Required for contract interactions

### Gas Estimation
- Use `-1` for automatic estimation
- Polkadot calculates required gas
- User approves before transaction

---

## Critical Flow: Fund Release

This is the dual-chain sync point:

```
1. Client clicks "Release Funds"
   ↓
2. Call Polkadot: markApproved() ← MUST SUCCEED FIRST
   ↓
3. Call Stellar: release_milestone()
   ↓
4. Funds transferred to freelancer
```

**Why this order?**
- Approval proof exists before funds move
- If Stellar fails, Polkadot already has record
- No double-spending possible
- Audit trail immutable

---

## What NOT to Do Yet

❌ Don't implement Phase 1-10 yet  
❌ Don't modify any code  
❌ Don't add dependencies  
❌ Don't create new files  

This is the **planning document only**.

---

## When Ready to Start

1. Read this document
2. Read `SUBWALLET_POLKADOT_INTEGRATION_STEPS.md` (detailed version)
3. Start with Phase 1 when ready
4. Follow phases sequentially

---

## Questions?

- **Phase 1-3:** Environment setup
- **Phase 4-6:** Contract interactions
- **Phase 7:** UI updates
- **Phase 8-10:** Testing & deployment

See `SUBWALLET_POLKADOT_INTEGRATION_STEPS.md` for detailed instructions.

---

**Last Updated:** December 5, 2025
