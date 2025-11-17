# Cart & Wishlist Sync Fix - Complete Solution

## Problem Summary

The cart and wishlist had serious sync issues:
1. **Duplicate merge on refresh** - LocalStorage data merged repeatedly causing duplicate items
2. **Items resurrecting after checkout** - Old localStorage items reappeared on page refresh
3. **Wishlist items returning** - Removed items came back from localStorage
4. **No sync state tracking** - No way to know if merge already happened

## Root Cause

The old implementation:
- ❌ Merged localStorage with server data **on every page load**
- ❌ Never cleared localStorage after merging
- ❌ Used localStorage as fallback even for logged-in users
- ❌ No flag to track if sync already happened
- ❌ Cart not properly cleared after checkout

## Solution Implemented

### 🎯 Core Principles

1. **Guest users** → localStorage is source of truth
2. **Logged-in users** → Server is ALWAYS source of truth
3. **Merge happens ONCE** per login session
4. **localStorage cleared immediately** after merge
5. **Sync flag prevents duplicate** merges

### ✅ What Was Fixed

#### 1. Added Sync State Flags

**New localStorage flags:**
```typescript
CART_SYNCED: 'cart_synced'           // Prevents duplicate cart merges
WISHLIST_SYNCED: 'wishlist_synced'   // Prevents duplicate wishlist merges
```

**New functions in `syncUtils.ts`:**
- `isCartSynced()` - Check if cart already merged
- `isWishlistSynced()` - Check if wishlist already merged
- `markCartAsSynced()` - Mark cart as synced
- `markWishlistAsSynced()` - Mark wishlist as synced
- `resetSyncFlags()` - Reset on logout
- `clearLocalCart()` - Clear cart localStorage
- `clearLocalWishlist()` - Clear wishlist localStorage

#### 2. Backend Merge Endpoints

**New API endpoints:**
```javascript
POST /api/cart/:userId/merge
POST /api/wishlist/:userId/merge
```

These endpoints:
- Accept guest items from localStorage
- Merge with existing server data (once)
- Handle duplicates properly (sum quantities for cart, avoid duplicates for wishlist)
- Return merged result

#### 3. Completely Rewritten Cart Context

**Key changes:**
```typescript
// Before: Merged on every load
useEffect(() => {
  loadCart(); // Always merged localStorage
}, [isAuthenticated]);

// After: Merge only once with flag check
const performOneTimeMerge = async (userId: string) => {
  if (isCartSynced()) {
    console.log('⏭️  Cart already synced, skipping merge');
    return;
  }
  
  const guestCart = getGuestCart();
  if (guestCart.length === 0) {
    markCartAsSynced();
    return;
  }
  
  // Merge cart items
  await mergeCartWithServer(userId, guestCart);
  
  // CRITICAL: Clear localStorage
  clearGuestData();
  
  // Mark as synced
  markCartAsSynced();
};
```

**Flow for logged-in users:**
1. Check if cart already synced (`isCartSynced()`)
2. If not synced and guest cart exists → merge
3. Clear localStorage after merge
4. Mark as synced
5. **Never use localStorage again for this session**

#### 4. Completely Rewritten Wishlist Context

Same logic as cart:
- One-time merge on login
- Server is source of truth for logged-in users
- localStorage cleared after merge
- Sync flag prevents duplicates

#### 5. Proper Checkout Cleanup

**New function:**
```typescript
const clearCartAfterCheckout = async () => {
  // Clear local state
  dispatch({ type: 'CLEAR_CART' });
  
  // Clear localStorage
  clearLocalCart();
  
  // Clear server cart
  if (isAuthenticated && user) {
    await userAPI.clearCart(user.id);
  }
};
```

**Usage in Checkout.tsx:**
```typescript
// Before
dispatch({ type: 'CLEAR_CART' }); // Only cleared local state

// After
await clearCartAfterCheckout(); // Clears everything
```

#### 6. Logout Handling

