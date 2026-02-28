import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, parseInt(id)));

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      coverImageUrl,
      metaTitle,
      metaDescription,
      metaKeywords,
      author,
      category,
      tags,
      isPublished,
    } = body;

    const existing = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, parseInt(id)));

    if (!existing[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const wasPublished = existing[0].isPublished;
    const now = new Date();

    const [updated] = await db
      .update(blogPosts)
      .set({
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(metaKeywords !== undefined && { metaKeywords }),
        ...(author !== undefined && { author }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isPublished && !wasPublished && { publishedAt: now }),
        updatedAt: now,
      })
      .where(eq(blogPosts.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
