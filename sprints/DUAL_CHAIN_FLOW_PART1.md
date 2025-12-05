# PolkStellar Dual-Chain Flow Diagram - Part 1

**Date:** December 5, 2025  
**Purpose:** Detailed explanation of cross-chain synchronization

---

## System Overview

PolkStellar uses two blockchains for different purposes:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PolkStellar Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Frontend (Web App)                     │   │
│  │  - Client Dashboard                                      │   │
│  │  - Freelancer Dashboard                                  │   │
│  │  - Project Management UI                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↓                                      ↓                │
│  ┌──────────────────────────┐      ┌──────────────────────────┐ │
│  │   Freighter Wallet       │      │  Polkadot.js Extension   │ │
│  │   (Stellar Account)      │      │  (Polkadot Account)      │ │
│  └──────────────────────────┘      └──────────────────────────┘ │
│           ↓                                      ↓                │
│  ┌──────────────────────────┐      ┌──────────────────────────┐ │
│  │  Stellar Blockchain      │      │  Polkadot Blockchain     │ │
│  │  (Soroban - Testnet)     │      │  (Ink! - Testnet)        │ │
│  │                          │      │                          │ │
│  │  Escrow Contract:        │      │  ProjectRegistry:        │ │
│  │  - Fund Management       │      │  - Project Metadata      │ │
│  │  - Milestone Payments    │      │  - Deliverable Tracking  │ │
│  │  - Balance Tracking      │      │  - Approval Status       │ │
│  │                          │      │                          │ │
│  │  MilestoneManager:       │      │  MilestoneManager:       │ │
│  │  - Release Logic         │      │  - Status Updates        │ │
│  │  - Fund Distribution     │      │  - Dispute Records       │ │
│  └──────────────────────────┘      └──────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. WALLET CONNECTION FLOW

### Initial Setup

```
User visits PolkStellar
    ↓
Frontend detects wallet availability
    ↓
User clicks "Connect Freighter"
    ↓
Freighter Wallet Connection:
  1. Freighter extension popup appears
  2. User approves connection
  3. Freighter returns Stellar public key
  4. Frontend stores in WalletContext
  5. UI updates: "Connected: stellar1abc..."
    ↓
User clicks "Connect Polkadot"
    ↓
Polkadot.js Wallet Connection:
  1. Polkadot.js extension popup appears
  2. User selects Polkadot account
  3. User approves connection
  4. Polkadot.js returns Polkadot public key
  5. Frontend stores in PolkadotWalletContext
  6. UI updates: "Connected: 1ABC2def..."
    ↓
✅ BOTH WALLETS READY FOR TRANSACTIONS
```

---

## 2. PROJECT CREATION FLOW (Dual-Chain)

### User Perspective

```
Client Dashboard → [Create Project Button]
    ↓
Modal opens with form:
  - Project Title: "Website Redesign"
  - Description: "Modern responsive design"
  - Milestone 1: $500
  - Milestone 2: $500
  - Milestone 3: $1000
    ↓
[Submit Button]
    ↓
Loading... (Processing on both chains)
    ↓
✅ Project Created Successfully!
   Project ID: proj_12345
```

### Technical Flow (Behind the Scenes)

```
STEP 1: Validate Form
  ✓ Title not empty
  ✓ Description not empty
  ✓ Freelancer address valid
  ✓ Milestones > 0
  ✓ Both wallets connected
    ↓
STEP 2: Create Project on Stellar
  
  Frontend calls: createProjectOnStellar()
    ↓
  Stellar Escrow Contract:
    - Function: create_project()
    - Parameters: client, freelancer, milestone_amounts
    - Returns: projectId "proj_12345"
    - Storage: projects[proj_12345] created
    ↓
  Freighter Signs Transaction
    ↓
  ✓ Transaction confirmed in ~5 seconds
  ✓ Project created with ID: proj_12345
    ↓
STEP 3: Register Project on Polkadot
  
  Frontend calls: registerProjectOnPolkadot()
    ↓
  Polkadot ProjectRegistry Contract:
    - Function: register_project()
    - Parameters: projectId, title, descriptionHash, milestoneCount
    - Storage: projects[proj_12345] with metadata
    - Creates milestone records (Pending status)
    ↓
  Polkadot.js Signs Transaction
    ↓
  ✓ Transaction confirmed in ~12 seconds
  ✓ Project metadata registered
    ↓
STEP 4: Display Results
  
  Frontend State Updated:
  {
    projectId: "proj_12345",
    title: "Website Redesign",
    status: "Created",
    stellar: { txHash: "0xabc123...", status: "confirmed" },
    polkadot: { txHash: "0xdef456...", status: "confirmed" }
  }
    ↓
  UI Shows:
  ✅ Project Created Successfully!
  ✓ Stellar: Confirmed (0xabc123...)
  ✓ Polkadot: Confirmed (0xdef456...)
```

---

## 3. MILESTONE FUNDING FLOW

### User Perspective