On logout:
```typescript
useEffect(() => {
  if (!isAuthenticated && isLoaded) {
    resetSyncFlags(); // Reset sync flags
    hasPerformedInitialSync.current = false;
  }
}, [isAuthenticated, isLoaded]);
```

### 📋 Complete Flow Diagrams

#### Guest User Flow
```
1. Add items to cart
   ↓
2. Items saved to localStorage
   ↓
3. Page refresh
   ↓
4. Items loaded from localStorage
   ✅ Works perfectly
```

#### Login Flow (First Time)
```
1. Guest has items in localStorage
   ↓
2. User logs in
   ↓
3. Check isCartSynced() → false
   ↓
4. Get guest cart from localStorage
   ↓
5. Get server cart from backend
   ↓
6. Merge (add quantities, avoid duplicates)
   ↓
7. Save merged cart to server
   ↓
8. clearGuestData() → Clear localStorage
   ↓
9. markCartAsSynced() → Set flag
   ↓
10. Load merged cart from server
    ✅ Cart synced once
```

#### Page Refresh (While Logged In)
```
1. User refreshes page
   ↓
2. Check isCartSynced() → true
   ↓
3. Skip merge logic
   ↓
4. Load cart ONLY from server
   ↓
5. localStorage is ignored
   ✅ No duplicate merge
```

#### Checkout Flow
```
1. User completes payment
   ↓
2. Payment verified
   ↓
3. Call clearCartAfterCheckout()
   ├→ Clear React state
   ├→ Clear localStorage
   └→ Clear server cart
   ↓
4. Navigate to success page
   ↓
5. User refreshes page
   ↓
6. Load from server → empty cart
   ✅ No items resurrect
```

#### Logout Flow
```
1. User logs out
   ↓
2. resetSyncFlags()
   ├→ Remove CART_SYNCED flag
   └→ Remove WISHLIST_SYNCED flag
   ↓
3. Reset hasPerformedInitialSync
   ↓
4. Next login will merge again
   ✅ Clean state for next user
```

### 🔒 Guarantees

#### ✅ No Duplicate Merges
- Sync flag checked before merge
- Flag set after successful merge
- Flag prevents repeated merges on refresh

#### ✅ No Item Resurrection
- localStorage cleared after merge
- Checkout clears both server and localStorage
- Logged-in users never read from localStorage

#### ✅ Proper Guest Experience
- Guest users continue using localStorage
- No server calls for guests
- Smooth transition to server on login

#### ✅ Proper Logged-In Experience
- Server is single source of truth
- Fast loads (no merge checks after first time)
- Changes persist across devices (server-backed)

### 📊 Before vs After

#### Before
```typescript
// On every load for logged-in users:
1. Load from server
2. Load from localStorage  ❌
3. Merge them  ❌
4. Duplicates created  ❌
5. Old items return  ❌
```

#### After
```typescript
// First load after login:
1. Check sync flag
2. If not synced → merge once
3. Clear localStorage
4. Mark as synced

// Subsequent loads:
1. Check sync flag → already synced
2. Load ONLY from server
3. localStorage ignored
✅ Clean, correct data
```

### 🧪 Test Scenarios

#### Test 1: No Duplicate Merges
```
1. Add gold necklace to cart (guest)
2. Login (necklace merges to server)
3. Refresh page
4. ✅ Necklace appears once (not twice)
```

#### Test 2: Checkout Clears Everything
```
1. Add items to cart
2. Complete checkout
3. Refresh page
4. ✅ Cart is empty (items don't return)
```

#### Test 3: Wishlist Clear Persists
```
1. Add items to wishlist
2. Remove all items
3. Refresh page
4. ✅ Wishlist stays empty
```

#### Test 4: Guest Users Work Normally
```
1. Add items to cart (not logged in)
2. Refresh page
3. ✅ Items still in cart (localStorage)
```

#### Test 5: Multiple Logins
```
1. Login as User A
2. Add items
3. Logout
4. Login as User B
5. ✅ See User B's cart (not User A's)
```

### 🛠️ Files Modified

#### Frontend
1. **`src/utils/syncUtils.ts`**
   - Added sync flag functions
   - Added clear functions
   - Improved documentation

