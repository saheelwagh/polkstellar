# Dual-Chain Quick Reference

**Date:** December 5, 2025

---

## One-Page Summary

### The Two Blockchains

**STELLAR (Financial)**
- Handles money
- Escrow contract
- Fund transfers
- Balances

**POLKADOT (Metadata)**
- Handles proof
- Project registry
- Deliverables
- Approvals

---

## The Four Main Operations

### 1. CREATE PROJECT
```
User → Frontend → Stellar (create) → Polkadot (register) → ✅ Done
```
Both chains record project creation

### 2. FUND MILESTONE
```
User → Frontend → Stellar (fund) → ✅ Done
```
Only Stellar involved (financial operation)

### 3. SUBMIT WORK
```
User → Frontend → Stellar (submit) → Polkadot (submit) → ✅ Done
```
Both chains record work submission

### 4. RELEASE FUNDS
```
User → Frontend → Polkadot (approve) → Stellar (release) → ✅ Done
```
Polkadot FIRST (approval proof), then Stellar (funds)

---

## Key Principle: Order Matters

```
RELEASE FUNDS MUST BE:
  1. Polkadot first (approval recorded)
  2. Stellar second (funds transferred)

WHY?
  - Approval proof exists before funds move
  - If Stellar fails, Polkadot already has record
  - No double-spending possible
  - Audit trail immutable
```

---

## Error Scenarios

### Scenario A: Polkadot Fails
```
Polkadot fails → Stop → Don't call Stellar
Result: Safe, retry later
```

### Scenario B: Stellar Fails (after Polkadot succeeds)
```
Polkadot succeeds → Stellar fails → Retry Stellar
Result: Consistent, recoverable
```

### Scenario C: Both Succeed
```
Polkadot succeeds → Stellar succeeds → ✅ Done
Result: Synchronized
```

---

## Data Consistency

### What Each Chain Stores

**STELLAR**
- Project creation
- Milestone amounts
- Fund transfers
- Escrow balances
- Account balances

**POLKADOT**
- Project metadata
- Deliverable hashes
- Submission timestamps
- Approval records
- Immutable audit trail

### How Frontend Merges Data

```
Query Stellar → Get financial data
Query Polkadot → Get metadata
Merge results → Show unified view
```

---

## Transaction Timeline

### Releasing $500 Milestone

```
T+0s   User clicks "Release"
T+1s   Polkadot.js popup
T+2s   Polkadot tx submitted
T+12s  Polkadot confirmed ✓
T+13s  Freighter popup
T+14s  Stellar tx submitted
T+19s  Stellar confirmed ✓
T+20s  UI shows success

Total: ~20 seconds
```

---

## Security

### Double-Spending Prevention
```
Stellar contract checks: "Is milestone Submitted?"
First release: YES → Transfer
Second release: NO → Already Released
✓ PREVENTED
```

### Approval Disputes Prevention
```
Polkadot immutable record:
  - Approved at timestamp
  - By address
  - In block
✓ CANNOT BE DISPUTED
```

### Wallet Security
```
Private keys: Never leave wallet
Signing: Local only
Frontend: Never sees keys
✓ SAFE
```

---

## Wallet Setup

### Freighter (Stellar)
- Already installed ✓
- Manages USDC
- Signs Stellar transactions

### Polkadot.js (Polkadot)
- Install from Chrome Web Store
- Manages DOT
- Signs Polkadot transactions

### Both Together
- Run simultaneously
- No conflicts
- User can switch between them

---

## State Machine

### Milestone Lifecycle

```
STELLAR:
Pending → Funded → Submitted → Released

POLKADOT:
Pending → Submitted → Approved

SYNCHRONIZED:
Stellar: Released
Polkadot: Approved
Result: ✅ COMPLETED
```

---

## Reconciliation Example

### Frontend Query

```
Stellar says:
  - Status: Released
  - Amount: $500
  - Escrow: $1500

Polkadot says:
  - Status: Approved
  - Deliverable: QmAbc123...
  - Approved at: Dec 5, 6:35 PM

Frontend shows:
  ✅ Milestone Released
  Amount: $500
  Deliverable: QmAbc123...
  Approved: Dec 5, 6:35 PM
  Released: Dec 5, 6:35 PM
```

---

## Why Dual-Chain?

### Single-Chain Problems
- No immutable proof of work
- No dispute evidence
- Harder to prove approval
- Limited metadata storage

### Dual-Chain Solutions
- Immutable audit trail
- Proof of work submission
- Proof of approval
- Scalable metadata
- Better dispute resolution

---

## Common Questions

**Q: What if Polkadot is down?**
A: Can't release funds (need approval proof). Stellar operations still work.

**Q: What if Stellar is down?**
A: Can't transfer funds. Polkadot operations still work.

**Q: What if both are down?**
A: Wait for them to come back up. Retry transactions.

**Q: Can I double-spend?**
A: No. Stellar contract prevents it. Timestamps prevent replay.

**Q: Can client deny approval?**
A: No. Polkadot has immutable record with timestamp and address.

**Q: Can freelancer deny submission?**
A: No. Stellar has immutable record with deliverable hash.

**Q: How long does a release take?**
A: ~20 seconds (Polkadot ~12s + Stellar ~5s + overhead ~3s)

**Q: What if I close browser during transaction?**
A: Blockchain continues. Reopen browser, it detects completion.

---

## Checklist: Before Release

- [ ] Both wallets connected
- [ ] Milestone is "Submitted"
- [ ] Deliverable exists
- [ ] Funds in escrow
- [ ] Client wallet has balance for gas
- [ ] No concurrent transactions

---

## Checklist: After Release

- [ ] Polkadot shows "Approved"
- [ ] Stellar shows "Released"
- [ ] Freelancer received funds
- [ ] Escrow balance updated
- [ ] Both transaction hashes visible
- [ ] UI shows success

---

## Files to Read

1. **DUAL_CHAIN_FLOW_PART1.md** - Complete flow diagrams
2. **DUAL_CHAIN_FLOW_PART2.md** - Error handling & security
3. **SPRINT_5_PLAN.md** - Implementation roadmap
4. **WALLET_INTEGRATION_GUIDE.md** - Wallet setup guide

---

**Last Updated:** December 5, 2025
