import { z } from "zod";

export const api = {
  auth: {
    checkMobile: {
      method: "POST" as const,
      path: "/api/auth/check-mobile",
      input: z.object({ mobile: z.string() }),
      responses: {
        200: z.object({ exists: z.boolean() }),
      },
    },
    setupPin: {
      method: "POST" as const,
      path: "/api/auth/setup-pin",
      input: z.object({ mobile: z.string(), pin: z.string().length(4) }),
      responses: {
        200: z.object({ success: z.boolean(), session: z.any() }),
        400: z.object({ message: z.string() }),
      },
    },
    loginPin: {
      method: "POST" as const,
      path: "/api/auth/login-pin",
      input: z.object({ mobile: z.string(), pin: z.string().length(4) }),
      responses: {
        200: z.object({ success: z.boolean(), session: z.any() }),
        401: z.object({ message: z.string() }),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/auth/me",
      responses: {
        200: z.object({ user: z.any().nullable() }),
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/auth/logout",
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    changePin: {
      method: "POST" as const,
      path: "/api/auth/change-pin",
      input: z.object({
        mobile: z.string(),
        oldPin: z.string().length(4),
        newPin: z.string().length(4),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
      },
    },
  },
  admin: {
    uploadTally: {
      method: "POST" as const,
      path: "/api/admin/upload-tally",
      // input will be FormData, so we don't strictly define it here with Zod for body parsing in the same way,
      // but we can define the response.
      responses: {
        200: z.object({
          message: z.string(),
          stats: z.object({
            processed: z.number(),
            errors: z.number(),
          }),
        }),
        400: z.object({ message: z.string() }),
        500: z.object({ message: z.string() }),
      },
    },
  },
};