2. **`src/context/CartContext.tsx`** (Complete rewrite)
   - One-time merge logic
   - Sync flag checking
   - Server-only for logged-in users
   - Proper checkout cleanup

3. **`src/context/WishlistContext.tsx`** (Complete rewrite)
   - Same improvements as cart
   - Duplicate prevention
   - Server-only for logged-in users

4. **`src/pages/Checkout.tsx`**
   - Use `clearCartAfterCheckout()` instead of dispatch
   - Clears server + localStorage

5. **`src/utils/api.ts`**
   - Added `mergeCart()` endpoint
   - Added `mergeWishlist()` endpoint

#### Backend
1. **`backend/routes/cartRoutes.js`**
   - Added `POST /:userId/merge` endpoint
   - Merges guest cart with server cart
   - Handles quantity summation

2. **`backend/routes/wishlistRoutes.js`**
   - Added `POST /:userId/merge` endpoint
   - Merges guest wishlist with server wishlist
   - Avoids duplicates

### 📝 API Documentation

#### Merge Cart
```http
POST /api/cart/:userId/merge
Content-Type: application/json

{
  "guestItems": [
    {
      "_id": "product123",
      "name": "Gold Necklace",
      "price": 25000,
      "quantity": 1,
      "image": "...",
      "category": "Necklaces"
    }
  ]
}

Response:
{
  "success": true,
  "cart": { /* merged cart */ },
  "message": "Cart merged successfully"
}
```

#### Merge Wishlist
```http
POST /api/wishlist/:userId/merge
Content-Type: application/json

{
  "guestItems": [
    {
      "_id": "product456",
      "name": "Diamond Ring",
      "price": 50000,
      "image": "...",
      "category": "Rings"
    }
  ]
}

Response:
{
  "success": true,
  "wishlist": { /* merged wishlist */ },
  "message": "Wishlist merged successfully"
}
```

### 🔐 Security Considerations

- ✅ User ID verified on server
- ✅ Merge only happens with authentication
- ✅ No injection of arbitrary data
- ✅ Proper data validation

### 🚀 Performance Improvements

- ✅ Merge happens only once (not on every refresh)
- ✅ Fewer database operations
- ✅ Faster page loads after initial sync
- ✅ No unnecessary localStorage reads for logged-in users

### 🐛 Debug Logging

Console logs help track sync process:

```
// On first login with guest cart:
🔄 Merging 2 guest cart items...
✅ Cart merged and localStorage cleared

// On subsequent refreshes:
⏭️  Cart already synced, skipping merge
✅ Loaded 2 items from server

// Guest user:
👤 Guest user, loading cart from localStorage...
✅ Loaded 2 guest items
💾 Cart saved to localStorage (guest)

// Logout:
👤 User logged out, resetting sync flags
```

### ✅ Success Criteria Met

- [x] Merge happens exactly once per login
- [x] localStorage cleared after merge
- [x] No duplicate items on refresh
- [x] Checkout clears everything
- [x] Wishlist clear persists
- [x] Guest users unaffected
- [x] Server is source of truth for logged-in users
- [x] Sync flags prevent re-merging
- [x] Proper logout handling
- [x] Backend supports merge flow

---

## Migration Guide

### For Users
No action needed. The fix is automatic.

### For Developers

**Testing checklist:**
1. Clear browser localStorage
2. Add items as guest
3. Login
4. Verify items merged
5. Refresh page
6. Verify no duplicates
7. Complete checkout
8. Refresh page
9. Verify cart empty
10. Logout and login again
11. Verify clean state

**Rollback:**
If issues occur, restore backups:
```bash
mv src/context/CartContext.backup.tsx src/context/CartContext.tsx
mv src/context/WishlistContext.backup.tsx src/context/WishlistContext.tsx
```

---

**Status:** ✅ FIXED - All sync issues resolved
**Date:** November 17, 2025
**Version:** 2.0 (Complete Rewrite)
**Tested:** ✅ All scenarios pass
