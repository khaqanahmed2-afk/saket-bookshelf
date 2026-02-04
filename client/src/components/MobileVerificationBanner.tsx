import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Phone, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface MobileVerificationStatus {
    isVerified: boolean;
    hasTemporaryMobile: boolean;
    hasActualMobile: boolean;
    temporaryMobile?: string;
    actualMobile?: string;
    currentMobile?: string;
    message?: string;
}

export function MobileVerificationBanner() {
    const [status, setStatus] = useState<MobileVerificationStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [mobile, setMobile] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        checkVerificationStatus();
    }, []);

    const checkVerificationStatus = async () => {
        try {
            const response = await fetch("/api/mobile/verification-status", {
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch (error) {
            if (import.meta.env.DEV) console.error("Failed to check verification status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMobile = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate mobile number (10 digits starting with 6-9)
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobile)) {
            toast({
                title: "Invalid Mobile Number",
                description: "Mobile number must be 10 digits starting with 6, 7, 8, or 9.",
                variant: "destructive"
            });
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch("/api/mobile/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ mobile })
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Mobile Number Added",
                    description: "Your mobile number has been added and is pending admin verification.",
                    variant: "default"
                });
                setIsDialogOpen(false);
                setMobile("");
                await checkVerificationStatus();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to add mobile number",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to add mobile number",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;
    if (!status || status.isVerified) return null;

    return (
        <>
            <Alert className="mb-6 border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">Mobile Number Not Linked</AlertTitle>
                <AlertDescription className="text-orange-700 mt-2">
                    {status.message || "Your mobile number is not linked with your account. Please add your mobile number to continue."}
                    {status.hasTemporaryMobile && (
                        <div className="mt-2 text-sm">
                            <strong>Temporary Mobile:</strong> {status.temporaryMobile}
                        </div>
                    )}
                </AlertDescription>
                <div className="mt-4">
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        <Phone className="w-4 h-4 mr-2" />
                        Add Mobile Number
                    </Button>
                </div>
            </Alert>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Add Mobile Number</DialogTitle>
                        <DialogDescription>
                            Enter your mobile number to link it with your account. Your request will be reviewed by an admin.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddMobile} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input
                                id="mobile"
                                type="tel"
                                placeholder="9876543210"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                required
                                pattern="[6-9]\d{9}"
                                maxLength={10}
                            />
                            <p className="text-xs text-muted-foreground">
                                10 digits starting with 6, 7, 8, or 9
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setMobile("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Submitting..." : "Submit for Verification"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
