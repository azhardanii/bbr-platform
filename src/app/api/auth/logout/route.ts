import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  // 1. Send Clear-Site-Data to instruct browser to purge its memory and cache
  response.headers.set("Clear-Site-Data", '"cache", "cookies", "storage"');
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

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

  const namesToClear = new Set<string>(authCookieNames);
  for (const c of allCookies) {
    if (
      c.name.includes("authjs") ||
      c.name.includes("next-auth") ||
      c.name.includes("session")
    ) {
      namesToClear.add(c.name);
    }
  }

  // 2. Expire cookies across both secure (HTTPS) and standard environments
  for (const name of namesToClear) {
    // Delete for HTTPS / Secure
    response.cookies.set({
      name,
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      secure: true,
      httpOnly: true,
      sameSite: "lax",
    });

    // Also delete without secure flag for localhost/HTTP
    response.cookies.set({
      name,
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}

export async function GET() {
  return POST();
}
