import { NextResponse } from "next/server";
import { db } from "@/db";
import { youtubeVideos } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(youtubeVideos)
      .where(eq(youtubeVideos.isActive, true))
      .orderBy(asc(youtubeVideos.sortOrder));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/youtube-videos error:", err);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, videoId, description, sortOrder, isActive } = body;
    if (!title || !videoId) {
      return NextResponse.json({ error: "title and videoId are required" }, { status: 400 });
    }
    const [row] = await db
      .insert(youtubeVideos)
      .values({
        title,
        videoId,
        description: description ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("POST /api/youtube-videos error:", err);
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}
