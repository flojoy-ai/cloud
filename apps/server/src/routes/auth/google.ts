import { Elysia } from "elysia";

export const authRoute = new Elysia({ prefix: "/google" })
  .get("/login", googleLogin)
  .get("/callback", googleCallback);

function googleLogin(req: Request, res: Response) {
  // ...
}

function googleCallback(req: Request, res: Response) {
  // ...
}
