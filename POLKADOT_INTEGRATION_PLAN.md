# Polkadot Integration Plan - PolkStellar

**Date:** December 5, 2025  
**Status:** Ready for Implementation  
**Scope:** Complete Polkadot contract deployment and frontend integration

---

## Executive Summary

PolkStellar is a **dual-chain freelance escrow platform** that leverages:

- **Stellar (Soroban)** for financial escrow and fund management
- **Polkadot (Ink!)** for project metadata, deliverable tracking, and dispute resolution

This document outlines the Polkadot integration strategy, feature mapping, and implementation roadmap.

---

## Current Project Status

### ✅ Completed (Stellar Side)

**Frontend Features:**

- Project creation with title, description, and milestone setup
- Real-time dashboard with project stats
- Search and filter by project status (Pending, Active, Completed)
- Transaction history with Stellar Explorer links
- Project metadata display (title, description)
- Milestone funding, submission, and release workflows

**Backend:**

- Stellar Soroban escrow contract deployed and working
- TypeScript client for Stellar interactions
- Transaction tracking in localStorage

### 📝 In Progress (Polkadot Side)

**Contract:**

- Project Registry contract written in Ink! (Rust)
- Tests written but not yet compiled/deployed
- Ready for compilation and deployment

**Frontend:**

- Placeholder file exists (`polkadot.ts`)
- Wallet context only supports Stellar (Freighter)
- No Polkadot contract interactions implemented

---

## Polkadot Architecture Overview

### Project Registry Contract (Ink!)

**Location:** `/contracts/polkadot/project-registry/lib.rs`

#### Purpose

Provides immutable, on-chain record of:

1. Project metadata (title, description hash)
2. Milestone deliverables (work submissions)
3. Approval status and timestamps
4. Dispute records with evidence

#### Key Data Structures

```rust
pub struct ProjectMeta {
    pub title: String,
    pub description_hash: Hash,
    pub client: AccountId,
    pub freelancer: AccountId,
    pub milestone_count: u32,
    pub created_at: Timestamp,
    pub is_active: bool,
}

pub struct MilestoneRecord {
    pub deliverable_hash: Option<Hash>,      // IPFS/git hash
    pub submitted_at: Option<Timestamp>,
    pub status: MilestoneStatus,             // Pending, Submitted, Approved, Disputed
    pub dispute_reason: Option<String>,
    pub disputed_at: Option<Timestamp>,
}

pub enum MilestoneStatus {
    Pending,    // No deliverable yet
    Submitted,  // Freelancer submitted work
    Approved,   // Client approved
    Disputed,   // Client raised dispute
}
```

#### Contract Methods

| Method | Caller | Purpose | Returns |
|--------|--------|---------|---------|
| `register_project(id, title, desc_hash, freelancer, count)` | Client | Register project metadata | `ProjectRegistered` event |
| `submit_deliverable(project_id, milestone_id, hash)` | Freelancer | Submit work proof | `DeliverableSubmitted` event |
| `approve_milestone(project_id, milestone_id)` | Client | Approve deliverable | `MilestoneApproved` event |
| `raise_dispute(project_id, milestone_id, reason)` | Client | Dispute deliverable | `DisputeRaised` event |
| `resolve_dispute(project_id, milestone_id, approve)` | Admin | Resolve dispute | Event |
| `get_project(project_id)` | Anyone | Query project metadata | `ProjectMeta` |
| `get_milestone(project_id, milestone_id)` | Anyone | Query milestone record | `MilestoneRecord` |
| `is_approved(project_id, milestone_id)` | Anyone | Check approval status | `bool` |

---

## Feature Mapping: Stellar ↔ Polkadot

