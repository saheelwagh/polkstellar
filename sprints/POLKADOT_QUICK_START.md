# Polkadot Integration - Quick Start Guide

## TL;DR

PolkStellar uses **Stellar for payments** and **Polkadot for work verification**. This document summarizes what's needed to get Polkadot working.

---

## Current Status

✅ **Done:**

- Stellar escrow contract deployed and working
- Frontend with search, filter, transaction history
- Project metadata display (title, description)

❌ **TODO:**

- Compile and deploy Polkadot contract
- Create Polkadot wallet connection
- Implement contract client
- Integrate into dashboards

---

## Why This Architecture?

| Layer | Stellar | Polkadot |
|-------|---------|----------|
| **Role** | Financial escrow | Work verification |
| **Why** | Fast, proven, payment-optimized | Flexible, scalable, dispute-capable |
| **Cost** | 0.21 XLM/KB (expensive) | 0.01 DOT/KB (cheap) |
| **Speed** | 3-5 sec | 6-12 sec |
| **Use Case** | Hold & release funds | Track deliverables & approvals |

---

## Implementation Steps (2-3 weeks)

### Week 1: Contract Deployment

```bash
# 1. Compile
cd contracts/polkadot/project-registry
cargo contract build

# 2. Test
cargo test

# 3. Deploy to Rococo testnet
cargo contract instantiate \
  --suri <SECRET_URI> \
  --url wss://rococo-contracts-rpc.polkadot.io \
  --constructor new

# 4. Save address to .env
VITE_POLKADOT_CONTRACT_ADDRESS=<address>
```

### Week 1-2: Wallet Integration

```typescript
// Extend WalletContext to support both Stellar and Polkadot
// Allow users to connect either or both wallets
// Support Polkadot.js extension

interface WalletContextType {
  stellar: { isConnected, address, connect() }
  polkadot: { isConnected, address, connect() }
}
```

### Week 2: Contract Client

```typescript
// Create frontend/src/lib/polkadot-client.ts
export async function registerProject(projectId, title, descriptionHash, freelancer, milestoneCount)
export async function submitDeliverable(projectId, milestoneId, deliverableHash)
export async function approveMilestone(projectId, milestoneId)
export async function raiseDispute(projectId, milestoneId, reason)
export async function getProjectMeta(projectId)
export async function getMilestoneRecord(projectId, milestoneId)
```

### Week 2-3: Dashboard Integration

**ClientDashboard:**
- Add "Register on Polkadot" button
- Add "Approve Deliverable" button
- Add "Raise Dispute" button
- Display deliverable hash and status

**FreelancerDashboard:**
- Add "Submit Deliverable" button
- Input field for deliverable hash
- Display submission status

### Week 3: Testing & Polish

- End-to-end workflow testing
- Error handling
- UI refinement
- Documentation

---

## Feature Mapping

### Client Workflow

```
1. Create Project (Stellar)
   ↓
2. Register on Polkadot
   ↓
3. Fund Milestone (Stellar)
   ↓
4. Review Deliverable (Polkadot)
   ↓
5. Approve or Dispute (Polkadot)
   ↓
6. Release Funds (Stellar)
```

### Freelancer Workflow

```
1. View Projects (Both chains)
   ↓
2. Submit Deliverable (Polkadot)
   ↓
3. Wait for Approval (Polkadot)
   ↓
4. Receive Funds (Stellar)
```

---

## Key Contract Methods

### Write Operations (State-changing)

| Method | Caller | Purpose |
|--------|--------|---------|
| `register_project(id, title, desc_hash, freelancer, count)` | Client | Register project metadata |
| `submit_deliverable(project_id, milestone_id, hash)` | Freelancer | Submit work proof |
| `approve_milestone(project_id, milestone_id)` | Client | Approve deliverable |
| `raise_dispute(project_id, milestone_id, reason)` | Client | Dispute deliverable |

### Read Operations (Query-only)

| Method | Returns |
|--------|---------|
| `get_project(project_id)` | ProjectMeta |
| `get_milestone(project_id, milestone_id)` | MilestoneRecord |
| `is_approved(project_id, milestone_id)` | bool |

---

## Data Structures

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

---

## Environment Setup

```bash
# Install packages
pnpm install @polkadot/api @polkadot/api-contract @polkadot/extension-dapp

# .env
VITE_POLKADOT_CONTRACT_ADDRESS=<deployed_address>
VITE_POLKADOT_RPC_URL=wss://rococo-contracts-rpc.polkadot.io
```

---

## Testing Checklist

- [ ] Contract compiles without errors
- [ ] All tests pass
- [ ] Contract deploys to Rococo testnet
- [ ] Wallet connection works
- [ ] All contract methods callable
- [ ] Project registration works
- [ ] Deliverable submission works
- [ ] Approval workflow works
- [ ] Dispute workflow works
- [ ] Transaction history shows both chains
- [ ] Explorer links work
- [ ] Error handling works
- [ ] UI is responsive
- [ ] End-to-end workflow tested

---

## Resources

**Polkadot Documentation:**
- https://docs.substrate.io/
- https://docs.rs/ink/latest/ink/

**Ink! Contract Examples:**
- https://github.com/paritytech/ink-examples

**Polkadot.js:**
- https://polkadot.js.org/docs/

**Rococo Testnet:**
- RPC: wss://rococo-contracts-rpc.polkadot.io
- Explorer: https://rococo.subscan.io
- Faucet: https://rococo.subscan.io/tools/faucet

---

## Success Criteria

✅ **Functional:**
- Contract deploys and works
- All methods callable
- Wallet connection works
- Workflow complete

✅ **Non-Functional:**
- Tx confirmation < 30 sec
- Clear error messages
- Responsive UI
- No wallet disconnection

✅ **Testing:**
- End-to-end tested
- All error paths tested
- Cross-chain consistency verified

---

## Next Steps

1. **Start with contract deployment** (1-2 days)
   - Compile, test, deploy to Rococo
   - Save contract address

2. **Then wallet integration** (2-3 days)
   - Extend WalletContext
   - Add Polkadot.js support

3. **Then contract client** (2-3 days)
   - Implement all methods
   - Add transaction tracking

4. **Then dashboard integration** (2-3 days)
   - Add buttons and workflows
   - Add explorer links

5. **Finally testing & polish** (2-3 days)
   - End-to-end testing
   - Error handling
   - UI refinement

**Total: 2-3 weeks**

---

## Questions?

See `POLKADOT_INTEGRATION_PLAN.md` for detailed information on:
- Architecture decisions
- Data flow diagrams
- Implementation details
- Troubleshooting guide
- Future enhancements
