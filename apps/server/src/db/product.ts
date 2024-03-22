import { generateDatabaseId } from "@/lib/db-utils";
import { Kysely } from "kysely";
import type DB from "@/schemas/Database";
import { InsertProduct } from "@/types/product";
import { Result, err, ok } from "neverthrow";
import { Product } from "@/schemas/public/Product";

export async function createProduct(
  db: Kysely<DB>,
  product: InsertProduct,
): Promise<Result<Product, string>> {
  const res = await db
    .insertInto("product")
    .values({
      id: generateDatabaseId("product"),
      ...product,
    })
    .returningAll()
    .executeTakeFirst();

  if (res === undefined) {
    return err("Failed to create product");
  }

  return ok(res);
}
