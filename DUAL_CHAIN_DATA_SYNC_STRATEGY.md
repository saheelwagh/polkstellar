# Dual-Chain Data Sync Strategy

## The Problem

**Question:** When I create projects on Stellar, will the data be reflected in Polkadot upon connection?

**Short Answer:** **NO** - Stellar and Polkadot are separate blockchains that don't automatically sync.

**Reason:** Blockchains are isolated systems. A transaction on Stellar cannot directly write to Polkadot, and vice versa.

---

## Current Architecture

### Stellar (Soroban) - Financial Layer
- **Purpose:** Escrow, fund management, payments
- **Data Stored:** 
  - Project funding amounts
  - Milestone payment releases
  - Escrow balances
- **Contract:** `freelance_escrow.wasm`

### Polkadot (Ink!) - Metadata Layer
- **Purpose:** Project metadata, deliverables, approval workflow
- **Data Stored:**
  - Project details (title, description, deadline)
  - Deliverable submissions
  - Milestone approval status
- **Contract:** `FreelanceEscrowMetadata` (to be deployed)

### Current State
**Separate data stores** - No automatic sync between chains.

---

## Solution Options

### Option 1: Dual Write (Recommended for MVP)

**How it works:**
1. User creates project in frontend
2. Frontend submits to **both** chains simultaneously
3. Both transactions must succeed for project to be "created"

**Implementation:**

```typescript
// In frontend when creating project
async function createProject(formData) {
  try {
    // Step 1: Write metadata to Polkadot
    const polkadotTx = await polkadotContract.register_project(
      formData.title,
      formData.description,
      formData.freelancer,
      formData.budget,
      formData.deadline,
      formData.milestoneCount
    );
    
    // Step 2: Create escrow on Stellar
    const stellarTx = await stellarContract.create_project(
      polkadotTx.projectId,  // Use same ID
      formData.client,
      formData.freelancer,
      formData.budget
    );
    
    // Both succeeded!
    return { polkadotId: polkadotTx.projectId, stellarId: stellarTx.projectId };
  } catch (error) {
    // Rollback if one fails
    // (Or accept partial state and retry later)
  }
}
```

**Pros:**
- Simple to implement
- No backend required
- Data is always in sync (or both fail)

**Cons:**
- Both chains must be available
- User pays gas on both chains
- If one fails, need rollback logic

---

### Option 2: Off-Chain Indexer

**How it works:**
1. Create project on Stellar
2. Backend listens for Stellar events
3. Backend automatically creates on Polkadot
4. Or vice versa

**Architecture:**

```
User → Frontend → Stellar Contract
                      ↓ (emits event)
                  Indexer/Backend
                      ↓ (listens)
                  Polkadot Contract
```

**Implementation:**

```typescript
// Backend service
stellarIndexer.on('ProjectCreated', async (event) => {
  // Create matching record on Polkadot
  await polkadotContract.register_project(
    event.title,
    event.description,
    event.freelancer,
    event.budget,
    event.deadline,
    event.milestoneCount
  );
});
```

**Pros:**
- User only interacts with one chain
- Can batch transactions
- Retry logic handled by backend

**Cons:**
- Requires backend infrastructure
- Centralization (backend is trusted)
- Additional complexity

---

### Option 3: Frontend State Management

**How it works:**
1. Store project data in frontend (localStorage/IndexedDB)
2. When user connects to Stellar: show Stellar projects
3. When user connects to Polkadot: show Polkadot projects
4. UI merges both views

**Implementation:**

```typescript
// Frontend state
const projects = {
  stellar: [...],     // From Stellar contract
  polkadot: [...],    // From Polkadot contract
  local: [...]        // Not yet submitted to either chain
};

// Merged view
const allProjects = [
  ...projects.stellar,
  ...projects.polkadot,
  ...projects.local
];
```

**Pros:**
- Flexible
- Works offline
- User controls which chain to use

**Cons:**
- Data can get out of sync
- Not truly "on-chain"
- More complex UI logic

---

### Option 4: Cross-Chain Messaging (Future)

**How it works:**
Use protocols like **XCM** (Cross-Consensus Messaging) to send data between chains.

**Status:** Not available for Stellar ↔ Polkadot yet.

---

## Recommended Approach for PolkStellar

### Phase 1 (MVP): Dual Write

**For demo/testing:**
- Create projects on **both** chains when user submits form
- Store IDs from both chains
- UI shows combined data

