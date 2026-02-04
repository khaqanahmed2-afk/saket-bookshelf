import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Store, MapPin, ChevronRight, CheckCircle2, Phone } from "lucide-react";
import { api } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

interface MobileRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMobile?: string;
}

export function MobileRegistrationModal({ isOpen, onClose, initialMobile }: MobileRegistrationModalProps) {
    const [step, setStep] = useState<"search" | "confirm" | "success">("search");
    const [searchQuery, setSearchQuery] = useState("");
    const [shops, setShops] = useState<any[]>([]);
    const [selectedShop, setSelectedShop] = useState<any>(null);
    const [mobile, setMobile] = useState(initialMobile || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                try {
                    const results = await api.auth.searchShops(searchQuery);
                    setShops(results);
                } catch (error) {
                    if (import.meta.env.DEV) console.error("Search failed", error);
                }
            } else {
                setShops([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectShop = (shop: any) => {
        setSelectedShop(shop);
        setStep("confirm");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.auth.requestMobileLink({
                customerId: selectedShop.id,
                mobile
            });
            if (res.success) {
                setMessage(res.message);
                setStep("success");
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
                <div className="bg-primary/5 p-8 pb-12">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-800">
                            {step === "success" ? "Request Sent!" : "Register Mobile"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            {step === "search" && "Search for your shop name to link your mobile number."}
                            {step === "confirm" && "Confirm your shop details and enter your 10-digit mobile number."}
                            {step === "success" && "Your request is being reviewed."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 -mt-8 bg-white rounded-t-[2.5rem] min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {step === "search" && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <Input
                                        placeholder="Search shop name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                    {shops.map((shop) => (
                                        <button
                                            key={shop.id}
                                            onClick={() => handleSelectShop(shop)}
                                            className="w-full text-left p-4 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-100 p-2 rounded-xl group-hover:bg-white transition-colors">
                                                    <Store className="w-5 h-5 text-slate-500 group-hover:text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{shop.name}</p>
                                                    <div className="flex items-center text-xs text-slate-400 font-medium">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {shop.address || "Area not specified"}
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                    {searchQuery.length >= 2 && shops.length === 0 && (
                                        <div className="py-12 text-center text-slate-400 font-medium">
                                            No shops found matching "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === "confirm" && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-primary/5 p-4 rounded-2xl flex items-center gap-3">
                                    <Store className="w-10 h-10 text-primary bg-white p-2 rounded-xl shadow-sm" />
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-primary/50">Selected Shop</p>
                                        <p className="font-black text-slate-800 text-lg leading-tight">{selectedShop.name}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Your Mobile Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <Input
                                                type="tel"
                                                maxLength={10}
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                placeholder="98765 43210"
                                                className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-black text-xl tracking-wider focus:ring-2 focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold px-1">Must be a 10-digit number starting with 6, 7, 8, or 9.</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setStep("search")}
                                            className="h-14 rounded-2xl font-bold text-slate-500"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 h-14 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Sending..." : "Request Approval"}
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8 space-y-6"
                            >
                                <div className="bg-green-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <div className="space-y-2">
                                    <p className="font-black text-2xl text-slate-800">Success!</p>
                                    <p className="text-slate-500 font-medium px-4">
                                        {message}
                                    </p>
                                </div>
                                <Button
                                    onClick={onClose}
                                    className="w-full h-14 rounded-2xl bg-slate-800 text-white font-black"
                                >
                                    Finshed
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
