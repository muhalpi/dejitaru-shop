"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpAZ, Search } from "lucide-react";
import {
  formatRupiah,
  getStartingPriceSummary,
  hasActivePromo,
  productCategories,
  type ProductCategory,
  type ProductItem,
} from "@/data/products";

type ProductCatalogProps = {
  products: ProductItem[];
};

type CategoryFilter = "Semua" | ProductCategory;

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedAndFilteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("id-ID");

    return products
      .filter((product) =>
        activeCategory === "Semua" ? true : product.category === activeCategory,
      )
      .filter((product) =>
        normalizedQuery.length === 0
          ? true
          : product.name.toLocaleLowerCase("id-ID").includes(normalizedQuery),
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, "id-ID", {
          sensitivity: "base",
        }),
      );
  }, [activeCategory, products, searchQuery]);

  const groupedProducts = useMemo(() => {
    const grouped = new Map<ProductCategory, ProductItem[]>();

    for (const category of productCategories) {
      grouped.set(category, []);
    }

    for (const product of sortedAndFilteredProducts) {
      grouped.get(product.category)?.push(product);
    }

    return productCategories
      .map((category) => ({
        category,
        items: grouped.get(category) ?? [],
      }))
      .filter((group) => group.items.length > 0);
  }, [sortedAndFilteredProducts]);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#05082e]/75 p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Semua Produk</h2>
            <p className="text-sm text-blue-100/70">
              Produk sudah diurutkan A-Z dan dikelompokkan per kategori.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-medium text-fuchsia-200">
            <ArrowUpAZ className="size-4" />
            Urutan A-Z
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#0a0f3c]/70 px-3 py-2 text-sm text-blue-100/80">
            <Search className="size-4 text-fuchsia-200" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              type="text"
              placeholder="Cari produk..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-blue-100/45"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <CategoryButton
              isActive={activeCategory === "Semua"}
              onClick={() => setActiveCategory("Semua")}
            >
              Semua
            </CategoryButton>
            {productCategories.map((category) => (
              <CategoryButton
                key={category}
                isActive={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </CategoryButton>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {groupedProducts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#090d39]/70 p-6 text-center text-blue-100/75">
            Produk tidak ditemukan. Coba kata kunci lain atau ubah filter.
          </div>
        ) : (
          groupedProducts.map((group) => (
            <div key={group.category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-fuchsia-100">
                  {group.category}
                </h3>
                <span className="text-xs text-blue-100/55">
                  {group.items.length} produk
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {group.items.map((product) => {
                    const priceSummary = getStartingPriceSummary(product);
                    const promoActive = hasActivePromo(product);

                    return (
                      <article
                        key={product.slug}
                        className="flex h-full min-h-[320px] flex-col rounded-2xl border border-white/10 bg-[#0a0f3c]/85 p-4"
                      >
                        <div className="mb-3 h-24 overflow-hidden rounded-xl border border-white/10">
                          {product.imageUrl ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </>
                          ) : (
                            <div
                              className={`flex h-full items-center justify-center bg-gradient-to-br ${product.color}`}
                            >
                              <span className="text-3xl font-extrabold tracking-wider text-white/95">
                                {product.short}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="mb-2 inline-flex w-fit rounded-full border border-fuchsia-400/40 bg-fuchsia-400/10 px-2.5 py-1 text-[11px] text-fuchsia-200">
                          {product.category}
                        </span>
                        {promoActive ? (
                          <span className="mb-2 inline-flex w-fit rounded-full border border-rose-400/50 bg-rose-500/15 px-2.5 py-1 text-[11px] text-rose-200">
                            Promo
                          </span>
                        ) : null}
                        <h4 className="mb-2 text-base font-semibold leading-snug text-white">
                          {product.name}
                        </h4>
                        <p className="text-sm text-blue-100/65">{product.description}</p>

                        <div className="mt-auto space-y-3 pt-4">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-blue-100/55">
                              Mulai dari
                            </p>
                            {priceSummary.hasPromo && priceSummary.originalPrice ? (
                              <p className="text-xs text-blue-100/45 line-through">
                                {formatRupiah(priceSummary.originalPrice)}
                              </p>
                            ) : null}
                            <p className="text-2xl font-bold text-blue-100">
                              {formatRupiah(priceSummary.price)}
                            </p>
                            <p className="text-xs text-blue-100/55">
                              {product.variants.filter((variant) => variant.isActive ?? true).length} pilihan
                              opsi
                            </p>
                          </div>
                          <Link
                            href={`/produk/${product.slug}`}
                            className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-blue-500 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                          >
                            Lihat Detail
                          </Link>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

type CategoryButtonProps = {
  children: string;
  isActive: boolean;
  onClick: () => void;
};

function CategoryButton({ children, isActive, onClick }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
        isActive
          ? "border-fuchsia-400/60 bg-fuchsia-500/20 text-fuchsia-100"
          : "border-white/15 bg-[#0a0f3c]/70 text-blue-100/70 hover:border-fuchsia-400/45 hover:text-blue-50"
      }`}
    >
      {children}
    </button>
  );
}
