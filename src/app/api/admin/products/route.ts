import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db/client";
import { products } from "@/db/schema";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { productCreateSchema } from "@/lib/validators/admin";

function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSessionToken(token);
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
  const parsed = productCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const inserted = await db
      .insert(products)
      .values({
        name: data.name,
        slug: data.slug,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl || null,
        termsAndConditions: data.termsAndConditions,
        isActive: data.isActive,
        isPopular: data.isPopular,
      })
      .onConflictDoNothing()
      .returning({ id: products.id });

    if (inserted.length === 0) {
      return NextResponse.json({ error: "Slug sudah digunakan." }, { status: 409 });
    }

    return NextResponse.json({ ok: true, id: inserted[0].id });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat produk.", detail: String(error) }, { status: 500 });
  }
}