### Cross-Chain Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT WORKFLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 1. CREATE PROJECT                                                │
│    ├─ Stellar: create_project() → Get project_id                │
│    └─ Polkadot: register_project() → Store metadata             │
│                                                                   │
│ 2. FUND MILESTONE                                                │
│    └─ Stellar: fund_milestone() → Lock funds in escrow          │
│                                                                   │
│ 3. REVIEW DELIVERABLE                                            │
│    ├─ Polkadot: get_milestone() → View submission hash          │
│    └─ Frontend: Fetch from IPFS/GitHub using hash              │
│                                                                   │
│ 4. APPROVE OR DISPUTE                                            │
│    ├─ Polkadot: approve_milestone() → Record approval           │
│    └─ OR raise_dispute() → Record dispute with evidence         │
│                                                                   │
│ 5. RELEASE FUNDS                                                 │
│    └─ Stellar: release_milestone() → Pay freelancer             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  FREELANCER WORKFLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 1. VIEW ASSIGNED PROJECTS                                        │
│    ├─ Stellar: get_project() → View milestones & funding        │
│    └─ Polkadot: get_project() → View metadata & status          │
│                                                                   │
│ 2. SUBMIT DELIVERABLE                                            │
│    ├─ Upload to IPFS/GitHub → Get hash                          │
│    └─ Polkadot: submit_deliverable() → Record hash on-chain    │
│                                                                   │
│ 3. WAIT FOR APPROVAL                                             │
│    └─ Polkadot: is_approved() → Poll approval status            │
│                                                                   │
│ 4. RECEIVE FUNDS                                                 │
│    └─ Stellar: Automatic on release_milestone()                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Feature Comparison

| Feature | Stellar | Polkadot | Purpose |
|---------|---------|----------|---------|
| **Financial Escrow** | ✅ Primary | ❌ N/A | Hold and release funds |
| **Project Metadata** | ❌ Off-chain (localStorage) | ✅ On-chain | Immutable record |
| **Deliverable Tracking** | ❌ N/A | ✅ Primary | Hash-based proof of work |
| **Approval Records** | ❌ N/A | ✅ Primary | Timestamped approvals |
| **Dispute Handling** | ❌ N/A | ✅ Primary | Evidence-based disputes |
| **Timestamps** | ✅ Contract | ✅ Contract | Audit trail |
| **Access Control** | ✅ Client/Freelancer | ✅ Client/Freelancer | Role-based permissions |

---

## Why This Architecture?

### Why Polkadot for Metadata & Deliverables?

1. **Better Storage Economics**
   - Polkadot: ~0.01 DOT per KB (cheaper than Stellar)
   - Stellar: ~0.21 XLM per KB (expensive for large data)
   - Polkadot is 20x cheaper for metadata storage

2. **Specialized for Complex Data**
   - Polkadot: Designed for complex smart contracts
   - Stellar: Optimized for simple payments
   - Project metadata requires flexible data structures

3. **Dispute Resolution**
   - Polkadot: Native support for complex state machines
   - Stellar: Limited to simple escrow logic
   - Disputes need multi-step approval workflows

4. **Scalability**
   - Polkadot: Parallel processing via parachains
   - Stellar: Sequential processing
   - Multiple projects benefit from parallel execution

### Why Stellar for Escrow?

1. **Proven Payment Infrastructure**
   - Stellar: Built for payments, battle-tested
   - Polkadot: General-purpose, not optimized for payments

2. **Native Asset Support**
   - Stellar: Native USDC integration
   - Polkadot: Requires wrapped assets
   - Direct fiat-to-crypto bridges available

3. **Faster Finality**
   - Stellar: 3-5 seconds
   - Polkadot: 6-12 seconds
   - Faster confirmation for fund releases

4. **Simpler for Users**
   - Stellar: Freighter wallet (simple)
   - Polkadot: Polkadot.js (complex)
   - Escrow users prefer simplicity

---

## Implementation Roadmap

### Phase 1: Contract Deployment (Week 1)

**Tasks:**
1. Compile Polkadot contract
   ```bash
   cd contracts/polkadot/project-registry
   cargo contract build
   ```

2. Run contract tests
   ```bash
   cargo test
   ```

3. Deploy to Rococo testnet
   ```bash
   cargo contract instantiate \
     --suri <SECRET_URI> \
     --url wss://rococo-contracts-rpc.polkadot.io \
     --constructor new
   ```

4. Save contract address to `.env`
   ```
   VITE_POLKADOT_CONTRACT_ADDRESS=<deployed_address>
   VITE_POLKADOT_RPC_URL=wss://rococo-contracts-rpc.polkadot.io
   ```

5. Generate contract metadata
   ```bash
   cargo contract build --release
   # Extract metadata.json from target/
   ```

**Deliverables:**
- ✅ Compiled contract
- ✅ Passing tests
- ✅ Deployed to testnet
- ✅ Contract address in .env
- ✅ Metadata JSON file

---

### Phase 2: Frontend Wallet Integration (Week 1-2)

**Tasks:**

1. **Extend WalletContext to support Polkadot**
   - Add Polkadot wallet state (address, connected)
   - Support both Stellar (Freighter) and Polkadot (Polkadot.js)
   - Allow users to connect either or both wallets

