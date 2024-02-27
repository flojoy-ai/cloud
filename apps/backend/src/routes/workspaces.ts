import { Elysia } from "elysia";

export const workspacesRoute = new Elysia({ prefix: "/workspace" })
  .get("/:id", (param) => `workspace ${param.params.id}`)
  .get("/", getWorkspaces);

function getWorkspace(req: Request, res: Response) {
  // ...
}

function getWorkspaces(req: Request, res: Response) {
  // ...
}
