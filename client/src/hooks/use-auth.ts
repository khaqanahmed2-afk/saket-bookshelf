import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { api } from "@/services/api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check backend session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await api.auth.me();
        setUser(data.user || null);
      } catch (error) {
        if (import.meta.env.DEV) console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const checkMobile = async (mobile: string) => {
    try {
      const data = await api.auth.checkMobile(mobile);
      return data; // Return full object { exists, verified, message }
    } catch {
      return { exists: false };
    }
  };

  const setupPin = async (mobile: string, pin: string) => {
    try {
      const data = await api.auth.setupPin(mobile, pin);
      if (data.success) {
        // Wait for session to settle
        await new Promise(r => setTimeout(r, 200));
        const meData = await api.auth.me();
        const authenticatedUser = meData.user || data.session;

        setUser(authenticatedUser);
        const redirectPath = (authenticatedUser as any)?.role === 'admin' ? '/admin' : '/dashboard';
        setLocation(redirectPath);
        return true;
      }
      return false;
    } catch (e: any) {
      toast({ title: "Setup Failed", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const loginWithPin = async (mobile: string, pin: string) => {
    try {
      const data = await api.auth.loginPin(mobile, pin);
      if (data.success) {
        // Wait for session to settle
        await new Promise(r => setTimeout(r, 200));
        const meData = await api.auth.me();
        const authenticatedUser = meData.user || data.session;

        setUser(authenticatedUser);
        const redirectPath = (authenticatedUser as any)?.role === 'admin' ? '/admin' : '/dashboard';
        setLocation(redirectPath);
        return true;
      }
      return false;
    } catch (e: any) {
      toast({ title: "Login Failed", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const changePin = async (oldPin: string, newPin: string) => {
    try {
      const data = await api.auth.changePin(oldPin, newPin);
      if (data.success) {
        toast({ title: "Success", description: "PIN changed successfully" });
        return true;
      }
      return false;
    } catch (e: any) {
      toast({ title: "Change Failed", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const signOut = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      if (import.meta.env.DEV) console.error("Logout error:", error);
    } finally {
      setUser(null);
      setLocation("/");
    }
  };

  return {
    user,
    loading,
    checkMobile,
    setupPin,
    loginWithPin,
    changePin,
    signOut,
    phone: user?.mobile || user?.phone
  };
}
