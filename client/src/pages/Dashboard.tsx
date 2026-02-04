import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardData } from "@/hooks/use-dashboard";
import { StatCard } from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Wallet, ShoppingCart, Receipt, Calendar, Lock, LogOut, FileText, Download, TrendingUp, TrendingDown, ArrowUpRight, Search, Filter, Upload } from "lucide-react";
import { format, subMonths, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns";
import { DashboardCharts } from "@/components/DashboardCharts";
import { LedgerTable } from "@/components/LedgerTable";
import { SkeletonLoader } from "@/components/LoadingStates";
import { motion, AnimatePresence } from "framer-motion";
import { AccountInfoCard } from "@/components/dashboard/AccountInfoCard";
import { generatePDFStatement, generateExcelStatement } from "@/utils/statement-generator";
import { ShinyButton } from "@/components/ui/shiny-button";
import { SmartUpload } from "@/components/SmartUpload";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettleInvoiceModal } from "@/components/SettleInvoiceModal";
import { MobileVerificationBanner } from "@/components/MobileVerificationBanner";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"monthly" | "yearly" | "all">("all"); // Default to "all" to show all invoices
  const { customer, ledger, invoices, payments, summary, monthly, isLoading, refetch } = useDashboardData({ period: viewMode });
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Filter Invoices Logic
  const displayInvoices = useMemo(() => {
    let data = invoices || [];

    // Filter
    if (invoiceSearch) {
      const term = invoiceSearch.trim().toLowerCase();
      data = data.filter((inv: any) => {
        const invNo = String(inv.invoiceNo || "").toLowerCase();
        const amt = String(inv.totalAmount || inv.amount || 0);

        return invNo.includes(term) || amt.includes(term);
      });
    }
    return data;
  }, [invoices, invoiceSearch]);

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <SkeletonLoader />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  // Invoice / Bill Merging Logic



  return (
    <Layout>
      <div className="bg-secondary/30 min-h-screen pb-20 overflow-x-hidden">
        {/* Mobile Verification Banner */}
        <div className="container mx-auto px-4 pt-6">
          <MobileVerificationBanner />
        </div>

        {/* Top Header & Account Info - PASTEL THEME */}
        <div className="bg-gradient-to-r from-primary/10 via-secondary to-accent/10 pt-10 pb-20 px-4 border-b border-primary/5">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-display font-bold text-slate-800">
                  Welcome, <span className="text-primary">{customer?.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-slate-500 font-medium">Here is your financial overview.</p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                  <DialogTrigger asChild>
                    <ShinyButton className="w-full sm:w-auto min-h-[44px] bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
                      <Upload className="w-4 h-4 mr-2" /> Smart Import
                    </ShinyButton>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-6 border-b bg-slate-50/50">
                        <DialogTitle className="text-xl font-bold text-slate-800">Smart Data Import</DialogTitle>
                        <DialogDescription>
                          Upload any Excel file. We'll verify it, create backups, and update your ledger automatically.
                        </DialogDescription>
                      </div>
                      <div className="p-6">
                        <SmartUpload onComplete={() => { refetch(); setTimeout(() => setIsImportOpen(false), 2000); }} />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <ShinyButton onClick={() => generatePDFStatement({
                  customer,
                  ledger: ledger,
                  openingBalance: summary.openingBalance,
                  closingBalance: summary.currentBalance
                })} className="w-full sm:w-auto min-h-[44px] bg-white border-primary/20 text-slate-700 hover:bg-primary/5 shadow-sm">
                  <Download className="w-4 h-4 mr-2 text-primary" /> Statement (PDF)
                </ShinyButton>
                <ShinyButton onClick={() => generateExcelStatement({
                  customer,
                  ledger: ledger,
                  openingBalance: summary.openingBalance,
                  closingBalance: summary.currentBalance
                })} className="w-full sm:w-auto min-h-[44px] bg-white border-primary/20 text-slate-700 hover:bg-primary/5 shadow-sm">
                  <FileText className="w-4 h-4 mr-2 text-green-600" /> Excel
                </ShinyButton>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Left Sidebar: Account Info */}
            <div className="lg:col-span-1 space-y-6">
              <AccountInfoCard customer={customer} />

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <button onClick={() => setLocation("/change-pin")} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors text-slate-600 font-medium text-sm border border-transparent hover:border-primary/10">
                    <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Change PIN</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => signOut()} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition-colors text-red-500 font-medium text-sm border border-transparent hover:border-red-100">
                    <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</span>
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Right Content: Summary & Tabs */}
            <div className="lg:col-span-3 space-y-8">

              {/* View Toggle */}
              <div className="flex justify-end">
                <div className="bg-white p-1 rounded-2xl shadow-sm border border-primary/10 inline-flex">
                  <button
                    onClick={() => setViewMode("all")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'all' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:bg-secondary'}`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setViewMode("monthly")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'monthly' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:bg-secondary'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setViewMode("yearly")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'yearly' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:bg-secondary'}`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  title="Opening Balance"
                  value={`₹${summary.openingBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                  icon={Calendar}
                  color="slate"
                  delay={0}
                />
                <StatCard
                  title="Total Purchase"
                  value={`₹${summary.totalPurchases.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                  icon={TrendingUp}
                  color="orange"
                  delay={100}
                />
                <StatCard
                  title="Total Paid"
                  value={`₹${summary.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                  icon={TrendingDown}
                  color="teal"
                  delay={200}
                />
                <StatCard
                  title="Closing Balance"
                  value={`₹${summary.currentBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                  icon={Wallet}
                  color={summary.currentBalance > 0 ? 'red' : 'green'}
                  delay={300}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6">
                <DashboardCharts data={monthly} type="purchase" />
              </div>

              {/* Main Tabs */}
              <Tabs defaultValue="invoices" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                  <TabsList className="bg-white p-1.5 h-auto rounded-2xl border border-primary/10 shadow-sm w-full sm:w-auto grid grid-cols-3">
                    <TabsTrigger value="invoices" className="rounded-xl py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Invoices</TabsTrigger>
                    <TabsTrigger value="payments" className="rounded-xl py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Payments</TabsTrigger>
                    <TabsTrigger value="ledger" className="rounded-xl py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Ledger</TabsTrigger>
                  </TabsList>

                  {/* Search for Invoices */}
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search invoices..."
                      className="pl-9 w-full sm:w-64 bg-white border-primary/10 rounded-xl focus:ring-primary/20"
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                    />
                  </div>
                </div>

                <TabsContent value="invoices" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayInvoices.map((inv: any, idx: number) => {
                      const amount = Number(inv.totalAmount || 0);
                      const paid = Number(inv.paidAmount || 0);
                      const due = Number(inv.dueAmount || 0);
                      const date = inv.date;
                      const number = inv.invoiceNo || "N/A";
                      const status = inv.status;

                      return (
                        <Card key={idx} className="border-primary/5 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all group bg-white rounded-[1.5rem] overflow-hidden">
                          <CardContent className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-2xl ${status === 'unpaid' ? 'bg-red-50 text-red-500' : (status === 'partial' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-600')}`}>
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">#{number}</p>
                                <p className="text-sm text-slate-500">{format(new Date(date), 'dd MMM yyyy')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="font-bold text-lg text-slate-800">₹{amount.toLocaleString()}</p>
                                <div className="flex flex-col items-end gap-1 mt-1">
                                  <Badge variant={status === 'paid' ? 'default' : (status === 'partial' ? 'outline' : 'destructive')} className="capitalize rounded-lg px-2 py-0.5">
                                    {status}
                                  </Badge>
                                  {status !== 'paid' && (
                                    <p className="text-[10px] font-bold text-slate-400">
                                      Due: ₹{due.toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {status !== 'paid' && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="rounded-xl h-10 px-4 font-bold bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-none border-none"
                                  onClick={() => setSelectedInvoice(inv)}
                                >
                                  Settle
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {displayInvoices.length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-[2rem] border border-dashed border-primary/10">
                        No invoices found
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="payments">
                  <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                    <CardContent className="p-0">
                      <div className="divide-y divide-primary/5">
                        {Array.isArray(payments) && payments.map((payment: any) => (
                          <div key={payment.id} className="flex items-center justify-between p-6 hover:bg-secondary/30 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                                <Wallet className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{payment.mode}</p>
                                <p className="text-sm text-slate-500 mr-2">
                                  {format(new Date(payment.paymentDate), 'dd MMM yyyy')} • Ref: {payment.referenceNo || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">+₹{Number(payment.amount).toLocaleString()}</p>
                              <p className="text-xs text-primary/70 font-medium bg-primary/5 px-2 py-0.5 rounded-full inline-block mt-1">
                                Received
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ledger">
                  <LedgerTable data={ledger} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <SettleInvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />
      </div>
    </Layout>
  );
}

