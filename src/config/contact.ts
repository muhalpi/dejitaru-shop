import { getStoreSettingsRow } from "@/lib/store-settings";
import { DEFAULT_WHATSAPP_NUMBER, sanitizeWhatsappNumber } from "@/lib/whatsapp";
export { DEFAULT_WHATSAPP_NUMBER, sanitizeWhatsappNumber };

function resolveEnvWhatsappNumber() {
  const envNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ?? "";
  const sanitizedEnvNumber = sanitizeWhatsappNumber(envNumber);

  if (sanitizedEnvNumber.length >= 9) {
    return sanitizedEnvNumber;
  }

  return sanitizeWhatsappNumber(DEFAULT_WHATSAPP_NUMBER);
}

export async function getCheckoutWhatsappNumber(): Promise<string> {
  const settings = await getStoreSettingsRow();
  const dbNumber = sanitizeWhatsappNumber(settings?.whatsappNumber ?? "");

  if (dbNumber.length >= 9) {
    return dbNumber;
  }

  return resolveEnvWhatsappNumber();
}
