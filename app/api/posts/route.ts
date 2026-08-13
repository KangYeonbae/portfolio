import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createPost, listPosts } from "@/lib/content-store";
import { parsePostInput } from "@/lib/content-validation";

export async function GET(request: NextRequest) {
  const includeDrafts = request.nextUrl.searchParams.get("drafts") === "true" && isAdminRequest(request);
  try {
    return NextResponse.json({ posts: await listPosts({ includeDrafts }) });
  } catch {
    return NextResponse.json({ error: "콘텐츠 저장소에 연결할 수 없습니다." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const post = await createPost(parsePostInput(await request.json()));
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "글을 저장하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
