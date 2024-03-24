import { generateDatabaseId } from "@/lib/db-utils";
import { Kysely } from "kysely";
import type DB from "@/schemas/Database";
import { InsertFamily } from "@/types/family";
import { Result, err, ok, safeTry } from "neverthrow";
import { Family } from "@/schemas/public/Family";
import { createProduct } from "./product";

export async function createFamily(
  db: Kysely<DB>,
  family: InsertFamily,
): Promise<Result<Family, string>> {
  let product = await db
    .selectFrom("product")
    .selectAll()
    .where("name", "=", family.name)
    .executeTakeFirst();

  if (product === undefined) {
    console.log("Creating product");
    product = (
      await createProduct(db, {
        workspaceId: family.workspaceId,
        name: family.productName,
      })
    )._unsafeUnwrap();
  }

  console.log("Creating family");
  const res = await db
    .insertInto("family")
    .values({
      id: generateDatabaseId("family"),
      productId: product.id,
      ...family,
    })
    .returningAll()
    .executeTakeFirst();
  console.log(res);

  if (res === undefined) {
    return err("Failed to create family");
  }

  return ok(res);
}
