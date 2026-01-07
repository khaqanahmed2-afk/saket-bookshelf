import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LedgerEntry, Bill, Payment, Customer } from "@shared/schema";
import { useAuth } from "./use-auth";

export function useDashboardData() {
  const { user } = useAuth();
  
  // Note: We assume the user's phone number matches the 'mobile' field in the 'customers' table.
  // In a real RLS setup, Supabase would filter this automatically based on auth.uid() 
  // if the customer table has a link to auth.users. 
  // For this MVP, we'll fetch the customer profile first based on the verified phone number.

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ["customer", user?.phone],
    queryFn: async () => {
      if (!user?.phone) return null;
      // Note: phone in auth is typically E.164 (e.g., +919876543210)
      // Ensure DB mobile format matches or normalize it.
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("mobile", user.phone) // Match by phone since that's our auth method
        .single();
        
      if (error) throw error;
      return data as Customer;
    },
    enabled: !!user?.phone,
  });

  const customerId = customer?.id;

  const { data: ledger, isLoading: isLoadingLedger } = useQuery({
    queryKey: ["ledger", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ledger")
        .select("*")
        .eq("customer_id", customerId)
        .order("entry_date", { ascending: false });
      if (error) throw error;
      return data as LedgerEntry[];
    },
    enabled: !!customerId,
  });

  const { data: bills, isLoading: isLoadingBills } = useQuery({
    queryKey: ["bills", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq("customer_id", customerId)
        .order("bill_date", { ascending: false });
      if (error) throw error;
      return data as Bill[];
    },
    enabled: !!customerId,
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["payments", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("customer_id", customerId)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!customerId,
  });

  // Calculate totals
  const totalDebit = ledger?.reduce((sum, item) => sum + Number(item.debit), 0) || 0;
  const totalCredit = ledger?.reduce((sum, item) => sum + Number(item.credit), 0) || 0;
  const currentBalance = ledger?.[0]?.balance || 0; // Assuming sorted by date descending, latest entry has current balance
  // Alternatively, balance = totalDebit - totalCredit if logic dictates. 
  // But usually ledger stores running balance. Let's stick to the latest balance entry for accuracy with Tally.

  return {
    customer,
    ledger,
    bills,
    payments,
    summary: {
      totalPurchases: totalDebit,
      totalPaid: totalCredit,
      currentBalance: Number(currentBalance),
    },
    isLoading: isLoadingCustomer || isLoadingLedger || isLoadingBills || isLoadingPayments,
  };
}
