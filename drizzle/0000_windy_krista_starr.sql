CREATE TYPE "public"."product_category" AS ENUM('APPS_PREMIUM', 'PULSA', 'TOKEN_LISTRIK', 'TOPUP_GAME');--> statement-breakpoint
CREATE TYPE "public"."product_input_type" AS ENUM('TEXT', 'NUMBER', 'TEL', 'SELECT');--> statement-breakpoint
CREATE TYPE "public"."product_variant_type" AS ENUM('VARIAN', 'NOMINAL', 'JENIS', 'DURASI', 'PROVIDER');--> statement-breakpoint
CREATE TABLE "product_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"field_key" text NOT NULL,
	"field_label" text NOT NULL,
	"input_type" "product_input_type" DEFAULT 'TEXT' NOT NULL,
	"placeholder" text,
	"is_required" boolean DEFAULT true NOT NULL,
	"validation_regex" text,
	"help_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"label" text NOT NULL,
	"type" "product_variant_type" DEFAULT 'VARIAN' NOT NULL,
	"value" text NOT NULL,
	"price" integer NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" "product_category" NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"terms_and_conditions" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "product_requirements" ADD CONSTRAINT "product_requirements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;