import { db } from "~/server/db";

export async function getHardwareById(id: string) {
  return await db
    .selectFrom("hardware")
    .selectAll("hardware")
    .where("hardware.id", "=", id)
    .executeTakeFirst();
}
