# Wallet Integration Guide - PolkStellar

**Date:** December 5, 2025  
**Status:** Planning Phase

---

## Quick Answer: SubWallet vs Polkadot.js

**Recommendation: Use Polkadot.js Extension**

SubWallet is excellent for general Polkadot use, but for PolkStellar development:
- Polkadot.js is the standard in the ecosystem
- Better TypeScript support and documentation
- More stable for dApp integration
- Official Polkadot team maintains it

---

## Current Wallet Setup

### Stellar (Already Configured ✓)
- **Wallet:** Freighter
- **Status:** Installed and working
- **Purpose:** Sign transactions, manage USDC
- **Network:** Stellar Testnet (Futurenet)

### Polkadot (To Be Configured)
- **Wallet:** Polkadot.js Extension (recommended)
- **Status:** Needs installation
- **Purpose:** Sign transactions, manage DOT
- **Network:** Polkadot Testnet (Rococo or local)

---

## Wallet Comparison Table

| Feature | SubWallet | Polkadot.js | Freighter |
|---------|-----------|------------|-----------|
| **Polkadot Support** | ✅ Excellent | ✅ Excellent | ❌ No |
| **Stellar Support** | ❌ No | ❌ No | ✅ Excellent |
| **Multi-chain** | ✅ Yes | ⚠️ Limited | ⚠️ Limited |
| **Ease of Use** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Developer Support** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Documentation** | Good | Excellent | Good |
| **Community** | Growing | Established | Established |
| **dApp Integration** | Good | Best | Best |
| **Type Safety** | Good | Excellent | Good |
| **Maintenance** | Active | Very Active | Active |

---

## Why Polkadot.js for PolkStellar

### 1. Standard in Ecosystem
- Most Polkadot dApps use Polkadot.js
- Better compatibility with contract tools
- More examples and tutorials available

### 2. Developer Experience
- Excellent TypeScript support
- Comprehensive API documentation
- Active community support
- Regular updates and maintenance

### 3. Contract Integration
- Better ABI handling
- Type-safe contract calls
- Gas estimation tools
- Transaction monitoring

### 4. Dual-Wallet Architecture
- Can run alongside Freighter
- No conflicts or compatibility issues
- Users can have both installed
- Seamless switching between chains

### 5. Production Readiness
- Battle-tested in production
- Security audits available
- Long track record
- Enterprise support available

---

## Installation Instructions

### For Users

#### Step 1: Install Freighter (Stellar)
1. Visit: https://www.freighter.app/
2. Click "Install" → Choose your browser
3. Create or import Stellar account
4. Save your seed phrase securely

#### Step 2: Install Polkadot.js (Polkadot)
1. Visit: https://polkadot.js.org/extension/
2. Click "Install" → Choose your browser
3. Create or import Polkadot account
4. Grant permissions to PolkStellar

#### Step 3: Grant Permissions
1. Visit PolkStellar app
2. Click "Connect Freighter" → Approve in wallet
3. Click "Connect Polkadot" → Approve in wallet
4. Both wallets now connected

### For Developers

#### Install Dependencies
```bash
cd frontend
pnpm install @polkadot/extension-dapp @polkadot/api @polkadot/api-contract
```

#### Update Environment Variables
```bash
# .env or .env.local
VITE_POLKADOT_RPC_URL=ws://127.0.0.1:9944
VITE_POLKADOT_CONTRACT_ADDRESS=<deployed-address>
VITE_STELLAR_CONTRACT_ID=<deployed-id>
```

#### Basic Integration Code
```typescript
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

// Enable extension
const extensions = await web3Enable('PolkStellar');
if (extensions.length === 0) {
  throw new Error('Polkadot.js extension not installed');
}

// Get accounts
const accounts = await web3Accounts();
const account = accounts[0];

console.log('Connected account:', account.address);
```

---

## Dual-Wallet User Flow

### User Perspective
```
1. User visits PolkStellar
2. Sees two wallet options:
   - "Connect Freighter" (for Stellar)
   - "Connect Polkadot" (for Polkadot)
3. Clicks both to connect
4. Can now create projects and manage funds across both chains
```

### Technical Flow
```
Frontend
├── WalletContext (Freighter)
│   ├── connectFreighterWallet()
│   ├── signStellarTransaction()
│   └── getStellarBalance()
│
├── PolkadotWalletContext (Polkadot.js)
│   ├── connectPolkadotWallet()
│   ├── signPolkadotTransaction()
│   └── getPolkadotBalance()
│
└── App
    ├── ClientDashboard (uses both)
    ├── FreelancerDashboard (uses both)
    └── ProjectDetails (uses both)
```

