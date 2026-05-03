import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { productRequirements, products, productVariants } from "@/db/schema";
import {
  getHomepagePopularProducts,
  productCatalog,
  type ProductCategory,
  type ProductInputType,
  type ProductItem,
  type ProductVariantType,
} from "@/data/products";

const fallbackColorByCategory: Record<ProductCategory, string[]> = {
  "Apps Premium": [
    "from-fuchsia-500/90 to-orange-500/80",
    "from-zinc-100/95 to-zinc-300/75",
    "from-cyan-400/90 to-indigo-500/80",
  ],
  Pulsa: [
    "from-red-500/90 to-rose-600/80",
    "from-sky-500/90 to-blue-600/80",
    "from-yellow-400/90 to-orange-500/80",
  ],
  "Token Listrik": [
    "from-cyan-500/90 to-blue-500/80",
    "from-blue-500/90 to-indigo-600/80",
  ],
  "Topup Game": [
    "from-orange-500/90 to-red-500/80",
    "from-blue-400/90 to-fuchsia-500/80",
    "from-violet-500/90 to-indigo-600/80",
  ],
  Lainnya: [
    "from-slate-500/90 to-zinc-600/80",
    "from-teal-500/90 to-cyan-600/80",
  ],
};

const categoryMap = {
  APPS_PREMIUM: "Apps Premium",
  PULSA: "Pulsa",
  TOKEN_LISTRIK: "Token Listrik",
  TOPUP_GAME: "Topup Game",
  LAINNYA: "Lainnya",
} as const;

type DbCategory = keyof typeof categoryMap;

type DbCatalogResponse = {
  products: ProductItem[];
  popularProducts: ProductItem[];
};

function pickColor(category: ProductCategory, index: number) {
  const palette = fallbackColorByCategory[category];
  return palette[index % palette.length];
}

function getShortCode(name: string) {
  const words = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
}

function splitTerms(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function mapInputType(inputType: string): ProductInputType {
  if (inputType === "NUMBER" || inputType === "TEL" || inputType === "SELECT") {
    return inputType;
  }

  return "TEXT";
}

function mapVariantType(type: string): ProductVariantType {
  void type;
  return "VARIAN";
}

async function fetchCatalogFromDatabase(): Promise<DbCatalogResponse | null> {
  const db = getDb();

  if (!db) {
    return null;
  }

  const productRows = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.name));

  if (productRows.length === 0) {
    return {
      products: [],
      popularProducts: [],
    };
  }

  const productIds = productRows.map((row) => row.id);

  const [variantRows, requirementRows] = await Promise.all([
    db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.productId, productIds))
      .orderBy(asc(productVariants.sortOrder), asc(productVariants.label)),
    db
      .select()
      .from(productRequirements)
      .where(inArray(productRequirements.productId, productIds))
      .orderBy(asc(productRequirements.sortOrder), asc(productRequirements.fieldLabel)),
  ]);

  const variantMap = new Map<string, typeof variantRows>();
  const requirementMap = new Map<string, typeof requirementRows>();

  for (const variant of variantRows) {
    variantMap.set(variant.productId, [...(variantMap.get(variant.productId) ?? []), variant]);
  }

  for (const requirement of requirementRows) {
    requirementMap.set(requirement.productId, [
      ...(requirementMap.get(requirement.productId) ?? []),
      requirement,
    ]);
  }

  const mappedProducts: ProductItem[] = productRows.map((row, index) => {
    const uiCategory = categoryMap[row.category as DbCategory];
    const variants = (variantMap.get(row.id) ?? []).map((variant) => ({
      id: variant.id,
      label: variant.label,
      type: mapVariantType(variant.type),
      value: variant.value,
      price: variant.price,
      promoPrice: variant.promoPrice,
      promoStartAt: variant.promoStartAt ? new Date(variant.promoStartAt).toISOString() : null,
      promoEndAt: variant.promoEndAt ? new Date(variant.promoEndAt).toISOString() : null,
      isDefault: variant.isDefault,
      isActive: variant.isActive,
      sortOrder: variant.sortOrder,
    }));

    const requirements = (requirementMap.get(row.id) ?? []).map((requirement) => ({
      key: requirement.fieldKey,
      label: requirement.fieldLabel,
      inputType: mapInputType(requirement.inputType),
      placeholder: requirement.placeholder ?? "",
      required: requirement.isRequired,
      validationRegex: requirement.validationRegex ?? undefined,
      helperText: requirement.helpText ?? undefined,
    }));

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: uiCategory,
      description: row.description,
      imageUrl: row.imageUrl ?? undefined,
      variants,
      terms: splitTerms(row.termsAndConditions),
      requirements,
      short: getShortCode(row.name),
      color: pickColor(uiCategory, index),
    };
  });

  const popularProducts = mappedProducts.filter((product) => {
    const source = productRows.find((row) => row.id === product.id);
    return source?.isPopular ?? false;
  });

  return {
    products: mappedProducts,
    popularProducts,
  };
}

export async function getStoreCatalog(): Promise<ProductItem[]> {
  try {
    const dbCatalog = await fetchCatalogFromDatabase();

    if (!dbCatalog || dbCatalog.products.length === 0) {
      return productCatalog;
    }

    return dbCatalog.products;
  } catch {
    return productCatalog;
  }
}

export async function getStorePopularProducts(): Promise<ProductItem[]> {
  try {
    const dbCatalog = await fetchCatalogFromDatabase();

    if (!dbCatalog || dbCatalog.products.length === 0) {
      return getHomepagePopularProducts().slice(0, 8);
    }

    if (dbCatalog.popularProducts.length === 0) {
      return dbCatalog.products.slice(0, 8);
    }

    return dbCatalog.popularProducts.slice(0, 8);
  } catch {
    return getHomepagePopularProducts().slice(0, 8);
  }
}

export async function getStoreProductBySlug(slug: string): Promise<ProductItem | null> {
  const catalog = await getStoreCatalog();
  return catalog.find((item) => item.slug === slug) ?? null;
}
