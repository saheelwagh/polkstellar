# 🛡️ FreelanceEscrow 

> **Pitch:** "Trustless freelancing. Work gets verified on Polkadot. Money moves on Stellar. 

---

## 📋 Project Overview

### The Problem

Freelancers get ghosted after delivering work. Clients fear paying upfront for incomplete work. Platforms like Upwork take 20% fees.

### The Solution

| Chain | Role | What It Does |
|-------|------|--------------|
| **Stellar (Soroban)** | The Money | Escrow vault, USDC deposits, milestone releases |
| **Polkadot (Ink!)** | The Arbiter | Project registry, deliverable tracking, dispute handling |

### Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   STELLAR       │         │   POLKADOT      │
│   (Soroban)     │◄───────►│   (Ink!)        │
├─────────────────┤         ├─────────────────┤
│ • Escrow Vault  │         │ • Project Registry│
│ • USDC Deposits │         │ • Milestone State │
│ • Release Funds │         │ • Dispute Handler │
└─────────────────┘         └─────────────────┘
         ▲                           ▲
         │                           │
         └───────── Frontend ────────┘
              (React + TypeScript)
```



## 🛠️ Tech Stack

### Backend - Stellar (Soroban)

| Tool | Purpose | Install |
|------|---------|---------|
| Stellar CLI | Contract deployment | Already installed |
| Rust + wasm32 | Compile contracts | `rustup target add wasm32-unknown-unknown` |
| Soroban SDK | Contract development | Via Cargo.toml |
| @stellar/stellar-sdk | Frontend integration | `npm install @stellar/stellar-sdk` |
| @stellar/freighter-api | Wallet connection | `npm install @stellar/freighter-api` |

### Backend - Polkadot (Ink!)

| Tool | Purpose | Install |
|------|---------|---------|
| cargo-contract | Build Ink! contracts | `cargo install cargo-contract --force` |
| substrate-contracts-node | Local testing | Docker or binary |
| @polkadot/api | Chain interaction | `npm install @polkadot/api` |
| @polkadot/api-contract | Contract calls | `npm install @polkadot/api-contract` |
| @polkadot/extension-dapp | Wallet connection | `npm install @polkadot/extension-dapp` |

### Frontend

| Tool | Purpose | Install |
|------|---------|---------|
| React + TypeScript | UI framework | `npm create vite@latest frontend -- --template react-ts` |
| TailwindCSS | Styling | `npm install -D tailwindcss postcss autoprefixer` |
| shadcn/ui | Components | `npx shadcn-ui@latest init` |
| Lucide React | Icons | `npm install lucide-react` |
| Recharts | Charts | `npm install recharts` |

---

## 📅 Sprint Plan (20 Hours)

### Day 1: Frontend + Setup (6 hours)

#### Sprint 1.1: Environment Setup (1.5 hours)

**Stellar Setup:**

```bash
mkdir -p contracts/stellar contracts/polkadot frontend
cd contracts/stellar
soroban contract init freelance-escrow
```

- [ ] Initialize Soroban project
- [ ] Configure Futurenet credentials
- [ ] Create test accounts (Client, Freelancer)

**Polkadot Setup:**

```bash
cd contracts/polkadot
cargo contract new project-registry
```

- [ ] Install cargo-contract
- [ ] Start local substrate-contracts-node
- [ ] Verify contract compiles

**Frontend Setup:**

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install @stellar/stellar-sdk @polkadot/api recharts lucide-react
npx shadcn-ui@latest init
npx shadcn-ui@latest add card button badge progress dialog input textarea
```

**Folder Structure:**

```
polkstellar/
├── contracts/
│   ├── stellar/
│   │   └── freelance-escrow/
│   └── polkadot/
│       └── project-registry/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ProjectCard.tsx
│       │   ├── MilestoneList.tsx
│       │   ├── WalletConnect.tsx
│       │   └── DisputeModal.tsx
│       ├── pages/
│       │   ├── ClientDashboard.tsx
│       │   ├── FreelancerDashboard.tsx
│       │   └── ProjectView.tsx
│       ├── hooks/
│       │   ├── useStellar.ts
│       │   └── usePolkadot.ts
│       ├── lib/
│       │   ├── stellar.ts
│       │   └── polkadot.ts
│       └── mock/
│           └── projectData.ts
├── rust-practice/
│   └── (practice exercises)
└── FREELANCE_ESCROW.md (this file)
```

#### Sprint 1.2: Frontend Pages (4.5 hours)

