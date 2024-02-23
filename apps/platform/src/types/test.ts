import { z } from "zod";
import { test } from "~/schemas/public/Test";

export const insertTestSchema = test.pick({
  name: true,
  projectId: true,
  measurementType: true,
});

export type InsertTest = z.infer<typeof insertTestSchema>;

export const updateTestSchema = insertTestSchema.pick({
  name: true,
});
