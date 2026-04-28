import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db/client";
import { productVariants } from "@/db/schema";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { variantCreateSchema } from "@/lib/validators/admin";

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
  const parsed = variantCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  await db.insert(productVariants).values({
    productId: data.productId,
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
  });

  return NextResponse.json({ ok: true });
}
