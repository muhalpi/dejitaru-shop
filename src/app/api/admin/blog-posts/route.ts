import { desc } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { blogPostCreateSchema } from "@/lib/validators/admin";

function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSessionToken(token);
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({ error: "DATABASE_URL belum dikonfigurasi." }, { status: 500 });
  }

  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  return NextResponse.json({ posts: rows });
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({ error: "DATABASE_URL belum dikonfigurasi." }, { status: 500 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = blogPostCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const inserted = await db
      .insert(blogPosts)
      .values({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        cover: data.cover,
        content: data.content,
        publishedAt: data.publishedAt,
      })
      .onConflictDoNothing()
      .returning({ id: blogPosts.id });

    if (inserted.length === 0) {
      return NextResponse.json({ error: "Slug artikel sudah digunakan." }, { status: 409 });
    }

    return NextResponse.json({ ok: true, id: inserted[0].id });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat artikel blog.", detail: String(error) },
      { status: 500 },
    );
  }
}
