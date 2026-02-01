import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isFormData = data instanceof FormData;
  const headers: Record<string, string> = {};

  if (!isFormData && data) {
    headers["Content-Type"] = "application/json";
  }

  const body = isFormData
    ? (data as BodyInit)
    : (data ? JSON.stringify(data) : undefined);

  const res = await fetch(url, {
    method,
    headers,
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      // Use VITE_API_URL if available, otherwise empty for relative URLs
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const url = queryKey.join("/") as string;
      const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

      const res = await fetch(fullUrl, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);

      // Safe JSON parsing with content-type validation
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await res.text();
        throw new Error(
          `Expected JSON but received ${contentType || 'unknown'}. ` +
          `Response: ${text.substring(0, 100)}`
        );
      }

      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
