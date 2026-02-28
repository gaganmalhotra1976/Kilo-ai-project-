import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)));

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}
