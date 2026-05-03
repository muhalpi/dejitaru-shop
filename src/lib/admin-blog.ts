import { desc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { getFileBlogPosts } from "@/lib/blog";

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  content: string;
  publishedAt: string;
};

export async function getAdminBlogPosts(): Promise<AdminBlogPost[]> {
  const db = getDb();

  if (!db) {
    return [];
  }

  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    cover: row.cover,
    content: row.content,
    publishedAt: new Date(row.publishedAt).toISOString(),
  }));
}

export async function syncExistingFileBlogPostsToDatabase(): Promise<number> {
  const db = getDb();

  if (!db) {
    return 0;
  }

  const filePosts = await getFileBlogPosts();
  let insertedCount = 0;

  for (const post of filePosts) {
    const publishedAt = new Date(post.date);
    const safePublishedAt = Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt;

    const inserted = await db
      .insert(blogPosts)
      .values({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        cover: post.cover,
        content: post.content,
        publishedAt: safePublishedAt,
      })
      .onConflictDoNothing({ target: blogPosts.slug })
      .returning({ id: blogPosts.id });

    if (inserted.length > 0) {
      insertedCount += 1;
    }
  }

  return insertedCount;
}
