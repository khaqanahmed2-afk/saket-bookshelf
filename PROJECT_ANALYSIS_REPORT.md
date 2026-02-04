# 📊 Saket Bookshelf - Comprehensive Project Analysis Report
**Generated:** February 4, 2026  
**Analyst:** Senior Full-Stack Engineer & Database Architect

---

## PROJECT OVERVIEW

### Tech Stack
- **Frontend:** React 18.3 + Vite, TypeScript, TailwindCSS, TanStack Query, Framer Motion, Recharts
- **Backend:** Node.js 20.19+, Express, TypeScript, Express-Session (PostgreSQL-backed)
- **Database:** Supabase (PostgreSQL) with Drizzle ORM
- **Authentication:** Custom PIN-based auth (bcrypt), session-based (no Supabase Auth)
- **Deployment:** Vercel/Heroku ready, Firebase Hosting config present

### Architecture Pattern
- **Backend-for-Frontend (BFF):** Frontend does NOT connect directly to Supabase
- **Service Role Key:** Backend uses SERVICE_ROLE_KEY (bypasses RLS)
- **Session Management:** PostgreSQL-backed sessions via `connect-pg-simple`

### Project Structure
```
├── client/src/          # React frontend
├── server/              # Express backend
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   └── middleware/     # Auth middleware
├── shared/              # Shared schemas (Zod + Drizzle)
├── migrations/          # SQL migrations
└── scripts/             # Utility scripts
```

---

## ✔ WHAT IS WORKING

### 1. **Core Authentication Flow**
- ✅ Mobile + PIN authentication working
- ✅ Session management with PostgreSQL store
- ✅ PIN hashing with bcrypt (10 rounds)
- ✅ Mobile verification workflow (`mobile_verified` flag)
- ✅ Admin role checking middleware

### 2. **Database Schema**
- ✅ Unified `invoices` table (merged from `bills`)
- ✅ `customer_ledger_view` provides single source of truth
- ✅ Proper foreign keys: `payments.invoice_id → invoices.id`
- ✅ Unique constraints: `(invoice_no, customer_id)`, `(receipt_no, customer_id)`
- ✅ Opening balance support (`opening_balance`, `balance_type`)

### 3. **Dashboard Features**
- ✅ Customer dashboard with real-time balance calculation
- ✅ Period filtering (monthly/yearly/custom date range)
- ✅ Invoice reconciliation (paid/due tracking)
- ✅ Payment history display
- ✅ Monthly charts (purchase vs paid)
- ✅ PDF/Excel statement generation

### 4. **Import System**
- ✅ Vyapar Excel import (customers, products, invoices)
- ✅ Tally Excel import (Party Report, Sales Report)
- ✅ XML upload system (strict order: customers → bills → payments)
- ✅ Duplicate detection (file hash, receipt_no uniqueness)
- ✅ Staging import workflow (`staging_imports` table)
- ✅ Error logging and validation

### 5. **Product Management**
- ✅ Products CRUD operations
- ✅ Image upload support
- ✅ Category management
- ✅ Stock tracking

### 6. **Code Quality**
- ✅ TypeScript throughout
- ✅ Zod validation schemas
- ✅ Centralized API service (`client/src/services/api.ts`)
- ✅ Error boundaries
- ✅ Loading states

---

## 🟡 PARTIALLY DONE

### 1. **RLS (Row Level Security) Policies**
**Status:** Inconsistent and incomplete

**Issues:**
- ❌ `invoices` table has NO RLS policies (security gap)
- ❌ `invoice_items` table has NO RLS policies
- ❌ `products` table has NO RLS policies
- ⚠️ Multiple conflicting RLS migration files:
  - `migrations/01_enable_rls.sql` - References `ledger` and `bills` tables (DO NOT EXIST)
  - `migrations/0002_security_rls.sql` - Same issue
  - `migrations/security_hardening.sql` - Denies all public access (correct for BFF pattern)

**Files:**
- `migrations/01_enable_rls.sql` (lines 3-4, 30-32, 44-46)
- `migrations/0002_security_rls.sql` (lines 3-4, 20-22, 25-27)
- `migrations/security_hardening.sql` (lines 22-24, 32-35)

