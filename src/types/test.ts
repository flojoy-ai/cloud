import { test } from "~/schemas/public/Test";

export const insertTestSchema = test.pick({
  name: true,
  projectId: true,
  measurementType: true,
});

export const updateTestSchema = insertTestSchema.pick({
  name: true,
});
