# 🚀 YouTuber's IPO - Sprint Plan (20 Hours)

## 📋 Project Overview
**Concept:** Tokenize creator revenue streams - "The NASDAQ for Creators"
- **Stellar (Soroban):** Revenue share token + dividend distribution
- **Polkadot (Ink!):** Monthly revenue registry + verification
- **Frontend:** Dashboard showing revenue, dividends, and token ownership

---

## 🛠️ Required Tools & Libraries

### Backend - Stellar (Soroban)
- ✅ **Stellar CLI** (already installed)
- **Rust toolchain:** `rustup target add wasm32-unknown-unknown`
- **Soroban SDK:** Added via Cargo.toml
- **stellar-sdk (JS):** `npm install @stellar/stellar-sdk`
- **soroban-client:** For frontend integration

### Backend - Polkadot (Ink!)
- **Cargo contract:** `cargo install cargo-contract --force`
- **Substrate Contracts Node:** For local testing
- **@polkadot/api:** `npm install @polkadot/api`
- **@polkadot/api-contract:** For contract interaction
- **Inkathon template** (optional but recommended for boilerplate)

### Frontend
- **React + TypeScript** (via Inkathon or Vite)
- **TailwindCSS:** For styling
- **shadcn/ui:** For components (`npx shadcn-ui@latest init`)
- **Lucide React:** For icons (`npm install lucide-react`)
- **Recharts:** For revenue graphs (`npm install recharts`)
- **Wagmi/RainbowKit alternative:** Polkadot.js wallet connector
- **@stellar/freighter-api:** For Stellar wallet integration

### Development Tools
- **Docker:** For running local Stellar/Polkadot nodes
- **Postman/Thunder Client:** For API testing
- **TypeScript:** `npm install -D typescript @types/node`

---

## 📅 SPRINT BREAKDOWN

---

## 🎯 **DAY 1: Frontend + Environment Setup** (6 hours)

### Sprint 1.1: Environment Setup (1.5 hours)
**Goal:** Get both chains running locally with contract scaffolding

#### Stellar Setup
- [ ] Initialize Soroban project: `soroban contract init revenue-share`
- [ ] Set up local Stellar network (Futurenet or Standalone)
- [ ] Configure Soroban CLI with test accounts
- [ ] Create basic contract structure in `contracts/stellar/`

**Commands:**
```bash
# Create project structure
mkdir -p contracts/stellar contracts/polkadot
cd contracts/stellar
soroban contract init revenue-share
```

#### Polkadot Setup
- [ ] Install cargo-contract: `cargo install cargo-contract --force`
- [ ] Initialize Ink! project: `cargo contract new revenue-registry`
- [ ] Download substrate-contracts-node (or use docker)
- [ ] Start local node: `substrate-contracts-node --dev`

**Commands:**
```bash
cd contracts/polkadot
cargo contract new revenue-registry
# Start local node
docker run -p 9944:9944 paritytech/substrate-contracts-node:latest --dev --rpc-external
```

#### Frontend Setup
- [ ] Initialize React + TypeScript project (Vite or Inkathon)
- [ ] Install core dependencies (see tools list above)
- [ ] Set up TailwindCSS config
- [ ] Create basic folder structure:
  - `/components` - UI components
  - `/hooks` - Custom hooks for blockchain interaction
  - `/lib` - Utility functions & contract ABIs
  - `/pages` - Route pages
  - `/mock` - Mock data for Day 1

**Commands:**
```bash
# Option A: Using Vite
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Option B: Using Inkathon template
npx create-inkathon-app frontend

# Install dependencies
npm install @stellar/stellar-sdk @polkadot/api @polkadot/api-contract
npm install recharts lucide-react
npx shadcn-ui@latest init
npx shadcn-ui@latest add card button badge progress
```

---

### Sprint 1.2: Frontend Pages with Mock Data (4.5 hours)

**Goal:** Build all UI components with fake data for demo readiness

