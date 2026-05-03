"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { formatRupiah } from "@/data/products";
import { sanitizeWhatsappNumber } from "@/lib/whatsapp";
import { getCartSubtotal, type CartItem } from "@/lib/cart";
import { useCart } from "@/hooks/use-cart";

const customerInputLabels: Record<string, string> = {
  customerWhatsapp: "WhatsApp",
  targetNumber: "Nomor Tujuan",
  meterNumber: "ID Pelanggan",
  gameUserId: "User ID",
  gameServerId: "Server ID",
};

const variantTypeLabels: Record<string, string> = {
  VARIAN: "Varian",
};

function getInputLabel(key: string): string {
  return customerInputLabels[key] ?? key;
}

function getVariantLabel(type: string): string {
  return variantTypeLabels[type] ?? type;
}

function buildCheckoutMessage(items: CartItem[], total: number): string {
  const lines: string[] = [
    "Halo Dejitaru Shop, saya ingin checkout produk berikut:",
    "",
  ];

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.productName}`);
    lines.push(`   Kategori: ${item.category}`);
    lines.push("   Pilihan:");

    item.selectedVariants.forEach((selectedVariant) => {
      lines.push(`   - ${getVariantLabel(selectedVariant.type)}: ${selectedVariant.label}`);
    });

    lines.push(`   Qty: ${item.quantity}`);
    lines.push(`   Subtotal: ${formatRupiah(getCartSubtotal(item))}`);

    const inputs = Object.entries(item.customerInputs).filter(([, value]) =>
      value.trim(),
    );

    if (inputs.length > 0) {
      lines.push("   Data:");
      inputs.forEach(([key, value]) => {
        lines.push(
          `   - ${item.customerInputLabels?.[key] ?? getInputLabel(key)}: ${value}`,
        );
      });
    }

    lines.push("");
  });

  lines.push(`Total: ${formatRupiah(total)}`);

  return lines.join("\n").trim();
}

type CartControlProps = {
  whatsappNumber: string;
};

export function CartControl({ whatsappNumber }: CartControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBadgeBump, setIsBadgeBump] = useState(false);
  const { items, count, total, setQuantity, remove, reset } = useCart();
  const previousCountRef = useRef(count);

  useEffect(() => {
    if (count > previousCountRef.current) {
      setIsBadgeBump(true);
      const timeoutId = window.setTimeout(() => {
        setIsBadgeBump(false);
      }, 500);

      previousCountRef.current = count;
      return () => window.clearTimeout(timeoutId);
    }

    previousCountRef.current = count;
  }, [count]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const checkoutLink = useMemo(() => {
    if (items.length === 0) {
      return "";
    }

    const normalizedNumber = sanitizeWhatsappNumber(whatsappNumber);
    const message = buildCheckoutMessage(items, total);

    return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
  }, [items, total, whatsappNumber]);

  const canUseDom = typeof document !== "undefined";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`relative rounded-full border border-fuchsia-400/45 p-2 text-fuchsia-200 transition hover:bg-fuchsia-500/10 ${
          isBadgeBump ? "animate-cart-bump" : ""
        }`}
        aria-label="Buka cart"
      >
        <ShoppingCart className="size-5" />
        <span
          className={`absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-semibold text-white ${
            isBadgeBump ? "animate-cart-bump" : ""
          }`}
        >
          {count}
        </span>
      </button>

      {canUseDom && isOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] pointer-events-auto animate-overlay-in"
              aria-hidden={false}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
                aria-label="Tutup cart"
              />

              <aside
                className="absolute inset-y-0 right-0 flex h-[100dvh] w-full max-w-md translate-x-0 animate-drawer-in flex-col border-l border-white/10 bg-[#050826] px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-[max(env(safe-area-inset-top),1rem)] shadow-2xl sm:px-5"
                role="dialog"
                aria-modal="true"
                aria-label="Cart Drawer"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Cart</h2>
                    <p className="text-xs text-blue-100/65">{count} item di keranjang</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-md border border-white/20 bg-white/5 p-1.5 text-blue-100/80 transition hover:border-fuchsia-400/60"
                    aria-label="Tutup"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#090d39]/70 p-6 text-center">
                    <p className="text-sm text-blue-100/70">
                      Keranjang masih kosong. Tambahkan produk dari halaman detail.
                    </p>
                    <Link
                      href="/produk"
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg border border-fuchsia-400/50 bg-fuchsia-500/15 px-3 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/25"
                    >
                      Lihat Produk
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                      {items.map((item) => (
                        <article
                          key={item.key}
                          className="rounded-xl border border-white/10 bg-[#090d39]/75 p-3"
                        >
                          <p className="text-sm font-semibold text-white">{item.productName}</p>
                          <p className="mt-1 text-xs text-blue-100/60">{item.category}</p>

                          <div className="mt-2 space-y-1 rounded-lg border border-white/10 bg-black/20 p-2">
                            {item.selectedVariants.map((variant) => (
                              <p key={variant.variantId} className="text-[11px] text-fuchsia-200">
                                {getVariantLabel(variant.type)}: {variant.label}
                              </p>
                            ))}
                          </div>

                          {Object.entries(item.customerInputs).some(([, value]) => value.trim()) ? (
                            <div className="mt-2 space-y-0.5 rounded-lg border border-white/10 bg-black/20 p-2">
                              {Object.entries(item.customerInputs)
                                .filter(([, value]) => value.trim())
                                .map(([key, value]) => (
                                  <p key={key} className="text-[11px] text-blue-100/70">
                                    {item.customerInputLabels?.[key] ?? getInputLabel(key)}:{" "}
                                    {value}
                                  </p>
                                ))}
                            </div>
                          ) : null}

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 p-1">
                              <button
                                type="button"
                                onClick={() => setQuantity(item.key, item.quantity - 1)}
                                className="rounded border border-white/10 p-1 text-blue-100/80 transition hover:border-fuchsia-400/50"
                                aria-label="Kurangi qty"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="min-w-6 text-center text-sm font-semibold text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuantity(item.key, item.quantity + 1)}
                                className="rounded border border-white/10 p-1 text-blue-100/80 transition hover:border-fuchsia-400/50"
                                aria-label="Tambah qty"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>

                            <p className="text-sm font-semibold text-blue-100">
                              {formatRupiah(getCartSubtotal(item))}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => remove(item.key)}
                            className="mt-2 inline-flex items-center gap-1 text-xs text-rose-300 transition hover:text-rose-200"
                          >
                            <Trash2 className="size-3.5" />
                            Hapus
                          </button>
                        </article>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-white/10 bg-[#090d39]/75 p-3">
                      <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="text-blue-100/70">Total</span>
                        <span className="text-xl font-bold text-blue-100">
                          {formatRupiah(total)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={reset}
                          className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-xs font-medium text-blue-100/85 transition hover:border-fuchsia-400/60"
                        >
                          Kosongkan
                        </button>
                        <a
                          href={checkoutLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-gradient-to-r from-fuchsia-600 to-blue-500 px-3 py-2 text-center text-xs font-semibold text-white transition hover:brightness-110"
                        >
                          Checkout WA
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
