import { Elysia } from "elysia";

export const authRoute = new Elysia({ prefix: "/auth" })
  .get("/google/login", googleLogin)
  .get("/google/callback", googleCallback)
  .get("/logout", logout);

function googleLogin(req: Request, res: Response) {
  // ...
}

function googleCallback(req: Request, res: Response) {
  // ...
}

function logout(req: Request, res: Response) {
  // ...
}
