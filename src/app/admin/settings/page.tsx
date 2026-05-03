import { AlertTriangle } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import { isDatabaseConfigured } from "@/db/client";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getAdminStoreSettings } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminAuth();

  const dbConfigured = isDatabaseConfigured();
  let whatsappNumber = "6281234567890";
  let dbRuntimeError: string | null = null;

  if (dbConfigured) {
    try {
      const settings = await getAdminStoreSettings();
      whatsappNumber = settings.whatsappNumber;
    } catch {
      dbRuntimeError =
        "Koneksi database aktif, tetapi schema belum siap. Jalankan `npm run db:migrate`.";
    }
  }

  return (
    <div className="min-h-screen bg-[#03041a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(131,72,255,0.28),transparent_30%),radial-gradient(circle_at_80%_8%,rgba(0,163,255,0.20),transparent_35%),radial-gradient(circle_at_55%_65%,rgba(105,45,255,0.16),transparent_45%),linear-gradient(to_bottom,#040521,#020313)]" />

      <div className="mx-auto max-w-[960px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <AdminHeader activePage="pengaturan" />

        {!dbConfigured ? (
          <div className="mb-5 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="inline-flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" />
              DATABASE_URL belum dikonfigurasi.
            </p>
            <p className="mt-1 text-amber-100/85">
              Pengaturan tersimpan ke database. Isi `DATABASE_URL` di `.env.local` terlebih
              dahulu.
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

        <AdminSettingsForm initialWhatsappNumber={whatsappNumber} />
      </div>
    </div>
  );
}
