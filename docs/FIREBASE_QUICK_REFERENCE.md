# Firebase Account Confusion - Quick Reference Card

## 🎯 The Problem (5 min read)

When you sign in with `Gagan211105@akgec.ac.in`, the app logs in as `gagandev.001@gmail.com`

## ✅ The Fix (4 changes deployed)

| File                      | What Changed                       | Why                    |
| ------------------------- | ---------------------------------- | ---------------------- |
| `firebaseAuth.js`         | Added `signOut()` before new login | Clears cached session  |
| `firebaseAuth.js`         | Set `prompt: "select_account"`     | Forces account chooser |
| `authController.js`       | Lookup by UID first, email second  | UID is authoritative   |
| `firebase-login/page.jsx` | Added email verification           | Catches mismatches     |

## 🧪 Quick Test (2 minutes)

```
1. Log in with Account A (gagandev.001@gmail.com)
2. Click Logout
3. Click "Sign in with Google" again
4. MUST see account selection dialog
5. Select Account B (Gagan211105@akgec.ac.in)
6. Verify: Logged in as Account B ✅
   NOT Account A ❌
```

## 🔍 What to Check If Still Broken

```javascript
// Browser console:
firebase.auth().currentUser;
// Should be NULL after logout

// Network tab:
POST / api / v1 / auth / firebase - login;
// "email" should match account selected
```

## 📋 Browser Console Expected Logs

**Wrong Account Reused:**

```
❌ Clearing Firebase session returns undefined
❌ No "⚠️  Clearing" message appears
```

**Correct (After Fix):**

```
✅ "⚠️  Clearing existing Firebase session for: gagandev.001@gmail.com"
✅ "✅ Successfully signed in as: Gagan211105@akgec.ac.in"
✅ "🔐 Backend returned user: Gagan211105@akgec.ac.in"
```

## 🚨 Quick Fixes If Still Failing

### Option 1: Clear Everything

```
1. Close all sbali.in tabs
2. DevTools (F12) → Application tab
3. Click "Clear site data" (checkbox)
4. Reload page
5. Try login again
```

### Option 2: Incognito Window

```
1. New Incognito Window (Ctrl+Shift+N)
2. Visit sbali.in/auth/firebase-login
3. Try login
   (This tests clean session - if works here, issue is cache)
```

### Option 3: Manual Firebase Logout

```javascript
// Browser console:
firebase
  .auth()
  .signOut()
  .then(() => (window.location.href = "/auth/firebase-login"));
```

## 📊 Decision Tree

```
Sign in works -> Correct account?
    ├─ YES ✅ → Issue fixed! Monitor for errors.
    ├─ NO ❌ → Browser cache?
    │    ├─ YES → Clear cache (Option 1)
    │    └─ NO → Try incognito (Option 2)
    │         ├─ Works in incognito ✅ → Persistent cache issue
    │         └─ Fails in incognito ❌ → Backend or Firebase issue
```

## 📈 Monitoring After Fix

**Watch for these logs:**

| Status      | Log Message                              | Action                          |
| ----------- | ---------------------------------------- | ------------------------------- |
| ✅ Good     | `⚠️  Clearing existing Firebase session` | Normal behavior                 |
| ⚠️ Warning  | No clearing message                      | Possible stale session          |
| 🔴 Critical | `FIREBASE_UID_MISMATCH`                  | Potential hijack, contact admin |

## 🔒 Security Checks

```javascript
// Each account should have UNIQUE firebaseUid:
db.users.findOne({ email: "gagandev.001@gmail.com" }).firebaseUid;
// Should be: "uid_admin_account_123..."

db.users.findOne({ email: "Gagan211105@akgec.ac.in" }).firebaseUid;
// Should be: "uid_different_account_456..."
// NOT the same UID!
```

## 📞 Still Not Working?

1. **Gather info:**
   - Screenshot of wrong account
   - Browser console output
   - Network tab for /auth/firebase-login
   - MongoDB: `db.users.find({ email: { $in: ["...", "..."] } })`

2. **Test thoroughly:**
   - Regular window + Incognito
   - Chrome + Firefox
   - 3 different Google accounts
   - All with 5+ seconds between login attempts

3. **Escalate if persists**

---

**Status:** ✅ Fixed (3-layer security implemented)  
**Tested:** Module-level validation complete  
**Next:** Production deployment + monitoring