```
Client Dashboard → Project: Website Redesign
    ↓
[Fund Milestone 1] button
    ↓
Modal: "Fund Milestone 1 - $500"
    ↓
[Confirm] button
    ↓
Loading... (Processing on Stellar)
    ↓
✅ Milestone Funded!
   $500 in escrow
```

### Technical Flow

```
STEP 1: Client Initiates Funding
  Form Data:
  {
    projectId: "proj_12345",
    milestoneId: 0,
    amount: 500  // USDC
  }
    ↓
STEP 2: Fund Milestone on Stellar
  
  Frontend calls: fundMilestoneOnStellar()
    ↓
  Stellar Escrow Contract:
    - Function: fund_milestone()
    - Actions:
      1. Check client has 500 USDC
      2. Transfer 500 USDC to contract
      3. Update milestone status to "Funded"
      4. Record timestamp
    - Storage Updated:
      milestones[proj_12345][0] = {
        amount: 500,
        status: "Funded",
        in_escrow: 500
      }
    ↓
  Freighter Signs Transaction
    ↓
  ✓ 500 USDC transferred to escrow
    ↓
STEP 3: Update UI
  
  Milestone 1 Status: ✅ Funded
  In Escrow: $500
  [Submit Work] button now enabled
```

---

## 4. WORK SUBMISSION FLOW (Dual-Chain)

### User Perspective

```
Freelancer Dashboard → Project: Website Redesign
    ↓
Milestone 1: Website Mockups (Status: Funded)
    ↓
[Submit Work] button
    ↓
Modal: Upload deliverable
  - File: mockups.zip
  - Description: "3 design variations"
    ↓
[Submit] button
    ↓
Loading... (Processing on both chains)
    ↓
✅ Work Submitted!
   Awaiting client review
```

### Technical Flow

```
STEP 1: Freelancer Submits Work
  Form Data:
  {
    projectId: "proj_12345",
    milestoneId: 0,
    deliverableFile: File,
    description: "3 design variations"
  }
  
  Process:
  1. Upload file to IPFS
  2. Get IPFS hash: "QmAbc123..."
    ↓
STEP 2: Submit on Stellar
  
  Frontend calls: submitMilestoneOnStellar()
    ↓
  Stellar Escrow Contract:
    - Function: submit_milestone()
    - Actions:
      1. Check milestone is Funded
      2. Update status to "Submitted"
      3. Store deliverable hash
      4. Record submission timestamp
    - Storage Updated:
      milestones[proj_12345][0] = {
        status: "Submitted",
        deliverable_hash: "QmAbc123...",
        submitted_at: 1733420200
      }
    ↓
  Freighter Signs Transaction
    ↓
  ✓ Submission recorded on Stellar
    ↓
STEP 3: Submit on Polkadot
  
  Frontend calls: submitDeliverableOnPolkadot()
    ↓
  Polkadot ProjectRegistry Contract:
    - Function: submit_deliverable()
    - Actions:
      1. Check milestone exists
      2. Update status to "Submitted"
      3. Store deliverable hash
      4. Record submission timestamp
    - Storage Updated:
      milestones[proj_12345][0] = {
        status: Submitted,
        deliverable_hash: "QmAbc123...",
        submitted_at: 1733420200
      }
    ↓
  Polkadot.js Signs Transaction
    ↓
  ✓ Submission recorded on Polkadot (immutable)
    ↓
STEP 4: Update UI
  
  Freelancer sees:
  ✅ Work Submitted Successfully!
  Status: ⏳ Awaiting Review
  Submitted: Dec 5, 2025 6:30 PM
  
  Client sees:
  Milestone 1: 🔍 Review Needed
  [View Deliverable] [Approve] [Request Changes]
```

---

## 5. FUND RELEASE FLOW (Critical Dual-Chain Sync)

### User Perspective

```
Client Dashboard → Project: Website Redesign
    ↓
Milestone 1: Website Mockups (Status: Review Needed)
    ↓
Reviews deliverable...
    ↓
[Approve & Release Funds] button
    ↓
Modal: "Release $500 to freelancer?"
    ↓
[Confirm] button
    ↓
Loading... (Processing on both chains - CRITICAL)
    ↓
✅ Funds Released!
   $500 transferred to freelancer
```

### Technical Flow (Most Important)

