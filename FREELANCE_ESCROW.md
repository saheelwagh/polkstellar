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

| Time | Action | What to Say |
|------|--------|-------------|
| 0:00 | Title slide | "Freelancing is broken. Upwork takes 20%. Clients ghost. We fix this." |
| 0:15 | Client Dashboard | "Create Project: Logo Design. 3 milestones: Concept, Revision, Final." |
| 0:30 | Fund Project | "Client deposits $1000 USDC into escrow. Money is locked." |
| 0:45 | Freelancer View | "Freelancer sees project. Submits deliverable hash for Milestone 1." |
| 1:00 | Client View | "Client reviews. Clicks Approve. Polkadot records approval." |
| 1:15 | Release Funds | "Stellar releases $500 to freelancer. Instant. No fees." |
| 1:30 | Show Wallets | "Freelancer wallet: +$500. Escrow: $500 remaining." |
| 1:45 | Dispute Flow | "What if there's a dispute? Third-party arbitrator resolves." |
| 2:00 | Closing | "Trustless freelancing. Polkadot verifies. Stellar pays. Zero fees." |

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

*Last Updated: Planning Phase*
*Status: Ready to Start Day 1*
