import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteProject, updateProject } from "@/lib/content-store";
import { parseProjectInput } from "@/lib/content-validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    const project = await updateProject(id, parseProjectInput(await request.json()));
    if (!project) return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ project });
  } catch (error) {
    const message = error instanceof Error ? error.message : "프로젝트를 수정하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    await deleteProject(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "프로젝트를 삭제하지 못했습니다." }, { status: 400 });
  }
}