**Page 1: Client Dashboard (`/client`) - 1.5 hours**

Features:
- [ ] Active projects list with status badges
- [ ] "Create New Project" button → modal form
- [ ] Total funds in escrow display
- [ ] Pending approvals section

Mock Data:

```typescript
// frontend/src/mock/projectData.ts
export const mockProjects = [
  {
    id: "proj-001",
    title: "E-commerce Website Redesign",
    freelancer: "alice.stellar",
    totalBudget: 5000,
    funded: 5000,
    released: 2000,
    milestones: [
      { id: 1, title: "Wireframes", amount: 1000, status: "completed" },
      { id: 2, title: "UI Design", amount: 2000, status: "pending_approval" },
      { id: 3, title: "Development", amount: 2000, status: "in_progress" },
    ],
    status: "active"
  }
];

export const freelancerData = {
  address: "GFREELANCER...",
  totalEarned: 15000,
  pendingRelease: 3000,
  activeProjects: 2,
  completedProjects: 8
};
```

Components:
- [ ] `ProjectCard` - Shows project summary + progress bar
- [ ] `CreateProjectModal` - Form for new project
- [ ] `MilestoneApprovalCard` - Approve/Dispute buttons

**Page 2: Freelancer Dashboard (`/freelancer`) - 1.5 hours**

Features:
- [ ] Assigned projects list
- [ ] Earnings summary (Released / Pending / Total)
- [ ] "Submit Deliverable" button per milestone
- [ ] Dispute status alerts

Components:
- [ ] `EarningsCard` - Summary stats
- [ ] `MilestoneSubmitForm` - Upload deliverable hash
- [ ] `ProjectTimeline` - Visual milestone progress

**Page 3: Project Detail View (`/project/:id`) - 1 hour**

Features:
- [ ] Full milestone breakdown with amounts
- [ ] Deliverable links/hashes per milestone
- [ ] Action buttons based on role (Approve/Submit/Dispute)
- [ ] Transaction history

**Shared Components - 0.5 hours**

- [ ] `WalletConnect` - Dual wallet (Freighter + Polkadot.js)
- [ ] `StatusBadge` - Color-coded status indicators
- [ ] `AmountDisplay` - Format USDC amounts
- [ ] Navigation with role switcher (for demo)

---

### Day 2: Smart Contracts (7 hours)

#### Sprint 2.1: Stellar Escrow Contract (3.5 hours)

**Contract Interface:**

```rust
// contracts/stellar/freelance-escrow/src/lib.rs

// Types
pub struct Project {
    client: Address,
    freelancer: Address,
    total_amount: i128,
    released_amount: i128,
    milestone_count: u32,
}

pub enum MilestoneStatus {
    Pending,
    Submitted,
    Approved,
    Disputed,
    Released,
}

pub struct Milestone {
    amount: i128,
    status: MilestoneStatus,
}

// Functions
pub fn create_project(
    env: Env,
    client: Address,
    freelancer: Address,
    milestones: Vec<i128>  // amounts per milestone
) -> u64  // returns project_id

pub fn fund_project(
    env: Env,
    project_id: u64,
    amount: i128
) -> Result<(), Error>

pub fn release_milestone(
    env: Env,
    project_id: u64,
    milestone_id: u32
) -> Result<(), Error>

pub fn refund_project(
    env: Env,
    project_id: u64
) -> Result<(), Error>  // admin only

pub fn get_project(env: Env, project_id: u64) -> Project

pub fn get_balance(env: Env, project_id: u64) -> i128
```

**AI Prompt for Contract:**

> "Write a Soroban smart contract for milestone-based escrow. A client creates a project with multiple milestones (each with an amount). Client funds the escrow. Client can release individual milestones to the freelancer. Include a refund function callable only by admin. Track total deposited vs released. Include tests."

**Tasks:**

- [ ] Hour 1: Generate contract with AI, review structure
- [ ] Hour 2: Fix compilation errors, implement missing pieces
- [ ] Hour 3: Write and run tests (`cargo test`)
- [ ] Hour 3.5: Deploy to Futurenet

```bash
cd contracts/stellar/freelance-escrow
soroban contract build
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/freelance_escrow.wasm \
  --network futurenet
```

#### Sprint 2.2: Polkadot Project Registry (2.5 hours)

**Contract Interface:**

