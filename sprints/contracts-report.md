# PolkStellar Contracts Report

**Generated:** December 5, 2025  
**Sprint:** 3

---

## Overview

PolkStellar uses a dual-chain architecture:
- **Stellar (Soroban)**: Handles escrow funds and payments
- **Polkadot (Ink!)**: Handles project registry, deliverables, and disputes

---

## Stellar Contracts (Soroban/Rust)

### 1. Escrow Contract ✅ DEPLOYED

**Location:** `/contracts/stellar/escrow/src/lib.rs`  
**Contract ID:** `CCKCGYGFMTYRAHHNOVMBMGKAP6S4XSWL3TEJJH2D4JCZWBJRIZBUXZII`  
**Network:** Stellar Testnet  
**Status:** Deployed and working

#### Methods

| Method | Description | Frontend Usage |
|--------|-------------|----------------|
| `create_project(client, freelancer, milestone_amounts)` | Creates new escrow project | `ClientDashboard.tsx` - "Create Project" button |
| `fund_milestone(project_id, milestone_index)` | Client funds a milestone | `ClientDashboard.tsx` - "Fund" button (planned) |
| `submit_milestone(project_id, milestone_index)` | Freelancer marks work done | `FreelancerDashboard.tsx` - "Submit" button (planned) |
| `release_milestone(project_id, milestone_index)` | Client releases funds | `ClientDashboard.tsx` - "Release" button (planned) |
| `get_project(project_id)` | Get project details | `ClientDashboard.tsx` - loads on-chain projects |
| `get_project_count()` | Get total projects | `ClientDashboard.tsx` - determines how many to load |
| `get_balance(project_id)` | Get escrow balance | `Dashboard.tsx` - stats display (planned) |

#### Data Structures

```rust
pub struct Project {
    pub id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub milestones: Vec<Milestone>,
    pub total_funded: i128,
    pub total_released: i128,
}

pub struct Milestone {
    pub amount: i128,
    pub status: MilestoneStatus,  // Pending, Funded, Submitted, Approved, Released
}
```

#### Frontend Integration

**File:** `/frontend/src/lib/escrow-client.ts`

```typescript
// Uses generated TypeScript bindings
import { Client, networks } from '../../packages/escrow/src';

export async function createProject(clientAddress, freelancerAddress, milestoneAmounts)
export async function fundMilestone(signerAddress, projectId, milestoneIndex)
export async function submitMilestone(signerAddress, projectId, milestoneIndex)
export async function releaseMilestone(signerAddress, projectId, milestoneIndex)
export async function getProject(projectId)
export async function getProjectCount()
```

#### Build & Deploy Commands

```bash
cd contracts/stellar/escrow
stellar contract build
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --network testnet \
  --source <SECRET_KEY>
```

---

## Polkadot Contracts (Ink!/Rust)

### 1. Project Registry 📝 NEW - READY TO DEPLOY

**Location:** `/contracts/polkadot/project-registry/lib.rs`  
**Status:** Written, needs compilation and deployment

#### Purpose

Tracks project metadata, deliverables, and disputes on Polkadot. Works alongside the Stellar escrow contract to provide:
- Immutable record of work submissions
- Dispute handling with evidence
- Cross-chain verification

#### Methods

| Method | Description | Frontend Usage |
|--------|-------------|----------------|
| `register_project(project_id, title, description_hash, freelancer, milestone_count)` | Register project metadata | `ClientDashboard.tsx` - after Stellar project creation |
| `submit_deliverable(project_id, milestone_id, deliverable_hash)` | Submit work proof | `FreelancerDashboard.tsx` - "Submit Work" button |
| `approve_milestone(project_id, milestone_id)` | Approve deliverable | `ClientDashboard.tsx` - "Approve" button |
| `raise_dispute(project_id, milestone_id, reason)` | Raise a dispute | `ClientDashboard.tsx` - "Dispute" button |
| `resolve_dispute(project_id, milestone_id, approve)` | Admin resolves dispute | Admin panel (future) |
| `get_project(project_id)` | Get project metadata | Both dashboards |
| `get_milestone(project_id, milestone_id)` | Get milestone record | Both dashboards |
| `get_deliverable(project_id, milestone_id)` | Get deliverable hash | `ClientDashboard.tsx` - view submissions |
| `is_approved(project_id, milestone_id)` | Check approval status | Both dashboards |
| `get_project_count()` | Get total projects | Stats display |

