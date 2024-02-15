import { z } from "zod";

export const httpError = z.object({
  message: z.string(),
});
