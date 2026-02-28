import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string) {
  try {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)));
    return post ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found | The Vaccine Panda Blog",
    };
  }

  const title = post.metaTitle ?? `${post.title} | The Vaccine Panda Blog`;
  const description =
    post.metaDescription ??
    post.excerpt ??
    "Read this article on The Vaccine Panda Blog.";
  const url = `https://thevaccinepanda.com/blog/${post.slug}`;

  return {
    title,
    description,
    keywords: post.metaKeywords ?? undefined,
    authors: [{ name: post.author }],
    openGraph: {
      title,
      description,
      type: "article",
      url,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author],
      ...(post.coverImageUrl && {
        images: [{ url: post.coverImageUrl, alt: post.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.coverImageUrl && { images: [post.coverImageUrl] }),
    },
    alternates: {
      canonical: url,
    },
  };
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const tags: string[] = post.tags ? JSON.parse(post.tags) : [];

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-2">
        <nav className="text-sm text-gray-400 flex gap-2 items-center">
          <Link href="/" className="hover:text-emerald-700">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-emerald-700">
            Blog
          </Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-xs">{post.title}</span>
        </nav>
      </div>

      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Category */}
        {post.category && (
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
            {post.category}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 border-b border-gray-100 pb-6">
          <span>By {post.author}</span>
          <span>·</span>
          <time dateTime={post.publishedAt?.toISOString()}>
            {formatDate(post.publishedAt ?? post.createdAt)}
          </time>
        </div>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-gray-600 font-medium mb-8 leading-relaxed border-l-4 border-emerald-400 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-emerald max-w-none prose-headings:font-bold prose-a:text-emerald-700 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 mb-3">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-900 transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>
      </article>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.metaDescription ?? post.excerpt ?? "",
            author: {
              "@type": "Organization",
              name: post.author,
            },
            publisher: {
              "@type": "Organization",
              name: "The Vaccine Panda",
              url: "https://thevaccinepanda.com",
            },
            datePublished: post.publishedAt?.toISOString(),
            dateModified: post.updatedAt?.toISOString(),
            url: `https://thevaccinepanda.com/blog/${post.slug}`,
            ...(post.coverImageUrl && { image: post.coverImageUrl }),
          }),
        }}
      />
    </main>
  );
}
