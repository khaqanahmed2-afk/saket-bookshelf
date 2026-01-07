import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Phone, Lock } from "lucide-react";

export default function Login() {
  const { loginWithPhone, verifyOtp } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsSubmitting(true);
    // Simple validation/formatting could happen here
    const success = await loginWithPhone(phone);
    setIsSubmitting(false);
    if (success) setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsSubmitting(true);
    await verifyOtp(phone, otp);
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-cream/50 relative overflow-hidden py-12">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md px-4 relative z-10"
        >
          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm">
            <div className="h-2 bg-gradient-to-r from-primary to-orange-400 w-full" />
            <CardHeader className="text-center pt-8 pb-6">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-primary">
                {step === "phone" ? <Phone className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
              </div>
              <CardTitle className="text-2xl font-display font-bold">
                {step === "phone" ? "Welcome Back!" : "Enter OTP"}
              </CardTitle>
              <CardDescription className="text-base">
                {step === "phone" 
                  ? "Enter your mobile number to access your dashboard" 
                  : `We sent a code to ${phone}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-8 px-8">
              {step === "phone" ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 text-lg"
                      required
                    />
                  </div>
                  <ShinyButton 
                    type="submit" 
                    className="w-full h-12 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send OTP"}
                  </ShinyButton>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input 
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 text-lg tracking-widest text-center font-mono"
                      maxLength={6}
                      required
                    />
                  </div>
                  <ShinyButton 
                    type="submit" 
                    className="w-full h-12 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Verifying..." : "Verify & Login"}
                  </ShinyButton>
                  <button 
                    type="button"
                    onClick={() => setStep("phone")}
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