#### Page 1: Creator Dashboard (`/creator`) - 1.5 hours
**Features:**
- [ ] Revenue overview card (Total raised, monthly revenue)
- [ ] Token distribution pie chart (who owns shares)
- [ ] "Deposit Revenue" button (triggers mock transaction)
- [ ] Transaction history table

**Mock Data:**
```typescript
// /mock/creatorData.ts
{
  channelName: "TechWithSaheel",
  totalRaised: 10000,
  sharesSold: 450,
  totalShares: 1000,
  monthlyRevenue: [
    { month: "Jan", amount: 2500 },
    { month: "Feb", amount: 3200 },
    // ...
  ]
}
```

#### Page 2: Investor Dashboard (`/investor`) - 1.5 hours
**Features:**
- [ ] Portfolio overview (shares owned, dividends earned)
- [ ] Revenue chart (creator's monthly performance)
- [ ] "Claim Dividends" button
- [ ] Badge showing "Verified Investor" (from Polkadot)

**Mock Data:**
```typescript
// /mock/investorData.ts
{
  sharesOwned: 50,
  initialInvestment: 1000,
  totalDividends: 125,
  unclaimedDividends: 25,
  creatorPerformance: [...],
  isVerified: true
}
```

#### Page 3: Marketplace (`/marketplace`) - 1 hour
**Features:**
- [ ] List of creators with available shares
- [ ] Each card shows: Channel name, price per share, projected ROI
- [ ] "Buy Shares" button

**Mock Data:**
```typescript
// /mock/marketplace.ts
[
  {
    id: "creator-1",
    name: "TechWithSaheel",
    pricePerShare: 22,
    sharesAvailable: 550,
    monthlyRevenue: 5000
  },
  // ...
]
```

#### Shared Components - 0.5 hours
- [ ] Wallet connect button (Freighter for Stellar, Polkadot.js for Polkadot)
- [ ] Navigation bar
- [ ] Transaction toast notifications
- [ ] Loading states

**Deliverables by End of Day 1:**
- ✅ Fully functional UI with navigation
- ✅ All pages render with mock data
- ✅ Stellar & Polkadot dev environments running
- ✅ Contract project scaffolding ready

---

## 🎯 **DAY 2: Smart Contracts** (7 hours)

### Sprint 2.1: Stellar Revenue Share Contract (3.5 hours)

**Goal:** Deploy working dividend distribution contract

#### Contract Functions Needed:
```rust
// Key functions to implement
pub fn initialize(admin: Address, total_shares: u32) -> Result<(), Error>
pub fn issue_shares(to: Address, amount: u32) -> Result<(), Error>
pub fn deposit_revenue(amount: i128) -> Result<(), Error>
pub fn claim_dividends(shareholder: Address) -> Result<i128, Error>
pub fn get_share_balance(address: Address) -> u32
pub fn get_unclaimed_dividends(address: Address) -> i128
```

#### Tasks:
- [ ] **Hour 1:** AI prompt for contract structure
  - Prompt: *"Write a Soroban smart contract in Rust for a dividend-paying share token. It should track total shares per address, accept USDC deposits as revenue, calculate dividends proportionally, and allow shareholders to claim their share. Include test module."*

- [ ] **Hour 2:** Build & test locally
  ```bash
  cd contracts/stellar/revenue-share
  soroban contract build
  cargo test
  ```

- [ ] **Hour 3:** Deploy to Futurenet
  ```bash
  soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/revenue_share.wasm \
    --network futurenet
  ```

- [ ] **Hour 3.5:** Test contract functions via CLI
  ```bash
  soroban contract invoke \
    --id <CONTRACT_ID> \
    --network futurenet \
    -- issue_shares --to <ADDRESS> --amount 100
  ```

**Output:** Deployed contract ID + ABI

---

### Sprint 2.2: Polkadot Revenue Registry (2.5 hours)

**Goal:** Deploy contract that stores monthly revenue reports

#### Contract Functions Needed:
```rust
// Key storage & functions
pub struct RevenueReport {
    month: String,
    amount: Balance,
    timestamp: Timestamp,
    proof_hash: Hash, // IPFS hash of revenue proof
}

pub fn submit_report(month: String, amount: Balance, proof_hash: Hash) -> Result<(), Error>
pub fn get_report(report_id: u32) -> Option<RevenueReport>
pub fn get_latest_report() -> Option<RevenueReport>
pub fn verify_creator(creator: AccountId) -> Result<(), Error>
```

#### Tasks:
- [ ] **Hour 1:** AI prompt for contract
  - Prompt: *"Write a Polkadot Ink! smart contract that acts as a Revenue Registry. It should store monthly revenue reports with fields: month (String), amount (u128), timestamp, and proof_hash (Hash). Include functions to submit and retrieve reports. Add a simple verification system for creators. Include test module."*

- [ ] **Hour 2:** Build & test
  ```bash
  cd contracts/polkadot/revenue-registry
  cargo contract build
  cargo test
  ```

- [ ] **Hour 2.5:** Deploy to local node
  ```bash
  cargo contract upload --suri //Alice
  cargo contract instantiate --suri //Alice --constructor new --args <PARAMS>
  ```

**Output:** Deployed contract address + ABI

---

### Sprint 2.3: Integration Testing (1 hour)
- [ ] Test Stellar contract: Issue shares to 2 test addresses
- [ ] Test Stellar contract: Deposit 1000 USDC, verify dividend calculation
- [ ] Test Polkadot contract: Submit mock revenue report
- [ ] Document contract addresses in `.env` file

---

## 🎯 **DAY 3: Integration & Glue Layer** (4.5 hours)

### Sprint 3.1: Frontend → Stellar Integration (2 hours)

**Goal:** Replace mock data with real contract calls

#### Tasks:
- [ ] Create Stellar service layer (`/lib/stellar.ts`)
  ```typescript
  // Functions to implement
  - connectWallet()
  - getShareBalance(address)
  - buyShares(amount)
  - depositRevenue(amount)
  - claimDividends()
  - getUnclaimedDividends(address)
  ```

- [ ] Update Creator Dashboard to call `depositRevenue()`
- [ ] Update Investor Dashboard to call `claimDividends()`
- [ ] Add Freighter wallet integration
- [ ] Handle transaction signing & loading states

**Test:** Complete flow from connecting wallet → buying shares → claiming dividends

---

### Sprint 3.2: Frontend → Polkadot Integration (1.5 hours)

**Goal:** Fetch revenue reports from Polkadot registry

#### Tasks:
- [ ] Create Polkadot service layer (`/lib/polkadot.ts`)
  ```typescript
  // Functions to implement
  - connectWallet()
  - submitRevenueReport(month, amount, proofHash)
  - getLatestReport()
  - getAllReports()
  - verifyCreator(address)
  ```

- [ ] Update Creator Dashboard to display revenue reports from Polkadot
- [ ] Add Polkadot.js wallet integration
- [ ] Show "Verified Creator" badge if verified on Polkadot

---

### Sprint 3.3: Cross-Chain Listener (Optional - 1 hour)

**Goal:** Auto-trigger dividend distribution when Polkadot report is submitted

#### Tasks:
- [ ] Create relayer script (`/backend/relayer.ts`)
- [ ] Listen for `ReportSubmitted` events on Polkadot
- [ ] Auto-call `deposit_revenue()` on Stellar when event fires
- [ ] Run as background service

**Note:** This is optional for MVP. You can manually trigger for demo.

---

## 🎯 **DAY 4: Polish & Demo Prep** (2.5 hours)

### Sprint 4.1: UI/UX Polish (1 hour)
- [ ] Add loading skeletons for all async operations
- [ ] Improve error handling (user-friendly messages)
- [ ] Add success/error toast notifications
- [ ] Make UI responsive (mobile-friendly)
- [ ] Add animations (framer-motion optional)

### Sprint 4.2: Demo Script & Deployment (1 hour)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Create demo walkthrough script:
  1. Show Investor view (0 shares, 0 dividends)
  2. Switch to Creator view → Deposit revenue
  3. Switch to Investor → Show dividends accumulated
  4. Claim dividends → Show transaction success
  5. Show Polkadot revenue registry

- [ ] Prepare 2-minute pitch
- [ ] Record demo video (backup if live fails)

### Sprint 4.3: Documentation (0.5 hours)
- [ ] Update README with:
  - Project description
  - Architecture diagram
  - Setup instructions
  - Contract addresses
  - Demo video link

---

## 🎬 Demo Flow (The Magic Moment)

### The Pitch (30 seconds)
*"Creators are businesses with real revenue, but banks won't lend to them because they can't collateralize their audience. We let creators IPO their channels. This is the NASDAQ for creators, powered by Stellar and Polkadot."*

### The Action (90 seconds)
1. **Investor Dashboard** - "This is an investor who wants to support TechWithSaheel"
2. **Buy 50 shares** (Stellar transaction) - Show confirmation
3. **Creator Dashboard** - "End of month, creator earned $5,000 from AdSense"
4. **Deposit Revenue** (Stellar) - Money hits the dividend vault
5. **Submit Report** (Polkadot) - Proof of revenue recorded on-chain
6. **Back to Investor** - Watch dividends appear ($125 based on 50/1000 shares)
7. **Claim Dividends** - USDC arrives in investor wallet

### The Closing (15 seconds)
*"Every metric is verifiable. The revenue is on Polkadot. The money is on Stellar. This solves creator financing."*

---

## ⚡ Quick Reference Commands

### Stellar
```bash
# Build contract
soroban contract build

# Deploy
soroban contract deploy --wasm <PATH> --network futurenet

# Invoke function
soroban contract invoke --id <ID> --network futurenet -- <FUNCTION> --args <ARGS>
```

### Polkadot
```bash
# Build contract
cargo contract build

# Deploy (local)
cargo contract upload --suri //Alice
cargo contract instantiate --suri //Alice --constructor new

# Call function (via frontend or polkadot.js)
```

### Frontend
```bash
# Dev server
npm run dev

# Build
npm run build

# Deploy
vercel deploy # or netlify deploy
```

---

## 🚨 Risk Mitigation

### If You Fall Behind:
1. **Cut the Polkadot contract** - Just use Stellar for everything (still impressive)
2. **Simplify UI** - 2 pages instead of 3 (Creator + Investor only)
3. **Mock the revenue reports** - Show static data instead of Polkadot queries

### If You Get Ahead:
1. Add marketplace for secondary share trading
2. Implement the cross-chain relayer
3. Add revenue prediction ML model
4. Create creator onboarding flow with KYC

---

## 📊 Time Tracking

| Day | Sprint | Planned Hours | Actual Hours |
|-----|--------|--------------|--------------|
| 1   | Setup  | 1.5          |              |
| 1   | Frontend | 4.5        |              |
| 2   | Stellar | 3.5         |              |
| 2   | Polkadot | 2.5        |              |
| 2   | Testing | 1           |              |
| 3   | Integration | 4         |              |
| 4   | Polish | 2.5          |              |
| **TOTAL** | | **20 hours** |              |

---

## ✅ Definition of Done

### Day 1
- [ ] All frontend pages render with mock data
- [ ] Navigation works
- [ ] Both dev environments running

### Day 2
- [ ] Stellar contract deployed & tested
- [ ] Polkadot contract deployed & tested
- [ ] Can call functions via CLI

### Day 3
- [ ] Frontend connected to both contracts
- [ ] Can execute full flow: Buy → Deposit → Claim
- [ ] Transactions show in wallets

### Day 4
- [ ] Project deployed and live
- [ ] Demo script rehearsed
- [ ] README complete

---

## 🎯 Success Metrics

**Must Have (MVP):**
- ✅ Stellar dividend contract working
- ✅ Frontend shows real-time balance updates
- ✅ Can demonstrate: Invest → Revenue → Dividends flow

**Nice to Have:**
- ✅ Polkadot revenue registry integrated
- ✅ Cross-chain verification
- ✅ Beautiful UI with charts

**Wow Factor:**
- ✅ Live demo with judge's wallet
- ✅ Show transaction on block explorer
- ✅ Revenue prediction feature

---

*Last Updated: Day 0 - Planning Phase*
