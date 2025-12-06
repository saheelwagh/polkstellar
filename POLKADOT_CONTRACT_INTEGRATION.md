# Polkadot Contract Integration Guide

## Status: Contracts Deployed ✅

You have already deployed the contracts to Paseo testnet using:
```bash
pop up --url wss://testnet-passet-hub.polkadot.io
```

## Current Contract Status

### What You Have
- **Compiled contracts**: `ProjectRegistry` and `MilestoneManager` 
- **Deployed addresses**: Ready to be added to `.env`
- **Basic functionality**: `register_project()` and `get_project_count()`

### What the Frontend Expects (Mock Mode)
The frontend currently uses **mock data** with these functions:
- `registerProject(formData)` - Create project with metadata
- `submitDeliverable(projectId, milestoneId, data)`
- `approveDeliverable(projectId, milestoneId)`
- `getProject(projectId)` - Get project details
- `getMyProjects()` - List user's projects

### The Gap
Your deployed contract is minimal (counter-based). The frontend expects rich metadata (title, description, budget, freelancer address, etc.).

---

## Option 1: Use Mock Data (Current - Recommended for Demo)

**Status**: ✅ Already working

**What it does**:
- Shows full UI functionality
- Demonstrates user flows
- No contract calls (all local)

**Good for**:
- UI/UX demos
- Testing frontend logic
- Sprint presentations

---

## Option 2: Connect to Deployed Contract (Basic)

Add your contract addresses to use real blockchain calls with the current simple contract.

### Steps:

1. **Create `.env` file**:
```bash
cd frontend
cp .env.example .env
```

2. **Add your deployed addresses**:
```env
VITE_POLKADOT_RPC_URL=wss://testnet-passet-hub.polkadot.io
VITE_POLKADOT_CONTRACT_ADDRESS=<your_ProjectRegistry_address>
VITE_POLKADOT_MILESTONE_MANAGER_ADDRESS=<your_MilestoneManager_address>
VITE_POLKADOT_NETWORK=paseo
```

3. **Update the hook** to call real contract:

```typescript
// In usePolkadotContracts.ts
import { useContract, useCall, useTx } from 'typink';
import contractAbi from '../contracts/ProjectRegistry.json';

const { contract } = useContract(PROJECT_REGISTRY_ADDRESS, contractAbi);

// Call register_project
const { signAndSend } = useTx(contract, 'register_project');
await signAndSend();

// Read project count
const { data: count } = useCall(contract, 'get_project_count');
```

**Limitation**: Can only increment counter, not store project metadata.

---

## Option 3: Enhance Contract (Full Features)

To support the full frontend functionality, the contract needs enhancement.

### What Needs to be Added:

```rust
#[ink(storage)]
pub struct ProjectRegistry {
    project_count: u64,
    // NEW: Storage for project metadata
    projects: Mapping<u64, ProjectMetadata>,
    user_projects: Mapping<AccountId, Vec<u64>>,
}

#[derive(scale::Encode, scale::Decode)]
pub struct ProjectMetadata {
    pub project_id: u64,
    pub title: String,
    pub description: String,
    pub client: AccountId,
    pub freelancer: AccountId,
    pub budget: u128,
    pub deadline: u64,
    pub milestone_count: u8,
    pub status: ProjectStatus,
}

#[ink(message)]
pub fn register_project(
    &mut self,
    title: String,
    description: String,
    freelancer: AccountId,
    budget: u128,
    deadline: u64,
    milestone_count: u8,
) -> Result<u64, Error> {
    // Store full metadata
    // Add to user's project list
    // Emit event
}

#[ink(message)]
pub fn get_project(&self, project_id: u64) -> Option<ProjectMetadata> {
    self.projects.get(project_id)
}

#[ink(message)]
pub fn get_user_projects(&self, user: AccountId) -> Vec<u64> {
    self.user_projects.get(user).unwrap_or_default()
}
```

### Workflow:

1. **Edit Contract**:
   ```bash
   cd contracts/polkadot/ProjectRegistry
   # Edit lib.rs with new storage and functions
   ```

2. **Rebuild**:
   ```bash
   cargo contract build --release
   ```

3. **Redeploy**:
   ```bash
   pop up --url wss://testnet-passet-hub.polkadot.io
   ```

4. **Update Frontend**:
   - Copy new ABI from `target/ink/ProjectRegistry.json`
   - Update `.env` with new contract address
   - Update `usePolkadotContracts.ts` to remove mock data

---

## Recommended Path

### For Now (Sprint 6 Complete):
✅ **Keep mock data** - UI is polished and functional

### For Next Sprint (Real Integration):
1. Enhance contract with metadata storage
2. Redeploy to Paseo
3. Wire up real contract calls
4. Test end-to-end transactions

---

## Your Deployed Addresses

Add them here for reference:

```
ProjectRegistry: _____________________
MilestoneManager: _____________________
Deployment Date: _____________________
```

---

## Testing Real Contract Calls

Once connected, test these flows:

1. **Connect SubWallet** → Should see your Paseo address
2. **Create Project** → Triggers `register_project()` transaction
3. **Sign Transaction** → SubWallet popup for approval
4. **Wait for Block** → Transaction finalized (~6 seconds)
5. **View Project** → Read from contract storage

---

## Contract Enhancement Status

- [ ] Add ProjectMetadata struct
- [ ] Add storage Mappings
- [ ] Implement register_project with params
- [ ] Implement get_project
- [ ] Implement get_user_projects
- [ ] Add deliverable functions
- [ ] Add approval/rejection logic
- [ ] Rebuild and test locally
- [ ] Deploy to Paseo
- [ ] Update frontend ABI
- [ ] Test end-to-end

