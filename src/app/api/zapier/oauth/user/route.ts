import { type NextRequest } from "next/server";
import { ErrorWithCode, zapierUserAuthMiddleware } from "../../middleware";

export const GET = async (req: NextRequest) => {
  try {
    const authData = await zapierUserAuthMiddleware(req);
    return new Response(JSON.stringify(authData), {
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
