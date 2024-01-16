import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { RESERVED_SCOPE } from "~/config/workspace";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  const isWorkspaceRoute = segments[1] === "workspace";
  const scope = segments[2];
  if (
    isWorkspaceRoute &&
    scope &&
    !RESERVED_SCOPE.includes(scope.toLowerCase())
  ) {
    // Now we know we are trying to access a workspace

    const scopeCookie = cookies().get("scope");

    if (scopeCookie?.value !== scope) {
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
