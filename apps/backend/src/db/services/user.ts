import { InsertExpression } from "node_modules/kysely/dist/esm/parser/insert-values-parser";
import { db } from "../index";
import PublicSchema from "../schemas/public/PublicSchema";

export const findUserByEmail = async (email: string) => {
  return await db
    .selectFrom("user")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();
};
export const addNewUser = async (
  user: InsertExpression<PublicSchema, "user">
) => {
  return await db.insertInto("user").values(user).execute();
};

export const markUserEmailAsVerified = async (userId: string) => {
  return await db
    .updateTable("user")
    .set({ emailVerified: true })
    .where("user.id", "=", userId)
    .execute();
};
