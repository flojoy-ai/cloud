import { generateDatabaseId, tryQuery } from "../lib/db-utils";
import type { DB } from "@cloud/shared";
import { InsertPart } from "@cloud/shared";
import { Kysely } from "kysely";
import { err, ok, safeTry } from "neverthrow";
import { createProduct } from "./product";

export async function getPart(db: Kysely<DB>, partId: string) {
  return await db
    .selectFrom("part")
    .selectAll()
    .where("id", "=", partId)
    .executeTakeFirst();
}

export async function createPart(db: Kysely<DB>, part: InsertPart) {
  const { productName, ...rest } = part;

  return safeTry(async function* () {
    let product = await db
      .selectFrom("product")
      .selectAll()
      .where("name", "=", productName)
      .executeTakeFirst();

    if (product === undefined) {
      product = yield* (
        await createProduct(db, {
          workspaceId: part.workspaceId,
          name: productName,
        })
      ).safeUnwrap();
    }

    const res = yield* tryQuery(
      db
        .insertInto("part")
        .values({
          id: generateDatabaseId("part"),
          productId: product.id,
          ...rest,
        })
        .returningAll()
        .executeTakeFirst(),
    ).safeUnwrap();

    if (res === undefined) {
      return err("Failed to create part");
    }

    return ok(res);
  });
}
