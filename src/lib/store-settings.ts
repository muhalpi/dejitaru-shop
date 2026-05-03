import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { storeSettings } from "@/db/schema";

export const STORE_SETTINGS_ID = "default";

export async function getStoreSettingsRow() {
  const db = getDb();

  if (!db) {
    return null;
  }

  const rows = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.id, STORE_SETTINGS_ID))
    .limit(1);

  return rows[0] ?? null;
}
