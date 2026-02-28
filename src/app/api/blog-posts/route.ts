import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get("published") !== "false";

    const query = db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));

    const posts = publishedOnly
      ? await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.isPublished, true))
          .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
      : await query;

    return NextResponse.json(posts);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "title, slug, and content are required" }, { status: 400 });
    }

    const now = new Date();
    const [post] = await db
      .insert(blogPosts)
      .values({
        title,
        slug,
        excerpt: excerpt ?? null,
        content,
        coverImageUrl: coverImageUrl ?? null,
        metaTitle: metaTitle ?? null,
        metaDescription: metaDescription ?? null,
        metaKeywords: metaKeywords ?? null,
        author: author ?? "The Vaccine Panda Team",
        category: category ?? null,
        tags: tags ? JSON.stringify(tags) : null,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
