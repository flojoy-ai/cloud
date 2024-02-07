import { type NextRequest } from "next/server";
import { ErrorWithCode, zapierUserAuthMiddleware } from "../middleware";
import { api } from "~/trpc/server";

export const GET = async (req: NextRequest) => {
  try {
    const { workspaceId } = await zapierUserAuthMiddleware(req);
    const hardwares = await api.hardware.getAllHardware.query({
      workspaceId,
    });
    const hardwareFields = hardwares.map((hardware) => {
      return {
        key: hardware.id,
        label: `${hardware.name} (${hardware.type})`,
        value: hardware.id,
      };
    });
    return new Response(JSON.stringify(hardwareFields), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ErrorWithCode) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: error.code,
      });
    }
  }
};
