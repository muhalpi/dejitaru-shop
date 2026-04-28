import { AlertTriangle } from "lucide-react";
import { AdminDashboard } from "../../components/admin/admin-dashboard";
import { AdminLogoutButton } from "../../components/admin/admin-logout-button";
import { isDatabaseConfigured } from "@/db/client";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getAdminCatalogData, type AdminCatalogProduct } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminAuth();

  const dbConfigured = isDatabaseConfigured();
  let products: AdminCatalogProduct[] = [];
  let dbRuntimeError: string | null = null;

  if (dbConfigured) {
    try {
      products = await getAdminCatalogData();
    } catch {
      dbRuntimeError =
        "Koneksi database aktif, tetapi schema belum siap. Jalankan `npm run db:migrate` lalu `npm run db:seed`.";
    }
  }

  return (
    <div className="min-h-screen bg-[#03041a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(131,72,255,0.28),transparent_30%),radial-gradient(circle_at_80%_8%,rgba(0,163,255,0.20),transparent_35%),radial-gradient(circle_at_55%_65%,rgba(105,45,255,0.16),transparent_45%),linear-gradient(to_bottom,#040521,#020313)]" />

      <div className="mx-auto max-w-[1240px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#070a2d]/80 px-4 py-3 backdrop-blur md:px-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-fuchsia-200/90">Admin Panel</p>
            <h1 className="text-2xl font-bold">Dejitaru Shop</h1>
          </div>
          <AdminLogoutButton />
        </header>

        {!dbConfigured ? (
          <div className="mb-5 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="inline-flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" />
              DATABASE_URL belum dikonfigurasi.
            </p>
            <p className="mt-1 text-amber-100/85">
              Isi `DATABASE_URL` di `.env.local` agar data admin bisa tersimpan ke Neon PostgreSQL.
            </p>
          </div>
        ) : null}

        {dbRuntimeError ? (
          <div className="mb-5 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
            <p className="inline-flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" />
              Schema database belum siap.
            </p>
            <p className="mt-1 text-rose-100/85">{dbRuntimeError}</p>
          </div>
        ) : null}

        <AdminDashboard initialProducts={products} />
      </div>
    </div>
  );
}
