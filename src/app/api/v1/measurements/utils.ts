import { z } from "zod";
import * as jose from "jose";
import { env } from "~/env";
import { db } from "~/server/db";
import { secret } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { checkWorkspaceAccess } from "~/lib/auth";

export class ErrorWithStatus extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const generateError = (message: string, status: number) => {
  throw new ErrorWithStatus(message, status);
};

const authorizeWorkspace = async (workspaceSecret: string | null) => {
  if (!workspaceSecret) {
    return generateError("No workspace secret provided", 401);
  }
  const { payload } = await jose.jwtVerify(
    workspaceSecret.slice("Bearer ".length),
    new TextEncoder().encode(env.JWT_SECRET),
    {},
  );
  const parsed = z
    .object({
      userId: z.string(),
      workspaceId: z.string().startsWith("workspace_"),
    })
    .safeParse(payload);

  if (!parsed.success) {
    return generateError("the given JWT token is invalid, parsing failed", 401);
  }

  const userId = parsed.data.userId;
  const workspaceId = parsed.data.workspaceId;

  await db
    .update(secret)
    .set({ lastUsedAt: new Date() })
    .where(and(eq(secret.userId, userId), eq(secret.workspaceId, workspaceId)));
  return { userId, workspaceId };
};

const hardwareMiddleware = async (
  hardwareId: string,
  userId: string,
  workspaceId: string,
) => {
  const hardware = await db.query.hardware.findFirst({
    where: (h, { eq }) => eq(h.id, hardwareId),
    with: {
      workspace: true,
    },
  });

  if (!hardware) {
    return generateError("Device not found", 404);
  }

  const workspaceUser = await checkWorkspaceAccess(
    {
      db,
      userId,
      workspaceId,
    },
    hardware.workspace.id,
  );

  if (!workspaceUser) {
    return generateError("You do not have access to this device", 401);
  }

  return { workspaceId: workspaceUser.workspaceId, hardwareId: hardware.id };
};

const testMiddleware = async (testId: string, userId: string) => {
  const test = await db.query.test.findFirst({
    where: (t, { eq }) => eq(t.id, testId),
    with: {
      project: {
        with: {
          workspace: true,
        },
      },
    },
  });

  if (!test) {
    return generateError("Test not found", 404);
  }

  const workspaceUser = await checkWorkspaceAccess(
    {
      db,
      userId,
      workspaceId: test.project.workspace.id,
    },
    test.project.workspace.id,
  );
  if (!workspaceUser) {
    return generateError("You do not have access to this test", 401);
  }

  return {
    testId: test.id,
  };
};

export const measurementRouteAuthCheck = async ({
  workspaceSecret,
  inputHardwareId,
  inputTestId,
}: {
  workspaceSecret: string | null;
  inputHardwareId: string;
  inputTestId: string;
}) => {
  const { userId, workspaceId } = await authorizeWorkspace(workspaceSecret);
  const { hardwareId } = await hardwareMiddleware(
    inputHardwareId,
    userId,
    workspaceId,
  );
  const { testId } = await testMiddleware(inputTestId, userId);
  return { userId, workspaceId, hardwareId, testId };
};
