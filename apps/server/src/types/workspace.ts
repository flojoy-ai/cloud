import { z } from "zod";
import {
  workspaceInitializer,
  workspaceMutator,
} from "@/schemas/public/Workspace";
import { t, Static } from "elysia";

export const createWorkspace = t.Object({
  name: t.String(),
  namespace: t.String(),
  populateData: t.Boolean(),
});
export type CreateWorkspace = Static<typeof createWorkspace>;

// export const createWorkspace = workspaceInitializer
//   .pick({
//     name: true,
//     namespace: true,
//   })
//   .extend({
//     populateData: z.boolean(),
//   });
//
// export const updateWorkspace = workspaceMutator.pick({
//   name: true,
//   namespace: true,
// });
