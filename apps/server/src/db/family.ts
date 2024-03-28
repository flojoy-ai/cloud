import { generateDatabaseId, tryQuery } from "../lib/db-utils";
import type { DB } from "@cloud/shared";
import { InsertFamily } from "@cloud/shared";
import { Kysely } from "kysely";
import { err, ok, safeTry } from "neverthrow";
import { createProduct } from "./product";

export async function createFamily(db: Kysely<DB>, family: InsertFamily) {
  const { productName, ...rest } = family;

  return safeTry(async function*() {
    let product = await db
      .selectFrom("product")
      .selectAll()
      .where("name", "=", productName)
      .executeTakeFirst();

    if (product === undefined) {
      product = yield* (
        await createProduct(db, {
          workspaceId: family.workspaceId,
          name: productName,
        })
      ).safeUnwrap();
    }

    const res = yield* tryQuery(
      db
        .insertInto("family")
        .values({
          id: generateDatabaseId("family"),
          productId: product.id,
          ...rest,
        })
        .returningAll()
        .executeTakeFirst(),
    ).safeUnwrap();

    if (res === undefined) {
      return err("Failed to create family");
    }

    return ok(res);
  });
}
