import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import * as XLSX from "xlsx";
import { getDb } from "@/db/client";
import { products } from "@/db/schema";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { productCategorySchema } from "@/lib/validators/admin";

type ImportRow = Record<string, unknown>;

type ParsedImportRow = {
  rowNumber: number;
  targetProductId: string;
  changes: {
    name?: string;
    slug?: string;
    category?: "APPS_PREMIUM" | "PULSA" | "TOKEN_LISTRIK" | "TOPUP_GAME" | "LAINNYA";
    description?: string;
    imageUrl?: string | null;
    termsAndConditions?: string;
    isActive?: boolean;
    isPopular?: boolean;
  };
};

function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSessionToken(token);
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function toStringValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toNormalizedRow(row: ImportRow) {
  const result = new Map<string, unknown>();

  for (const [key, value] of Object.entries(row)) {
    result.set(normalizeHeader(key), value);
  }

  return result;
}

function findValue(row: Map<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    if (row.has(alias)) {
      return { exists: true, value: row.get(alias) };
    }
  }

  return { exists: false, value: null };
}

function parseBooleanValue(value: unknown) {
  if (typeof value === "boolean") {
    return { ok: true as const, value };
  }

  if (typeof value === "number") {
    if (value === 1) {
      return { ok: true as const, value: true };
    }

    if (value === 0) {
      return { ok: true as const, value: false };
    }
  }

  const normalized = toStringValue(value).toLowerCase();

  if (["true", "1", "yes", "y", "aktif"].includes(normalized)) {
    return { ok: true as const, value: true };
  }

  if (["false", "0", "no", "n", "nonaktif"].includes(normalized)) {
    return { ok: true as const, value: false };
  }

  return { ok: false as const };
}