**Impact:** Since backend uses SERVICE_ROLE_KEY, RLS is bypassed anyway. But if someone accidentally uses anon key, invoices/products are exposed.

### 2. **Database Indexes**
**Status:** Partially optimized

**Issues:**
- ❌ Indexes created for non-existent tables:
  - `migrations/02_optimize_indexes.sql` creates indexes on `ledger` and `bills` (tables don't exist)
- ✅ Good indexes exist for:
  - `customers.mobile`
  - `payments.customer_id`, `payments.payment_date`
- ⚠️ Missing indexes:
  - `invoices.customer_id` (high usage)
  - `invoices.date` (filtering)
  - `invoices.invoice_no` (lookups)
  - `invoice_items.invoice_id` (joins)
  - `payments.invoice_id` (reconciliation queries)

**Files:**
- `migrations/02_optimize_indexes.sql` (lines 8-14)

### 3. **Ledger View Column Mismatch**
**Status:** BUG - View returns different columns than code expects

**Issue:**
- View returns: `type`, `source_id`, `customer_id`, `entry_date`, `description`, `debit`, `credit`, `created_at`
- Code expects: `entry_type`, `reference_no` (doesn't exist)

**Location:**
- `server/controllers/dashboard.ts` lines 98-100:
  ```typescript
  type: row.entry_type,        // ❌ Should be row.type
  referenceNo: row.reference_no, // ❌ Should be row.description
  ```

**Impact:** Ledger table shows `undefined` for type and referenceNo fields.

**Files:**
- `migrations/0002_create_view.sql`
- `server/controllers/dashboard.ts` (lines 94-106)
- `client/src/components/LedgerTable.tsx` (line 92)

### 4. **Settlement Feature**
**Status:** Implemented but missing validation

**Issues:**
- ✅ Payment creation works
- ⚠️ No validation that `amount <= invoice.dueAmount`
- ⚠️ No check for duplicate payments
- ⚠️ No invoice status update after settlement

**Files:**
- `server/controllers/settlements.ts`
- `client/src/components/SettleInvoiceModal.tsx`

### 5. **Mobile Registration Flow**
**Status:** Implemented but security concern

**Issues:**
- ✅ Shop search works
- ✅ Mobile link request system
- ⚠️ Admin approval routes are PUBLIC (no authentication):
  - `/api/admin/approve-mobile`
  - `/api/admin/reject-mobile`
- ⚠️ Comment says "should have signed token/secret" but not implemented

**Files:**
- `server/routes.ts` (lines 74-76)
- `server/controllers/mobile-registration.ts`

### 6. **Bulk Orders Feature**
**Status:** Files exist but integration unclear

**Files Found:**
- `client/src/components/BulkOrderForm.tsx` (untracked)
- `client/src/components/BulkOrdersSchema.tsx` (untracked)
- `client/src/pages/BulkOrders.tsx` (untracked)

**Status:** Need to verify if this feature is complete and wired up.

---

## ❌ MISSING / BROKEN

### 1. **Data Integrity Constraints**

**Missing Foreign Key Constraints:**
- ❌ `payments.invoice_id` has FK but no `ON DELETE CASCADE` or `ON UPDATE CASCADE`
- ❌ `invoice_items.invoice_id` has `ON DELETE CASCADE` ✅ but no `ON UPDATE` policy
- ❌ No constraint ensuring `payments.amount <= invoices.total_amount`

**Missing Check Constraints:**
- ❌ No validation that `invoices.total_amount >= 0`
- ❌ No validation that `payments.amount > 0`
- ❌ No validation that `invoice_items.amount = quantity * rate`

**Files:**
- `shared/schema.ts` (lines 46, 126)

### 2. **Accounting Balance Validation**

**Issue:** No automated check that balance always equals:
```
Balance = Opening Balance + SUM(Invoices) - SUM(Payments)
```

**Current State:**
- ✅ Dashboard calculates balance correctly
- ❌ No database trigger/function to validate balance integrity
- ❌ No script to detect and fix balance discrepancies

**Risk:** If data is imported incorrectly or manually edited, balances can become inconsistent.

**Files:**
- `server/controllers/dashboard.ts` (lines 44-82)
- `scripts/fix-ledger-integrity.ts` (exists but references old `ledger` table)

### 3. **Invoice Status Automation**

**Issue:** Invoice status (`paid`, `unpaid`, `partial`) is not automatically updated.

**Current State:**
- ✅ Dashboard calculates `paid_amount` and `due_amount` via JOIN
- ❌ `invoices.status` column is never updated automatically
- ❌ Status is set to `"paid"` by default during import (line 239 in `import-service.ts`)

**Impact:** Status column is unreliable. Dashboard ignores it and calculates on-the-fly.

**Files:**
- `shared/schema.ts` (line 111)
- `server/controllers/dashboard.ts` (lines 121-146)
- `server/services/import-service.ts` (line 239)

### 4. **Orphaned Records Detection**

**Missing:**
- ❌ No script to find payments with `invoice_id` pointing to non-existent invoices
- ❌ No script to find invoices with `customer_id` pointing to deleted customers
- ❌ No script to find `invoice_items` with invalid `product_id` or `invoice_id`

**Risk:** Data corruption can occur silently.

### 5. **Migration Cleanup**

**Issues:**
- ❌ Multiple migration files reference deleted tables (`ledger`, `bills`)
- ❌ Migration order unclear (0000, 0001, 0002, 0005, 0006, 01, 02, 03, 04)
- ❌ Some migrations conflict (e.g., RLS policies)

**Files:**
- `migrations/01_enable_rls.sql`
- `migrations/0002_security_rls.sql`
- `migrations/02_optimize_indexes.sql`
- `migrations/0001_monthly_ledger_view.sql` (references `ledger` table)

### 6. **Error Handling**

**Missing:**
- ❌ No global error logging service
- ❌ No error tracking (Sentry, etc.)
- ❌ Limited error context in API responses
- ⚠️ Some try-catch blocks swallow errors silently

**Files:**
- `server/controllers/dashboard.ts` (line 197 - generic error message)
- `server/services/import-service.ts` (line 194 - error logged but not tracked)

### 7. **API Documentation**

**Missing:**
- ❌ No OpenAPI/Swagger documentation
- ❌ No API versioning
- ❌ Route definitions scattered (`server/routes.ts` + individual route files)

---

## ⚠ RISKS & WARNINGS

### 🔴 CRITICAL RISKS

1. **Ledger View Column Mismatch**
   - **Risk:** Ledger table shows incorrect/undefined data
   - **Impact:** Users see broken transaction history
   - **Fix:** Update `dashboard.ts` to use `row.type` and `row.description`

2. **Missing RLS on Invoices**
   - **Risk:** If anon key is accidentally used, all invoices are exposed
   - **Impact:** Data breach
   - **Mitigation:** Currently safe because backend uses SERVICE_ROLE_KEY, but should add RLS for defense-in-depth

3. **Public Admin Approval Routes**
   - **Risk:** Anyone can approve/reject mobile registrations via URL
   - **Impact:** Security vulnerability
   - **Fix:** Add signed token or require admin session

### 🟡 MEDIUM RISKS

4. **No Balance Integrity Checks**
   - **Risk:** Balance calculations can drift from actual data
   - **Impact:** Incorrect financial reports
   - **Fix:** Add database trigger or periodic validation script

5. **Invoice Status Not Updated**
   - **Risk:** Status column is unreliable
   - **Impact:** Confusion, but mitigated by on-the-fly calculation
   - **Fix:** Add trigger to update status when payments change

6. **Orphaned Records**
   - **Risk:** Foreign key violations can occur if data is manually edited
   - **Impact:** Broken queries, inconsistent data
   - **Fix:** Add FK constraints with proper CASCADE rules

7. **Migration Conflicts**
   - **Risk:** Running migrations in wrong order can break database
   - **Impact:** Production downtime
   - **Fix:** Consolidate migrations, remove references to deleted tables

### 🟢 LOW RISKS

8. **Missing Indexes**
   - **Risk:** Slow queries as data grows
   - **Impact:** Performance degradation
   - **Fix:** Add indexes on frequently queried columns

9. **No API Documentation**
   - **Risk:** Harder to onboard new developers
   - **Impact:** Development slowdown
   - **Fix:** Add OpenAPI docs

---

## 🛠 STEP-BY-STEP NEXT PLAN

### IMMEDIATE FIXES (Must Do - This Week)

#### 1. Fix Ledger View Column Mismatch
**Priority:** 🔴 CRITICAL  
**Time:** 15 minutes

**Action:**
```typescript
// server/controllers/dashboard.ts line 94-106
const ledgerList = ledgerResult.rows.map(row => {
    currentRunningBalance += (Number(row.debit) - Number(row.credit));
    return {
        id: row.source_id,
        type: row.type,                    // ✅ Fixed: was row.entry_type
        entryDate: row.entry_date,
        referenceNo: row.description,    // ✅ Fixed: was row.reference_no
        debit: row.debit,
        credit: row.credit,
        balance: currentRunningBalance,
        createdAt: row.created_at
    };
}).reverse();
```

**Files:**
- `server/controllers/dashboard.ts`

#### 2. Add RLS Policies for Invoices
**Priority:** 🔴 CRITICAL  
**Time:** 30 minutes

**Action:** Create migration:
```sql
-- migrations/0007_add_invoice_rls.sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Deny all public access (BFF pattern)
CREATE POLICY "Deny Public Access Invoices" ON invoices FOR ALL USING (false);
CREATE POLICY "Deny Public Access Invoice Items" ON invoice_items FOR ALL USING (false);
CREATE POLICY "Deny Public Access Products" ON products FOR ALL USING (false);
```

**Files:**
- Create `migrations/0007_add_invoice_rls.sql`

#### 3. Secure Admin Approval Routes
**Priority:** 🔴 CRITICAL  
**Time:** 1 hour

**Action:**
- Option A: Require admin session (simpler)
  ```typescript
  // server/routes.ts
  app.get("/api/admin/approve-mobile", requireAdmin, mobileRegController.approveMobileRegistration);
  app.get("/api/admin/reject-mobile", requireAdmin, mobileRegController.rejectMobileRegistration);
  ```

- Option B: Add signed token (more secure)
  - Generate JWT token with expiration
  - Include token in WhatsApp link
  - Verify token in controller

**Files:**
- `server/routes.ts` (lines 74-76)
- `server/controllers/mobile-registration.ts`

#### 4. Add Missing Database Indexes
**Priority:** 🟡 HIGH  
**Time:** 20 minutes

**Action:** Create migration:
```sql
-- migrations/0008_add_missing_indexes.sql
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_no ON invoices(invoice_no);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
```

**Files:**
- Create `migrations/0008_add_missing_indexes.sql`

---

### SHORT-TERM IMPROVEMENTS (Next 2 Weeks)

#### 5. Fix Settlement Validation
**Priority:** 🟡 MEDIUM  
**Time:** 1 hour

**Action:**
```typescript
// server/controllers/settlements.ts
// Add validation:
const totalPaid = await db.execute(sql`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM payments
    WHERE invoice_id = ${invoiceId}
`);
const remaining = Number(invoice.totalAmount) - Number(totalPaid.rows[0].total);
if (Number(amount) > remaining) {
    return res.status(400).json({ 
        message: `Amount exceeds due amount. Remaining: ₹${remaining}` 
    });
}
```

**Files:**
- `server/controllers/settlements.ts`

#### 6. Add Balance Integrity Check Script
**Priority:** 🟡 MEDIUM  
**Time:** 2 hours

**Action:** Create script:
```typescript
// scripts/verify-balance-integrity.ts
// For each customer:
// 1. Calculate: opening_balance + SUM(invoices) - SUM(payments)
// 2. Compare with dashboard calculation
// 3. Report discrepancies
```

**Files:**
- Create `scripts/verify-balance-integrity.ts`

#### 7. Clean Up Migration Files
**Priority:** 🟡 MEDIUM  
**Time:** 1 hour

**Action:**
- Remove references to `ledger` and `bills` tables from:
  - `migrations/01_enable_rls.sql`
  - `migrations/0002_security_rls.sql`
  - `migrations/02_optimize_indexes.sql`
  - `migrations/0001_monthly_ledger_view.sql` (or update to use `customer_ledger_view`)

**Files:**
- Multiple migration files

#### 8. Add Invoice Status Trigger
**Priority:** 🟢 LOW  
**Time:** 1 hour

**Action:** Create trigger:
```sql
-- migrations/0009_invoice_status_trigger.sql
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices
    SET status = CASE
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) >= total_amount THEN 'paid'
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) > 0 THEN 'partial'
        ELSE 'unpaid'
    END
    WHERE id = NEW.invoice_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_status_on_payment
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION update_invoice_status();
```

**Files:**
- Create `migrations/0009_invoice_status_trigger.sql`

---

### LONG-TERM / OPTIONAL ENHANCEMENTS

#### 9. Add Data Integrity Constraints
**Priority:** 🟢 LOW  
**Time:** 2 hours

**Action:**
- Add check constraints for amounts > 0
- Add FK CASCADE rules
- Add validation triggers

#### 10. Implement Error Tracking
**Priority:** 🟢 LOW  
**Time:** 3 hours

**Action:**
- Integrate Sentry or similar
- Add structured error logging
- Create error dashboard

#### 11. Add API Documentation
**Priority:** 🟢 LOW  
**Time:** 4 hours

**Action:**
- Generate OpenAPI spec from routes
- Add Swagger UI
- Document request/response schemas

#### 12. Add Unit Tests
**Priority:** 🟢 LOW  
**Time:** Ongoing

**Action:**
- Test balance calculations
- Test import services
- Test authentication flow

---

## 📋 SUMMARY CHECKLIST

### Critical (Do Immediately)
- [ ] Fix ledger view column mismatch (`dashboard.ts`)
- [ ] Add RLS policies for invoices/products
- [ ] Secure admin approval routes
- [ ] Add missing database indexes

### High Priority (This Week)
- [ ] Fix settlement validation
- [ ] Create balance integrity check script
- [ ] Clean up migration files

### Medium Priority (This Month)
- [ ] Add invoice status trigger
- [ ] Add data integrity constraints
- [ ] Document API endpoints

### Low Priority (Backlog)
- [ ] Add error tracking
- [ ] Add unit tests
- [ ] Performance optimization

---

## 📝 NOTES

### Accounting Logic Verification

**Current Implementation:**
```typescript
// Opening Balance Calculation (CORRECT ✅)
const baseOpeningBalance = Number(customerData.openingBalance || 0);
const preStats = await db.execute(sql`
    SELECT SUM(debit - credit) as balance_change
    FROM customer_ledger_view
    WHERE customer_id = ${customerId}
    AND entry_date < ${startDate}
`);
const calculatedOpeningBalance = baseOpeningBalance + Number(preStats.rows[0]?.balance_change || 0);

// Period Stats (CORRECT ✅)
const periodStats = await db.execute(sql`
    SELECT SUM(debit) as total_debit, SUM(credit) as total_credit
    FROM customer_ledger_view
    WHERE customer_id = ${customerId} AND entry_date >= ${startDate} AND entry_date <= ${endDate}
`);

// Closing Balance (CORRECT ✅)
const closingBalance = calculatedOpeningBalance + purchase - paid;
```

**Accounting is mathematically correct.** The only risk is data integrity (orphaned records, missing payments).

### Migration Order Recommendation

Run migrations in this order:
1. `0000_needy_microbe.sql` (initial schema)
2. `0001_unify_structure.sql` (merge bills → invoices)
3. `0002_create_view.sql` (create ledger view)
4. `0003_create_products_table.sql`
4. `0005_tally_excel_import.sql`
5. `0006_add_vyapar_columns.sql`
6. `01_enable_rls.sql` (but remove ledger/bills references)
7. `02_optimize_indexes.sql` (but remove ledger/bills references)
8. `03_tally_masters.sql`
9. `04_production_optimizations.sql`
10. `security_hardening.sql` (final security layer)
11. `0007_add_invoice_rls.sql` (NEW - to be created)
12. `0008_add_missing_indexes.sql` (NEW - to be created)

---

**End of Report**
