import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createProject, listProjects } from "@/lib/content-store";
import { parseProjectInput } from "@/lib/content-validation";

export async function GET() {
  try {
    return NextResponse.json({ projects: await listProjects() });
  } catch {
    return NextResponse.json({ error: "프로젝트 저장소에 연결할 수 없습니다." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const project = await createProject(parseProjectInput(await request.json()));
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "프로젝트를 저장하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
