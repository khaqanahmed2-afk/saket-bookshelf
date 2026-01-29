import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export default function ChangePin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPin !== confirmPin) {
      toast({ title: "Validation Error", description: "New PINs do not match", variant: "destructive" });
      return;
    }

    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      toast({ title: "Validation Error", description: "PIN must be 4 digits", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const mobile = user.mobile || user.phone;
      const res = await fetch(api.auth.changePin.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, oldPin, newPin }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: "PIN changed successfully" });
        setLocation("/dashboard");
      } else {
        throw new Error(data.message || "Failed to change PIN");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50 py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="text-center pt-8 pb-6">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-primary">
                <Lock className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-display font-bold">Change PIN</CardTitle>
              <CardDescription>Update your 4-digit security PIN</CardDescription>
            </CardHeader>

            <CardContent className="pb-8 px-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="oldPin">Current PIN</Label>
                  <Input 
                    id="oldPin"
                    type={showPin ? "text" : "password"}
                    placeholder="****"
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value)}
                    className="h-12 rounded-xl text-center tracking-widest"
                    maxLength={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPin">New PIN</Label>
                  <Input 
                    id="newPin"
                    type={showPin ? "text" : "password"}
                    placeholder="****"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="h-12 rounded-xl text-center tracking-widest"
                    maxLength={4}
                    required
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="confirmPin">Confirm New PIN</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPin"
                      type={showPin ? "text" : "password"}
                      placeholder="****"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      className="h-12 rounded-xl text-center tracking-widest"
                      maxLength={4}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <ShinyButton type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update PIN"}
                </ShinyButton>
                
                <button 
                  type="button"
                  onClick={() => setLocation("/dashboard")}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cancel
                </button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}