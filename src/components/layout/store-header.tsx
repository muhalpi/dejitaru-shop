import Image from "next/image";
import Link from "next/link";
import { CartControl } from "@/components/cart/cart-control";
import {
  MobileNavMenu,
  type StoreNavItem,
} from "@/components/layout/mobile-nav-menu";

type StoreHeaderProps = {
  activeLabel: "Beranda" | "Produk" | "Blog";
  whatsappContactLink: string;
  whatsappNumber: string;
};

export function StoreHeader({
  activeLabel,
  whatsappContactLink,
  whatsappNumber,
}: StoreHeaderProps) {
  const links: StoreNavItem[] = [
    { label: "Beranda", href: "/" },
    { label: "Produk", href: "/produk" },
    { label: "Blog", href: "/blog" },
    { label: "Kontak", href: whatsappContactLink },
  ];

  return (
    <header className="mb-8 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#080a2f]/80 px-3 py-2.5 backdrop-blur md:mb-10 md:px-6 md:py-3">
      <Link href="/" className="inline-flex shrink-0">
        <Image
          src="/assets/logo-dejitaru-shop.png"
          alt="Dejitaru Shop"
          width={250}
          height={82}
          priority
          className="h-9 w-auto sm:h-11 md:h-12"
        />
      </Link>

      <nav className="hidden items-center gap-10 text-sm text-white/80 md:flex">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`transition hover:text-white ${
              link.label === activeLabel
                ? "border-b-2 border-fuchsia-400 pb-1 text-fuchsia-300"
                : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0b103d]/55 p-1 md:border-0 md:bg-transparent md:p-0">
        <MobileNavMenu links={links} activeLabel={activeLabel} />
        <CartControl
          whatsappNumber={whatsappNumber}
          triggerClassName="size-10 border-white/25 bg-white/5 p-0 text-blue-100 hover:border-fuchsia-400/60 hover:bg-white/10"
        />
      </div>
    </header>
  );
}
