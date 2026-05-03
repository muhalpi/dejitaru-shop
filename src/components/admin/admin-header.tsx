import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

type AdminHeaderProps = {
  activePage: "produk" | "blog" | "pengaturan";
};

const navItems = [
  { key: "produk", label: "Produk", href: "/admin" },
  { key: "blog", label: "Blog", href: "/admin/blog" },
  { key: "pengaturan", label: "Pengaturan", href: "/admin/settings" },
] as const;

export function AdminHeader({ activePage }: AdminHeaderProps) {
  return (
    <header className="mb-6 rounded-2xl border border-white/10 bg-[#070a2d]/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-fuchsia-200/90">Admin Panel</p>
          <h1 className="text-2xl font-bold">Dejitaru Shop</h1>
        </div>
        <AdminLogoutButton />
      </div>

      <nav className="mt-4 flex flex-wrap items-center gap-2">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              item.key === activePage
                ? "border-fuchsia-400/70 bg-fuchsia-500/15 text-fuchsia-100"
                : "border-white/15 bg-[#0b103d]/65 text-blue-100/80 hover:border-fuchsia-400/50"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
