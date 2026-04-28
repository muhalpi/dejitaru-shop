import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db/client";
import { productRequirements } from "@/db/schema";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { requirementCreateSchema } from "@/lib/validators/admin";

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
  const parsed = requirementCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  await db.insert(productRequirements).values({
    productId: data.productId,
    fieldKey: data.fieldKey,
    fieldLabel: data.fieldLabel,
    inputType: data.inputType,
    placeholder: data.placeholder || null,
    isRequired: data.isRequired,
    validationRegex: data.validationRegex || null,
    helpText: data.helpText || null,
    sortOrder: data.sortOrder,
  });

  return NextResponse.json({ ok: true });
}