2. **Create Polkadot wallet connection**
   ```typescript
   // frontend/src/context/WalletContext.tsx
   
   interface WalletContextType {
     // Stellar
     stellar: {
       isConnected: boolean;
       address: string;
       connect: () => Promise<void>;
     };
     // Polkadot
     polkadot: {
       isConnected: boolean;
       address: string;
       connect: () => Promise<void>;
     };
   }
   ```

3. **Implement Polkadot.js connection**
   ```typescript
   // frontend/src/lib/polkadot-wallet.ts
   
   export async function connectPolkadotWallet(): Promise<string> {
     const extensions = await web3Enable('PolkStellar');
     const accounts = await web3Accounts();
     return accounts[0].address;
   }
   ```

**Deliverables:**
- ✅ Extended WalletContext
- ✅ Polkadot wallet connection
- ✅ UI for connecting both wallets
- ✅ Wallet state persistence

---

### Phase 3: Contract Client Implementation (Week 2)

**Tasks:**

1. **Create Polkadot contract client**
   ```typescript
   // frontend/src/lib/polkadot-client.ts
   
   export async function registerProject(
     projectId: number,
     title: string,
     descriptionHash: string,
     freelancerAddress: string,
     milestoneCount: number
   ): Promise<{ success: boolean; txHash?: string; error?: string }>
   
   export async function submitDeliverable(
     projectId: number,
     milestoneId: number,
     deliverableHash: string
   ): Promise<{ success: boolean; txHash?: string; error?: string }>
   
   export async function approveMilestone(
     projectId: number,
     milestoneId: number
   ): Promise<{ success: boolean; txHash?: string; error?: string }>
   
   export async function raiseDispute(
     projectId: number,
     milestoneId: number,
     reason: string
   ): Promise<{ success: boolean; txHash?: string; error?: string }>
   
   export async function getProjectMeta(projectId: number): Promise<ProjectMeta>
   export async function getMilestoneRecord(projectId: number, milestoneId: number): Promise<MilestoneRecord>
   export async function isApproved(projectId: number, milestoneId: number): Promise<boolean>
   ```

2. **Integrate with ApiPromise**
   - Connect to Polkadot RPC
   - Load contract ABI
   - Create contract instance

3. **Handle transaction signing**
   - Use Polkadot.js signer
   - Track transaction hashes
   - Add to transaction history

**Deliverables:**
- ✅ Polkadot contract client
- ✅ All contract methods callable
- ✅ Transaction tracking
- ✅ Error handling

---

### Phase 4: Dashboard Integration (Week 2-3)

**Tasks:**

1. **Update ClientDashboard**
   - Add "Register on Polkadot" button after creating Stellar project
   - Add "Approve Deliverable" button (calls Polkadot)
   - Add "Raise Dispute" button (calls Polkadot)
   - Display deliverable hash and approval status

2. **Update FreelancerDashboard**
   - Add "Submit Deliverable" button
   - Input field for deliverable hash (IPFS/GitHub)
   - Display submission status and approval status

3. **Add Polkadot Explorer links**
   - Similar to Stellar Explorer links
   - Link format: `https://rococo.subscan.io/extrinsic/{hash}`

4. **Update transaction history**
   - Track Polkadot transactions
   - Show both Stellar and Polkadot in unified history

**Deliverables:**
- ✅ Updated ClientDashboard
- ✅ Updated FreelancerDashboard
- ✅ Polkadot Explorer links
- ✅ Unified transaction history

---

### Phase 5: Testing & Refinement (Week 3)

**Tasks:**

1. **End-to-end testing**
   - Create project on Stellar
   - Register on Polkadot
   - Submit deliverable
   - Approve/dispute
   - Release funds

2. **Error handling**
   - Network errors
   - Wallet disconnection
   - Transaction failures
   - Invalid inputs

3. **UI/UX refinement**
   - Loading states
   - Error messages
   - Success confirmations
   - Transaction status updates

4. **Documentation**
   - User guide for Polkadot workflow
   - Developer guide for future enhancements
   - Troubleshooting guide

**Deliverables:**
- ✅ Tested workflows
- ✅ Robust error handling
- ✅ Polished UI
- ✅ Complete documentation

---

## Technical Details

### Environment Setup

**Required packages:**
```bash
pnpm install @polkadot/api @polkadot/api-contract @polkadot/extension-dapp @polkadot/util-crypto
```

