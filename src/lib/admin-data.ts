import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { productRequirements, products, productVariants } from "@/db/schema";

export type AdminCatalogProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  imageUrl: string | null;
  termsAndConditions: string;
  isActive: boolean;
  isPopular: boolean;
  variants: {
    id: string;
    label: string;
    type: string;
    value: string;
    price: number;
    promoPrice: number | null;
    promoStartAt: string | Date | null;
    promoEndAt: string | Date | null;
    isDefault: boolean;
    isActive: boolean;
    sortOrder: number;
  }[];
  requirements: {
    id: string;
    fieldKey: string;
    fieldLabel: string;
    inputType: string;
    placeholder: string | null;
    isRequired: boolean;
    validationRegex: string | null;
    helpText: string | null;
    sortOrder: number;
  }[];
};

export async function getAdminCatalogData(): Promise<AdminCatalogProduct[]> {
  const db = getDb();

  if (!db) {
    return [];
  }

  const rows = await db.select().from(products).orderBy(asc(products.name));

  if (rows.length === 0) {
    return [];
  }

  const catalog: AdminCatalogProduct[] = [];

  for (const product of rows) {
    const [variants, requirements] = await Promise.all([
      db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, product.id))
        .orderBy(asc(productVariants.sortOrder), asc(productVariants.label)),
      db
        .select()
        .from(productRequirements)
        .where(eq(productRequirements.productId, product.id))
        .orderBy(asc(productRequirements.sortOrder), asc(productRequirements.fieldLabel)),
    ]);

    catalog.push({
      ...product,
      variants: variants.map((variant) => ({
        ...variant,
        type: "VARIAN",
      })),
      requirements,
    });
  }

  return catalog;
}
