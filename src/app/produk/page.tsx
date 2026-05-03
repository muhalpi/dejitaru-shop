import { ProductCatalog } from "@/components/product/product-catalog";
import { StoreHeader } from "@/components/layout/store-header";
import { getCheckoutWhatsappNumber } from "@/config/contact";
import { getStoreCatalog } from "@/lib/store-data";

export const dynamic = "force-dynamic";

export default async function ProductPage() {
  const productCatalog = await getStoreCatalog();
  const whatsappNumber = await getCheckoutWhatsappNumber();
  const whatsappContactLink = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen bg-[#03041a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(131,72,255,0.28),transparent_30%),radial-gradient(circle_at_80%_8%,rgba(0,163,255,0.20),transparent_35%),radial-gradient(circle_at_55%_65%,rgba(105,45,255,0.16),transparent_45%),linear-gradient(to_bottom,#040521,#020313)]" />

      <div className="mx-auto max-w-[1160px] px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <StoreHeader
          activeLabel="Produk"
          whatsappContactLink={whatsappContactLink}
          whatsappNumber={whatsappNumber}
        />

        <main className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-[#070a2d]/70 p-5 backdrop-blur md:p-8">
            <span className="inline-flex rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-4 py-2 text-sm font-medium text-fuchsia-200">
              Katalog Dejitaru Shop
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Halaman Produk
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-100/70 md:text-base">
              Pilih produk digital, pulsa, token listrik, dan topup game sesuai
              kebutuhanmu. Gunakan filter kategori untuk mempercepat pencarian.
            </p>
          </section>

          <ProductCatalog products={productCatalog} />
        </main>
      </div>
    </div>
  );
}
