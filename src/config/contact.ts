export const DEFAULT_WHATSAPP_NUMBER = "6281234567890";

function sanitizeWhatsappNumber(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

export function getCheckoutWhatsappNumber(): string {
  const envNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ?? "";
  const sanitizedEnvNumber = sanitizeWhatsappNumber(envNumber);

  if (sanitizedEnvNumber.length >= 9) {
    return sanitizedEnvNumber;
  }

  return sanitizeWhatsappNumber(DEFAULT_WHATSAPP_NUMBER);
}
