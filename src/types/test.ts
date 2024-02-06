// import { testTable } from "~/server/db/schema";
// import { createInsertSchema, createSelectSchema } from "drizzle-zod";
//
// export type SelectTest = typeof testTable.$inferSelect;
//
// export const insertTestSchema = createInsertSchema(testTable);
//
// export const publicInsertTestSchema = insertTestSchema.pick({
//   name: true,
//   projectId: true,
//   measurementType: true,
// });
//
// export const publicUpdateTestSchema = insertTestSchema.pick({
//   name: true,
// });
//
// export const selectTestSchema = createSelectSchema(testTable);
