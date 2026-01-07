import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithPhone = async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });
      if (error) throw error;
      toast({
        title: "OTP Sent!",
        description: `We've sent a code to ${phone}`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) throw error;
      
      if (data.session) {
        toast({
          title: "Welcome Back!",
          description: "Successfully logged in.",
        });
        setLocation("/dashboard");
      }
      return true;
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
    toast({
      title: "Signed Out",
      description: "Come back soon!",
    });
  };

  return {
    user,
    session,
    loading,
    loginWithPhone,
    verifyOtp,
    signOut,
  };
}
