import { z } from "zod";
import {
  workspaceInitializer,
  workspaceMutator,
} from "~/schemas/public/Workspace";

export const createWorkspace = workspaceInitializer
  .pick({
    name: true,
    namespace: true,
  })
  .extend({
    populateData: z.boolean(),
  });

export const updateWorkspace = workspaceMutator.pick({
  name: true,
  namespace: true,
});
