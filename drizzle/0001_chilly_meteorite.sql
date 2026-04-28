ALTER TABLE "product_variants" ADD COLUMN "promo_price" integer;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "promo_start_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "promo_end_at" timestamp with time zone;