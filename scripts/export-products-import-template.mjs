import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import * as XLSX from "xlsx";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL tidak ditemukan di .env.local");
}

const sql = neon(databaseUrl);

const rows = await sql`
  select
    id,
    slug,
    name,
    category,
    description,
    image_url,
    terms_and_conditions,
    is_active,
    is_popular
  from products
  order by name asc
`;

const exportRows = rows.map((row) => ({
  slug: row.slug ?? "",
  name: row.name ?? "",
  slug_update: "",
  category: row.category ?? "",
  description: row.description ?? "",
  image_url: row.image_url ?? "NULL",
  terms_and_conditions: row.terms_and_conditions ?? "",
  is_active: String(Boolean(row.is_active)),
  is_popular: String(Boolean(row.is_popular)),
}));

const headers = [
  "slug",
  "name",
  "slug_update",
  "category",
  "description",
  "image_url",
  "terms_and_conditions",
  "is_active",
  "is_popular",
];

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(exportRows, { header: headers });
XLSX.utils.book_append_sheet(workbook, worksheet, "products_import");

const outputDir = path.join(process.cwd(), "public", "templates");
fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, "admin-products-import-existing.xlsx");
let finalOutputPath = outputPath;

try {
  XLSX.writeFile(workbook, outputPath);
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "EBUSY") {
    finalOutputPath = path.join(
      outputDir,
      `admin-products-import-existing-${Date.now()}.xlsx`,
    );
    XLSX.writeFile(workbook, finalOutputPath);
  } else {
    throw error;
  }
}

console.log(
  JSON.stringify({
    outputPath: finalOutputPath,
    totalRows: exportRows.length,
  }),
);