```rust
// contracts/polkadot/project-registry/lib.rs

#[ink::contract]
mod project_registry {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;

    #[derive(Debug, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct ProjectMeta {
        title: String,
        description_hash: Hash,
        created_at: Timestamp,
    }

    #[derive(Debug, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct MilestoneRecord {
        deliverable_hash: Option<Hash>,
        submitted_at: Option<Timestamp>,
        approved: bool,
        disputed: bool,
        dispute_reason: Option<String>,
    }

    #[ink(message)]
    pub fn register_project(
        &mut self,
        project_id: u64,
        title: String,
        description_hash: Hash,
        milestone_titles: Vec<String>
    ) -> Result<(), Error>

    #[ink(message)]
    pub fn submit_deliverable(
        &mut self,
        project_id: u64,
        milestone_id: u32,
        deliverable_hash: Hash
    ) -> Result<(), Error>

    #[ink(message)]
    pub fn mark_approved(
        &mut self,
        project_id: u64,
        milestone_id: u32
    ) -> Result<(), Error>

    #[ink(message)]
    pub fn raise_dispute(
        &mut self,
        project_id: u64,
        milestone_id: u32,
        reason: String
    ) -> Result<(), Error>

    #[ink(message)]
    pub fn get_milestone_status(
        &self,
        project_id: u64,
        milestone_id: u32
    ) -> Option<MilestoneRecord>
}
```

**AI Prompt for Contract:**

> "Write a Polkadot Ink! smart contract for a Project Registry. It stores project metadata (title, description hash) and milestone records. Freelancers can submit deliverable hashes. Clients can mark milestones approved or raise disputes. Emit events for key state changes. Include tests."

**Tasks:**

- [ ] Hour 1: Generate contract with AI
- [ ] Hour 2: Build and test (`cargo contract build && cargo test`)
- [ ] Hour 2.5: Deploy to local node

```bash
cargo contract upload --suri //Alice
cargo contract instantiate --suri //Alice --constructor new
```

#### Sprint 2.3: Integration Testing (1 hour)

- [ ] Create project on Stellar (get project_id)
- [ ] Register same project on Polkadot
- [ ] Fund escrow on Stellar
- [ ] Submit deliverable on Polkadot
- [ ] Release milestone on Stellar
- [ ] Verify funds transferred

**Save to `.env`:**

```
STELLAR_CONTRACT_ID=CXXX...
POLKADOT_CONTRACT_ADDRESS=5XXX...
STELLAR_ADMIN_SECRET=SXXX...
STELLAR_NETWORK=futurenet
```

---

### Day 3: Integration (4.5 hours)

#### Sprint 3.1: Frontend → Stellar (2 hours)

**Stellar Service (`frontend/src/lib/stellar.ts`):**

```typescript
import { Contract, networks, Keypair } from '@stellar/stellar-sdk';

export async function connectFreighter(): Promise<string> {
  // Connect to Freighter wallet, return public key
}

export async function createProject(
  freelancer: string,
  milestones: number[]
): Promise<string> {
  // Call create_project on contract
}

export async function fundProject(
  projectId: string,
  amount: number
): Promise<void> {
  // Call fund_project on contract
}

export async function releaseMilestone(
  projectId: string,
  milestoneId: number
): Promise<void> {
  // Call release_milestone on contract
}

export async function getProjectDetails(
  projectId: string
): Promise<Project> {
  // Query contract state
}

export async function getEscrowBalance(
  projectId: string
): Promise<number> {
  // Query escrow balance
}
```

**Tasks:**

- [ ] Implement wallet connection with Freighter
- [ ] Wire up "Create Project" form to contract
- [ ] Wire up "Fund Project" button
- [ ] Wire up "Release Milestone" button
- [ ] Add transaction status toasts

#### Sprint 3.2: Frontend → Polkadot (1.5 hours)

**Polkadot Service (`frontend/src/lib/polkadot.ts`):**

```typescript
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';

export async function connectPolkadotWallet(): Promise<string> {
  // Connect to Polkadot.js extension
}

export async function registerProject(
  projectId: string,
  title: string,
  milestones: string[]
): Promise<void> {
  // Call register_project on contract
}

export async function submitDeliverable(
  projectId: string,
  milestoneId: number,
  hash: string
): Promise<void> {
  // Call submit_deliverable on contract
}

export async function getMilestoneStatus(
  projectId: string,
  milestoneId: number
): Promise<MilestoneRecord> {
  // Query contract state
}

export async function raiseDispute(
  projectId: string,
  milestoneId: number,
  reason: string
): Promise<void> {
  // Call raise_dispute on contract
}
```

**Tasks:**

