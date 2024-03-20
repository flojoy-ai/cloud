import { Elysia } from "elysia";

export const userRoute = new Elysia({ prefix: "/user" }).get("/", getUser);

function getUser(req: Request, res: Response) {
  // ...
}
