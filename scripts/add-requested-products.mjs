import path from "node:path";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL belum di-set. Isi di .env.local atau .env.");
}

const sql = neon(databaseUrl);

const requestedProducts = [
  { name: "Iqiyi", slug: "iqiyi" },
  { name: "Lightroom", slug: "lightroom" },
  { name: "Loklok", slug: "loklok" },
  { name: "Miro", slug: "miro" },
  { name: "MS Office", slug: "ms-office" },
  { name: "Netflix", slug: "netflix" },
  { name: "Office", slug: "office" },
  { name: "Prime", slug: "prime" },
  { name: "Spotify", slug: "spotify" },
  { name: "Vidio", slug: "vidio" },
  { name: "Viu", slug: "viu" },
  { name: "VPN", slug: "vpn" },
  { name: "WeTV", slug: "wetv" },
  { name: "Windows", slug: "windows" },
  { name: "Youtube", slug: "youtube" },
  { name: "Zoom", slug: "zoom" },
];

const baseTerms = [
  "Pesanan diproses setelah pembayaran dikonfirmasi admin.",
  "Data tujuan wajib benar sebelum checkout via WhatsApp.",
  "Garansi mengikuti masa aktif dan ketentuan tiap produk.",
].join("\n");

const defaultVariants = [
  { label: "Paket 1 Bulan", value: "1_bulan", price: 39000, isDefault: true, sortOrder: 1 },
  { label: "Paket 3 Bulan", value: "3_bulan", price: 99000, isDefault: false, sortOrder: 2 },
  { label: "Paket 12 Bulan", value: "12_bulan", price: 299000, isDefault: false, sortOrder: 3 },
];

let insertedProducts = 0;
let skippedProducts = 0;
let insertedVariants = 0;
let insertedRequirements = 0;

for (const product of requestedProducts) {
  const existing = await sql`
    select id
    from products
    where slug = ${product.slug}
    limit 1
  `;

  let productId;

  if (existing.length > 0) {
    productId = existing[0].id;
    skippedProducts += 1;
  } else {
    const inserted = await sql`
      insert into products (
        name,
        slug,
        category,
        description,
        image_url,
        terms_and_conditions,
        is_active,
        is_popular
      )
      values (
        ${product.name},
        ${product.slug},
        'APPS_PREMIUM',
        ${`${product.name} premium dengan proses aktivasi cepat dan dukungan admin.`},
        null,
        ${baseTerms},
        true,
        false
      )
      returning id
    `;

    productId = inserted[0].id;
    insertedProducts += 1;
  }

  const variantCountRows = await sql`
    select count(*)::int as count
    from product_variants
    where product_id = ${productId}
  `;

  const variantCount = Number(variantCountRows[0]?.count ?? 0);

  if (variantCount === 0) {
    for (const variant of defaultVariants) {
      await sql`
        insert into product_variants (
          product_id,
          label,
          type,
          value,
          price,
          promo_price,
          promo_start_at,
          promo_end_at,
          is_default,
          is_active,
          sort_order
        )
        values (
          ${productId},
          ${variant.label},
          'VARIAN',
          ${variant.value},
          ${variant.price},
          null,
          null,
          null,
          ${variant.isDefault},
          true,
          ${variant.sortOrder}
        )
      `;
      insertedVariants += 1;
    }
  }

  const requirementCountRows = await sql`
    select count(*)::int as count
    from product_requirements
    where product_id = ${productId}
  `;

  const requirementCount = Number(requirementCountRows[0]?.count ?? 0);

  if (requirementCount === 0) {
    await sql`
      insert into product_requirements (
        product_id,
        field_key,
        field_label,
        input_type,
        placeholder,
        is_required,
        validation_regex,
        help_text,
        sort_order
      )
      values (
        ${productId},
        'customerWhatsapp',
        'Nomor WhatsApp Aktif',
        'TEL',
        'Contoh: 081234567890',
        true,
        '^(?:\\+?62|0)[2-9][0-9]{7,12}$',
        'Nomor aktif untuk proses akun dan konfirmasi order.',
        0
      )
    `;
    insertedRequirements += 1;
  }
}

console.log(
  JSON.stringify(
    {
      totalRequested: requestedProducts.length,
      insertedProducts,
      skippedProducts,
      insertedVariants,
      insertedRequirements,
    },
    null,
    2,
  ),
);
