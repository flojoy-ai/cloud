import { Elysia, t } from "elysia";

export const ProjectMiddleware = new Elysia({ name: "ProjectMiddleware" })
  .guard({ params: t.Object({ projectId: t.String() }) })
  .derive(({ params }) => {
    return { lmao: "lmao" };
  })
  .propagate();
