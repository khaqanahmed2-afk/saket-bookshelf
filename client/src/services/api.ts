import { api as apiContract } from "@shared/routes";
import { TallyUploadResponse } from "@shared/schema";

/**
 * Centralized API Service
 * Handles all communication with the Backend-for-Frontend (BFF).
 * Ensures consistent error handling and type safety.
 */

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

    const res = await fetch(fullUrl, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        credentials: "include", // Ensure cookies are sent
    });

    // Safe JSON parsing with content-type validation
    const contentType = res.headers.get("content-type");

    if (!res.ok) {
        // Check if response is JSON before parsing
        if (contentType?.includes("application/json")) {
            const error = await res.json().catch(() => ({ message: "Unknown error" }));
            throw new Error(error.message || `API error: ${res.status}`);
        } else {
            // HTML or other non-JSON response - typically firebase.json misconfiguration
            const text = await res.text();
            if (text.includes("<!DOCTYPE") || text.includes("<html")) {
                throw new Error(
                    `❌ API route returned HTML instead of JSON.\n` +
                    `This usually means Firebase Hosting is serving index.html for API routes.\n` +
                    `Check firebase.json rewrites and ensure VITE_API_URL is set correctly.\n` +
                    `Attempted URL: ${fullUrl}`
                );
            }
            throw new Error(`API error: ${res.status} - ${text.substring(0, 100)}`);
        }
    }

    // Verify successful response is JSON
    if (!contentType?.includes("application/json")) {
        const text = await res.text();
        throw new Error(
            `Expected JSON but received ${contentType || 'unknown type'}.\n` +
            `Response preview: ${text.substring(0, 100)}\n` +
            `URL: ${fullUrl}`
        );
    }

    return res.json();
}

export const api = {
    auth: {
        checkMobile: (mobile: string) =>
            fetchJson<{ exists: boolean, verified?: boolean, message?: string }>(apiContract.auth.checkMobile.path, {
                method: "POST",
                body: JSON.stringify({ mobile }),
            }),

        searchShops: (query: string) =>
            fetchJson<any[]>(`/api/auth/search-shops?q=${encodeURIComponent(query)}`),

        requestMobileLink: (data: { customerId: string, mobile: string }) =>
            fetchJson<{ success: boolean, message: string }>("/api/auth/request-mobile-link", {
                method: "POST",
                body: JSON.stringify(data),
            }),

        setupPin: (mobile: string, pin: string) =>
            fetchJson<any>(apiContract.auth.setupPin.path, {
                method: "POST",
                body: JSON.stringify({ mobile, pin }),
            }),

        loginPin: (mobile: string, pin: string) =>
            fetchJson<any>(apiContract.auth.loginPin.path, {
                method: "POST",
                body: JSON.stringify({ mobile, pin }),
            }),

        changePin: (oldPin: string, newPin: string) =>
            fetchJson<{ success: boolean }>(apiContract.auth.changePin.path, {
                method: "POST",
                body: JSON.stringify({ oldPin, newPin }),
            }),

        me: () => fetchJson<{ user: any }>(apiContract.auth.me.path),

        logout: () => fetchJson<{ success: boolean }>(apiContract.auth.logout.path, {
            method: "POST",
        }),
    },

    dashboard: {
        getData: (params?: Record<string, any>) => {
            const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
            return fetchJson<any>(`/api/dashboard${query}`);
        },
    },

    admin: {
        uploadTally: (file: File) => {
            const formData = new FormData();
            formData.append("file", file);

            const baseUrl = import.meta.env.VITE_API_URL || "";
            const fullUrl = `${baseUrl}/api/admin/upload-tally`;

            return fetch(fullUrl, {
                method: "POST",
                body: formData,
                credentials: "include",
            }).then(async (res) => {
                if (!res.ok) {
                    const error = await res.json().catch(() => ({ message: "Upload failed" }));
                    throw new Error(error.message || "Upload failed");
                }
                return res.json() as Promise<TallyUploadResponse>;
            });
        },

        uploadVyapar: (file: File, type: string = "invoices") => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", type);

            const baseUrl = import.meta.env.VITE_API_URL || "";
            const fullUrl = `${baseUrl}/api/import/upload`;

            return fetch(fullUrl, {
                method: "POST",
                body: formData,
                credentials: "include",
            }).then(async (res) => {
                if (!res.ok) {
                    const error = await res.json().catch(() => ({ message: "Upload failed" }));
                    throw new Error(error.message || "Upload failed");
                }
                return res.json();
            });
        },

        syncImport: (id: string) => {
            const baseUrl = import.meta.env.VITE_API_URL || "";
            // Using helper directly if path allows, assuming fetchJson handles full url if provided or relative
            // The fetchJson helper defined in this file handles standard relative paths.
            // But here we are constructing fullUrl manually in other methods? 
            // fetchJson adds baseUrl if not starting with http.
            // So we can just pass partial path if we want, or full.
            // Let's use relative path for fetchJson to be consistent.
            return fetchJson<any>(`/api/import/sync/${id}`, {
                method: "POST"
            });
        },
    },
};
