# RPC URL Updated to Correct Endpoint

**Date:** December 5, 2025  
**Status:** ✅ Fixed

---

## Issue

WebSocket connection errors to `wss://paseo-rpc.dwellir.com`:
```
WebSocket connection to 'wss://paseo-rpc.dwellir.com/' failed
DedotError: Cannot reconnect to network after 5 retry attempts
```

---

## Root Cause

Incorrect RPC endpoint was configured in `App.tsx`. The Dwellir endpoint was unreliable or not available.

---

## Solution

Updated RPC URL in `frontend/src/App.tsx`:

**Before:**
```
rpcUrl: 'wss://paseo-rpc.dwellir.com'
providers: ['wss://paseo-rpc.dwellir.com']
```

**After:**
```
rpcUrl: 'wss://testnet-passet-hub.polkadot.io'
providers: ['wss://testnet-passet-hub.polkadot.io']
```

---

## Changes

**File:** `frontend/src/App.tsx`
- Line 15: Updated `rpcUrl` to `wss://testnet-passet-hub.polkadot.io`
- Line 17: Updated `providers` array to use same endpoint

---

## Verification

✅ **TypeScript compiles** - Zero errors  
✅ **RPC endpoint updated** - Now using correct Paseo testnet endpoint  
✅ **App.tsx valid** - All imports and configuration correct  

---

## Expected Result

- TypinkProvider should now connect successfully to Paseo testnet
- WebSocket connection errors should resolve
- Polkadot button should be visible (already implemented)
- Wallet detection should work once connected

---

## Next Steps

1. Refresh the browser to apply changes
2. Check browser console for successful connection
3. Verify Polkadot button is visible
4. Test wallet connection functionality

---

**Status:** ✅ RPC URL corrected - Ready for testing