#### Data Structures

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
    pub deliverable_hash: Option<Hash>,
    pub submitted_at: Option<Timestamp>,
    pub status: MilestoneStatus,  // Pending, Submitted, Approved, Disputed
    pub dispute_reason: Option<String>,
    pub disputed_at: Option<Timestamp>,
}
```

#### Events

| Event | When Emitted |
|-------|--------------|
| `ProjectRegistered` | New project registered |
| `DeliverableSubmitted` | Freelancer submits work |
| `MilestoneApproved` | Client approves milestone |
| `DisputeRaised` | Client raises dispute |

#### Build & Deploy Commands

```bash
cd contracts/polkadot/project-registry

# Build
cargo contract build

# Deploy to local node
cargo contract instantiate \
  --suri //Alice \
  --constructor new

# Or deploy to testnet (e.g., Contracts on Rococo)
cargo contract instantiate \
  --suri <SECRET_URI> \
  --url wss://rococo-contracts-rpc.polkadot.io \
  --constructor new
```

#### Frontend Integration (To Be Created)

**Planned File:** `/frontend/src/lib/polkadot-client.ts`

```typescript
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';

export async function registerProject(projectId, title, descriptionHash, freelancer, milestoneCount)
export async function submitDeliverable(projectId, milestoneId, hash)
export async function approveMilestone(projectId, milestoneId)
export async function raiseDispute(projectId, milestoneId, reason)
export async function getProjectMeta(projectId)
export async function getMilestoneRecord(projectId, milestoneId)
```

---

## Cross-Chain Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT ACTIONS                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. Create Project (Stellar) ──► Get project_id                  │
│ 2. Register Project (Polkadot) ──► Link metadata                │
│ 3. Fund Milestone (Stellar) ──► Lock funds                      │
│ 4. Review Deliverable (Polkadot) ──► View submission            │
│ 5. Approve/Dispute (Polkadot) ──► Record decision               │
│ 6. Release Funds (Stellar) ──► Pay freelancer                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      FREELANCER ACTIONS                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. View Assigned Projects (Both chains)                         │
│ 2. Submit Deliverable (Polkadot) ──► Upload proof               │
│ 3. Wait for Approval                                            │
│ 4. Receive Funds (Stellar) ──► Automatic on release             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Contracts Still Needed

### Stellar (Soroban)

| Contract | Priority | Description |
|----------|----------|-------------|
| ~~Escrow~~ | ✅ Done | Main escrow contract |
| Token Integration | Low | USDC/XLM token transfers (currently simulated) |

**Note:** The current escrow contract simulates token transfers. For production, integrate with Stellar's native token or USDC contract.

### Polkadot (Ink!)

| Contract | Priority | Description |
|----------|----------|-------------|
| ~~Project Registry~~ | ✅ Done | Deliverables and disputes |
| Reputation Contract | Medium | Track freelancer/client ratings |
| Arbitration DAO | Low | Decentralized dispute resolution |

---

## Testing Status

### Stellar Escrow

| Test | Status |
|------|--------|
| `test_create_project` | ✅ Passing |
| `test_fund_and_release` | ✅ Passing |
| Frontend integration | ✅ Working |

### Polkadot Project Registry

| Test | Status |
|------|--------|
| `test_register_project` | 📝 Written |
| `test_submit_deliverable` | 📝 Written |
| `test_approve_milestone` | 📝 Written |
| `test_raise_dispute` | 📝 Written |
| `test_only_freelancer_can_submit` | 📝 Written |
| `test_only_client_can_approve` | 📝 Written |
| `test_cannot_approve_without_deliverable` | 📝 Written |
| `test_full_workflow` | 📝 Written |
| Frontend integration | ❌ Not started |

---

## Deployment Checklist

### Stellar
- [x] Contract written
- [x] Tests passing
- [x] Deployed to testnet
- [x] TypeScript bindings generated
- [x] Frontend integrated

### Polkadot
- [x] Contract written
- [ ] Compile with `cargo contract build`
- [ ] Run tests with `cargo test`
- [ ] Deploy to local node or testnet
- [ ] Generate metadata/ABI
- [ ] Create frontend client
- [ ] Integrate with frontend

---

## File Locations Summary

```
contracts/
├── stellar/
│   └── escrow/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs          # ✅ Deployed
│
└── polkadot/
    ├── flipper/                # Example contract (ignore)
    └── project-registry/
        ├── Cargo.toml          # 📝 New
        └── lib.rs              # 📝 New

frontend/
├── packages/
│   └── escrow/                 # Generated Stellar bindings
│       └── src/
│           └── index.ts
│
└── src/
    └── lib/
        ├── escrow-client.ts    # ✅ Stellar client
        └── polkadot-client.ts  # ❌ To be created
```
