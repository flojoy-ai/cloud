import { generateDatabaseId } from "@/lib/db-utils";
import { Kysely } from "kysely";
import type DB from "@/schemas/Database";
import { InsertProduct } from "@/types/product";
import { err, ok } from "neverthrow";

export async function createProduct(db: Kysely<DB>, product: InsertProduct) {
  const res = await db
    .insertInto("product")
    .values({
      id: generateDatabaseId("product"),
      ...product,
    })
    .returning("id")
    .executeTakeFirst();

  if (res === undefined) {
    return err("Failed to create product");
  }

  return ok(res);
}