**Environment variables:**
```env
VITE_POLKADOT_CONTRACT_ADDRESS=<deployed_contract_address>
VITE_POLKADOT_RPC_URL=wss://rococo-contracts-rpc.polkadot.io
```

### Contract Interaction Pattern

```typescript
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import metadata from './metadata.json';

// 1. Connect to network
const wsProvider = new WsProvider(process.env.VITE_POLKADOT_RPC_URL);
const api = await ApiPromise.create({ provider: wsProvider });

// 2. Create contract instance
const contract = new ContractPromise(
  api,
  metadata,
  process.env.VITE_POLKADOT_CONTRACT_ADDRESS
);

// 3. Query (read-only)
const { result, output } = await contract.query.getProject(
  account,
  { gasLimit: -1 },
  projectId
);

// 4. Transaction (state-changing)
const tx = contract.tx.registerProject(
  { gasLimit: -1 },
  projectId,
  title,
  descriptionHash,
  freelancer,
  milestoneCount
);
const unsub = await tx.signAndSend(account, (status) => {
  if (status.isInBlock) {
    console.log('In block:', status.asInBlock.toHex());
  }
});
```

### Wallet Integration Pattern

```typescript
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';

// 1. Enable extension
const extensions = await web3Enable('PolkStellar');

// 2. Get accounts
const accounts = await web3Accounts();
const account = accounts[0];

// 3. Get signer
const injector = await web3FromAddress(account.address);
const signer = injector.signer;

// 4. Sign transaction
const tx = contract.tx.registerProject(...);
await tx.signAndSend(account.address, { signer }, (status) => {
  // Handle status
});
```

---

## Data Flow Diagrams

### Project Creation Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. CLIENT CREATES PROJECT                                    │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ClientDashboard.tsx                                           │
│   ↓                                                            │
│ handleCreateProject()                                         │
│   ├─ Stellar: createProject()                                │
│   │   ├─ Contract: create_project()                          │
│   │   └─ Returns: projectId, txHash                          │
│   │                                                            │
│   ├─ localStorage: saveProjectMetadata()                     │
│   │   └─ Stores: title, description, addresses              │
│   │                                                            │
│   ├─ localStorage: addTransaction()                          │
│   │   └─ Stores: Stellar tx hash, timestamp                 │
│   │                                                            │
│   └─ UI: Show "Register on Polkadot" button                 │
│                                                                │
│ 2. CLIENT REGISTERS ON POLKADOT                              │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ handleRegisterOnPolkadot()                                    │
│   ├─ Polkadot: registerProject()                             │
│   │   ├─ Contract: register_project()                        │
│   │   └─ Returns: txHash                                     │
│   │                                                            │
│   ├─ localStorage: addTransaction()                          │
│   │   └─ Stores: Polkadot tx hash, timestamp                │
│   │                                                            │
│   └─ UI: Show "Project registered on both chains!"          │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Deliverable Submission Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. FREELANCER SUBMITS DELIVERABLE                            │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ FreelancerDashboard.tsx                                       │
│   ↓                                                            │
│ handleSubmitDeliverable()                                     │
│   ├─ User uploads to IPFS/GitHub                             │
│   │   └─ Gets: deliverableHash                              │
│   │                                                            │
│   ├─ Polkadot: submitDeliverable()                           │
│   │   ├─ Contract: submit_deliverable()                      │
│   │   ├─ Updates: MilestoneRecord.status = Submitted        │
│   │   └─ Returns: txHash                                     │
│   │                                                            │
│   ├─ localStorage: addTransaction()                          │
│   │   └─ Stores: Polkadot tx hash, deliverable hash         │
│   │                                                            │
│   └─ UI: Show "Deliverable submitted! Awaiting approval"    │
│                                                                │
│ 2. CLIENT REVIEWS & APPROVES                                 │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ClientDashboard.tsx                                           │
│   ├─ Display: deliverableHash (link to IPFS/GitHub)         │
│   │                                                            │
│   ├─ handleApproveMilestone()                                │
│   │   ├─ Polkadot: approveMilestone()                        │
│   │   │   ├─ Contract: approve_milestone()                   │
│   │   │   ├─ Updates: MilestoneRecord.status = Approved     │
│   │   │   └─ Returns: txHash                                 │
│   │   │                                                        │
│   │   ├─ Stellar: releaseMilestone()                         │
│   │   │   ├─ Contract: release_milestone()                   │
│   │   │   ├─ Transfers: funds to freelancer                 │
│   │   │   └─ Returns: txHash                                 │
│   │   │                                                        │
│   │   └─ localStorage: addTransaction() (both)               │
│   │                                                            │
│   └─ UI: Show "Funds released!"                              │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

