# SubWallet Connection Issue - Detailed Report

**Date:** December 5, 2025  
**Issue:** SubWallet not detected even though extension was installed  
**Status:** ✅ RESOLVED  
**Severity:** Critical (blocking feature)  

---

## Executive Summary

During Sprint 5, we encountered a critical issue where SubWallet was not being detected by the typeink provider, even though the extension was installed in the browser. After investigation, we identified **two root causes** and implemented fixes that resolved the issue completely.

---

## Problem Statement

### Symptoms
- SubWallet button showed "SubWallet Not Installed" message
- Error: "SubWallet not detected. Please install SubWallet extension."
- Button was disabled and non-functional
- Issue persisted even after browser restart

### Impact
- Users could not connect to Polkadot
- Polkadot wallet integration was non-functional
- Feature was completely blocked

---

## Root Causes Identified

### Root Cause #1: TypinkProvider Scope (CRITICAL)

**Problem:**
```typescript
// WRONG - TypinkProvider only wraps /app routes
<Route path="/app" element={
  <TypinkProvider>
    <AppLayout />
  </TypinkProvider>
}>
```

**Issue:**
- TypinkProvider was only wrapping the `/app` routes
- The `useTypink()` hook was being called in `AppLayout` (which is inside the provider)
- However, the provider initialization was delayed until the route was accessed
- Wallet detection happens during provider initialization
- If wallets weren't detected during initialization, they wouldn't be available later

**Why It Failed:**
- Typeink needs to be at the top level of the app to properly initialize wallet detection
- According to Dedot documentation: "TypinkProvider is the main provider component that wraps your application"
- Nested providers can miss wallet initialization timing

**Fix Applied:**
```typescript
// CORRECT - TypinkProvider wraps entire app
<BrowserRouter>
  <WalletProvider>
    <TypinkProvider>
      <Routes>
        {/* All routes have access to Typink */}
      </Routes>
    </TypinkProvider>
  </WalletProvider>
</BrowserRouter>
```

**Result:** ✅ Wallet detection now works properly

---

### Root Cause #2: RPC Endpoint Instability (SECONDARY)

**Problem:**
```typescript
// WRONG - Unreliable endpoint
rpcUrl: 'wss://paseo-rpc.dwellir.com'
```

**Symptoms:**
```
WebSocket connection to 'wss://paseo-rpc.dwellir.com/' failed
DedotError: Cannot reconnect to network after 5 retry attempts
```

**Issue:**
- Dwellir endpoint was experiencing connection issues
- Multiple WebSocket connection failures
- After 5 retry attempts, the connection would fail completely
- This prevented the provider from fully initializing

**Fix Applied:**
```typescript
// CORRECT - Stable endpoint
rpcUrl: 'wss://testnet-passet-hub.polkadot.io'
```

**Result:** ✅ Stable RPC connection established

---

## Investigation Process

### Step 1: Initial Diagnosis
- Checked browser console for errors
- Found WebSocket connection failures
- Noticed TypinkProvider was only on /app routes

### Step 2: Testing Isolation
- Created standalone test page at `/polkadot-test`
- Test page worked correctly (button visible)
- Main app page didn't work
- Conclusion: Issue was with provider scope, not component logic

### Step 3: Root Cause Analysis
- Compared test page (working) with main app (not working)
- Test page: No providers (standalone)
- Main app: Providers only on /app route
- Identified: TypinkProvider scope issue

### Step 4: Secondary Issue Discovery
- While fixing provider scope, noticed RPC errors
- Changed RPC endpoint from Dwellir to testnet-passet-hub
- Resolved connection stability issues

### Step 5: Verification
- Moved TypinkProvider to top level
- Changed RPC endpoint
- SubWallet now detected correctly
- Connection successful

---

## Technical Details

### Provider Hierarchy (Before - WRONG)

```
BrowserRouter
  └── Routes
      ├── LandingPage (no Typink)
      ├── PolkadotTestPage (no Typink)
      └── /app route
          └── TypinkProvider (only here)
              └── AppLayout
                  └── PolkadotWallet (useTypink hook)
```

**Problem:** Typink context not available on all pages

### Provider Hierarchy (After - CORRECT)

```
BrowserRouter
  └── WalletProvider (Stellar)
      └── TypinkProvider (Polkadot - wraps entire app)
          └── Routes
              ├── LandingPage (has Typink)
              ├── PolkadotTestPage (has Typink)
              └── /app route
                  └── AppLayout (has Typink)
                      └── PolkadotWallet (useTypink hook)
```

**Solution:** Typink context available globally

---

## Wallet Detection Flow

### How Wallet Detection Works

```
1. TypinkProvider initializes
   ↓
2. Scans for installed wallet extensions
   ↓
3. Checks for:
   - SubWallet (id: 'subwallet')
   - Talisman (id: 'talisman')
   - PolkadotJS (id: 'polkadotjs')
   ↓
4. Populates wallets array
   ↓
5. useTypink() hook returns wallets
   ↓
6. Component renders based on wallet availability
```

### Why Scope Matters

- **Wallet detection happens during provider initialization**
- **Provider must be at top level to initialize before any routes**
- **If provider is nested, initialization might be delayed or missed**
- **Hooks must be called within provider scope**

---

## Debugging Checklist

