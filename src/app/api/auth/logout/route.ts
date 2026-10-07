import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  const authCookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
    "next-auth.csrf-token",
    "authjs.callback-url",
    "next-auth.callback-url",
    "authjs.state",
    "next-auth.state",
    "authjs.pkce.code_verifier",
  ];

  // Expire any existing auth cookies
  for (const c of allCookies) {
    if (
      authCookieNames.includes(c.name) ||
      c.name.includes("authjs") ||
      c.name.includes("next-auth")
    ) {
      response.cookies.set({
        name: c.name,
        value: "",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }
  }

  // Also explicitly set maxAge 0 for all common cookie names
  for (const name of authCookieNames) {
    response.cookies.set({
      name,
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return response;
}

export async function GET() {
  return POST();
}
