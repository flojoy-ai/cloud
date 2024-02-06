import { userInviteInitializer } from "~/schemas/public/UserInvite";

export const createUserInvite = userInviteInitializer
  .pick({
    email: true,
    workspaceId: true,
    role: true,
  })
  .refine((input) => input.role !== "owner");
