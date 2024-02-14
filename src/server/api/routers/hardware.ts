import { z } from "zod";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import _ from "lodash";
import { checkWorkspaceAccess } from "~/lib/auth";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { workspaceAccessMiddleware } from "./workspace";
import {
  getHardwareById,
  getHardwareComponentsWithModel,
  getHardwareTree,
  getModelById,
  getModelComponents,
  markUpdatedAt,
  notInUse,
  withHardwareModel,
  withProjects,
} from "~/lib/query";
import {
  hardwareTreeSchema,
  insertHardwareSchema,
  selectHardwareRevision,
  swapHardwareComponentSchema,
} from "~/types/hardware";
import { generateDatabaseId } from "~/lib/id";
import { hardware } from "~/schemas/public/Hardware";
import { Model, model } from "~/schemas/public/Model";
import { project } from "~/schemas/public/Project";
import { ExpressionBuilder } from "kysely";
import DB from "~/schemas/public/PublicSchema";
import { withDBErrorCheck } from "~/lib/db-utils";

export const hardwareAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
  input: { hardwareId: string };
}>().create(async (opts) => {
  const hardware = await getHardwareById(opts.input.hardwareId);

  if (!hardware) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Device not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    hardware.workspaceId,
  );

  if (!workspaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this device",
    });
  }

  return opts.next({
    // this infers the `workspaceId` in ctx to be non-null
    // and also adds the respective resource id as well for use
    ctx: { workspaceUser, hardware },
  });
});

export const multiHardwareAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
  input: { hardwareIds: string[] };
}>().create(async (opts) => {
  const ids = opts.input.hardwareIds;

  if (ids.length === 0) {
    return opts.next({
      ctx: {
        workspaceId: opts.ctx.workspaceId,
        hardwareIds: ids,
      },
    });
  }

  const hardwares = await opts.ctx.db
    .selectFrom("hardware")
    .selectAll()
    .where("id", "in", ids)
    .execute();

  if (hardwares.length !== ids.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Device not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    hardwares[0]!.workspaceId, // We know that hardwares must have at least 1 element here
  );

  if (!workspaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to all of these devices",
    });
  }

  for (const hardware of _.drop(hardwares, 1)) {
    const user = await checkWorkspaceAccess(opts.ctx, hardware.workspaceId);

    if (
      workspaceUser.userId !== user?.userId ||
      workspaceUser.workspaceId !== user?.workspaceId
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You do not have access to all of these devices",
      });
    }
  }

  return opts.next({
    // this infers the `workspaceId` in ctx to be non-null
    // and also adds the respective resource id as well for use
    ctx: {
      workspaceUser,
      hardwares,
    },
  });
});

const hardwareQueryOptions = z.object({
  workspaceId: z.string(),
  projectId: z.string().optional(),
  modelId: z.string().optional(),
});

const deviceQueryOptions = hardwareQueryOptions.extend({
  onlyAvailable: z.boolean().optional(),
});