---

## Transaction Flow Example

### Creating a Project (Dual-Chain)
```
User clicks "Create Project"
    ↓
Frontend validates input
    ↓
Call Stellar contract (via Freighter)
    ├─ create_project()
    ├─ Freighter signs transaction
    └─ Returns projectId
    ↓
Call Polkadot contract (via Polkadot.js)
    ├─ registerProject()
    ├─ Polkadot.js signs transaction
    └─ Returns confirmation
    ↓
UI updates with project details
    ├─ Stellar: Project created, ready to fund
    └─ Polkadot: Metadata registered
```

---

## Common Issues & Solutions

### Issue: "Polkadot.js extension not found"
**Solution:**
1. Install Polkadot.js extension
2. Refresh the page
3. Check browser console for errors

### Issue: "Account not found"
**Solution:**
1. Create account in Polkadot.js extension
2. Grant permissions to PolkStellar
3. Refresh page

### Issue: "Transaction failed"
**Solution:**
1. Check account has sufficient balance
2. Verify RPC endpoint is accessible
3. Check contract address is correct
4. Review transaction parameters

### Issue: "Both wallets connected but transactions fail"
**Solution:**
1. Verify both networks are accessible
2. Check gas limits are sufficient
3. Ensure accounts have funds on both chains
4. Review contract ABIs are correct

---

## Network Configuration

### Stellar Testnet (Futurenet)
- **RPC:** https://rpc-futurenet.stellar.org
- **Network ID:** Futurenet
- **Faucet:** https://laboratory.stellar.org/#account-creator
- **Explorer:** https://stellar.expert/explorer/testnet

### Polkadot Testnet (Rococo)
- **RPC:** wss://rococo-rpc.polkadot.io
- **Network ID:** Rococo
- **Faucet:** https://faucet.polkadot.io/
- **Explorer:** https://rococo.subscan.io/

### Local Development
- **Polkadot Local:** ws://127.0.0.1:9944
- **Start Local Node:** `polkadot --dev`

---

## Security Best Practices

### For Users
1. **Never share seed phrases** - Keep them secure
2. **Verify addresses** - Always check transaction details
3. **Use official wallets** - Download from official sources only
4. **Enable 2FA** - If wallet supports it
5. **Test with small amounts** - Before large transactions

### For Developers
1. **Never hardcode private keys** - Use environment variables
2. **Validate all inputs** - Before sending transactions
3. **Implement rate limiting** - Prevent spam
4. **Use HTTPS only** - In production
5. **Audit contracts** - Before mainnet deployment

---

## Mainnet Preparation

### Before Mainnet Launch
- [ ] Test with Polkadot.js on testnet
- [ ] Verify all transaction types work
- [ ] Test error handling
- [ ] Load test with multiple users
- [ ] Security audit of wallet integration
- [ ] Update documentation for mainnet

### Mainnet Configuration
```bash
# .env.production
VITE_POLKADOT_RPC_URL=wss://rpc.polkadot.io
VITE_POLKADOT_CONTRACT_ADDRESS=<mainnet-address>
VITE_STELLAR_NETWORK=public
VITE_STELLAR_CONTRACT_ID=<mainnet-id>
```

---

## Support Resources

### Polkadot.js
- **Docs:** https://polkadot.js.org/docs/
- **Extension:** https://polkadot.js.org/extension/
- **GitHub:** https://github.com/polkadot-js/extension
- **Discord:** https://discord.gg/polkadot

### Freighter
- **Docs:** https://developers.stellar.org/docs/tools/freighter-api
- **GitHub:** https://github.com/stellar/freighter
- **Support:** https://www.freighter.app/support

### PolkStellar
- **GitHub:** [Your repo]
- **Issues:** [Your issues page]
- **Documentation:** See SPRINT_5_PLAN.md

---

## Next Steps

1. **Install Polkadot.js** - Users should install before Sprint 5
2. **Test Wallet Connection** - Verify both wallets work
3. **Implement Polkadot Context** - Create PolkadotWalletContext
4. **Update UI** - Add wallet connection buttons
5. **Test Dual-Chain Flow** - Verify cross-chain operations

---

**Last Updated:** December 5, 2025  
**Next Review:** Before Sprint 5 implementation
