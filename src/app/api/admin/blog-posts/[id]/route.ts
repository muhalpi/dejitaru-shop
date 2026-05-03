import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { blogPostUpdateSchema } from "@/lib/validators/admin";

function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSessionToken(token);
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({ error: "DATABASE_URL belum dikonfigurasi." }, { status: 500 });
  }

  const { id } = await params;
  const payload = await request.json().catch(() => null);
  const parsed = blogPostUpdateSchema.safeParse({ ...payload, id });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    await db
      .update(blogPosts)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        cover: data.cover,
        content: data.content,
        publishedAt: data.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui artikel blog.", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({ error: "DATABASE_URL belum dikonfigurasi." }, { status: 500 });
  }

  const { id } = await params;
  await db.delete(blogPosts).where(eq(blogPosts.id, id));

  return NextResponse.json({ ok: true });
}