```
STEP 1: Client Initiates Release
  Form Data:
  {
    projectId: "proj_12345",
    milestoneId: 0,
    action: "approve_and_release"
  }
  
  Validation:
  ✓ Milestone status is "Submitted"
  ✓ Deliverable exists
  ✓ Funds in escrow
  ✓ Client wallet connected
    ↓
STEP 2: Mark Approved on Polkadot (FIRST!)
  
  ⚠️  IMPORTANT: Polkadot is called FIRST
      This creates immutable proof of approval
      BEFORE funds are released
  
  Frontend calls: markApprovedOnPolkadot()
    ↓
  Polkadot ProjectRegistry Contract:
    - Function: mark_approved()
    - Actions:
      1. Check milestone is "Submitted"
      2. Update status to "Approved"
      3. Record approval timestamp
      4. Store approver address (client)
    - Storage Updated:
      milestones[proj_12345][0] = {
        status: Approved,
        approved_at: 1733420300,
        approved_by: 1ABC2def...
      }
    ↓
  Polkadot.js Signs Transaction
    ↓
  ✓ Approval recorded immutably on Polkadot
  ✓ Cannot be changed or disputed later
    ↓
STEP 3: Release Funds on Stellar (SECOND)
  
  ⚠️  IMPORTANT: Only called if Polkadot succeeded
      This ensures approval is recorded before funds move
  
  Frontend calls: releaseMilestoneOnStellar()
    ↓
  Stellar Escrow Contract:
    - Function: release_milestone()
    - Actions:
      1. Check milestone is "Submitted"
      2. Check funds in escrow (500 USDC)
      3. Transfer 500 USDC to freelancer
      4. Update milestone status to "Released"
      5. Update escrow balance
      6. Record release timestamp
    - Storage Updated:
      milestones[proj_12345][0] = {
        status: "Released",
        released_at: 1733420350,
        in_escrow: 0
      }
      escrow_balance[proj_12345] = 1500 (was 2000)
    ↓
  Freighter Signs Transaction
    ↓
  ✓ 500 USDC transferred to freelancer
    ↓
STEP 4: Sync and Display Results
  
  Both Chains Now In Sync:
  
  Stellar:
    - Milestone 0: Released
    - Funds transferred to freelancer
    - Escrow balance: 1500 USDC
  
  Polkadot:
    - Milestone 0: Approved
    - Immutable record of approval
    - Timestamp: 1733420300
  
  ✅ SYNCHRONIZED: Both chains agree on state
  
  Client sees:
  ✅ Funds Released Successfully!
  Milestone 1: ✅ Completed
  Amount: $500
  Released: Dec 5, 2025 6:35 PM
  Blockchain Status:
  ✓ Stellar: Released (0xstu901...)
  ✓ Polkadot: Approved (0xpqr678...)
  
  Freelancer sees:
  ✅ Payment Received!
  Amount: $500
  Received: Dec 5, 2025 6:35 PM
  Your Balance: $500
  [Withdraw] [View Transaction]
```

---

## 6. COMPLETE PROJECT LIFECYCLE

### Timeline View

```
PROJECT: Website Redesign ($2,000 total)
Created: Dec 5, 2025 6:00 PM

MILESTONE 1: Website Mockups ($500)
├─ Dec 5, 6:05 PM - Funded on Stellar
├─ Dec 5, 6:15 PM - Freelancer submits (both chains)
├─ Dec 5, 6:30 PM - Client reviews
└─ Dec 5, 6:35 PM - ✅ Released (both chains)
   Status: COMPLETED

MILESTONE 2: Development ($500)
├─ Dec 5, 6:40 PM - Funded on Stellar
├─ Dec 5, 6:50 PM - Freelancer submits (both chains)
├─ Dec 6, 9:00 AM - Client reviews
└─ Dec 6, 9:15 AM - ✅ Released (both chains)
   Status: COMPLETED

MILESTONE 3: Testing & Deployment ($1,000)
├─ Dec 6, 9:20 AM - Funded on Stellar
├─ Dec 6, 5:00 PM - Freelancer submits (both chains)
├─ Dec 7, 10:00 AM - Client reviews
└─ Dec 7, 10:30 AM - ✅ Released (both chains)
   Status: COMPLETED

PROJECT STATUS: ✅ COMPLETED
Total Released: $2,000
Freelancer Earned: $2,000
```

---

## 7. DATA CONSISTENCY & SYNCHRONIZATION

### What Each Blockchain Stores

```
STELLAR (Financial Layer)
├─ Project creation
├─ Milestone funding amounts
├─ Milestone submission records
├─ Fund releases
├─ Escrow balances
├─ Transaction history
└─ Account balances

POLKADOT (Metadata Layer)
├─ Project metadata (title, description)
├─ Deliverable hashes (IPFS)
├─ Submission timestamps
├─ Approval records
├─ Approval timestamps
├─ Dispute records
└─ Immutable audit trail
```

### Synchronization Strategy

```
CONSISTENCY MODEL:

1. EVENTUAL CONSISTENCY
   - Both chains may be temporarily out of sync
   - Frontend queries both and merges state
   - Reconciles within seconds

2. ORDERED OPERATIONS
   - Polkadot called FIRST for approvals
   - Stellar called SECOND for fund releases
   - Ensures approval record exists before funds move

3. IDEMPOTENT OPERATIONS
   - Operations can be retried safely
   - No double-spending or double-approval
   - Timestamps prevent replay attacks

4. QUERY RECONCILIATION
   - Frontend queries both chains
   - Merges results with priority:
     * Stellar = source of truth for funds
     * Polkadot = source of truth for metadata
   - Shows combined view to user
```

---

**Continue to Part 2 for Error Handling and Security Details**
