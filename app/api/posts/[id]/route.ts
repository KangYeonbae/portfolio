import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deletePost, updatePost } from "@/lib/content-store";
import { parsePostInput } from "@/lib/content-validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    const post = await updatePost(id, parsePostInput(await request.json()));
    if (!post) return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "글을 수정하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    await deletePost(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "글을 삭제하지 못했습니다." }, { status: 400 });
  }
}
