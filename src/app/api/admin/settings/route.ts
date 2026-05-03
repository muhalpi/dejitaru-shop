import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { storeSettings } from "@/db/schema";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { storeSettingsUpdateSchema } from "@/lib/validators/admin";
import { STORE_SETTINGS_ID } from "@/lib/store-settings";
import { sanitizeWhatsappNumber } from "@/config/contact";

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

  const rows = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.id, STORE_SETTINGS_ID))
    .limit(1);
  const row = rows[0] ?? null;

  return NextResponse.json({
    whatsappNumber: sanitizeWhatsappNumber(row?.whatsappNumber ?? ""),
  });
}

export async function PATCH(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({ error: "DATABASE_URL belum dikonfigurasi." }, { status: 500 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = storeSettingsUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const whatsappNumber = sanitizeWhatsappNumber(parsed.data.whatsappNumber);

  try {
    await db
      .insert(storeSettings)
      .values({
        id: STORE_SETTINGS_ID,
        whatsappNumber,
      })
      .onConflictDoUpdate({
        target: storeSettings.id,
        set: {
          whatsappNumber,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ ok: true, whatsappNumber });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan toko.", detail: String(error) },
      { status: 500 },
    );
  }
}
