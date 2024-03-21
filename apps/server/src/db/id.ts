import { createId } from "@paralleldrive/cuid2";
import type PublicSchema from "@/schemas/public/PublicSchema";

export function generateDatabaseId(table: keyof PublicSchema) {
  const cuid = createId();
  switch (table) {
    // can add more case here if we need custom handling
    // maybe like a shorter prefix or something
    default:
      return table + "_" + cuid;
  }
}
