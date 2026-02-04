import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { api } from "@/services/api";

export function useDashboardData(filters?: Record<string, any>) {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard", user?.mobile, filters],
    queryFn: () => api.dashboard.getData(filters),
    enabled: !!user,
  });

  return {
    customer: data?.customer || null,
    ledger: data?.ledger || [],
    payments: data?.payments || [],
    invoices: data?.invoices || [],
    monthly: data?.monthly || [],
    summary: {
      totalPurchases: Number(data?.summary?.totalPurchases || 0),
      totalPaid: Number(data?.summary?.totalPaid || 0),
      currentBalance: Number(data?.summary?.currentBalance || 0),
      openingBalance: Number(data?.summary?.openingBalance || 0),
    },
    isLoading: isLoading,
    refetch,
  };
}
