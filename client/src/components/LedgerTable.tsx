import { useState } from "react";
import { format } from "date-fns";
import { Receipt, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";


interface LedgerProps {
    data: any[];
}

export function LedgerTable({ data }: LedgerProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = data?.slice(startIndex, startIndex + itemsPerPage) || [];

    if (!data || data.length === 0) {
        return <div className="px-6 py-20 text-center text-muted-foreground bg-white rounded-[2.5rem] shadow-xl border border-slate-100 font-medium">No transactions found</div>;
    }

    return (
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
            <CardHeader className="bg-white/50 border-b border-slate-100/50 pb-6 pt-8 px-8 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-2xl font-display font-black text-slate-800">
                    <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                        <Receipt className="w-6 h-6" />
                    </div>
                    Transaction History
                </CardTitle>
                <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-bold w-12 text-center text-slate-600">{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    {/* Desktop View */}
                    <table className="hidden md:table w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Voucher Description</th>
                                <th className="px-8 py-5 text-right">Debit</th>
                                <th className="px-8 py-5 text-right">Credit</th>
                                <th className="px-8 py-5 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50 bg-white/30">
                            <AnimatePresence mode="wait">
                                {currentItems.map((entry, idx) => (
                                    <motion.tr
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        className="hover:bg-primary/5 transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{format(new Date(entry.entryDate), 'dd MMM yyyy')}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">#{entry.id.toString().slice(-4)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-xl",
                                                    Number(entry.debit) > 0 ? "bg-orange-100 text-orange-600" : "bg-teal-100 text-teal-600"
                                                )}>
                                                    {Number(entry.debit) > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{entry.referenceNo || "General Entry"}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Transaction</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={cn(
                                                "font-black text-lg",
                                                Number(entry.debit) > 0 ? "text-orange-600" : "text-slate-200"
                                            )}>
                                                {Number(entry.debit) > 0 ? `₹${Number(entry.debit).toLocaleString()}` : "-"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={cn(
                                                "font-black text-lg",
                                                Number(entry.credit) > 0 ? "text-teal-600" : "text-slate-200"
                                            )}>
                                                {Number(entry.credit) > 0 ? `₹${Number(entry.credit).toLocaleString()}` : "-"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="bg-slate-800 text-white px-4 py-2 rounded-2xl inline-block font-display font-black shadow-lg">
                                                ₹{Number(entry.balance).toLocaleString()}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-100 bg-white">
                        {currentItems.map((entry) => (
                            <div key={entry.id} className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "p-3 rounded-2xl h-fit",
                                            Number(entry.debit) > 0 ? "bg-orange-100 text-orange-600" : "bg-teal-100 text-teal-600"
                                        )}>
                                            {Number(entry.debit) > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800">{format(new Date(entry.entryDate), 'dd MMM yyyy')}</p>
                                            <p className="text-xs text-muted-foreground font-bold">{entry.referenceNo || "No Reference"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs uppercase text-slate-400 font-black mb-1">Balance</p>
                                        <p className="font-black text-slate-800 text-lg">₹{Number(entry.balance).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <div className="flex-1 bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                                        <p className="text-[10px] uppercase text-slate-400 font-black mb-1">Debit (-)</p>
                                        <p className="text-md font-black text-orange-600">
                                            {Number(entry.debit) > 0 ? `₹${Number(entry.debit).toLocaleString()}` : "₹0"}
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                                        <p className="text-[10px] uppercase text-slate-400 font-black mb-1">Credit (+)</p>
                                        <p className="text-md font-black text-teal-600">
                                            {Number(entry.credit) > 0 ? `₹${Number(entry.credit).toLocaleString()}` : "₹0"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

