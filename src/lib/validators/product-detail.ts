import { z } from "zod";
import type { ProductItem, ProductVariantType } from "@/data/products";

export type ProductDetailPayload = {
  selectedVariantsByType: Partial<Record<ProductVariantType, string>>;
  customerInputs: Record<string, string>;
  quantity: number;
};

type ValidationIssueMap = {
  variantIssues: Partial<Record<ProductVariantType, string>>;
  inputIssues: Record<string, string>;
  quantityIssue?: string;
};

export type ProductDetailValidationResult = {
  isValid: boolean;
  issues: ValidationIssueMap;
};

function safeRegex(pattern?: string) {
  if (!pattern) {
    return null;
  }

  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
}

export function validateProductDetailPayload(
  product: ProductItem,
  payload: ProductDetailPayload,
): ProductDetailValidationResult {
  const variantIssues: Partial<Record<ProductVariantType, string>> = {};
  const inputIssues: Record<string, string> = {};

  const variantSchema = z.record(z.string(), z.string().min(1));
  const quantitySchema = z.number().int().positive();

  const groupedVariantTypes = new Map<ProductVariantType, string[]>();
  for (const variant of product.variants.filter((item) => item.isActive ?? true)) {
    const existing = groupedVariantTypes.get(variant.type) ?? [];
    groupedVariantTypes.set(variant.type, [...existing, variant.id]);
  }

  const variantParse = variantSchema.safeParse(payload.selectedVariantsByType);
  if (!variantParse.success) {
    for (const type of groupedVariantTypes.keys()) {
      if (!payload.selectedVariantsByType[type]) {
        variantIssues[type] = `Pilihan ${type.toLowerCase()} wajib dipilih.`;
      }
    }
  }

  for (const [type, validIds] of groupedVariantTypes) {
    const selectedId = payload.selectedVariantsByType[type];
    if (!selectedId) {
      variantIssues[type] = `Pilihan ${type.toLowerCase()} wajib dipilih.`;
      continue;
    }

    if (!validIds.includes(selectedId)) {
      variantIssues[type] = `Pilihan ${type.toLowerCase()} tidak valid.`;
    }
  }

  for (const field of product.requirements) {
    const value = payload.customerInputs[field.key]?.trim() ?? "";

    if (field.required && value.length === 0) {
      inputIssues[field.key] = `${field.label} wajib diisi.`;
      continue;
    }

    if (value.length > 0) {
      const regex = safeRegex(field.validationRegex);
      if (regex && !regex.test(value)) {
        inputIssues[field.key] = `${field.label} tidak valid.`;
      }
    }
  }

  const quantityParse = quantitySchema.safeParse(payload.quantity);
  const quantityIssue = quantityParse.success ? undefined : "Jumlah minimal 1.";

  const isValid =
    Object.keys(variantIssues).length === 0 &&
    Object.keys(inputIssues).length === 0 &&
    !quantityIssue;

  return {
    isValid,
    issues: {
      variantIssues,
      inputIssues,
      quantityIssue,
    },
  };
}
