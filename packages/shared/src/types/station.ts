import { t, Static } from "elysia";

export type { Station } from "../schemas/public/Station";

export const InsertStation = t.Object({
  name: t.String({ minLength: 1 }),
  projectId: t.String(),
});

export type InsertStation = Static<typeof InsertStation>;
