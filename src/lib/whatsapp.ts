export const DEFAULT_WHATSAPP_NUMBER = "6281234567890";

export function sanitizeWhatsappNumber(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}
