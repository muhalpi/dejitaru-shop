"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type StoreNavItem = {
  label: string;
  href: string;
};

type MobileNavMenuProps = {
  links: StoreNavItem[];
  activeLabel: string;
};

export function MobileNavMenu({ links, activeLabel }: MobileNavMenuProps) {
  return (
    <Sheet>
      <SheetTrigger
        aria-label="Buka menu navigasi"
        className="inline-flex rounded-lg border border-white/20 bg-white/5 p-2 text-blue-100/90 transition hover:border-fuchsia-400/60 md:hidden"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[80vw] max-w-sm border-white/10 bg-[#050826] text-white"
      >
        <SheetHeader className="p-0 pb-4">
          <SheetTitle className="text-white">Navigasi</SheetTitle>
          <SheetDescription className="text-blue-100/70">
            Akses halaman utama Dejitaru Shop.
          </SheetDescription>
        </SheetHeader>

        <nav className="space-y-2">
          {links.map((link) => {
            const isActive = link.label === activeLabel;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`block rounded-lg border px-3 py-2 text-sm transition ${
                  isActive
                    ? "border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-100"
                    : "border-white/15 bg-[#0b103d]/60 text-blue-100/85 hover:border-fuchsia-400/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
