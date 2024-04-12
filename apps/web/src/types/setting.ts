import { z } from "zod";

export const workspaceSettingsTabSchema = z.object({
  tab: z.enum(["general", "users", "secret"]).default("general"),
});

export const projectSettingsTabSchema = z.object({
  tab: z.enum(["general", "users"]).default("general"),
});
