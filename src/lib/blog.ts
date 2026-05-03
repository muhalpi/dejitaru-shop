import { promises as fs } from "node:fs";
import path from "node:path";
import { desc } from "drizzle-orm";
import matter from "gray-matter";
import { getDb } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { z } from "zod";

const blogFrontmatterSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().min(10),
  date: z.string().min(8),
  cover: z.string().min(1),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

export type BlogPost = BlogFrontmatter & {
  content: string;
};

const BLOG_CONTENT_PATH = path.join(process.cwd(), "content", "blog");

function mapDatabasePost(row: typeof blogPosts.$inferSelect): BlogPost {
  return {
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    date: new Date(row.publishedAt).toISOString(),
    cover: row.cover,
    content: row.content,
  };
}

async function getBlogPostsFromDatabase(): Promise<BlogPost[] | null> {
  const db = getDb();

  if (!db) {
    return null;
  }

  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));

  if (rows.length === 0) {
    return [];
  }

  return rows.map(mapDatabasePost);
}

async function readBlogDirectoryFiles() {
  try {
    const entries = await fs.readdir(BLOG_CONTENT_PATH, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")))
      .map((entry) => path.join(BLOG_CONTENT_PATH, entry.name));
  } catch {
    return [];
  }
}

function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getFileBlogPosts(): Promise<BlogPost[]> {
  const files = await readBlogDirectoryFiles();
  const posts: BlogPost[] = [];

  for (const filePath of files) {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const parsed = blogFrontmatterSchema.safeParse(data);

    if (!parsed.success) {
      continue;
    }

    posts.push({
      ...parsed.data,
      content,
    });
  }

  return sortByDateDesc(posts);
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  let databasePosts: BlogPost[] | null = null;

  try {
    databasePosts = await getBlogPostsFromDatabase();
  } catch {
    // Fallback to MDX content files when database read fails.
  }

  const filePosts = await getFileBlogPosts();

  if (!databasePosts) {
    return filePosts;
  }

  const mergedBySlug = new Map<string, BlogPost>();

  for (const post of filePosts) {
    mergedBySlug.set(post.slug, post);
  }

  for (const post of databasePosts) {
    mergedBySlug.set(post.slug, post);
  }

  return sortByDateDesc(Array.from(mergedBySlug.values()));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getLatestBlogPosts(limit = 4): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.slice(0, Math.max(1, limit));
}
