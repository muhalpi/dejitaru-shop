import { z } from "zod";

export const productCategorySchema = z.enum([
  "APPS_PREMIUM",
  "PULSA",
  "TOKEN_LISTRIK",
  "TOPUP_GAME",
  "LAINNYA",
]);

const productImageUrlSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) {
      return true;
    }

    if (value.startsWith("/")) {
      return true;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, "Image URL harus berupa URL valid atau path lokal yang diawali '/'.");

export const productCreateSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  category: productCategorySchema,
  description: z.string().min(10),
  imageUrl: productImageUrlSchema.optional().or(z.literal("")),
  termsAndConditions: z.string().min(10),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
});

export const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export const variantTypeSchema = z.literal("VARIAN");

const nullableDateSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }

  return value;
}, z.date().nullable());

const variantBaseSchema = z.object({
  productId: z.string().uuid(),
  label: z.string().min(1),
  type: variantTypeSchema,
  value: z.string().min(1),
  price: z.number().int().positive(),
  promoPrice: z.number().int().positive().nullable().optional(),
  promoStartAt: nullableDateSchema.optional(),
  promoEndAt: nullableDateSchema.optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
});

function validateVariantPromo(
  value: {
    price?: number;
    promoPrice?: number | null;
    promoStartAt?: Date | null;
    promoEndAt?: Date | null;
  },
  ctx: z.RefinementCtx,
) {
  const promoPrice = value.promoPrice ?? null;
  const promoStartAt = value.promoStartAt ?? null;
  const promoEndAt = value.promoEndAt ?? null;

  if (promoPrice !== null && value.price !== undefined && promoPrice >= value.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["promoPrice"],
      message: "Harga promo harus lebih kecil dari harga normal.",
    });
  }

  if ((promoStartAt && !promoEndAt) || (!promoStartAt && promoEndAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["promoStartAt"],
      message: "Promo start dan end harus diisi berpasangan.",
    });
  }

  if (promoStartAt && promoEndAt && promoStartAt > promoEndAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["promoEndAt"],
      message: "Waktu promo berakhir harus setelah waktu mulai.",
    });
  }
}

export const variantCreateSchema = variantBaseSchema.superRefine(validateVariantPromo);

export const variantUpdateSchema = variantBaseSchema.partial().extend({
  id: z.string().uuid(),
}).superRefine(validateVariantPromo);

export const inputTypeSchema = z.enum(["TEXT", "NUMBER", "TEL", "SELECT"]);

export const requirementCreateSchema = z.object({
  productId: z.string().uuid(),
  fieldKey: z.string().min(1),
  fieldLabel: z.string().min(1),
  inputType: inputTypeSchema,
  placeholder: z.string().optional().or(z.literal("")),
  isRequired: z.boolean().default(true),
  validationRegex: z.string().optional().or(z.literal("")),
  helpText: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const requirementUpdateSchema = requirementCreateSchema.partial().extend({
  id: z.string().uuid(),
});

const blogCoverSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) {
      return false;
    }

    if (value.startsWith("/")) {
      return true;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, "Cover harus berupa URL valid atau path lokal yang diawali '/'.");

const publishedAtSchema = z.preprocess((value) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return value;
}, z.date());

export const blogPostCreateSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().trim().min(10),
  cover: blogCoverSchema,
  content: z.string().min(10),
  publishedAt: publishedAtSchema,
});

export const blogPostUpdateSchema = blogPostCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export const storeSettingsUpdateSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .min(9)
    .refine((value) => value.replace(/\D/g, "").length >= 9, "Nomor WhatsApp tidak valid."),
});
