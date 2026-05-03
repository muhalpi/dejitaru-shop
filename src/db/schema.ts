import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const productCategoryEnum = pgEnum("product_category", [
  "APPS_PREMIUM",
  "PULSA",
  "TOKEN_LISTRIK",
  "TOPUP_GAME",
  "LAINNYA",
]);

export const productVariantTypeEnum = pgEnum("product_variant_type", [
  "VARIAN",
  "NOMINAL",
  "JENIS",
  "DURASI",
  "PROVIDER",
]);

export const productInputTypeEnum = pgEnum("product_input_type", [
  "TEXT",
  "NUMBER",
  "TEL",
  "SELECT",
]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: productCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  termsAndConditions: text("terms_and_conditions").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isPopular: boolean("is_popular").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  type: productVariantTypeEnum("type").notNull().default("VARIAN"),
  value: text("value").notNull(),
  price: integer("price").notNull(),
  promoPrice: integer("promo_price"),
  promoStartAt: timestamp("promo_start_at", { withTimezone: true }),
  promoEndAt: timestamp("promo_end_at", { withTimezone: true }),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productRequirements = pgTable("product_requirements", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  fieldKey: text("field_key").notNull(),
  fieldLabel: text("field_label").notNull(),
  inputType: productInputTypeEnum("input_type").notNull().default("TEXT"),
  placeholder: text("placeholder"),
  isRequired: boolean("is_required").notNull().default(true),
  validationRegex: text("validation_regex"),
  helpText: text("help_text"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  cover: text("cover").notNull(),
  content: text("content").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const storeSettings = pgTable("store_settings", {
  id: text("id").primaryKey().default("default"),
  whatsappNumber: text("whatsapp_number").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
