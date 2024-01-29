import { sql, type Column, eq } from "drizzle-orm";
import { type SystemModelPart } from "~/types/model";
import { db } from "~/server/db";
import {
  deviceModelTable,
  systemModelDeviceModelTable,
  modelTable,
  systemModelTable,
} from "~/server/db/schema";

export function partsFrom(modelId: Column, name: Column, count: Column) {
  return sql<
    SystemModelPart[]
  >`json_agg(json_build_object('modelId', ${modelId}, 'name', ${name}, 'count', ${count}))`;
}

export async function getSystemModelParts(modelId: string) {
  const sq = db
    .select({ id: modelTable.id, name: modelTable.name })
    .from(modelTable)
    .innerJoin(deviceModelTable, eq(deviceModelTable.id, modelTable.id))
    .as("sq");

  const [parts] = await db
    .select({
      parts: partsFrom(
        deviceModelTable.id,
        sq.name,
        systemModelDeviceModelTable.count,
      ),
    })
    .from(modelTable)
    .innerJoin(systemModelTable, eq(systemModelTable.id, modelTable.id))
    .innerJoin(
      systemModelDeviceModelTable,
      eq(systemModelTable.id, systemModelDeviceModelTable.systemModelId),
    )
    .innerJoin(
      deviceModelTable,
      eq(deviceModelTable.id, systemModelDeviceModelTable.deviceModelId),
    )
    .innerJoin(sq, eq(sq.id, deviceModelTable.id))
    .groupBy(systemModelTable.id)
    .where(eq(modelTable.id, modelId));

  return parts?.parts;
}
