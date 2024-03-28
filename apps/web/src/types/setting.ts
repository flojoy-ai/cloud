import { z } from "zod";

export const workspaceSettingsTabSchema = z.object({
  tab: z.enum(["general", "users", "secret"]).default("general"),
});
