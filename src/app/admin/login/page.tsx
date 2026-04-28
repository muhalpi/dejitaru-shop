import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { isAdminAuthenticatedOnServer, isAdminConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const isAuthed = await isAdminAuthenticatedOnServer();

  if (isAuthed) {
    redirect("/admin");
  }

  const configured = isAdminConfigured();

  return (
    <div className="min-h-screen bg-[#03041a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(131,72,255,0.28),transparent_30%),radial-gradient(circle_at_80%_8%,rgba(0,163,255,0.20),transparent_35%),radial-gradient(circle_at_55%_65%,rgba(105,45,255,0.16),transparent_45%),linear-gradient(to_bottom,#040521,#020313)]" />

      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-8 sm:px-6">
        <div className="w-full space-y-4">
          {!configured ? (
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-100">
              ADMIN_EMAIL / ADMIN_PASSWORD belum dikonfigurasi di `.env.local`.
            </div>
          ) : null}
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