export const hardwareRouter = createTRPCRouter({
  createHardware: workspaceProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/v1/hardwares/",
        tags: ["hardwares"],
      },
    })
    .input(insertHardwareSchema)
    .use(workspaceAccessMiddleware)
    .output(hardware)
    .mutation(async ({ ctx, input }) => {
      // TODO: Not working for now
      return await ctx.db.transaction().execute(async (tx) => {
        const { components, ...newHardware } = input;

        const hardware = await withDBErrorCheck(
          tx
            .insertInto("hardware")
            .values({
              id: generateDatabaseId("hardware"),
              ...newHardware,
            })
            .returningAll()
            .executeTakeFirstOrThrow(
              () =>
                new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to create hardware",
                }),
            ),
          {
            errorCode: "DUPLICATE",
            errorMsg: `A hardware with identifier "${newHardware.name}" already exists for selected model!`,
          },
        );

        const model = await getModelById(hardware.modelId);
        if (!model) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Model not found",
          });
        }
        const modelComponents = await getModelComponents(model.id);

        if (modelComponents.length > 0) {
          const ids = components.map((c) => c.hardwareId);
          if (_.uniq(ids).length !== ids.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Duplicate hardware devices",
            });
          }

          const hardwares = await db
            .selectFrom("hardware")
            .selectAll("hardware")
            .where("hardware.id", "in", ids)
            .where(notInUse)
            .execute();

          if (hardwares.length !== components.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Some hardware devices are already in use!",
            });
          }

          const modelCount = _.countBy(hardwares, (h) => h.modelId);
          const matches = _.every(
            modelComponents,
            (c) => modelCount[c.modelId] === c.count,
          );

          if (!matches) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Components do not satisfy model requirements",
            });
          }

          await tx
            .insertInto("hardware_relation")
            .values(
              components.map((c) => ({
                parentHardwareId: hardware.id,
                childHardwareId: c.hardwareId,
              })),
            )
            .execute();

          await tx
            .insertInto("hardware_revision")
            .values(
              components.map((c) => ({
                hardwareId: hardware.id,
                revisionType: "init",
                componentId: c.hardwareId,
                reason: "Initial hardware creation",
                userId: ctx.user.id,
              })),
            )
            .execute();
        }

        if (input.projectId !== undefined) {
          await tx
            .insertInto("project_hardware")
            .values({
              hardwareId: hardware.id,
              projectId: input.projectId,
            })
            .execute();
        }

        await markUpdatedAt(tx, "workspace", input.workspaceId);

        return hardware;
      });
    }),

  getHardwareById: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/hardwares/{hardwareId}",
        tags: ["hardwares"],
      },
    })
    .input(z.object({ hardwareId: z.string() }))
    .use(hardwareAccessMiddleware)
    .output(hardwareTreeSchema)
    .query(async ({ ctx }) => {
      return await getHardwareTree(ctx.hardware);
    }),

  getAllHardware: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/hardwares", tags: ["hardwares"] },
    })
    .input(deviceQueryOptions)
    .use(workspaceAccessMiddleware)
    .output(
      z.array(hardware.extend({ model: model, projects: project.array() })),
    )
    .query(async ({ input, ctx }) => {
      let query = ctx.db
        .selectFrom("hardware")
        .selectAll("hardware")
        .where("hardware.workspaceId", "=", input.workspaceId)
        .select((eb) => [withHardwareModel(eb), withProjects(eb)])
        .$if(input.projectId !== undefined, (qb) =>
          qb.innerJoin(
            // FIXME: Kysely can't infer the type of this expression builder for some reason
            (eb: ExpressionBuilder<DB, "hardware">) =>
              eb
                .selectFrom("project_hardware")
                .select("project_hardware.hardwareId")
                .where("project_hardware.projectId", "=", input.projectId!)
                .as("ph"),
            (join) => join.onRef("ph.hardwareId", "=", "hardware.id"),
          ),
        )
        .$narrowType<{ model: Model }>()
        .orderBy("createdAt");

      if (input.onlyAvailable) {
        query = query.where(notInUse);
      }

      if (input.modelId) {
        query = query.where("hardware.modelId", "=", input.modelId);
      }

      const data = query.execute();

      return data;
    }),

  deleteHardwareById: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/hardwares/{hardwareId}",
        tags: ["hardwares"],
      },
    })
    .input(z.object({ hardwareId: z.string() }))
    .use(hardwareAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      if (ctx.workspaceUser.role === "member") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this hardware",
        });
      }

      await ctx.db
        .deleteFrom("hardware")
        .where("id", "=", input.hardwareId)
        .execute();
    }),

  getRevisions: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/hardwares/{hardwareId}/revisions",
        tags: ["hardwares"],
      },
    })
    .input(z.object({ hardwareId: z.string() }))
    .use(hardwareAccessMiddleware)
    .output(z.array(selectHardwareRevision))
    .query(async ({ ctx, input }) => {
      const revisions = await ctx.db
        .selectFrom("hardware_revision as hr")
        .selectAll("hr")
        .innerJoin("hardware", "hardware.id", "hr.componentId")
        .innerJoin("user", "user.id", "hr.userId")
        .select("hardware.name as componentName")
        .select("user.email as userEmail")
        .where("hr.hardwareId", "=", input.hardwareId)
        .orderBy("hr.createdAt", "desc")
        .execute();
      return revisions;
    }),

  swapHardwareComponent: workspaceProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/v1/hardwares/{hardwareId}",
        tags: ["hardwares"],
      },
    })
    .input(swapHardwareComponentSchema)
    .use(hardwareAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      if (ctx.workspaceUser.role === "member") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You do not have permission to update the components of this hardware",
        });
      }

      const hardwareComponents = await getHardwareComponentsWithModel(
        ctx.hardware.id,
      );

      await ctx.db.transaction().execute(async (tx) => {
        const oldHardwareComponent = await tx
          .selectFrom("hardware")
          .selectAll()
          .where("hardware.id", "=", input.oldHardwareComponentId)
          .executeTakeFirstOrThrow(
            () =>
              new TRPCError({
                code: "BAD_REQUEST",
                message: "old hardware not found",
              }),
          );

        const newHardwareComponent = await tx
          .selectFrom("hardware")
          .selectAll()
          .where("hardware.id", "=", input.newHardwareComponentId)
          .executeTakeFirstOrThrow(
            () =>
              new TRPCError({
                code: "BAD_REQUEST",
                message: "new hardware not found",
              }),
          );

        if (oldHardwareComponent.modelId !== newHardwareComponent.modelId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Model mismatch",
          });
        }

        if (
          !hardwareComponents.some(
            (hc) => hc.hardwareId === input.oldHardwareComponentId,
          )
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Old component is not a part of the hardware",
          });
        }

        await tx
          .deleteFrom("hardware_relation as hr")
          .where("hr.parentHardwareId", "=", ctx.hardware.id)
          .where("hr.childHardwareId", "=", input.oldHardwareComponentId)
          .execute();

        await tx
          .insertInto("hardware_relation")
          .values({
            parentHardwareId: ctx.hardware.id,
            childHardwareId: input.newHardwareComponentId,
          })
          .execute();

        await tx
          .insertInto("hardware_revision")
          .values([
            {
              revisionType: "remove",
              userId: ctx.user.id,
              hardwareId: ctx.hardware.id,
              componentId: input.oldHardwareComponentId,
              reason: input.reason ?? "Component swap",
            },
            {
              revisionType: "add",
              userId: ctx.user.id,
              hardwareId: ctx.hardware.id,
              componentId: input.newHardwareComponentId,
              reason: input.reason ?? "Component swap",
            },
          ])
          .execute();
      });
    }),
});
