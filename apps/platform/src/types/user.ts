import { User } from "~/schemas/public/User";
import { userInviteInitializer } from "~/schemas/public/UserInvite";
import { WorkspaceUser } from "~/schemas/public/WorkspaceUser";

export const createUserInvite = userInviteInitializer
  .pick({
    email: true,
    workspaceId: true,
    role: true,
  })
  .refine((input) => input.role !== "owner");

export type UserWithRole = User & Pick<WorkspaceUser, "role">;
