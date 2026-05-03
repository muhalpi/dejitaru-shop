import { AlertTriangle } from "lucide-react";
import { AdminBlogManager } from "@/components/admin/admin-blog-manager";
import { AdminHeader } from "@/components/admin/admin-header";
import { isDatabaseConfigured } from "@/db/client";
import { requireAdminAuth } from "@/lib/admin-auth";
import {
  getAdminBlogPosts,
  syncExistingFileBlogPostsToDatabase,
  type AdminBlogPost,
} from "@/lib/admin-blog";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requireAdminAuth();

  const dbConfigured = isDatabaseConfigured();
  let posts: AdminBlogPost[] = [];
  let dbRuntimeError: string | null = null;

  if (dbConfigured) {
    try {
      await syncExistingFileBlogPostsToDatabase();
      posts = await getAdminBlogPosts();
    } catch {
      dbRuntimeError =
        "Koneksi database aktif, tetapi schema belum siap. Jalankan `npm run db:migrate`.";
    }
  }

  return (
    <div className="min-h-screen bg-[#03041a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(131,72,255,0.28),transparent_30%),radial-gradient(circle_at_80%_8%,rgba(0,163,255,0.20),transparent_35%),radial-gradient(circle_at_55%_65%,rgba(105,45,255,0.16),transparent_45%),linear-gradient(to_bottom,#040521,#020313)]" />

      <div className="mx-auto max-w-[1240px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <AdminHeader activePage="blog" />

        {!dbConfigured ? (
          <div className="mb-5 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="inline-flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" />
              DATABASE_URL belum dikonfigurasi.
            </p>
            <p className="mt-1 text-amber-100/85">
              Isi `DATABASE_URL` di `.env.local` agar artikel blog bisa dikelola dari admin.
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

        <AdminBlogManager initialPosts={posts} />
      </div>
    </div>
  );
}
