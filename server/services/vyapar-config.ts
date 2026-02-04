export const VYAPAR_CONFIG = {
    customers: {
        requiredColumns: ["Name"], // Only name is required, mobile is optional
        mappings: {
            name: ["Name", "Party Name", "Customer Name"],
            mobile: ["Mobile", "Phone", "Phone No", "Phone No."],
            receivableBalance: ["Receivable Balance", "Receivable"],
            payableBalance: ["Payable Balance", "Payable"],
            address: ["Address", "Billing Address"]
        }
    },
    products: {
        requiredColumns: ["Item Name"],
        mappings: {
            name: ["Item Name", "Product Name"],
            code: ["Item Code", "Product Code", "SKU"],
            price: ["Sales Price", "Rate", "Price"],
            stock: ["Current Stock", "Stock Quantity", "Quantity"],
            hsn: ["HSN Code"]
        }
    },
    invoices: {
        requiredColumns: ["Bill No", "Party Name", "Total"], // Documentation only
        mappings: {
            invoiceNo: ["Invoice No", "Invoice No.", "Bill No", "Bill Number", "Voucher No", "Ref No"],
            customerName: ["Party Name", "Customer Name"], // Used for lookup
            date: ["Date", "Invoice Date", "Bill Date"],
            totalAmount: ["Amount", "Total Amount", "Invoice Amount", "Net Amount", "Grand Total", "Total"],
            paidAmount: ["Paid", "Received", "Payment Received"],
            balanceAmount: ["Balance", "Due", "Remaining Amount"],
            status: ["Payment Status", "Status"] // Optional, defaults to paid if missing or partial
        },
        // Invoices are complex; we typically assume one row per invoice in a summary sheet, 
        // or multiple rows for items. For simplicity, we'll assume a "Sales Report" style export 
        // which usually lists one invoice per row, or an "Item Wise" report.
        // We will start with "Sales Report" logic (Head-level).
        // Future: Handle item-level details.
    }
};
