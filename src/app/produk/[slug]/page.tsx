import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CartControl } from "@/components/cart/cart-control";
import { ProductDetail } from "@/components/product/product-detail";
import { getCheckoutWhatsappNumber } from "@/config/contact";
import { getStoreProductBySlug } from "@/lib/store-data";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan | Dejitaru Shop",
    };
  }

  return {
    title: `${product.name} | Dejitaru Shop`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  const whatsappContactLink = `https://wa.me/${getCheckoutWhatsappNumber()}`;

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#03041a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(131,72,255,0.28),transparent_30%),radial-gradient(circle_at_80%_8%,rgba(0,163,255,0.20),transparent_35%),radial-gradient(circle_at_55%_65%,rgba(105,45,255,0.16),transparent_45%),linear-gradient(to_bottom,#040521,#020313)]" />

      <div className="mx-auto max-w-[1160px] px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-[#080a2f]/80 px-4 py-3 backdrop-blur md:mb-10 md:px-6">
          <Link href="/" className="inline-flex">
            <Image
              src="/assets/logo-dejitaru-shop.png"
              alt="Dejitaru Shop"
              width={250}
              height={82}
              priority
              className="h-12 w-auto sm:h-14"
            />
          </Link>

          <nav className="hidden items-center gap-10 text-sm text-white/80 md:flex">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <Link
              href="/produk"
              className="border-b-2 border-fuchsia-400 pb-1 text-fuchsia-300 transition hover:text-white"
            >
              Produk
            </Link>
            <Link href="/blog" className="transition hover:text-white">
              Blog
            </Link>
            <a href={whatsappContactLink} className="transition hover:text-white">
              Kontak
            </a>
          </nav>

          <CartControl />
        </header>

        <main className="space-y-5">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-[#060a31]/75 px-3 py-1 text-xs text-blue-100/70">
            <Link href="/" className="transition hover:text-blue-50">
              Beranda
            </Link>
            <ChevronRight className="size-3" />
            <Link href="/produk" className="transition hover:text-blue-50">
              Produk
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-blue-50">{product.name}</span>
          </div>

          <ProductDetail product={product} />
        </main>
      </div>
    </div>
  );
}
