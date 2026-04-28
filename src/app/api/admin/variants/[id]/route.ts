import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db/client";
import { productVariants } from "@/db/schema";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { variantUpdateSchema } from "@/lib/validators/admin";

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
  const parsed = variantUpdateSchema.safeParse({ ...payload, id });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  await db
    .update(productVariants)
    .set({
      label: data.label,
      type: "VARIAN",
      value: data.value,
      price: data.price,
      promoPrice: data.promoPrice ?? null,
      promoStartAt: data.promoStartAt ?? null,
      promoEndAt: data.promoEndAt ?? null,
      isDefault: data.isDefault,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(productVariants.id, id));

  return NextResponse.json({ ok: true });
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
  await db.delete(productVariants).where(eq(productVariants.id, id));
  return NextResponse.json({ ok: true });
}
