import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  const isWorkspaceRoute = segments[1] === "workspace";
  const scope = segments[2];
  if (isWorkspaceRoute && scope) {
    // Now we know we are trying to access a workspace

    const scopeCookie = cookies().get("scope");

    if (scopeCookie?.value !== scope) {
      // This is to make sure there is no mismatch between the scope cookie
      // and the actual scope in the URL. This cookie helps us to know which
      // workspace to redirect the user to after login.
      // And it persists user's workspace selection across sessions.
      // (Assume no different user logs in on the same device)
      const response = NextResponse.redirect(request.nextUrl);
      response.cookies.set("scope", scope);
      return response;
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