### Functional Requirements
- ✅ Polkadot contract compiles and deploys
- ✅ All contract methods callable from frontend
- ✅ Wallet connection for both Stellar and Polkadot
- ✅ Project registration on Polkadot after Stellar creation
- ✅ Deliverable submission and approval workflow
- ✅ Dispute raising and resolution
- ✅ Transaction history shows both chains
- ✅ Polkadot Explorer links work

### Non-Functional Requirements
- ✅ Transaction confirmation times < 30 seconds
- ✅ Error messages clear and actionable
- ✅ UI responsive on mobile and desktop
- ✅ No wallet disconnection during workflow
- ✅ Graceful handling of network errors

### Testing Requirements
- ✅ End-to-end workflow tested
- ✅ All error paths tested
- ✅ Cross-chain consistency verified
- ✅ Transaction history accurate
- ✅ Wallet switching works correctly

---

## Potential Challenges & Solutions

| Challenge | Impact | Solution |
|-----------|--------|----------|
| **Wallet Complexity** | High | Provide clear UI prompts, support both wallets simultaneously |
| **Network Latency** | Medium | Show loading states, cache queries, retry logic |
| **Gas Estimation** | Medium | Use fixed gas limits, show estimated costs upfront |
| **Cross-Chain Sync** | High | Implement polling, event listeners, manual refresh |
| **User Experience** | High | Simplify workflow, combine steps where possible |
| **Testing** | Medium | Use testnet, automated tests, manual QA |

---

## Future Enhancements (Post-MVP)

1. **Reputation System**
   - Track freelancer ratings on Polkadot
   - Display in project cards

2. **Arbitration DAO**
   - Decentralized dispute resolution
   - Community voting on disputes

3. **Automated Dispute Resolution**
   - AI-powered deliverable verification
   - Automatic approval for simple cases

4. **Multi-Signature Escrow**
   - Require multiple approvals for large projects
   - Enhanced security

5. **Token Rewards**
   - Earn tokens for completing projects
   - Staking for dispute resolution

6. **Cross-Chain Messaging**
   - Automatic fund release on Polkadot approval
   - Eliminate manual Stellar step

---

## Conclusion

The Polkadot integration completes PolkStellar's dual-chain architecture:
- **Stellar** handles the financial layer (fast, proven, payment-optimized)
- **Polkadot** handles the work verification layer (flexible, scalable, dispute-capable)

This separation of concerns provides:
- ✅ Cost efficiency (cheaper storage on Polkadot)
- ✅ Specialized tooling (each chain does what it does best)
- ✅ Scalability (parallel processing on Polkadot)
- ✅ Security (immutable records on both chains)
- ✅ User experience (simple workflows, clear status)

The implementation roadmap is realistic and achievable in 2-3 weeks, with clear milestones and success criteria.

---

## Quick Reference

### Key Addresses & URLs

```
Polkadot Rococo Testnet:
- RPC: wss://rococo-contracts-rpc.polkadot.io
- Explorer: https://rococo.subscan.io
- Faucet: https://rococo.subscan.io/tools/faucet

Stellar Testnet:
- RPC: https://soroban-testnet.stellar.org
- Explorer: https://stellar.expert/explorer/testnet
- Escrow Contract: CCKCGYGFMTYRAHHNOVMBMGKAP6S4XSWL3TEJJH2D4JCZWBJRIZBUXZII
```

### Important Files

```
contracts/polkadot/project-registry/lib.rs    # Contract source
frontend/src/lib/polkadot-client.ts           # Contract client (to create)
frontend/src/context/WalletContext.tsx        # Wallet state (to extend)
frontend/src/lib/polkadot-wallet.ts           # Wallet connection (to create)
.env                                           # Configuration
```

### Build Commands

```bash
# Compile contract
cd contracts/polkadot/project-registry && cargo contract build

# Run tests
cargo test

# Deploy to testnet
cargo contract instantiate --suri <SECRET> --url wss://rococo-contracts-rpc.polkadot.io

# Frontend
pnpm install @polkadot/api @polkadot/api-contract @polkadot/extension-dapp
pnpm run dev
```
