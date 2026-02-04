import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Phone, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { SkeletonLoader } from "@/components/LoadingStates";

interface VerificationRequest {
    requestId: string;
    customerId: string;
    shopName: string;
    temporaryMobile: string;
    actualMobile: string;
    requestedMobile: string;
    status: string;
    requestDate: string;
    adminNotes?: string;
}

export default function MobileVerification() {
    const { user, loading: authLoading } = useAuth();
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processing, setProcessing] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchPendingVerifications();
        }
    }, [user]);

    const fetchPendingVerifications = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/mobile-verifications", {
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                setRequests(data.requests || []);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch pending verifications",
                    variant: "destructive"
                });
            }
        } catch (error) {
            if (import.meta.env.DEV) console.error("Failed to fetch verifications:", error);
            toast({
                title: "Error",
                description: "Failed to fetch pending verifications",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (request: VerificationRequest) => {
        if (processing) return;

        setProcessing(request.requestId);
        try {
            const response = await fetch("/api/admin/mobile-verifications/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ requestId: request.requestId })
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Mobile Verified",
                    description: `Mobile number ${request.actualMobile} has been verified for ${request.shopName}`,
                    variant: "default"
                });
                await fetchPendingVerifications();
            } else {
                toast({
                    title: "Verification Failed",
                    description: data.message || "Failed to verify mobile number",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to verify mobile number",
                variant: "destructive"
            });
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || processing) return;

        setProcessing(selectedRequest.requestId);
        try {
            const response = await fetch("/api/admin/mobile-verifications/reject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    requestId: selectedRequest.requestId,
                    rejectionReason: rejectionReason || "Rejected by admin"
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Request Rejected",
                    description: `Verification request for ${selectedRequest.shopName} has been rejected`,
                    variant: "default"
                });
                setRejectDialogOpen(false);
                setRejectionReason("");
                setSelectedRequest(null);
                await fetchPendingVerifications();
            } else {
                toast({
                    title: "Rejection Failed",
                    description: data.message || "Failed to reject verification",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to reject verification",
                variant: "destructive"
            });
        } finally {
            setProcessing(null);
        }
    };

    if (authLoading || loading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-12">
                    <SkeletonLoader />
                </div>
            </Layout>
        );
    }

    if (!user || user.role !== 'admin') {
        return <Redirect to="/login" />;
    }

    return (
        <Layout>
            <div className="min-h-screen bg-secondary/30 pb-20">
                <div className="bg-gradient-to-r from-primary/10 via-secondary to-accent/10 pt-12 pb-20 px-4 border-b border-primary/5">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-display font-bold mb-4 text-slate-800 flex items-center gap-3">
                                    <Phone className="w-10 h-10 text-primary" />
                                    Mobile Verification Portal
                                </h1>
                                <p className="text-lg text-slate-500">
                                    Review and verify mobile number linking requests from users
                                </p>
                            </div>
                            <Button
                                onClick={fetchPendingVerifications}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-10 max-w-6xl">
                    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-bold text-slate-800">
                                        Pending Verifications
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        {requests.length} request{requests.length !== 1 ? 's' : ''} pending review
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-lg px-4 py-2">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {requests.length} Pending
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {requests.length === 0 ? (
                                <div className="py-20 text-center text-slate-400">
                                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                    <p className="text-lg font-medium">No pending verifications</p>
                                    <p className="text-sm mt-2">All mobile verification requests have been processed</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead className="font-bold">Shop Name</TableHead>
                                                <TableHead className="font-bold">Temporary Mobile</TableHead>
                                                <TableHead className="font-bold">Requested Mobile</TableHead>
                                                <TableHead className="font-bold">Request Date</TableHead>
                                                <TableHead className="font-bold">Status</TableHead>
                                                <TableHead className="font-bold text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.map((request) => (
                                                <TableRow key={request.requestId} className="hover:bg-slate-50/50">
                                                    <TableCell className="font-medium">{request.shopName}</TableCell>
                                                    <TableCell>
                                                        <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                                                            {request.temporaryMobile}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="bg-blue-50 px-2 py-1 rounded text-sm text-blue-700">
                                                            {request.actualMobile || request.requestedMobile}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {format(new Date(request.requestDate), 'dd MMM yyyy HH:mm')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            Pending
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleVerify(request)}
                                                                disabled={processing === request.requestId}
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                            >
                                                                {processing === request.requestId ? (
                                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                        Verify
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => {
                                                                    setSelectedRequest(request);
                                                                    setRejectDialogOpen(true);
                                                                }}
                                                                disabled={processing === request.requestId}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Reject Dialog */}
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogContent className="sm:max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle>Reject Verification Request</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to reject the mobile verification request for{" "}
                                <strong>{selectedRequest?.shopName}</strong>?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="rejectionReason">Rejection Reason (Optional)</Label>
                                <Textarea
                                    id="rejectionReason"
                                    placeholder="Enter reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setRejectDialogOpen(false);
                                    setRejectionReason("");
                                    setSelectedRequest(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={processing === selectedRequest?.requestId}
                            >
                                {processing === selectedRequest?.requestId ? "Rejecting..." : "Reject Request"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
