import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db/client";
import { productRequirements } from "@/db/schema";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { requirementUpdateSchema } from "@/lib/validators/admin";

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
  const parsed = requirementUpdateSchema.safeParse({ ...payload, id });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  await db
    .update(productRequirements)
    .set({
      fieldKey: data.fieldKey,
      fieldLabel: data.fieldLabel,
      inputType: data.inputType,
      placeholder: data.placeholder || null,
      isRequired: data.isRequired,
      validationRegex: data.validationRegex || null,
      helpText: data.helpText || null,
      sortOrder: data.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(productRequirements.id, id));

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
  await db.delete(productRequirements).where(eq(productRequirements.id, id));
  return NextResponse.json({ ok: true });
}
