# Tally Excel Import System - Documentation

## Overview

This system imports historical accounting data from Tally ERP (5 years) into the database via Excel exports. It consists of two import types:

1. **Party Report Import** - Customer opening balances
2. **Sales Report Import** - Historical invoice/bill data

## Key Principles

### Balance Correctness

**CRITICAL**: Opening balances come ONLY from Party Excel. Sales Excel provides bill history for reference only.

```
Party Excel → customers.opening_balance (FINAL, LOCKED)
Sales Excel → bills table (HISTORICAL, LOCKED)
```

**Why this works:**
- Party Excel contains the final calculated balance after 5 years of Tally transactions
- This balance already includes all sales, payments, and adjustments
- Sales bills are stored separately for audit/reference only
- No ledger entries are created to avoid double counting

### Data Locking

All imported Tally data is marked with:
- `source = 'tally'`
- `locked = true`

This prevents accidental modification and clearly separates historical data from new transactions.

---

## Database Schema

### Customers Table Extensions

| Column | Type | Description |
|--------|------|-------------|
| `opening_balance` | numeric | Final balance from Party Excel (can be positive or negative) |
| `balance_type` | text | 'receivable' (Dr) or 'payable' (Cr) |
| `locked` | boolean | true for Tally imports, prevents modification |

### Bills Table Extensions

| Column | Type | Description |
|--------|------|-------------|
| `source` | text | 'tally', 'vyapar', 'system' |
| `locked` | boolean | true for Tally imports |

### Import Logs Table

Tracks all imports with file hash validation:

| Column | Type | Description |
|--------|------|-------------|
| `file_hash` | text | SHA-256 hash for duplicate detection |
| `import_type` | text | 'party' or 'sales' |
| `total_rows` | numeric | Total rows in Excel |
| `imported_rows` | numeric | Successfully imported |
| `skipped_rows` | numeric | Skipped (duplicates, errors) |
| `error_log` | jsonb | Detailed error information |

---

## API Endpoints

### 1. Import Party Excel

**POST** `/api/tally/import-party`

**Auth**: Admin only

**Request**:
```
Content-Type: multipart/form-data
file: party_report.xlsx
```

**Response**:
```json
{
  "message": "Party import completed",
  "summary": {
    "totalRows": 250,
    "imported": 245,
    "skipped": 5,
    "failed": 0
  },
  "errors": [
    { "row": 12, "error": "Missing Party Name" }
  ]
}
```

### 2. Import Sales Excel

**POST** `/api/tally/import-sales`

**Auth**: Admin only

**Request**:
```
Content-Type: multipart/form-data
file: sales_report.xlsx
```

**Response**:
```json
{
  "message": "Sales import completed",
  "summary": {
    "totalRows": 520,
    "imported": 510,
    "skipped": 10,
    "failed": 0
  },
  "errors": [
    { "row": "INV-123", "error": "Customer not found: ABC Traders" }
  ]
}
```

### 3. Get Import Logs

**GET** `/api/tally/import-logs?type=party&limit=20`

**Auth**: Admin only

**Response**:
```json
[
  {
    "id": "uuid",
    "fileName": "party_report_2024.xlsx",
    "fileHash": "sha256hash...",
    "importType": "party",
    "totalRows": "250",
    "importedRows": "245",
    "skippedRows": "5",
    "status": "success",
    "importedAt": "2024-01-15T10:30:00Z"
  }
]
```

---

## Import Validation Rules

### Party Excel Validation

**Required Columns**: Party Name

**Column Mappings** (flexible):
- **Party Name**: "Party Name", "Name", "Customer Name"
- **Opening Balance**: "Opening Balance", "Balance", "Amount", "Closing Balance"
- **Dr/Cr**: "Dr/Cr", "Type", "Balance Type"
- **Mobile**: "Mobile", "Phone", "Contact No"

**Validation Logic**:
1. Party Name must not be empty
2. If mobile present, must be 10 digits (normalized)
3. Balance parsed as numeric (default: 0)
4. Dr/Cr determines balance type:
   - "Cr" → `balanceType = 'payable'`, balance made negative
   - "Dr" → `balanceType = 'receivable'`, balance positive
5. Duplicate names (case-insensitive) are skipped if already locked

**Row Processing**:
- Skip invalid rows, continue with others
- Update existing unlocked customers
- Skip locked customers (from previous imports)

### Sales Excel Validation

**Required Columns**: Invoice No, Party Name

**Column Mappings** (flexible):
- **Invoice No**: "Invoice No", "Bill No", "Voucher No"
- **Party Name**: "Party Name", "Customer Name"
- **Date**: "Date", "Invoice Date", "Bill Date"
- **Amount**: "Amount", "Total", "Bill Amount"

**Validation Logic**:
1. Invoice No and Party Name required
2. Customer must exist in database (by name match)
3. Date parsing supports Excel serial numbers and text dates
4. Amount parsed as numeric
5. Duplicate invoice numbers (per customer) are skipped

**Row Processing**:
- Skip if customer not found
- Skip duplicate invoices
- Link bill to customer via `customer_id`
- **Do NOT create ledger entries**
- **Do NOT modify customer balance**

---

## File Hash Protection

Every file is hashed using SHA-256 before import:

```typescript
const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
```

If hash exists in `import_logs.file_hash`:
- Reject with 409 Conflict
- Return original import details

This prevents:
- Accidental re-imports
- Data duplication
- Balance corruption

---

## Excel Format Examples

### Party Report Format