**Code structure:**

```typescript
// hooks/useCreateProject.ts
export function useCreateProject() {
  const { registerProject: polkadotRegister } = usePolkadotContracts();
  const { createProject: stellarCreate } = useStellarContracts();
  
  async function createProject(formData) {
    // 1. Create on Polkadot (metadata)
    const polkadotId = await polkadotRegister(formData);
    
    // 2. Create on Stellar (escrow) with same ID
    const stellarId = await stellarCreate({
      projectId: polkadotId,
      budget: formData.budget,
      ...
    });
    
    return { polkadotId, stellarId };
  }
  
  return { createProject };
}
```

### Phase 2 (Production): Add Backend

- Event indexer watches both chains
- Syncs data automatically
- Provides GraphQL API for frontend
- Handles retries and conflicts

---

## Current Data Flow (Without Sync)

### Stellar Flow
```
User → Stellar Wallet → Stellar Contract → Stellar Blockchain
                              ↓
                    Only Stellar knows this data
```

### Polkadot Flow
```
User → SubWallet → Polkadot Contract → Polkadot Blockchain
                        ↓
                Only Polkadot knows this data
```

### No Connection Between Them!

---

## Implementing Dual Write

### Step 1: Update Frontend Hook

```typescript
// useCreateProject.ts
export function useCreateProject() {
  const { connectedAccount: polkadotAccount } = useTypink();
  const { address: stellarAddress } = useWallet();
  const polkadot = usePolkadotContracts();
  const stellar = useStellarContracts();
  
  async function createDualChainProject(formData) {
    // Require both wallets
    if (!polkadotAccount || !stellarAddress) {
      throw new Error('Connect both wallets first');
    }
    
    setLoading(true);
    
    try {
      // 1. Polkadot transaction
      console.log('Creating project on Polkadot...');
      const polkadotResult = await polkadot.registerProject(formData);
      
      // 2. Stellar transaction (using Polkadot project ID)
      console.log('Creating escrow on Stellar...');
      const stellarResult = await stellar.createProject({
        projectId: polkadotResult.projectId,
        client: stellarAddress,
        freelancer: formData.freelancerStellarAddress,
        amount: formData.budget,
      });
      
      console.log('✅ Project created on both chains!');
      return {
        polkadotId: polkadotResult.projectId,
        stellarId: stellarResult.projectId,
      };
    } catch (error) {
      console.error('Failed to create on both chains:', error);
      // TODO: Rollback logic if needed
      throw error;
    } finally {
      setLoading(false);
    }
  }
  
  return { createDualChainProject };
}
```

### Step 2: Update UI

```typescript
// In CreateProjectForm component
const { createDualChainProject } = useCreateProject();

async function handleSubmit(formData) {
  const result = await createDualChainProject(formData);
  
  // Show success with both IDs
  alert(`Project created!
    Polkadot ID: ${result.polkadotId}
    Stellar ID: ${result.stellarId}
  `);
}
```

### Step 3: Reading Data

```typescript
// Fetch from both chains
const polkadotProjects = await polkadot.getMyProjects();
const stellarProjects = await stellar.getMyProjects();

// Merge by ID
const mergedProjects = polkadotProjects.map(pp => ({
  ...pp,
  stellarData: stellarProjects.find(sp => sp.projectId === pp.projectId)
}));
```

---

## Important Notes

### For Demo/Testing
- **Mock data is fine** - Shows the UI flow works
- When ready, implement dual write
- Test with small amounts on testnet

### For Production
- **Need both wallets connected** simultaneously
- **ID mapping** - Store which Polkadot ID maps to which Stellar ID
- **Error handling** - What if Stellar succeeds but Polkadot fails?
- **User experience** - Make it clear data lives on both chains

### Alternative: Choose One Chain Per Feature
- **Metadata-heavy features** → Polkadot only
- **Payment features** → Stellar only
- Simpler, but less integrated

---

## Summary

**Your Question:** "Will Stellar data show up in Polkadot?"

**Answer:** Not automatically. You need to:

1. **Option A (Simple):** Submit to both chains when creating projects
2. **Option B (Advanced):** Build a backend to sync data
3. **Option C (Hybrid):** Use Polkadot for metadata, Stellar for payments, keep them separate

**Recommendation:** Start with **dual write** - when user creates a project, submit it to both Polkadot and Stellar. This way both chains have the data and stay in sync.
