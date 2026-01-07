import { z } from "zod";

export const api = {
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
