/**
 * Configuration for Tally Excel Import
 * Defines column mappings for Party Report and Sales Report
 */

export const TALLY_EXCEL_CONFIG = {
    party: {
        requiredColumns: ["Party Name"],
        mappings: {
            name: ["Party Name", "Name", "Customer Name"],
            openingBalance: ["Opening Balance", "Balance", "Amount", "Closing Balance"],
            balanceType: ["Dr/Cr", "Type", "Balance Type", "Dr / Cr"],
            mobile: ["Mobile", "Phone", "Contact No", "Mobile No", "Phone Number"],
            address: ["Address", "Billing Address"],
        }
    },
    sales: {
        requiredColumns: ["Invoice No", "Party Name"],
        mappings: {
            invoiceNo: ["Invoice No", "Bill No", "Voucher No", "Invoice Number"],
            customerName: ["Party Name", "Customer Name", "Name"],
            invoiceDate: ["Date", "Invoice Date", "Bill Date", "Voucher Date"],
            amount: ["Amount", "Total", "Bill Amount", "Invoice Amount"],
        }
    }
};
