import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { api } from "~/trpc/server";

export const POST = async (req: NextRequest) => {
  const body = await req.formData();
  const code = body.get("code") as string;
  const clientId = body.get("client_id");
  const clientSecret = body.get("client_secret");
  if (!code || !clientId || !clientSecret) {
    return NextResponse.json(
      { message: "Missing fields" },
      {
        status: 422,
      },
    );
  }
  if (
    clientId !== env.ZAPIER_CLIENT_ID ||
    clientSecret !== env.ZAPIER_CLIENT_SECRET
  ) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      {
        status: 401,
      },
    );
  }
  const workspace = await api.workspace.getWorkspaceById.query({
    workspaceId: code,
  });
  const workspaceSecret = await api.secret._createSecret.mutate({
    workspaceId: code,
  });

  return NextResponse.json(
    {
      access_token: workspaceSecret,
      workspaceNamespace: workspace.namespace,
    },
    {
      status: 200,
    },
  );
};
