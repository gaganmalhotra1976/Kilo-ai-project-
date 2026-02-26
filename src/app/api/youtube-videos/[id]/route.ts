import { NextResponse } from "next/server";
import { db } from "@/db";
import { youtubeVideos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, videoId, description, sortOrder, isActive } = body;
    const [row] = await db
      .update(youtubeVideos)
      .set({
        title,
        videoId,
        description: description ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .where(eq(youtubeVideos.id, Number(id)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    console.error("PUT /api/youtube-videos/[id] error:", err);
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(youtubeVideos).where(eq(youtubeVideos.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/youtube-videos/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