For future wallet detection issues, use this checklist:

### 1. Verify Provider Placement
```typescript
// Check App.tsx - TypinkProvider should wrap entire app
<BrowserRouter>
  <TypinkProvider>  // ← Should be here, not nested
    <Routes>
      {/* routes */}
    </Routes>
  </TypinkProvider>
</BrowserRouter>
```

### 2. Check Browser Console
```javascript
// Add logging to see available wallets
console.log('Available wallets:', wallets);
console.log('Wallet details:', wallets.map(w => ({
  id: w.id,
  name: w.name,
  installed: w.installed
})));
```

### 3. Verify RPC Connection
```javascript
// Check for WebSocket errors
// Look for: "WebSocket connection to '...' failed"
// If found, try different RPC endpoint
```

### 4. Test Wallet Extension
- Open browser DevTools (F12)
- Go to Extensions tab
- Verify SubWallet is enabled
- Check for any errors in extension console

### 5. Check Wallet ID Matching
```typescript
// Wallet detection is case-sensitive
// Try multiple ID formats:
const wallet = wallets.find(w => 
  w.id === 'subwallet' ||           // lowercase
  w.id === 'SubWallet' ||           // capitalized
  w.name?.toLowerCase().includes('subwallet')  // name matching
);
```

---

## Prevention Strategies

### 1. Provider Scope Rule
**Rule:** Always place context providers at the top level of your app, not nested in routes.

```typescript
// ✅ GOOD
<BrowserRouter>
  <Provider>
    <Routes>
      {/* routes */}
    </Routes>
  </Provider>
</BrowserRouter>

// ❌ BAD
<BrowserRouter>
  <Routes>
    <Route path="/app" element={
      <Provider>
        {/* component */}
      </Provider>
    } />
  </Routes>
</BrowserRouter>
```

### 2. RPC Endpoint Validation
**Rule:** Test RPC endpoints before deployment.

```typescript
// Test endpoint connectivity
async function testRPC(url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', method: 'system_health', params: [], id: 1 })
    });
    return response.ok;
  } catch (err) {
    return false;
  }
}
```

### 3. Wallet Detection Logging
**Rule:** Always log wallet detection for debugging.

```typescript
useEffect(() => {
  if (wallets.length > 0) {
    console.log('Wallets detected:', wallets.map(w => ({
      id: w.id,
      name: w.name,
      installed: w.installed
    })));
  }
}, [wallets]);
```

### 4. Error Handling
**Rule:** Provide specific error messages for wallet issues.

```typescript
if (!wallet) {
  setError('SubWallet not detected. Please install the extension.');
  return;
}

if (!wallet.installed) {
  setError('SubWallet is installed but not enabled. Check your extensions.');
  return;
}
```

---

## Files Changed

**`frontend/src/App.tsx`**
- Moved TypinkProvider outside Routes
- Changed RPC endpoint to testnet-passet-hub.polkadot.io

**`frontend/src/components/PolkadotWallet.tsx`**
- Added wallet detection logging
- Improved wallet ID matching (case-insensitive)
- Added error state management

---

## Testing Results

| Test Case | Before | After |
|-----------|--------|-------|
| SubWallet detected | ❌ No | ✅ Yes |
| Connection successful | ❌ No | ✅ Yes |
| Address displays | ❌ No | ✅ Yes |
| Disconnect works | ❌ No | ✅ Yes |
| RPC stable | ❌ No | ✅ Yes |
| Console errors | ⚠️ Many | ✅ None |

---

## Lessons Learned

### 1. Provider Scope is Critical
- Providers must wrap the entire app
- Nested providers can cause initialization timing issues
- Always check provider hierarchy in documentation

### 2. RPC Endpoint Stability Matters
- Test endpoints before using them
- Have fallback endpoints ready
- Monitor connection errors in console

### 3. Wallet Detection Needs Logging
- Add console logging for wallet detection
- Makes debugging much easier
- Helps identify wallet ID mismatches

### 4. Test in Isolation
- Create standalone test pages for debugging
- Helps identify scope and context issues
- Easier to troubleshoot than full app

---

## Recommendations for Future

### Short Term
- [x] Document provider hierarchy
- [x] Add wallet detection logging
- [x] Test RPC endpoints

### Medium Term
- [ ] Create wallet detection utility function
- [ ] Add wallet detection tests
- [ ] Document wallet ID formats for each provider

### Long Term
- [ ] Create wallet provider abstraction layer
- [ ] Support multiple RPC endpoints with fallback
- [ ] Implement wallet detection health checks

---

## References

- **Dedot Documentation:** https://docs.dedot.dev/typink/getting-started/migrate-from-existing-dapp
- **Typeink GitHub:** https://github.com/dedotdev/typink
- **Paseo Testnet:** https://testnet-passet-hub.polkadot.io

---

## Conclusion

The SubWallet connection issue was caused by **incorrect provider placement** (primary) and **unstable RPC endpoint** (secondary). By moving TypinkProvider to the top level and changing the RPC endpoint, we resolved the issue completely.

This report should serve as a reference for future wallet integration issues and help prevent similar problems in future sprints.

---

**Report Status:** ✅ Complete  
**Issue Status:** ✅ Resolved  
**Recommendation:** Archive this report for future reference
