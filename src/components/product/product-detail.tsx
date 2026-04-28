"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Minus, Plus, ShoppingCart } from "lucide-react";
import {
  formatRupiah,
  getVariantEffectivePrice,
  isVariantPromoActive,
  type ProductItem,
  type ProductVariantType,
} from "@/data/products";
import { addCartItem } from "@/lib/cart";
import { validateProductDetailPayload } from "@/lib/validators/product-detail";

type ProductDetailProps = {
  product: ProductItem;
};

type VariantGroup = {
  type: ProductVariantType;
  options: ProductItem["variants"];
};

const variantTypeLabels: Record<ProductVariantType, string> = {
  VARIAN: "Varian",
};

function buildInitialSelectedVariants(product: ProductItem) {
  const grouped = new Map<ProductVariantType, ProductItem["variants"]>();

  for (const variant of product.variants.filter((item) => item.isActive ?? true)) {
    grouped.set(variant.type, [...(grouped.get(variant.type) ?? []), variant]);
  }

  const defaults: Partial<Record<ProductVariantType, string>> = {};

  for (const [type, options] of grouped) {
    const selected = options.find((item) => item.isDefault) ?? options[0];
    if (selected) {
      defaults[type] = selected.id;
    }
  }

  return defaults;
}

function getInputMode(inputType: string): React.HTMLAttributes<HTMLInputElement>["inputMode"] {
  if (inputType === "NUMBER" || inputType === "TEL") {
    return "numeric";
  }

  return "text";
}