- [ ] Implement Polkadot.js wallet connection
- [ ] Wire up "Submit Deliverable" form
- [ ] Fetch and display milestone status from Polkadot
- [ ] Wire up "Raise Dispute" modal

#### Sprint 3.3: Cross-Chain Sync (1 hour)

**For hackathon MVP:** Manual sync via frontend

1. User approves milestone on Polkadot
2. Frontend detects approval
3. Frontend prompts user to release funds on Stellar
4. User signs Stellar transaction

**Future enhancement:** Automated relayer script

---

### Day 4: Polish & Demo (2.5 hours)

#### Sprint 4.1: UI/UX Polish (1 hour)

- [ ] Loading states for all async operations
- [ ] Error handling with user-friendly messages
- [ ] Success toasts with transaction links
- [ ] Mobile-responsive layout
- [ ] Empty states for no projects

#### Sprint 4.2: Demo Prep (1 hour)

**Deploy:**

```bash
cd frontend
npm run build
vercel deploy --prod
```

**Demo Script (2 minutes):**



#### Sprint 4.3: Documentation (0.5 hours)

**README.md contents:**

- Project description
- Architecture diagram
- Setup instructions
- Contract addresses
- Demo video link
- Team info

---

## 🎬 The Pitch

### 30-Second Version

> "Every year, freelancers lose $50 billion to payment disputes and platform fees. We built FreelanceEscrow—a trustless payment system where work is verified on Polkadot and money moves on Stellar. No middleman. No 20% fee. Just code that guarantees: deliver work, get paid."

### Why Judges Should Care

1. **Real Problem:** $1.5T freelance market with massive trust issues
2. **Clear Value:** Eliminates 20% platform fees
3. **Technical Merit:** True cross-chain architecture
4. **RWA Fit:** Labor contracts are real-world agreements
5. **Demo Impact:** Visual "work → payment" flow

---

## ⚡ Quick Reference

### Stellar Commands

```bash
# check soroban docs 
# Build contract
soroban contract build

# Deploy to Futurenet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/freelance_escrow.wasm \
  --network futurenet

# Invoke function
soroban contract invoke --id <CONTRACT_ID> --network futurenet -- \
  create_project --client <ADDR> --freelancer <ADDR> --milestones '[1000, 2000]'

# Check balance
soroban contract invoke --id <CONTRACT_ID> --network futurenet -- \
  get_balance --project_id 1
```

### Polkadot Commands

```bash
# Build contract
cargo contract build

# Upload to local node
# deploy to testnet instead
cargo contract upload --suri //Alice

# Instantiate
cargo contract instantiate --suri //Alice --constructor new

# Call function
cargo contract call --suri //Alice --contract <ADDR> --message submit_deliverable \
  --args 1 0 0x1234...
```

### Frontend Commands

```bash
# Development
npm run dev

# Build
npm run build

# Deploy
vercel deploy --prod
```

---

## 🚨 Risk Mitigation

### If Behind Schedule

| Cut This | Impact | Recovery |
|----------|--------|----------|
| Polkadot contract | Medium | Use only Stellar escrow |
| Project detail page | Low | Use dashboard only |
| Dispute flow | Low | Mention as "future work" |
##### do not include dispute flow in first build 
### If Ahead of Schedule

| Add This | Impact |
|----------|--------|
| Arbitrator role | High - adds governance |
| Reputation scores | Medium - adds trust layer |
| Project templates | Low - UX improvement |

---

## ✅ Checklist

### Day 1 Complete When:

- [ ] All 3 pages render with mock data
- [ ] Navigation works between pages
- [ ] Stellar dev environment running
- [ ] Polkadot dev environment running

### Day 2 Complete When:

- [ ] Stellar escrow deployed to Futurenet
- [ ] Polkadot registry deployed to local node
- [ ] Can call all functions via CLI
- [ ] Contract addresses saved to .env

### Day 3 Complete When:

- [ ] Frontend connected to Stellar contract
- [ ] Frontend connected to Polkadot contract
- [ ] Full flow works: Create → Fund → Submit → Approve → Release
- [ ] Transactions visible in wallets

### Day 4 Complete When:

- [ ] Frontend deployed to production URL
- [ ] Demo script rehearsed 3 times
- [ ] README complete
- [ ] Backup video recorded

---

## 📊 Contract Addresses (Fill During Development)

```
# Stellar (Futurenet)
ESCROW_CONTRACT_ID=

# Polkadot (Local/Testnet)
REGISTRY_CONTRACT_ADDRESS=

# Test Accounts
CLIENT_PUBLIC_KEY=
CLIENT_SECRET_KEY=
FREELANCER_PUBLIC_KEY=
FREELANCER_SECRET_KEY=
ADMIN_PUBLIC_KEY=
ADMIN_SECRET_KEY=
```

