import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
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

export async function getAllBlogPosts(): Promise<BlogPost[]> {
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

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getLatestBlogPosts(limit = 4): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.slice(0, Math.max(1, limit));
}
