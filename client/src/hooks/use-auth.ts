import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { api } from "@shared/routes";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem("auth_session");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const checkMobile = async (mobile: string) => {
    const res = await fetch(api.auth.checkMobile.path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    const data = await res.json();
    return data.exists;
  };

  const setupPin = async (mobile: string, pin: string) => {
    try {
      const res = await fetch(api.auth.setupPin.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, pin }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("auth_session", JSON.stringify(data.session));
        setUser(data.session);
        setLocation("/dashboard");
        return true;
      }
      throw new Error(data.message);
    } catch (e: any) {
      toast({ title: "Setup Failed", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const loginWithPin = async (mobile: string, pin: string) => {
    try {
      const res = await fetch(api.auth.loginPin.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, pin }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("auth_session", JSON.stringify(data.session));
        setUser(data.session);
        setLocation("/dashboard");
        return true;
      }
      throw new Error(data.message);
    } catch (e: any) {
      toast({ title: "Login Failed", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const signOut = async () => {
    localStorage.removeItem("auth_session");
    setUser(null);
    setLocation("/");
  };

  return {
    user,
    loading,
    checkMobile,
    setupPin,
    loginWithPin,
    signOut,
    // Add compatibility for existing code
    phone: user?.mobile || user?.phone
  };
}
