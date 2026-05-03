import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { StoreHeader } from "@/components/layout/store-header";
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
  const whatsappNumber = await getCheckoutWhatsappNumber();
  const whatsappContactLink = `https://wa.me/${whatsappNumber}`;

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#03041a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(131,72,255,0.28),transparent_30%),radial-gradient(circle_at_80%_8%,rgba(0,163,255,0.20),transparent_35%),radial-gradient(circle_at_55%_65%,rgba(105,45,255,0.16),transparent_45%),linear-gradient(to_bottom,#040521,#020313)]" />

      <div className="mx-auto max-w-[1160px] px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <StoreHeader
          activeLabel="Produk"
          whatsappContactLink={whatsappContactLink}
          whatsappNumber={whatsappNumber}
        />

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
