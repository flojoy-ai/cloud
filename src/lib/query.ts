import { sql, type Column, eq } from "drizzle-orm";
import { type SystemModelPart } from "~/types/model";
import { db } from "~/server/db";
import {
  deviceModel,
  systemModelDeviceModel,
  model,
  systemModel,
} from "~/server/db/schema";

export function partsFrom(modelId: Column, name: Column, count: Column) {
  return sql<
    SystemModelPart[]
  >`json_agg(json_build_object('modelId', ${modelId}, 'name', ${name}, 'count', ${count}))`;
}

export async function getSystemModelParts(modelId: string) {
  const sq = db
    .select({ id: model.id, name: model.name })
    .from(model)
    .innerJoin(deviceModel, eq(deviceModel.id, model.id))
    .as("sq");

  const [parts] = await db
    .select({
      parts: partsFrom(deviceModel.id, sq.name, systemModelDeviceModel.count),
    })
    .from(model)
    .innerJoin(systemModel, eq(systemModel.id, model.id))
    .innerJoin(
      systemModelDeviceModel,
      eq(systemModel.id, systemModelDeviceModel.systemModelId),
    )
    .innerJoin(
      deviceModel,
      eq(deviceModel.id, systemModelDeviceModel.deviceModelId),
    )
    .innerJoin(sq, eq(sq.id, deviceModel.id))
    .groupBy(systemModel.id)
    .where(eq(model.id, modelId));

  return parts?.parts;
}
