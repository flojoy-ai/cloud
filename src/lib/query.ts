import type DB from "~/schemas/Database";
import { type Kysely } from "kysely";

export async function markUpdatedAt(
  db: Kysely<DB>,
  table: "project" | "hardware" | "test",
  id: string,
) {
  await db
    .updateTable(table)
    .set({ updatedAt: new Date() })
    .where(`${table}.id`, "=", id)
    .execute();
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