function parseSpreadsheetRows(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return [] as ImportRow[];
  }

  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    return [] as ImportRow[];
  }

  return XLSX.utils.sheet_to_json<ImportRow>(worksheet, {
    defval: null,
    raw: false,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({ error: "DATABASE_URL belum dikonfigurasi." }, { status: 500 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "File .xlsx wajib diisi pada field `file`." },
      { status: 400 },
    );
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return NextResponse.json({ error: "Format file harus .xlsx." }, { status: 400 });
  }

  const rows = parseSpreadsheetRows(await file.arrayBuffer());

  if (rows.length === 0) {
    return NextResponse.json({ error: "File .xlsx tidak berisi data." }, { status: 400 });
  }

  const existingProducts = await db
    .select({
      id: products.id,
      slug: products.slug,
    })
    .from(products);

  const bySlug = new Map(existingProducts.map((item) => [item.slug.toLowerCase(), item]));
  const slugRegex = /^[a-z0-9-]+$/;
  const parsedRows: ParsedImportRow[] = [];
  const errors: string[] = [];
  let skippedRows = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 2;
    const normalizedRow = toNormalizedRow(rows[index]);
    const slugCell = findValue(normalizedRow, ["slug", "product_slug"]);
    const slugValue = toStringValue(slugCell.value).toLowerCase();

    if (!slugValue) {
      skippedRows += 1;
      continue;
    }

    const targetProduct = bySlug.get(slugValue) ?? null;

    if (!targetProduct) {
      errors.push(`Baris ${rowNumber}: produk tidak ditemukan untuk slug "${slugValue}".`);
      continue;
    }

    const changes: ParsedImportRow["changes"] = {};

    const nameCell = findValue(normalizedRow, ["name", "nama"]);
    if (nameCell.exists) {
      const name = toStringValue(nameCell.value);
      if (!name) {
        // empty berarti tidak diubah
      } else if (name.length < 3) {
        errors.push(`Baris ${rowNumber}: kolom name minimal 3 karakter.`);
      } else {
        changes.name = name;
      }
    }

    const slugUpdateCell = findValue(normalizedRow, ["slug_update", "new_slug", "slug_baru"]);
    if (slugUpdateCell.exists) {
      const nextSlug = toStringValue(slugUpdateCell.value);
      if (!nextSlug) {
        // empty berarti tidak diubah
      } else if (!slugRegex.test(nextSlug)) {
        errors.push(`Baris ${rowNumber}: slug_update hanya boleh a-z, 0-9, dan tanda '-'.`);
      } else {
        changes.slug = nextSlug;
      }
    }

    const categoryCell = findValue(normalizedRow, ["category", "kategori"]);
    if (categoryCell.exists) {
      const normalizedCategory = toStringValue(categoryCell.value)
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
      if (!normalizedCategory) {
        // empty berarti tidak diubah
      } else {
        const parsedCategory = productCategorySchema.safeParse(normalizedCategory);

        if (!parsedCategory.success) {
          errors.push(`Baris ${rowNumber}: kategori tidak valid.`);
        } else {
          changes.category = parsedCategory.data;
        }
      }
    }

    const descriptionCell = findValue(normalizedRow, ["description", "deskripsi"]);
    if (descriptionCell.exists) {
      const description = toStringValue(descriptionCell.value);
      if (!description) {
        // empty berarti tidak diubah
      } else if (description.length < 10) {
        errors.push(`Baris ${rowNumber}: description minimal 10 karakter.`);
      } else {
        changes.description = description;
      }
    }

    const termsCell = findValue(normalizedRow, [
      "terms_and_conditions",
      "terms",
      "syarat_ketentuan",
    ]);
    if (termsCell.exists) {
      const terms = toStringValue(termsCell.value);
      if (!terms) {
        // empty berarti tidak diubah
      } else if (terms.length < 10) {
        errors.push(`Baris ${rowNumber}: terms_and_conditions minimal 10 karakter.`);
      } else {
        changes.termsAndConditions = terms;
      }
    }

    const imageCell = findValue(normalizedRow, ["image_url", "imageurl", "gambar"]);
    if (imageCell.exists) {
      const imageUrl = toStringValue(imageCell.value);
      if (!imageUrl || imageUrl.toUpperCase() === "NULL") {
        changes.imageUrl = null;
      } else if (imageUrl.startsWith("/")) {
        changes.imageUrl = imageUrl;
      } else {
        try {
          const parsedUrl = new URL(imageUrl);
          changes.imageUrl = parsedUrl.toString();
        } catch {
          errors.push(
            `Baris ${rowNumber}: image_url harus URL valid atau path lokal diawali '/'.`,
          );
        }
      }
    }

    const isActiveCell = findValue(normalizedRow, ["is_active", "active", "aktif"]);
    if (isActiveCell.exists) {
      const rawValue = toStringValue(isActiveCell.value);
      if (!rawValue) {
        // empty berarti tidak diubah
      } else {
        const parsedBoolean = parseBooleanValue(isActiveCell.value);
        if (!parsedBoolean.ok) {
          errors.push(`Baris ${rowNumber}: is_active harus bernilai true/false atau 1/0.`);
        } else {
          changes.isActive = parsedBoolean.value;
        }
      }
    }

    const isPopularCell = findValue(normalizedRow, ["is_popular", "popular"]);
    if (isPopularCell.exists) {
      const rawValue = toStringValue(isPopularCell.value);
      if (!rawValue) {
        // empty berarti tidak diubah
      } else {
        const parsedBoolean = parseBooleanValue(isPopularCell.value);
        if (!parsedBoolean.ok) {
          errors.push(`Baris ${rowNumber}: is_popular harus bernilai true/false atau 1/0.`);
        } else {
          changes.isPopular = parsedBoolean.value;
        }
      }
    }

    if (Object.keys(changes).length === 0) {
      skippedRows += 1;
      continue;
    }

    parsedRows.push({
      rowNumber,
      targetProductId: targetProduct.id,
      changes,
    });
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: `Validasi import gagal (${errors.length} baris).`,
        details: errors.slice(0, 20),
      },
      { status: 400 },
    );
  }

  const slugOwner = new Map<string, string>();

  for (const product of existingProducts) {
    slugOwner.set(product.slug.toLowerCase(), product.id);
  }

  for (const row of parsedRows) {
    if (!row.changes.slug) {
      continue;
    }

    const nextSlug = row.changes.slug.toLowerCase();
    const currentOwner = slugOwner.get(nextSlug);
    if (currentOwner && currentOwner !== row.targetProductId) {
      errors.push(
        `Baris ${row.rowNumber}: slug "${row.changes.slug}" sudah digunakan produk lain.`,
      );
      continue;
    }

    slugOwner.set(nextSlug, row.targetProductId);
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: `Validasi slug gagal (${errors.length} baris).`,
        details: errors.slice(0, 20),
      },
      { status: 400 },
    );
  }

  let updatedRows = 0;

  for (const row of parsedRows) {
    await db
      .update(products)
      .set({
        ...row.changes,
        updatedAt: new Date(),
      })
      .where(eq(products.id, row.targetProductId));

    updatedRows += 1;
  }

  return NextResponse.json({
    ok: true,
    totalRows: rows.length,
    updatedRows,
    skippedRows,
  });
}
