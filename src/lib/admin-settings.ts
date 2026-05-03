import { DEFAULT_WHATSAPP_NUMBER, sanitizeWhatsappNumber } from "@/config/contact";
import { getStoreSettingsRow } from "@/lib/store-settings";

export type AdminStoreSettings = {
  whatsappNumber: string;
};

export async function getAdminStoreSettings(): Promise<AdminStoreSettings> {
  const settings = await getStoreSettingsRow();
  const resolved = sanitizeWhatsappNumber(settings?.whatsappNumber ?? "");

  if (resolved.length >= 9) {
    return { whatsappNumber: resolved };
  }

  return { whatsappNumber: sanitizeWhatsappNumber(DEFAULT_WHATSAPP_NUMBER) };
}
