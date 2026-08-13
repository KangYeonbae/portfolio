import { NextResponse } from "next/server";
import { isContentDatabaseConfigured } from "@/lib/content-store";

export function GET() {
  return NextResponse.json({ ok: true, databaseConfigured: isContentDatabaseConfigured(), studioConfigured: Boolean(process.env.ADMIN_API_TOKEN) });
}
