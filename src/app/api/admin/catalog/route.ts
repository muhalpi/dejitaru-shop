import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { getAdminCatalogData } from "@/lib/admin-data";
import { isDatabaseConfigured } from "@/db/client";

function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSessionToken(token);
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ products: [], dbConfigured: false });
  }

  try {
    const products = await getAdminCatalogData();

    return NextResponse.json({ products, dbConfigured: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "Schema database belum siap. Jalankan `npm run db:migrate` lalu `npm run db:seed`.",
      },
      { status: 503 },
    );
  }
}
