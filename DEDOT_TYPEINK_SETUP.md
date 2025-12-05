# Dedot + Typeink Setup Guide

**Date:** December 5, 2025  
**SDK:** Dedot + Typeink  
**Reference:** https://docs.dedot.dev/typink/getting-started/migrate-from-existing-dapp

---

## Overview

**Dedot** is a modern Polkadot client library with full TypeScript support.  
**Typeink** is a React provider that simplifies wallet integration and contract interactions.

Key benefits:
- ✅ Built-in SubWallet, Talisman, PolkadotJS support
- ✅ Type-safe contract interactions
- ✅ React hooks for wallet state management
- ✅ Automatic signer handling

---

## Step 1: Install Dependencies

```bash
cd frontend
pnpm install
```

This installs:
- `dedot@^0.3.0` - Polkadot client
- `typink@^0.4.0` - React provider

---

## Step 2: Setup TypinkProvider in main.tsx

Wrap your app with `TypinkProvider`:

```typescript
import ReactDOM from 'react-dom/client';
import App from './App';
import { TypinkProvider, subwallet, talisman, polkadotjs } from 'typink';

// Define supported networks
const SUPPORTED_NETWORKS = [
  {
    id: 'paseo',
    name: 'Paseo Testnet',
    rpcUrl: 'wss://paseo-rpc.dwellir.com',
  },
];

function Root() {
  return (
    <TypinkProvider
      appName="PolkStellar"
      supportedNetworks={SUPPORTED_NETWORKS}
      defaultNetworkId="paseo"
      wallets={[subwallet, talisman, polkadotjs]}
      cacheMetadata={true}
    >
      <App />
    </TypinkProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Root />);
```

---

## Step 3: Use useTypink() Hook in Components

Access wallet state and actions:

```typescript
import { useTypink } from 'typink';

function WalletConnect() {
  const {
    // State
    wallets,
    connectedWalletIds,
    accounts,
    connectedAccount,
    signer,
    
    // Actions
    connectWallet,
    disconnect,
    setConnectedAccount,
  } = useTypink();

  return (
    <div>
      {wallets.map((wallet) => (
        <button
          key={wallet.id}
          onClick={() => connectWallet(wallet.id)}
          disabled={!wallet.installed}
        >
          {wallet.name}
        </button>
      ))}
    </div>
  );
}
```

---

## Step 4: Contract Interactions

### Get Dedot Client

```typescript
import { useTypinkClient } from 'typink';

function MyComponent() {
  const client = useTypinkClient(); // dedot client
  const { signer, connectedAccount } = useTypink();
  
  // Use client for contract calls
}
```

### Call Contract Methods

```typescript
import { registerProject } from './lib/polkadot';

async function handleRegisterProject() {
  const { signer } = useTypink();
  const client = useTypinkClient();
  
  try {
    const txHash = await registerProject(
      projectId,
      title,
      descriptionHash,
      milestoneCount,
      signer,
      client
    );
    console.log('Transaction:', txHash);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Step 5: Create .env.local

```
VITE_POLKADOT_RPC_URL=wss://paseo-rpc.dwellir.com
VITE_POLKADOT_CONTRACT_ADDRESS=<your_deployed_contract_address>
VITE_POLKADOT_NETWORK=paseo
```

---

## Key Differences from Previous Approaches

| Feature | Old (papi) | New (dedot + typeink) |
|---------|-----------|----------------------|
| **Setup** | Complex CLI | Simple React provider |
| **Wallet** | Manual extension API | Built-in wallets |
| **State** | Manual management | useTypink() hook |
| **Signer** | Manual setup | Automatic |
| **Type Safety** | Descriptor generation | Native TypeScript |

---

## Contract Function Signatures

All contract functions now accept `signer` and `client`:

```typescript
// Write operations
registerProject(projectId, title, hash, count, signer, client)
submitDeliverable(projectId, milestoneId, hash, signer, client)
markApproved(projectId, milestoneId, signer, client)

// Read operations
getProjectMetadata(projectId, client)
getDeliverable(projectId, milestoneId, client)
getMilestoneStatus(projectId, milestoneId, client)
```

---

## Wallet Integration Flow

```
TypinkProvider (main.tsx)
    ↓
useTypink() hook (components)
    ├─ wallets: Available wallet extensions
    ├─ connectedAccount: Current account
    ├─ signer: For signing transactions
    └─ connectWallet(): Connect to wallet
    
useTypinkClient() hook (components)
    └─ dedot client: For contract calls
```

---

## Next Steps

1. ✅ Install dependencies: `pnpm install`
2. ⏳ Update `main.tsx` with TypinkProvider
3. ⏳ Update `Layout.tsx` to use useTypink() for wallet button
4. ⏳ Update components to pass signer + client to contract functions
5. ⏳ Test wallet connection
6. ⏳ Test contract interactions

---

## Resources

- **Dedot Docs:** https://docs.dedot.dev/
- **Typeink Docs:** https://docs.dedot.dev/typink/
- **SubWallet:** https://www.subwallet.app/
- **Paseo Testnet:** https://paseo.subscan.io/

---

**Last Updated:** December 5, 2025