---

# 🔄 REVISED SPRINT PLAN (Modular / Single-Chain Ready)

> **Use this plan if:** You may only deploy on ONE chain, or want to complete each chain as a standalone deliverable before integrating.

## Key Changes from Original Plan

| Original | Revised |
|----------|---------|
| Day 2: Both contracts in parallel | Day 2: Stellar ONLY (complete + integrated) |
| Day 3: Integrate both | Day 3: Polkadot ONLY (complete + integrated) |
| Interleaved work | Sequential, each chain is a "checkpoint" |

## Benefits of Modular Approach

1. **Checkpoint after Day 2:** Stellar-only version is fully demoable
2. **Flexibility:** If time runs out, you have ONE working chain
3. **Cleaner commits:** Each chain is a complete feature
4. **Easier debugging:** Isolate issues to one chain at a time

---

## 📅 REVISED SPRINT BREAKDOWN

### Day 1: Frontend + Environment (6 hours) — NO CHANGE

Same as original plan:
- 1.5 hours: Setup both environments (scaffold only)
- 4.5 hours: Build all 3 pages with mock data

**Deliverable:** Complete UI with fake data, both dev environments ready

---

### Day 2: STELLAR COMPLETE (7 hours)

> **Goal:** Fully working Stellar escrow with frontend integration

#### Sprint 2.1: Stellar Contract (3 hours)

```rust
// Core functions to implement
fn create_project(client, freelancer, milestones: Vec<i128>) -> u64
fn fund_project(project_id: u64, amount: i128)
fn release_milestone(project_id: u64, milestone_id: u32) -> Result<i128, Error>
fn get_project(project_id: u64) -> Project
fn get_balance(project_id: u64) -> i128
```

**Tasks:**
- [ ] Hour 1: Generate contract with AI, review
- [ ] Hour 2: Fix errors, add tests, `cargo test`
- [ ] Hour 3: Deploy to Futurenet, test via CLI

#### Sprint 2.2: Stellar Frontend Integration (3 hours)

**Create `frontend/src/lib/stellar.ts`:**

```typescript
export async function connectFreighter(): Promise<string>
export async function createProject(freelancer: string, milestones: number[]): Promise<string>
export async function fundProject(projectId: string, amount: number): Promise<void>
export async function releaseMilestone(projectId: string, milestoneId: number): Promise<void>
export async function getProjectDetails(projectId: string): Promise<Project>
```

**Tasks:**
- [ ] Hour 1: Implement Stellar service functions
- [ ] Hour 2: Connect Client Dashboard (create, fund, release)
- [ ] Hour 3: Connect Freelancer Dashboard (view earnings)

#### Sprint 2.3: Stellar Demo Test (1 hour)

- [ ] Full flow test: Create → Fund → Release → Verify wallet
- [ ] Fix any bugs
- [ ] Record quick backup video of Stellar-only demo

**🎯 CHECKPOINT: Stellar-only version is COMPLETE and DEMOABLE**

If hackathon only allows Stellar, you're done with core functionality!

---

### Day 3: POLKADOT COMPLETE (5 hours)

> **Goal:** Add Polkadot registry for deliverable tracking

#### Sprint 3.1: Polkadot Contract (2.5 hours)

```rust
// Core functions to implement
#[ink(message)]
fn register_project(project_id: u64, title: String, milestone_count: u32)

#[ink(message)]
fn submit_deliverable(project_id: u64, milestone_id: u32, hash: Hash)

#[ink(message)]
fn get_deliverable(project_id: u64, milestone_id: u32) -> Option<Hash>

#[ink(message)]
fn mark_approved(project_id: u64, milestone_id: u32)
```

**Tasks:**
- [ ] Hour 1: Generate contract with AI
- [ ] Hour 1.5: Build and test locally
- [ ] Hour 2.5: Deploy to local node or testnet

#### Sprint 3.2: Polkadot Frontend Integration (2 hours)

**Create `frontend/src/lib/polkadot.ts`:**

```typescript
export async function connectPolkadotWallet(): Promise<string>
export async function registerProject(projectId: string, title: string): Promise<void>
export async function submitDeliverable(projectId: string, milestoneId: number, hash: string): Promise<void>
export async function getDeliverable(projectId: string, milestoneId: number): Promise<string | null>
```