function getInputType(inputType: string): React.HTMLInputTypeAttribute {
  if (inputType === "NUMBER") {
    return "text";
  }

  if (inputType === "TEL") {
    return "tel";
  }

  return "text";
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariantsByType, setSelectedVariantsByType] = useState<
    Partial<Record<ProductVariantType, string>>
  >(() => buildInitialSelectedVariants(product));
  const [quantity, setQuantity] = useState(1);
  const [customerInputs, setCustomerInputs] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(product.requirements.map((field) => [field.key, ""])),
  );
  const [addStatus, setAddStatus] = useState<"idle" | "added">("idle");

  const variantGroups = useMemo<VariantGroup[]>(() => {
    const grouped = new Map<ProductVariantType, ProductItem["variants"]>();

    for (const variant of product.variants) {
      grouped.set(variant.type, [...(grouped.get(variant.type) ?? []), variant]);
    }

    return Array.from(grouped.entries()).map(([type, options]) => ({
      type,
      options: options.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    }));
  }, [product.variants]);

  const selectedVariants = useMemo(() => {
    return variantGroups
      .map((group) => {
        const selectedId = selectedVariantsByType[group.type];
        return (
          group.options.find(
            (option) => option.id === selectedId && (option.isActive ?? true),
          ) ?? null
        );
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [selectedVariantsByType, variantGroups]);

  const unitPrice = useMemo(
    () =>
      selectedVariants.reduce(
        (total, variant) => total + getVariantEffectivePrice(variant),
        0,
      ),
    [selectedVariants],
  );
  const originalUnitPrice = useMemo(
    () => selectedVariants.reduce((total, variant) => total + variant.price, 0),
    [selectedVariants],
  );
  const promoAmountPerItem = Math.max(0, originalUnitPrice - unitPrice);
  const subtotal = unitPrice * quantity;

  const validation = useMemo(
    () =>
      validateProductDetailPayload(product, {
        selectedVariantsByType,
        customerInputs,
        quantity,
      }),
    [customerInputs, product, quantity, selectedVariantsByType],
  );

  function updateInputValue(key: string, value: string) {
    setCustomerInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function selectVariant(type: ProductVariantType, variantId: string) {
    setSelectedVariantsByType((prev) => ({
      ...prev,
      [type]: variantId,
    }));
  }

  function increaseQuantity() {
    setQuantity((prev) => prev + 1);
  }

  function decreaseQuantity() {
    setQuantity((prev) => Math.max(1, prev - 1));
  }

  function handleAddToCart() {
    if (!validation.isValid || selectedVariants.length === 0) {
      return;
    }

    addCartItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      category: product.category,
      selectedVariants: selectedVariants.map((variant) => ({
        variantId: variant.id,
        label: variant.label,
        type: variant.type,
        value: variant.value,
        price: getVariantEffectivePrice(variant),
      })),
      unitPrice,
      quantity,
      customerInputs: { ...customerInputs },
      customerInputLabels: Object.fromEntries(
        product.requirements.map((field) => [field.key, field.label]),
      ),
    });

    setAddStatus("added");
    window.setTimeout(() => {
      setAddStatus("idle");
    }, 1800);
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-3xl border border-white/10 bg-[#05082f]/75 p-5 md:p-6">
        <div className="mb-4 inline-flex rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
          {product.category}
        </div>

        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          {product.name}
        </h1>
        <p className="mb-6 text-sm leading-7 text-blue-100/70 md:text-base">
          {product.description}
        </p>

        <div
          className={`mb-6 flex h-36 items-center justify-center rounded-2xl bg-gradient-to-br ${product.color}`}
        >
          <span className="text-5xl font-extrabold tracking-wider text-white/95">
            {product.short}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090d39]/80 p-4">
          <h2 className="mb-3 text-lg font-semibold">Syarat & Ketentuan</h2>
          <ul className="space-y-2 text-sm text-blue-100/70">
            {product.terms.map((term, index) => (
              <li key={`${index}-${term}`} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-fuchsia-300" />
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>

      <aside className="rounded-3xl border border-white/10 bg-[#05082f]/75 p-5 md:p-6">
        <Link
          href="/produk"
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#0a0f3c]/70 px-3 py-2 text-xs font-medium text-blue-100/80 transition hover:border-fuchsia-400/50 hover:text-blue-50"
        >
          <ArrowLeft className="size-4" />
          Kembali ke List Produk
        </Link>

        {variantGroups.map((group) => (
          <div key={group.type} className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">
              Pilih {variantTypeLabels[group.type]}
            </h2>
            <div className="space-y-2">
              {group.options.map((option) => {
                const isAvailable = option.isActive ?? true;
                const isActive =
                  isAvailable && selectedVariantsByType[group.type] === option.id;
                const promoActive = isVariantPromoActive(option);
                const effectivePrice = getVariantEffectivePrice(option);

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      if (!isAvailable) {
                        return;
                      }

                      selectVariant(group.type, option.id);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition ${
                      !isAvailable
                        ? "cursor-not-allowed border-white/10 bg-[#090d39]/40 text-blue-100/35"
                        : ""
                    } ${
                      isActive
                        ? "border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-100"
                        : "border-white/15 bg-[#0a0f3c]/70 text-blue-100/75 hover:border-fuchsia-400/45"
                    }`}
                  >
                    <span>{option.label}</span>
                    {option.price > 0 ? (
                      <span className="text-right">
                        {promoActive ? (
                          <span className="block text-[11px] text-blue-100/45 line-through">
                            {formatRupiah(option.price)}
                          </span>
                        ) : null}
                        <span className="font-semibold">{formatRupiah(effectivePrice)}</span>
                        {!isAvailable ? (
                          <span className="block text-[11px] text-rose-200/85">
                            Tidak tersedia
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      <span className="font-semibold">
                        {isAvailable ? "Termasuk" : "Tidak tersedia"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {validation.issues.variantIssues[group.type] ? (
              <p className="mt-2 text-xs text-rose-300">
                {validation.issues.variantIssues[group.type]}
              </p>
            ) : null}
          </div>
        ))}

        <h2 className="mb-3 text-lg font-semibold">Data yang Dibutuhkan</h2>
        <div className="mb-6 space-y-3">
          {product.requirements.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1 block text-sm text-blue-100/80">
                {field.label}
                {field.required ? " *" : ""}
              </span>
              <input
                value={customerInputs[field.key] ?? ""}
                onChange={(event) => updateInputValue(field.key, event.target.value)}
                type={getInputType(field.inputType)}
                inputMode={getInputMode(field.inputType)}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-white/15 bg-[#0a0f3c]/75 px-3 py-2 text-sm text-white placeholder:text-blue-100/45 outline-none transition focus:border-fuchsia-400/60"
              />
              {validation.issues.inputIssues[field.key] ? (
                <span className="mt-1 block text-xs text-rose-300">
                  {validation.issues.inputIssues[field.key]}
                </span>
              ) : null}
              {field.helperText ? (
                <span className="mt-1 block text-xs text-blue-100/55">
                  {field.helperText}
                </span>
              ) : null}
            </label>
          ))}
        </div>

        <div className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#090d39]/80 px-3 py-2">
          <span className="text-sm text-blue-100/80">Jumlah</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decreaseQuantity}
              className="rounded-md border border-white/20 bg-white/5 p-1.5 text-blue-100/80 transition hover:border-fuchsia-400/60"
              aria-label="Kurangi jumlah"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-7 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              onClick={increaseQuantity}
              className="rounded-md border border-white/20 bg-white/5 p-1.5 text-blue-100/80 transition hover:border-fuchsia-400/60"
              aria-label="Tambah jumlah"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 space-y-1 rounded-xl border border-white/10 bg-[#090d39]/80 p-3">
          <p className="text-xs text-blue-100/55">Harga Satuan</p>
          {promoAmountPerItem > 0 ? (
            <p className="text-xs text-blue-100/45 line-through">{formatRupiah(originalUnitPrice)}</p>
          ) : null}
          <p className="text-sm text-blue-100/90">{formatRupiah(unitPrice)}</p>
          {promoAmountPerItem > 0 ? (
            <p className="text-xs text-rose-200">
              Hemat {formatRupiah(promoAmountPerItem)} per item
            </p>
          ) : null}
          <p className="text-xs text-blue-100/55">Subtotal</p>
          <p className="text-xl font-bold text-blue-100">{formatRupiah(subtotal)}</p>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!validation.isValid}
          className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${
            addStatus === "added" ? "animate-glow-pulse" : ""
          }`}
        >
          <ShoppingCart className="size-4" />
          Add to Cart
        </button>

        {!validation.isValid ? (
          <p className="mt-2 text-xs text-blue-100/60">
            Lengkapi semua pilihan varian dan data wajib sebelum menambahkan ke cart.
          </p>
        ) : null}

        {addStatus === "added" ? (
          <div className="mt-3 animate-success-pop rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            <p className="inline-flex items-center gap-1 font-semibold">
              <CheckCircle2 className="size-4" />
              Order masuk ke cart.
            </p>
            <p className="mt-1 text-emerald-100/85">
              Kamu bisa lanjut belanja produk lain atau langsung checkout dari icon cart.
            </p>
          </div>
        ) : null}

        <Link
          href="/produk"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#0a0f3c]/70 px-4 py-3 text-sm font-semibold text-blue-100/85 transition hover:border-fuchsia-400/50 hover:text-blue-50"
        >
          <ArrowLeft className="size-4" />
          Lanjut Belanja Produk Lain
        </Link>
      </aside>
    </section>
  );
}
