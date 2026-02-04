# 📱 Mobile Number Linking & Verification System

**Complete Implementation Guide**  
**Date:** February 4, 2026

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [User Flow](#user-flow)
4. [Admin Verification Portal](#admin-verification-portal)
5. [Backend API](#backend-api)
6. [Frontend Components](#frontend-components)
7. [Security & Safety](#security--safety)
8. [Edge Cases](#edge-cases)
9. [Testing Guide](#testing-guide)

---

## 🎯 System Overview

The Mobile Number Linking & Verification System allows users to link their mobile numbers to their accounts with admin verification. Users receive temporary mobile numbers (format: `000XXXXXXX`) for immediate access while their real mobile numbers are pending verification.

### Key Features

- ✅ **Temporary Mobile Assignment**: System-generated temporary numbers for immediate access
- ✅ **User-Initiated Verification**: Users can add their mobile numbers for verification
- ✅ **Admin Verification Portal**: Dedicated admin interface for reviewing requests
- ✅ **Audit Logging**: Complete audit trail of all verification actions
- ✅ **Duplicate Prevention**: Prevents duplicate mobile number linking
- ✅ **Data Access**: Users can access their shop data even with temporary mobile

---

## 🗄️ Database Schema

### Migration File
`migrations/0009_mobile_verification_system.sql`

### Schema Updates

#### Customers Table - New Columns

```sql
ALTER TABLE customers 
ADD COLUMN temporary_mobile text,           -- System-generated temp mobile (000XXXXXXX)
ADD COLUMN actual_mobile text,              -- User-entered real mobile (stored until verified)
ADD COLUMN verified_by uuid REFERENCES customers(id),  -- Admin who verified
ADD COLUMN verified_at timestamp;           -- Verification timestamp
```

#### Mobile Link Requests - Enhanced

```sql
ALTER TABLE mobile_link_requests
ADD COLUMN verified_by uuid REFERENCES customers(id),
ADD COLUMN verified_at timestamp,
ADD COLUMN rejected_by uuid REFERENCES customers(id),
ADD COLUMN rejected_at timestamp,
ADD COLUMN rejection_reason text;
```

#### Mobile Verification Audit - New Table

```sql
CREATE TABLE mobile_verification_audit (
    id uuid PRIMARY KEY,
    customer_id uuid REFERENCES customers(id) NOT NULL,
    action text NOT NULL CHECK (action IN ('temp_assigned', 'verification_requested', 'verified', 'rejected', 'temp_replaced')),
    admin_id uuid REFERENCES customers(id),
    old_mobile text,
    new_mobile text,
    temporary_mobile text,
    notes text,
    created_at timestamp DEFAULT now()
);
```

### Schema Flags

| Field | Type | Purpose |
|-------|------|---------|
| `mobile_verified` | boolean | True when mobile is verified by admin |
| `temporary_mobile` | text | System-generated temp number (000XXXXXXX) |
| `actual_mobile` | text | User-entered real mobile (stored separately) |
| `mobile` | text | Current active mobile (temp or verified) |
| `verified_by` | uuid | Admin ID who verified |
| `verified_at` | timestamp | When verification occurred |

---

## 👤 User Flow

### Step-by-Step Process

#### 1. **User Login Check**

When a user logs in, the system checks `mobile_verified` status:

```typescript
// server/controllers/auth.ts - loginPin()
// Allows login with temporary mobile (starts with '000')
const isTemporaryMobile = customer.mobile?.startsWith('000') || customer.temporary_mobile === mobile;
const isVerified = customer.mobile_verified === true;

// Block login only if not verified AND not temporary
if (!isVerified && !isTemporaryMobile) {
    return res.status(403).json({
        message: "Your mobile number is not registered. Please register it.",
        code: "MOBILE_UNVERIFIED"
    });
}
```

#### 2. **Dashboard Banner Display**

If `mobile_verified === false`, the dashboard shows a banner:

```
⚠️ Mobile Number Not Linked
Your mobile number is not linked with your account. Please add your mobile number to continue.
Temporary Mobile: 0004301160
[Add Mobile Number]
```

**Component:** `client/src/components/MobileVerificationBanner.tsx`

#### 3. **Add Mobile Number**

User clicks "Add Mobile Number" → Dialog opens:

- **Input:** 10-digit mobile number (starting with 6-9)
- **Validation:** Regex `/^[6-9]\d{9}$/`
- **Action:** Calls `/api/mobile/add`

**Backend Process:**
1. Validates mobile format
2. Checks for duplicates
3. Generates temporary mobile if not exists
4. Updates customer:
   - `temporary_mobile` = generated temp (e.g., `0004301160`)
   - `actual_mobile` = user-entered mobile
   - `mobile` = temporary mobile (for login access)
   - `mobile_verified` = false
5. Creates `mobile_link_requests` entry (status: 'pending')
6. Creates audit log entry

**API Endpoint:** `POST /api/mobile/add`

**Request:**
```json
{
  "mobile": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mobile number added successfully. Your request is pending admin verification.",
  "temporaryMobile": "0004301160",
  "actualMobile": "9876543210",
  "status": "pending"
}
```

#### 4. **User Access with Temporary Mobile**

- User can log in with temporary mobile (`0004301160`)
- User can access dashboard and shop data
- Banner remains visible until verification

---

## 🔐 Admin Verification Portal

### Portal Access

**Route:** `/admin/mobile-verification`  
**Access:** Admin only  
**Component:** `client/src/pages/admin/MobileVerification.tsx`

### Portal Features

#### 1. **Pending Verifications Table**

Displays all pending verification requests with:

| Column | Description |
|--------|-------------|
| Shop Name | Customer/shop name |
| Temporary Mobile | System-assigned temp number |
| Requested Mobile | User-entered real mobile |
| Request Date | When request was submitted |
| Status | Always "Pending" |
| Actions | Verify / Reject buttons |

#### 2. **Verify Action**

**API:** `POST /api/admin/mobile-verifications/verify`

**Process:**
1. Validates request exists and is pending
2. Checks mobile not already verified for another customer
3. Performs atomic transaction:
   - Updates customer:
     - `mobile` = actual mobile (replaces temporary)
     - `temporary_mobile` = null (cleared)
     - `actual_mobile` = null (cleared, now it's main mobile)
     - `mobile_verified` = true
     - `verified_by` = admin ID
     - `verified_at` = now()
   - Updates request:
     - `status` = 'approved'
     - `verified_by` = admin ID
     - `verified_at` = now()
   - Creates audit log entry

**Request:**
```json
{
  "requestId": "uuid-of-request"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mobile number 9876543210 has been verified and linked to Shop Name",
  "customerId": "uuid",
  "shopName": "Shop Name",
  "oldMobile": "0004301160",
  "newMobile": "9876543210"
}
```

#### 3. **Reject Action**

**API:** `POST /api/admin/mobile-verifications/reject`

**Process:**
1. Validates request exists and is pending
2. Performs atomic transaction:
   - Updates customer:
     - `actual_mobile` = null (cleared)
     - `mobile_verified` = false (remains unverified)
     - Keeps `temporary_mobile` and `mobile` (temp) for user access
   - Updates request:
     - `status` = 'rejected'
     - `rejected_by` = admin ID
     - `rejected_at` = now()
     - `rejection_reason` = provided reason
   - Creates audit log entry

**Request:**
```json
{
  "requestId": "uuid-of-request",
  "rejectionReason": "Mobile number already in use"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mobile verification request for Shop Name has been rejected",
  "customerId": "uuid",
  "shopName": "Shop Name",
  "requestedMobile": "9876543210",
  "rejectionReason": "Mobile number already in use"
}
```

---

## 🔌 Backend API

### Endpoints

#### User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/mobile/verification-status` | Required | Check verification status |
| POST | `/api/mobile/add` | Required | Add mobile number for verification |

#### Admin Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/mobile-verifications` | Admin | Get pending verifications |
| POST | `/api/admin/mobile-verifications/verify` | Admin | Verify mobile number |
| POST | `/api/admin/mobile-verifications/reject` | Admin | Reject verification |

### Controller Files

- `server/controllers/mobile-verification.ts` - Main verification logic
- `server/controllers/auth.ts` - Updated login logic

---

## 🎨 Frontend Components

### Components

1. **MobileVerificationBanner** (`client/src/components/MobileVerificationBanner.tsx`)
   - Displays banner when mobile not verified
   - "Add Mobile Number" button
   - Mobile input dialog

2. **MobileVerification** (`client/src/pages/admin/MobileVerification.tsx`)
   - Admin verification portal
   - Pending requests table
   - Verify/Reject actions

### Integration Points

- **Dashboard:** Banner displayed at top
- **Admin Panel:** New card linking to verification portal
- **Routes:** Added to `client/src/App.tsx`

---

## 🔒 Security & Safety

### Security Measures

1. **Temporary Mobile Uniqueness**
   - Generated with collision detection
   - Format: `000XXXXXXX` (never reused after verification)

2. **Duplicate Prevention**
   - Checks if mobile already verified for another customer
   - Prevents duplicate verification requests

3. **Admin Authentication**
   - All admin endpoints require `requireAdmin` middleware
   - Session-based authentication

4. **Audit Logging**
   - All actions logged in `mobile_verification_audit`
   - Tracks: who, when, what, why

5. **Data Integrity**
   - Atomic transactions for all updates
   - Foreign key constraints
   - RLS policies on audit table

### Safety Guarantees

✅ **Temporary mobiles never reused** - Cleared after verification  
✅ **No data loss** - All changes are atomic transactions  
✅ **User access maintained** - Users can access with temp mobile  
✅ **Audit trail** - Complete history of all actions  

---

## ⚠️ Edge Cases

### Handled Scenarios

1. **User Already Has Verified Mobile**
   - Returns error: "Your mobile number is already verified"
   - Prevents duplicate requests

2. **Mobile Already Verified for Another Customer**
   - Returns error: "Mobile number already registered with another shop"
   - Prevents duplicate linking

3. **Pending Request Already Exists**
   - Returns error: "You already have a pending verification request"
   - Prevents spam requests

4. **Request Already Processed**
   - Returns error: "This request has already been [approved/rejected]"
   - Prevents duplicate processing

5. **Temporary Mobile Generation Failure**
   - Retries up to 100 times
   - Returns error if all attempts fail

6. **User Logs In with Temporary Mobile**
   - Allowed (starts with '000')
   - Can access all data
   - Banner still shows

7. **Admin Rejects Request**
   - User keeps temporary mobile
   - Can submit new request
   - Previous request marked as rejected

---

## 🧪 Testing Guide

### Test Scenarios

#### User Flow Tests

1. **Login with Unverified Mobile**
   - ✅ Should show banner on dashboard
   - ✅ Should allow access with temporary mobile

2. **Add Mobile Number**
   - ✅ Should validate format (10 digits, starts with 6-9)
   - ✅ Should assign temporary mobile
   - ✅ Should create pending request
   - ✅ Should show success message

3. **Duplicate Mobile Prevention**
   - ✅ Should reject if mobile already verified for another customer
   - ✅ Should reject if pending request already exists

#### Admin Flow Tests

1. **View Pending Verifications**
   - ✅ Should list all pending requests
   - ✅ Should show shop name, temp mobile, requested mobile

2. **Verify Mobile**
   - ✅ Should replace temporary with actual mobile
   - ✅ Should mark customer as verified
   - ✅ Should create audit log
   - ✅ Should remove from pending list

3. **Reject Mobile**
   - ✅ Should keep temporary mobile
   - ✅ Should mark request as rejected
   - ✅ Should create audit log
   - ✅ Should remove from pending list

### Manual Testing Steps

1. **Run Migration**
   ```sql
   -- Run in Supabase SQL Editor
   -- migrations/0009_mobile_verification_system.sql
   ```

2. **Test User Flow**
   - Login with unverified mobile
   - Check dashboard banner appears
   - Click "Add Mobile Number"
   - Enter valid mobile (9876543210)
   - Submit request
   - Verify temporary mobile assigned

3. **Test Admin Flow**
   - Login as admin
   - Navigate to `/admin/mobile-verification`
   - View pending requests
   - Click "Verify" on a request
   - Confirm mobile replaced
   - Check audit log

---

## 📝 UI Text & Messages

### User Messages

**Banner Message:**
```
⚠️ Mobile Number Not Linked
Your mobile number is not linked with your account. Please add your mobile number to continue.
Temporary Mobile: 0004301160
[Add Mobile Number]
```

**Success Message (Add Mobile):**
```
Mobile number added successfully. Your request is pending admin verification.
```

**Error Messages:**
- "Invalid mobile number format. Must be 10 digits starting with 6, 7, 8, or 9."
- "This mobile number is already registered with another shop."
- "You already have a pending verification request for this mobile number."

### Admin Messages

**Verify Success:**
```
Mobile number 9876543210 has been verified and linked to Shop Name
```

**Reject Success:**
```
Mobile verification request for Shop Name has been rejected
```

**Confirmation Dialog (Reject):**
```
Are you sure you want to reject the mobile verification request for [Shop Name]?
[Rejection Reason Input]
[Cancel] [Reject Request]
```

---

## ✅ Implementation Checklist

### Backend
- [x] Database migration created
- [x] Schema updated (`shared/schema.ts`)
- [x] Mobile verification controller created
- [x] Auth controller updated (allow temp mobile login)
- [x] Routes added (`server/routes.ts`)

### Frontend
- [x] MobileVerificationBanner component created
- [x] MobileVerification admin page created
- [x] Dashboard integration (banner display)
- [x] Admin panel card added
- [x] Routes added (`client/src/App.tsx`)

### Documentation
- [x] Complete system documentation
- [x] API documentation
- [x] Testing guide
- [x] Edge cases documented

---

## 🚀 Deployment Steps

1. **Run Database Migration**
   ```bash
   # In Supabase SQL Editor
   # Run: migrations/0009_mobile_verification_system.sql
   ```

2. **Deploy Backend**
   - Controllers already added
   - Routes already registered
   - No additional config needed

3. **Deploy Frontend**
   - Components already created
   - Routes already added
   - No additional config needed

4. **Verify**
   - Test user flow
   - Test admin portal
   - Check audit logs

---

**Status:** ✅ Complete and Ready for Production
