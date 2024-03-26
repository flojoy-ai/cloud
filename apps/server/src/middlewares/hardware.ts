import { Elysia, error, t } from "elysia";
import { AuthMiddleware } from "./auth";
import { getHardware } from "@/db/hardware";
import { getWorkspaceUser } from "@/db/workspace";

export const HardwareMiddleware = new Elysia({ name: "HardwareMiddleware" })
  .guard({
    params: t.Object({
      hardwareId: t.String(),
    }),
  })
  .use(AuthMiddleware)
  .derive(async ({ params: { hardwareId }, user }) => {
    const hardware = await getHardware(hardwareId);
    if (!hardware) return error("Not Found");

    const workspaceUser = await getWorkspaceUser(hardware.workspaceId, user.id);
    if (!workspaceUser) {
      return error("Forbidden");
    }

    return { hardware, workspaceUser };
  })
  .propagate();
