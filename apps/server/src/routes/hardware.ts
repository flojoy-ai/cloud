import {
  createHardware,
  getHardwareTree,
  notInUse,
  withHardwareModel,
} from "@/db/hardware";
import { db } from "@/db/kysely";
import { WorkspaceMiddleware } from "@/middlewares/workspace";
import { insertHardware } from "@/types/hardware";
import { Model } from "@/types/model";
import Elysia, { t } from "elysia";

export const HardwareRoute = new Elysia({ prefix: "/hardware" })
  .use(WorkspaceMiddleware)
  .get(
    "/",
    async ({ workspace, query: { onlyAvailable } }) => {
      let query = db
        .selectFrom("hardware")
        .selectAll("hardware")
        .where("hardware.workspaceId", "=", workspace.id)
        .select((eb) => withHardwareModel(eb))
        .$narrowType<{ model: Model }>()
        .orderBy("createdAt");

      if (onlyAvailable) {
        query = query.where(notInUse);
      }

      const data = await query.execute();
      return data;
    },
    {
      query: t.Object({
        onlyAvailable: t
          .Transform(t.String())
          .Decode((arg) => {
            if (arg === "true" || arg === "1") {
              return true;
            }
            if (arg === "false" || arg === "0") {
              return false;
            }
            return false;
          })
          .Encode((arg) => (arg ? "true" : "false")),
      }),
    },
  )
  .post(
    "/",
    async ({ body, error, workspace, user }) => {
      const res = await createHardware(db, workspace.id, user, body);
      if (res.isErr()) {
        return error(500, res.error.message);
      }
      return res.value;
    },
    { body: insertHardware },
  )
  .get(
    "/:hardwareId",
    async ({ workspace, params: { hardwareId }, error }) => {
      const hardware = await db
        .selectFrom("hardware")
        .selectAll("hardware")
        .where("id", "=", hardwareId)
        .where("workspaceId", "=", workspace.id)
        .select((eb) => withHardwareModel(eb))
        .$narrowType<{ model: Model }>()
        .executeTakeFirst();
      if (hardware === undefined) {
        return error(404, "Model not found");
      }

      return await getHardwareTree(hardware);
    },
    {
      params: t.Object({ hardwareId: t.String() }),
    },
  );
