"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  clearCart,
  getCartCount,
  getCartTotal,
  readCart,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/cart";

const EMPTY_CART: CartItem[] = [];
let cachedRawCart = "__INIT__";
let cachedSnapshot: CartItem[] = EMPTY_CART;

function subscribeCart(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onCartUpdate = () => onStoreChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === CART_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(CART_UPDATED_EVENT, onCartUpdate);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, onCartUpdate);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function getClientSnapshot(): CartItem[] {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY) ?? "";

  if (raw === cachedRawCart) {
    return cachedSnapshot;
  }

  cachedRawCart = raw;
  const next = readCart();
  cachedSnapshot = next.length === 0 ? EMPTY_CART : next;
  return cachedSnapshot;
}

export function useCart() {
  const items = useSyncExternalStore(
    subscribeCart,
    getClientSnapshot,
    getServerSnapshot,
  );

  const count = useMemo(() => getCartCount(items), [items]);
  const total = useMemo(() => getCartTotal(items), [items]);

  const setQuantity = useCallback((itemKey: string, nextQuantity: number) => {
    updateCartItemQuantity(itemKey, nextQuantity);
  }, []);

  const remove = useCallback((itemKey: string) => {
    removeCartItem(itemKey);
  }, []);

  const reset = useCallback(() => {
    clearCart();
  }, []);

  return {
    items,
    count,
    total,
    setQuantity,
    remove,
    reset,
  };
}
