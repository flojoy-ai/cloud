import { Elysia, error, t } from "elysia";
import { AuthMiddleware } from "./auth";
import { getUnit } from "../db/unit";
import { getWorkspaceUser } from "../db/workspace";

export const UnitMiddleware = new Elysia({ name: "UnitMiddleware" })
  .guard({
    params: t.Object({
      unitId: t.String(),
    }),
  })
  .use(AuthMiddleware)
  .derive(async ({ params: { unitId }, user }) => {
    const unit = await getUnit(unitId);
    if (!unit) return error("Not Found");

    const workspaceUser = await getWorkspaceUser(unit.workspaceId, user.id);
    if (!workspaceUser) {
      return error("Forbidden");
    }

    return { unit, workspaceUser };
  })
  .propagate();
