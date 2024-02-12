import { z } from "zod";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import _ from "lodash";
import { checkWorkspaceAccess } from "~/lib/auth";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { workspaceAccessMiddleware } from "./workspace";
import { selectProjectSchema } from "~/types/project";
import { type DatabaseError } from "pg";
import {
  getHardwareById,
  getHardwareTree,
  getModelById,
  getModelComponents,
  markUpdatedAt,
  notInUse,
  withHardwareModel,
  withProjects,
} from "~/lib/query";
import { hardwareTreeSchema, insertHardwareSchema } from "~/types/hardware";
import { generateDatabaseId } from "~/lib/id";
import { hardware } from "~/schemas/public/Hardware";
import { Model, model } from "~/schemas/public/Model";
import { project } from "~/schemas/public/Project";
import { ExpressionBuilder } from "kysely";
import DB from "~/schemas/public/PublicSchema";

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
      return await ctx.db.transaction().execute(async (tx) => {
        try {
          const { components, ...newHardware } = input;
          const hardware = await tx
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
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          const err = error as DatabaseError;
          if (
            err.code === "23505" &&
            err.constraint?.includes("hardware_workspace_id_name")
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message: `A system for selected model already exists!`,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
            message: "Internal server error",
          });
        }
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
        .$narrowType<{ model: Model }>();

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
      if (ctx.workspaceUser.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this workspace",
        });
      }

      await ctx.db
        .deleteFrom("hardware")
        .where("id", "=", input.hardwareId)
        .execute();
    }),

  // TODO: hardware "commit history" to track component changes
  //
  // updateHardwareById: workspaceProcedure
  //   .meta({
  //     openapi: {
  //       method: "PATCH",
  //       path: "/v1/hardwares/{hardwareId}",
  //       tags: ["hardwares"],
  //     },
  //   })
  //   .input(updateHardwareSchema)
  //   .use(hardwareAccessMiddleware)
  //   .output(z.void())
  //   .mutation(async ({ input, ctx }) => {
  //     await ctx.db.transaction().execute(async (tx) => {
  //       await tx
  //         .updateTable("hardware")
  //         .set(input)
  //         .where("id", "=", input.hardwareId)
  //         .execute();
  //
  //       await markUpdatedAt(tx, "hardware", input.hardwareId);
  //     });
  //   }),
});
