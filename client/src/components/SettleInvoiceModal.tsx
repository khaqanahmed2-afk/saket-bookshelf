import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Banknote, X, Check, Calendar as CalendarIcon, CreditCard, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

interface SettleInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: {
        id: string;
        invoiceNo: string;
        totalAmount: number;
        dueAmount: number;
    } | null;
}

export function SettleInvoiceModal({ isOpen, onClose, invoice }: SettleInvoiceModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [amount, setAmount] = useState<string>("");
    const [paymentDate, setPaymentDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [paymentMode, setPaymentMode] = useState<string>("Cash");
    const [referenceNo, setReferenceNo] = useState<string>("");

    // Reset form when invoice changes
    useState(() => {
        if (invoice) {
            setAmount(invoice.dueAmount.toString());
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/admin/settle", data);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Payment Recorded",
                description: `Successfully settled ₹${amount} for invoice #${invoice?.invoiceNo}`,
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to record payment",
                variant: "destructive",
            });
        }
    });

    if (!invoice) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            invoiceId: invoice.id,
            amount: Number(amount),
            paymentDate,
            paymentMode,
            referenceNo
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl">
                <div className="bg-primary/5 p-6 pb-20">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
                            <div className="bg-primary/20 p-2 rounded-xl text-primary">
                                <Banknote className="w-6 h-6" />
                            </div>
                            Settle Invoice
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Record a payment for invoice <span className="text-primary font-bold">#{invoice.invoiceNo}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="-mt-14 p-6 pt-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 space-y-6"
                    >
                        <form id="settle-form" onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-xs font-black uppercase tracking-wider text-slate-400">Payment Amount</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-10 h-14 bg-slate-50 border-none rounded-2xl text-xl font-black focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="0.00"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setAmount(invoice.dueAmount.toString())}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-2 py-1 rounded-lg hover:bg-primary/20 transition-all"
                                    >
                                        Set Due
                                    </button>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold text-slate-400">Total: ₹{invoice.totalAmount.toLocaleString()}</span>
                                    <span className="text-[10px] font-bold text-red-400">Remaining: ₹{invoice.dueAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-xs font-black uppercase tracking-wider text-slate-400">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="h-12 bg-slate-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Mode</Label>
                                    <Select value={paymentMode} onValueChange={setPaymentMode}>
                                        <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold">
                                            <SelectValue placeholder="Mode" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="UPI">UPI / GPay</SelectItem>
                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="Cheque">Cheque</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ref" className="text-xs font-black uppercase tracking-wider text-slate-400">Reference No (Optional)</Label>
                                <Input
                                    id="ref"
                                    value={referenceNo}
                                    onChange={(e) => setReferenceNo(e.target.value)}
                                    className="h-12 bg-slate-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary/20"
                                    placeholder="TXN-1234..."
                                />
                            </div>
                        </form>
                    </motion.div>
                </div>

                <DialogFooter className="p-6 pt-0 bg-white">
                    <div className="flex w-full gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-2xl border-primary/10 hover:bg-slate-50 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            form="settle-form"
                            type="submit"
                            className="flex-[2] h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? "Recording..." : (
                                <>
                                    Confirm Payment
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
