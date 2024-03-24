import { generateDatabaseId, tryQuery } from "@/lib/db-utils";
import type DB from "@/schemas/Database";
import { InsertProduct } from "@/types/product";
import { Kysely } from "kysely";
import { errAsync, okAsync } from "neverthrow";

export async function createProduct(db: Kysely<DB>, product: InsertProduct) {
  return tryQuery(
    db
      .insertInto("product")
      .values({
        id: generateDatabaseId("product"),
        ...product,
      })
      .returningAll()
      .executeTakeFirst(),
  ).andThen((p) => {
    if (p === undefined) {
      return errAsync("No product returned when creating");
    }
    return okAsync(p);
  });
}
