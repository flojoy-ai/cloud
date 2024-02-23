import { Elysia } from "elysia";

export const workspacesRoute = new Elysia({ prefix: "/workspaces" })
  .get("/:id", getWorkspace)
  .get("/", getWorkspaces);

function getWorkspace(req: Request, res: Response) {
  // ...
}

function getWorkspaces(req: Request, res: Response) {
  // ...
}
