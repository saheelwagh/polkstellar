# PolkStellar - User Guide

## Overview

PolkStellar is a decentralized freelance escrow platform built on Stellar blockchain. It enables secure project payments with milestone-based fund release.

**Live Network:** Stellar Testnet  
**Wallet Required:** Freighter (Stellar)  
**Contract ID:** `CCKCGYGFMTYRAHHNOVMBMGKAP6S4XSWL3TEJJH2D4JCZWBJRIZBUXZII`

---

## Getting Started

### 1. Install Freighter Wallet

1. Visit [freighter.app](https://freighter.app)
2. Install the browser extension
3. Create or import a Stellar account
4. Switch to **Testnet** in Freighter settings

### 2. Get Test Funds

1. Visit [Stellar Testnet Faucet](https://laboratory.stellar.org/#account-creator)
2. Enter your Stellar address from Freighter
3. Click "Create Account" to receive 10,000 test XLM

### 3. Connect to PolkStellar

1. Open the PolkStellar application
2. Click "Connect Wallet" in the top right
3. Approve the connection in Freighter
4. You're ready to go!

---

## For Clients

### Creating a Project

1. Go to **Client Dashboard**
2. Click **"New Project"** button
3. Fill in:
   - **Project Title:** Name of your project
   - **Freelancer Address:** Stellar wallet address of the freelancer
   - **Total Budget:** Total stroops to allocate (1 XLM = 10,000,000 stroops)
   - **Milestones:** Number of milestones and amount per milestone
4. Click **"Create Project"**
5. Approve the transaction in Freighter
6. Project appears in "On-Chain Projects" section

### Funding a Milestone

1. Find your project in "On-Chain Projects"
2. Look for milestones with **"Pending"** status
3. Click **"💰 Fund This Milestone"**
4. Approve the transaction in Freighter
5. Status changes to **"Funded"** (funds are now in escrow)

### Releasing Funds

1. Once freelancer submits work, milestone shows **"Submitted"** status
2. Review the work
3. Click **"✅ Approve & Release Funds"**
4. Approve the transaction in Freighter
5. Funds are transferred to freelancer's wallet
6. Status changes to **"Released"**

### Dashboard Stats

- **Total Budget:** Sum of all milestone amounts across projects
- **In Escrow:** Funds currently held in smart contract
- **Active Projects:** Projects with unreleased milestones
- **Total Released:** Total funds paid to freelancers

---

## For Freelancers

### Viewing Projects

1. Go to **Freelancer Dashboard**
2. All projects assigned to your wallet appear in "On-Chain Projects"
3. Each project shows:
   - Client address
   - Total budget
   - Milestone breakdown
   - Your earnings and pending payments

### Submitting Work

1. Find a milestone with **"Funded"** status
2. Click **"📤 Submit Work (Mark as Done)"**
3. Approve the transaction in Freighter
4. Status changes to **"Submitted"**
5. Wait for client approval

### Receiving Payment

1. Once client approves, status changes to **"Released"**
2. Funds are automatically transferred to your wallet
3. Check "Total Earned" stat to see all payments received

### Dashboard Stats

- **Total Earned:** All funds you've received from completed milestones
- **Pending Release:** Funds awaiting client approval
- **Active Projects:** Projects you're currently working on
- **Awaiting Approval:** Milestones you've submitted waiting for client review

---

## Milestone Lifecycle

```
Pending → Funded → Submitted → Released
  ↓         ↓          ↓          ↓
Created  Client    Freelancer  Payment
         funds     submits     sent
```

### Status Meanings

| Status | Meaning | Action |
|--------|---------|--------|
| **Pending** | Milestone created, awaiting funding | Client funds |
| **Funded** | Funds in escrow, ready for work | Freelancer works |
| **Submitted** | Work submitted, awaiting approval | Client reviews |
| **Released** | Approved, funds sent to freelancer | Complete ✓ |

---

## Transaction Details

### What Happens When You Create a Project?

1. Your wallet signs the transaction
2. Smart contract creates project on-chain
3. Project ID is assigned
4. Milestones are initialized with "Pending" status

### What Happens When You Fund a Milestone?

1. Your wallet signs the transaction
2. Smart contract transfers stroops to escrow
3. Milestone status changes to "Funded"
4. Funds are held securely in contract

### What Happens When You Release Funds?

1. Your wallet signs the transaction
2. Smart contract transfers stroops from escrow to freelancer
3. Milestone status changes to "Released"
4. Funds appear in freelancer's Stellar wallet

---

## Troubleshooting

### "Wallet not connected"

- **Solution:** Click "Connect Wallet" and approve in Freighter
- Make sure you're on Testnet in Freighter settings

### Transaction fails with "Already Funded"

- **Solution:** Milestone is already funded. Check status in project card
- Each milestone can only be funded once

### "Project not found"

- **Solution:** Refresh the page or click "Refresh" button
- Make sure you're looking at the correct project

### Funds not appearing in wallet

- **Solution:** Funds are released to freelancer's wallet address
- Check that the freelancer address matches your wallet
- Funds may take a few seconds to appear

### Can't submit work

- **Solution:** Milestone must be "Funded" status first
- Client must fund the milestone before you can submit

---

## Best Practices

### For Clients

1. **Verify freelancer address** before creating project
2. **Start with small amounts** to test the system
3. **Review work carefully** before releasing funds
4. **Keep clear communication** with freelancer about deliverables
5. **Fund milestones promptly** to keep project moving

### For Freelancers

1. **Confirm project details** before starting work
2. **Submit work promptly** when milestone is funded
3. **Provide clear deliverables** with submission
4. **Communicate delays** to client immediately
5. **Keep wallet funded** with small XLM amount for transaction fees

---

## Security Notes

- All transactions require wallet signature - **never share your private key**
- Funds in escrow are secured by smart contract - **no middleman**
- Transactions are immutable on blockchain - **cannot be reversed**
- Use Testnet for testing before mainnet deployment

---

## Support

For issues or questions:

1. Check this guide first
2. Review transaction status in Freighter
3. Verify wallet is on Testnet
4. Check contract ID matches: `CCKCGYGFMTYRAHHNOVMBMGKAP6S4XSWL3TEJJH2D4JCZWBJRIZBUXZII`

---

## Technical Details

- **Network:** Stellar Testnet
- **RPC:** `https://soroban-testnet.stellar.org`
- **Contract Language:** Rust (Soroban)
- **Frontend:** React + Vite + TailwindCSS
- **Wallet:** Freighter

---

**Last Updated:** December 5, 2025  
**Version:** 1.0 (Sprint 4)
