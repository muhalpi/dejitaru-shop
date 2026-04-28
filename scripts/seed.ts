import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { homepagePopularProductSlugs, productCatalog } from "../src/data/products";
import {
  productRequirements,
  products,
  productVariants,
  type productCategoryEnum,
  type productInputTypeEnum,
  type productVariantTypeEnum,
} from "../src/db/schema";

loadEnv({ path: ".env.local" });
loadEnv();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum di-set. Isi di .env.local atau .env.");
}

const db = drizzle(neon(process.env.DATABASE_URL));

type DbCategory = (typeof productCategoryEnum.enumValues)[number];
type DbVariantType = (typeof productVariantTypeEnum.enumValues)[number];
type DbInputType = (typeof productInputTypeEnum.enumValues)[number];

function mapCategory(category: string): DbCategory {
  switch (category) {
    case "Apps Premium":
      return "APPS_PREMIUM";
    case "Pulsa":
      return "PULSA";
    case "Token Listrik":
      return "TOKEN_LISTRIK";
    case "Topup Game":
      return "TOPUP_GAME";
    default:
      return "APPS_PREMIUM";
  }
}

function mapVariantType(type: string): DbVariantType {
  void type;
  return "VARIAN";
}

function mapInputType(type: string): DbInputType {
  if (type === "NUMBER" || type === "TEL" || type === "SELECT") {
    return type;
  }

  return "TEXT";
}

function serializeTerms(terms: string[]): string {
  return terms.join("\n");
}

async function main() {
  console.log("Seed dimulai...");

  for (const product of productCatalog) {
    const slug = product.slug;
    const isPopular = homepagePopularProductSlugs.includes(slug);

    const inserted = await db
      .insert(products)
      .values({
        slug,
        name: product.name,
        category: mapCategory(product.category),
        description: product.description,
        imageUrl: null,
        termsAndConditions: serializeTerms(product.terms),
        isActive: true,
        isPopular,
      })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: product.name,
          category: mapCategory(product.category),
          description: product.description,
          termsAndConditions: serializeTerms(product.terms),
          isPopular,
          updatedAt: new Date(),
        },
      })
      .returning({ id: products.id });

    const productId = inserted[0]?.id;

    if (!productId) {
      continue;
    }

    await db.delete(productVariants).where(eq(productVariants.productId, productId));
    await db.delete(productRequirements).where(eq(productRequirements.productId, productId));

    if (product.variants.length > 0) {
      await db.insert(productVariants).values(
        product.variants.map((variant, index) => ({
          productId,
          label: variant.label,
          type: mapVariantType(variant.type),
          value: variant.value,
          price: variant.price,
          promoPrice: variant.promoPrice ?? null,
          promoStartAt: variant.promoStartAt ? new Date(variant.promoStartAt) : null,
          promoEndAt: variant.promoEndAt ? new Date(variant.promoEndAt) : null,
          isDefault: variant.isDefault ?? index === 0,
          isActive: variant.isActive ?? true,
          sortOrder: variant.sortOrder ?? index,
        })),
      );
    }

    if (product.requirements.length > 0) {
      for (let i = 0; i < product.requirements.length; i += 1) {
        const requirement = product.requirements[i];

        await db.insert(productRequirements).values({
          productId,
          fieldKey: requirement.key,
          fieldLabel: requirement.label,
          inputType: mapInputType(requirement.inputType),
          placeholder: requirement.placeholder,
          isRequired: requirement.required,
          validationRegex: requirement.validationRegex ?? null,
          helpText: requirement.helperText ?? null,
          sortOrder: i,
        });
      }
    }

    console.log(`- Seeded: ${product.name}`);
  }

  console.log("Seed selesai.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
