import { lucia, validateRequest } from "~/auth/lucia";

import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const POST = async () => {
  const { session } = await validateRequest();

  if (!session) {
    return new NextResponse(null, {
      status: 401,
    });
  }

  // make sure to invalidate the current session!
  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/");
};
