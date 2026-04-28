import path from "node:path";
import { put } from "@vercel/blob";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

const maxUploadSizeBytes = 2 * 1024 * 1024;

const mimeToExtension = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSessionToken(token);
}

function normalizeSlug(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "product";
}

function resolveExtension(file: File) {
  const byMime = mimeToExtension.get(file.type.toLowerCase());
  if (byMime) {
    return byMime;
  }

  const ext = path.extname(file.name).toLowerCase();
  return allowedExtensions.has(ext) ? ext : null;
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const slugHint = String(formData?.get("slug") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File gambar wajib diisi." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File gambar kosong." }, { status: 400 });
  }

  if (file.size > maxUploadSizeBytes) {
    return NextResponse.json(
      { error: "Ukuran gambar maksimal 2MB." },
      { status: 413 },
    );
  }

  const extension = resolveExtension(file);
  if (!extension) {
    return NextResponse.json(
      {
        error:
          "Format gambar tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.",
      },
      { status: 400 },
    );
  }

  const safeSlug = normalizeSlug(slugHint);
  const fileName = `products/${safeSlug}${extension}`;

  try {
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || undefined,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      ok: true,
      imageUrl: blob.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Upload ke Vercel Blob gagal. Pastikan Blob store sudah terhubung dan BLOB_READ_WRITE_TOKEN tersedia.",
        detail: String(error),
      },
      { status: 500 },
    );
  }
}
