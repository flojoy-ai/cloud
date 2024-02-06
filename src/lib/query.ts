import type DB from "~/schemas/Database";
import { type ExpressionBuilder, type Kysely } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { type Model } from "~/schemas/public/Model";
import { db } from "~/server/db";

export async function getProjectById(id: string) {
  return await db
    .selectFrom("project")
    .selectAll("project")
    .where("project.id", "=", id)
    .select((eb) => withProjectModel(eb))
    .$narrowType<{ model: Model }>()
    .executeTakeFirst();
}

export async function getHardwareById(id: string) {
  return await db
    .selectFrom("hardware")
    .selectAll("hardware")
    .where("hardware.id", "=", id)
    .executeTakeFirst();
}

export async function getModelById(id: string) {
  return await db
    .selectFrom("model")
    .selectAll("model")
    .where("model.id", "=", id)
    .executeTakeFirst();
}

export async function markUpdatedAt(
  db: Kysely<DB>,
  table: "project" | "hardware" | "test" | "workspace",
  id: string,
) {
  await db
    .updateTable(table)
    .set({ updatedAt: new Date() })
    .where(`${table}.id`, "=", id)
    .execute();
}

export function withHardwareModel(eb: ExpressionBuilder<DB, "hardware">) {
  return jsonObjectFrom(
    eb
      .selectFrom("model")
      .selectAll("model")
      .whereRef("model.id", "=", "hardware.modelId"),
  ).as("model");
}

export function withProjectModel(eb: ExpressionBuilder<DB, "project">) {
  return jsonObjectFrom(
    eb
      .selectFrom("model")
      .selectAll("model")
      .whereRef("model.id", "=", "project.modelId"),
  ).as("model");
}

export function withHardware(eb: ExpressionBuilder<DB, "measurement">) {
  return jsonObjectFrom(
    eb
      .selectFrom("hardware")
      .selectAll("hardware")
      .whereRef("hardware.id", "=", "measurement.hardwareId")
      .select((eb) => withHardwareModel(eb))
      .$narrowType<{ model: Model }>(),
  ).as("hardware");
}

// export function partsFrom(modelId: Column, name: Column, count: Column) {
//   return sql<
//     SystemModelPart[]
//   >`json_agg(json_build_object('modelId', ${modelId}, 'name', ${name}, 'count', ${count}))`;
// }
//
// export async function getSystemModelParts(modelId: string) {
//   const sq = db
//     .select({ id: modelTable.id, name: modelTable.name })
//     .from(modelTable)
//     .innerJoin(deviceModelTable, eq(deviceModelTable.id, modelTable.id))
//     .as("sq");
//
//   const [parts] = await db
//     .select({
//       parts: partsFrom(
//         deviceModelTable.id,
//         sq.name,
//         systemModelDeviceModelTable.count,
//       ),
//     })
//     .from(modelTable)
//     .innerJoin(systemModelTable, eq(systemModelTable.id, modelTable.id))
//     .innerJoin(
//       systemModelDeviceModelTable,
//       eq(systemModelTable.id, systemModelDeviceModelTable.systemModelId),
//     )
//     .innerJoin(
//       deviceModelTable,
//       eq(deviceModelTable.id, systemModelDeviceModelTable.deviceModelId),
//     )
//     .innerJoin(sq, eq(sq.id, deviceModelTable.id))
//     .groupBy(systemModelTable.id)
//     .where(eq(modelTable.id, modelId));
//
//   return parts?.parts;
// }