**Tasks:**
- [ ] Hour 1: Implement Polkadot service functions
- [ ] Hour 2: Add deliverable submission to Freelancer view
- [ ] Hour 2: Show deliverable hash in Client approval view

#### Sprint 3.3: Cross-Chain Flow Test (0.5 hours)

- [ ] Test: Submit on Polkadot → Approve → Release on Stellar
- [ ] Verify both wallets show correct state

**🎯 CHECKPOINT: Full cross-chain version is COMPLETE**

---

### Day 4: Polish & Demo (2 hours)

Same as original:
- [ ] UI polish, error handling
- [ ] Deploy frontend
- [ ] Rehearse demo 3x
- [ ] Record backup video
- [ ] Complete README

---

## 🎬 DEMO SCRIPTS (Choose Based on Deployment)

### Stellar-Only Demo (90 seconds)

| Time | Action | Script |
|------|--------|--------|
| 0:00 | Intro | "Freelancers wait 30 days for payment. We fix that." |
| 0:15 | Create Project | Client creates "Logo Design" with 3 milestones |
| 0:30 | Fund | Client deposits $1000 USDC into escrow |
| 0:45 | Show Balance | "Money is locked. Neither party can run." |
| 1:00 | Approve | Client approves Milestone 1 |
| 1:10 | Release | Funds release instantly to freelancer |
| 1:20 | Show Wallet | Freelancer wallet: +$500 |
| 1:30 | Close | "5 seconds, not 30 days. Zero platform fees." |

### Full Cross-Chain Demo (2 minutes)

| Time | Action | Script |
|------|--------|--------|
| 0:00 | Intro | "Trustless freelancing. Two chains. One solution." |
| 0:15 | Create + Fund | Client creates and funds project on Stellar |
| 0:30 | Submit Work | Freelancer submits deliverable hash on Polkadot |
| 0:45 | Show Proof | "Work is recorded on Polkadot. Immutable proof." |
| 1:00 | Approve | Client reviews, approves on Polkadot |
| 1:15 | Release | Stellar releases funds automatically |
| 1:30 | Show Wallets | Both chains updated, freelancer paid |
| 1:45 | Dispute | "What if there's a dispute? On-chain evidence." |
| 2:00 | Close | "Polkadot verifies. Stellar pays. No middleman." |

---

## ⏱️ TIME COMPARISON

| Scenario | Day 1 | Day 2 | Day 3 | Day 4 | Total |
|----------|-------|-------|-------|-------|-------|
| **Original (parallel)** | 6h | 7h | 4.5h | 2.5h | 20h |
| **Revised (sequential)** | 6h | 7h | 5h | 2h | 20h |
| **Stellar-only** | 6h | 7h | — | 2h | 15h |
| **Polkadot-only** | 6h | — | 7h | 2h | 15h |

**Key insight:** Sequential approach gives you a working demo after Day 2, with 5 hours of buffer if you stop there.

---

## 🚨 DECISION POINTS

### After Day 1:
- ✅ Frontend complete → Proceed to Day 2
- ❌ Frontend incomplete → Cut to 2 pages, skip marketplace

### After Day 2 (Stellar complete):
- ✅ Stellar working → Proceed to Polkadot
- ⚠️ Stellar buggy → Spend Day 3 fixing Stellar, skip Polkadot
- ❌ Stellar broken → Pivot to Polkadot-only

### After Day 3:
- ✅ Both chains working → Polish and demo prep
- ⚠️ Integration issues → Demo chains separately
- ❌ Major issues → Use Stellar-only demo

---

## ✅ REVISED CHECKLIST

### Day 1 Complete:
- [ ] All pages render with mock data
- [ ] Navigation works
- [ ] Both dev environments scaffolded

### Day 2 Complete (STELLAR CHECKPOINT):
- [ ] Stellar contract deployed to Futurenet
- [ ] Frontend creates/funds/releases via Stellar
- [ ] Can demo Stellar-only flow end-to-end
- [ ] Backup video recorded

### Day 3 Complete (FULL VERSION):
- [ ] Polkadot contract deployed
- [ ] Frontend submits deliverables via Polkadot
- [ ] Cross-chain flow works
- [ ] Both wallets show correct state

### Day 4 Complete:
- [ ] Frontend deployed
- [ ] Demo rehearsed
- [ ] README complete
- [ ] Final video recorded

---

*Last Updated: Planning Phase*
*Status: Ready to Start Day 1*
*Mode: Modular (Stellar-first, Polkadot-second)*