| Party Name | Opening Balance | Dr/Cr | Mobile | Address |
|------------|----------------|-------|--------|---------|
| ABC Traders | 50000 | Dr | 9876543210 | Delhi |
| XYZ Store | 25000 | Cr | 9123456789 | Mumbai |

### Sales Report Format

| Invoice No | Party Name | Date | Amount |
|------------|------------|------|--------|
| INV-001 | ABC Traders | 2023-01-15 | 15000 |
| INV-002 | XYZ Store | 2023-01-20 | 8000 |

---

## Error Handling

### File-Level Errors

| Error | HTTP Code | Action |
|-------|-----------|--------|
| File already imported | 409 | Reject, return original import ID |
| Invalid file format | 400 | Reject |
| Empty file | 400 | Reject |
| Missing required columns | 400 | Reject with column names |

### Row-Level Errors

All row errors are **non-blocking**. The system:
1. Skips invalid row
2. Logs error with row reference
3. Continues with next row
4. Returns summary with all errors

### Database Errors

Wrapped in transactions:
- Partial success is allowed
- Failed rows logged in `error_log`
- Import marked as "partial" if some rows failed

---

## Testing & Verification

### Quick Test

1. **Prepare test files**:
   - `test_party.xlsx` with 10 customers
   - `test_sales.xlsx` with 20 invoices

2. **Import Party data**:
```bash
curl -X POST http://localhost:5000/api/tally/import-party \
  -H "Cookie: session=..." \
  -F "file=@test_party.xlsx"
```

3. **Verify customers**:
```sql
SELECT name, opening_balance, balance_type, locked, source 
FROM customers 
WHERE source = 'tally' 
LIMIT 10;
```

4. **Import Sales data**:
```bash
curl -X POST http://localhost:5000/api/tally/import-sales \
  -H "Cookie: session=..." \
  -F "file=@test_sales.xlsx"
```

5. **Verify bills**:
```sql
SELECT bill_no, amount, locked, source 
FROM bills 
WHERE source = 'tally' 
LIMIT 10;
```

6. **Verify NO ledger entries created**:
```sql
SELECT COUNT(*) FROM ledger 
WHERE customer_id IN (
  SELECT id FROM customers WHERE source = 'tally'
);
-- Should return 0
```

7. **Test duplicate protection**:
```bash
# Try importing same file again - should get 409 Conflict
curl -X POST http://localhost:5000/api/tally/import-party \
  -F "file=@test_party.xlsx"
```

### Balance Verification

```sql
-- Customer balance should equal opening_balance (no ledger aggregation)
SELECT 
  c.name,
  c.opening_balance as "Balance from Party Excel",
  c.balance_type,
  COUNT(b.id) as "Number of Bills (informational)"
FROM customers c
LEFT JOIN bills b ON b.customer_id = c.id AND b.source = 'tally'
WHERE c.source = 'tally'
GROUP BY c.id, c.name, c.opening_balance, c.balance_type
LIMIT 10;
```

---

## Common Issues & Solutions

### Issue: "Customer not found" during Sales import

**Cause**: Customer name in Sales Excel doesn't exactly match Party Excel

**Solution**: 
- The system does case-insensitive trim matching
- Check for spelling differences
- Import Party Excel first, then Sales Excel
- Review error log for exact names

### Issue: "Duplicate invoice" errors

**Cause**: Invoice number already exists for that customer

**Solution**:
- This is expected behavior (safety feature)
- Check if file was previously imported
- If intentional re-import needed, clear existing bills first

### Issue: Incorrect balance type

**Cause**: Dr/Cr column not correctly parsed

**Solution**:
- Ensure Dr/Cr column contains "Dr" or "Cr"
- Default is "receivable" if missing
- Can manually update after import if needed:
```sql
UPDATE customers 
SET balance_type = 'payable', 
    opening_balance = -ABS(opening_balance::numeric)
WHERE name = 'CustomerName';
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Run migration: `npm run db:push` or `npm run db:migrate`
- [ ] Verify schema changes in production database
- [ ] Test with sample files in staging environment
- [ ] Prepare actual Tally Excel exports
- [ ] Backup database before import
- [ ] Verify admin authentication is working

### Import Order

1. **Import Party Excel FIRST**
   - This creates customers with opening balances
   - All subsequent imports depend on this

2. **Import Sales Excel SECOND**
   - Links bills to existing customers
   - Will fail for missing customers

### Post-Import Verification

```sql
-- Check import summary
SELECT 
  import_type,
  COUNT(*) as imports,
  SUM(total_rows::int) as total_rows,
  SUM(imported_rows::int) as imported,
  SUM(skipped_rows::int) as skipped
FROM import_logs
WHERE import_type IN ('party', 'sales')
GROUP BY import_type;

-- Verify data integrity
SELECT 
  (SELECT COUNT(*) FROM customers WHERE source = 'tally') as tally_customers,
  (SELECT COUNT(*) FROM bills WHERE source = 'tally') as tally_bills,
  (SELECT COUNT(*) FROM ledger WHERE customer_id IN (
    SELECT id FROM customers WHERE source = 'tally'
  )) as tally_ledger_entries; -- Should be 0
```

---

## Future Enhancements

Potential improvements (not in current scope):

1. **Bulk update balances** - Update opening balances from new Party exports
2. **Export to Excel** - Generate reports from imported data
3. **Advanced matching** - Fuzzy name matching for customer lookup
4. **Item-level details** - Import invoice line items (currently only headers)
5. **Payment import** - Separate payment history import
