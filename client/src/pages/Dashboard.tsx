import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardData } from "@/hooks/use-dashboard";
import { StatCard } from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Wallet, ShoppingCart, Receipt, ArrowDownToLine, Loader2, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { customer, ledger, bills, payments, summary, isLoading } = useDashboardData();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const downloadBillPDF = (bill: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text("Saket Pustak Kendra", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("Main Market, Rudauli, Ayodhya", 105, 30, { align: "center" });
    doc.text("Bill Receipt", 105, 40, { align: "center" });
    
    // Details
    doc.setFontSize(10);
    doc.text(`Bill No: ${bill.billNo}`, 14, 55);
    doc.text(`Date: ${format(new Date(bill.billDate), 'dd MMM yyyy')}`, 14, 60);
    doc.text(`Customer: ${customer?.name}`, 14, 65);
    
    // Line
    doc.setLineWidth(0.5);
    doc.line(14, 70, 196, 70);
    
    // Content (Mocked items since schema doesn't have bill items, just total)
    // In real app, fetch bill items
    const tableData = [
      ["Total Amount", `₹${bill.amount}`]
    ];
    
    autoTable(doc, {
      startY: 75,
      head: [['Description', 'Amount']],
      body: tableData,
      theme: 'grid',
    });
    
    // Footer
    doc.text("Thank you for your business!", 105, doc.lastAutoTable.finalY + 20, { align: "center" });
    
    doc.save(`Bill_${bill.billNo}.pdf`);
  };

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen pb-20">
        <div className="bg-primary/5 pb-20 pt-10 px-4">
          <div className="container mx-auto">
            <h1 className="text-3xl font-display font-bold mb-2">Hello, {customer?.name || "Customer"}!</h1>
            <p className="text-muted-foreground">Here is your financial overview.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Purchase" 
              value={`₹${summary.totalPurchases.toLocaleString()}`} 
              icon={ShoppingCart} 
              color="orange" 
              delay={0} 
            />
            <StatCard 
              title="Total Paid" 
              value={`₹${summary.totalPaid.toLocaleString()}`} 
              icon={Wallet} 
              color="green" 
              delay={100} 
            />
            <StatCard 
              title="Pending Balance" 
              value={`₹${summary.currentBalance.toLocaleString()}`} 
              icon={Receipt} 
              color="blue" 
              delay={200} 
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="ledger" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-14 bg-white shadow-sm rounded-2xl p-1.5">
              <TabsTrigger value="ledger" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-medium">Ledger</TabsTrigger>
              <TabsTrigger value="bills" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-medium">Bills</TabsTrigger>
              <TabsTrigger value="payments" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-medium">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="ledger" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="border-none shadow-md rounded-3xl overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Receipt className="w-5 h-5 text-primary" />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-muted-foreground font-medium uppercase text-xs">
                        <tr>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Voucher No</th>
                          <th className="px-6 py-4 text-right text-orange-600">Debit</th>
                          <th className="px-6 py-4 text-right text-green-600">Credit</th>
                          <th className="px-6 py-4 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {ledger?.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium">{format(new Date(entry.entryDate), 'dd MMM yyyy')}</td>
                            <td className="px-6 py-4 text-muted-foreground">{entry.voucherNo || "-"}</td>
                            <td className="px-6 py-4 text-right text-orange-600 font-medium">
                              {Number(entry.debit) > 0 ? `₹${Number(entry.debit).toLocaleString()}` : "-"}
                            </td>
                            <td className="px-6 py-4 text-right text-green-600 font-medium">
                              {Number(entry.credit) > 0 ? `₹${Number(entry.credit).toLocaleString()}` : "-"}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-700">
                              ₹{Number(entry.balance).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        {(!ledger || ledger.length === 0) && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No transactions found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bills" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bills?.map((bill) => (
                  <Card key={bill.id} className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{format(new Date(bill.billDate), 'dd MMM yyyy')}</span>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Bill No</p>
                        <p className="text-lg font-bold">#{bill.billNo}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="text-2xl font-display font-bold text-slate-800">₹{Number(bill.amount).toLocaleString()}</p>
                        </div>
                        <button 
                          onClick={() => downloadBillPDF(bill)}
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors"
                        >
                          <ArrowDownToLine className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!bills || bills.length === 0) && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">No bills found</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="border-none shadow-md rounded-3xl overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Wallet className="w-5 h-5 text-green-600" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {payments?.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{payment.mode}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(payment.paymentDate), 'dd MMM yyyy')} • Ref: {payment.referenceNo || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">+₹{Number(payment.amount).toLocaleString()}</p>
                          <p className="text-xs text-green-600/70 font-medium bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            Received
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!payments || payments.length === 0) && (
                      <div className="p-12 text-center text-muted-foreground">No payments found</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
