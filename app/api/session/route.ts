import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminSession, isAdminRequest, verifyAdminToken } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: isAdminRequest(request), configured: Boolean(process.env.ADMIN_API_TOKEN) });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  if (!verifyAdminToken(body.token)) {
    return NextResponse.json({ error: "관리자 키가 올바르지 않습니다." }, { status: 401 });
  }
  const session = createAdminSession();
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
