import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Blog | The Vaccine Panda – Home Vaccination Tips & Health Guides",
  description:
    "Read expert articles on vaccines, child immunisation schedules, travel vaccines, and home vaccination services in Delhi NCR by The Vaccine Panda.",
  openGraph: {
    title: "Blog | The Vaccine Panda",
    description:
      "Expert articles on vaccines, child immunisation, travel vaccines, and home vaccination in Delhi NCR.",
    type: "website",
    url: "https://thevaccinepanda.com/blog",
  },
  alternates: {
    canonical: "https://thevaccinepanda.com/blog",
  },
};

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  author: string;
  category: string | null;
  publishedAt: Date | null;
  createdAt: Date | null;
};

async function getPosts(): Promise<BlogPost[]> {
  try {
    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverImageUrl: blogPosts.coverImageUrl,
        author: blogPosts.author,
        category: blogPosts.category,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));
    return posts;
  } catch {
    return [];
  }
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-emerald-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-emerald-300 text-sm font-semibold uppercase tracking-widest mb-2">
            Health & Vaccines
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            The Vaccine Panda Blog
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Expert guides on vaccines, immunisation schedules, travel health,
            and home vaccination services in Delhi NCR.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl">No articles published yet.</p>
            <p className="mt-2 text-sm">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {post.coverImageUrl ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-emerald-50 flex items-center justify-center">
                    <span className="text-5xl">💉</span>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  {post.category && (
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
                      {post.category}
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-emerald-700 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-500 text-sm line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>{post.author}</span>
                    <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
