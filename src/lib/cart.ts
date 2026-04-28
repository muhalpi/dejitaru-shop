export const CART_STORAGE_KEY = "dejitaru-cart";
export const CART_UPDATED_EVENT = "dejitaru-cart-updated";

export type CartSelectedVariant = {
  variantId: string;
  label: string;
  type: string;
  value: string;
  price: number;
};

export type CartItem = {
  key: string;
  productId: string;
  productSlug: string;
  productName: string;
  category: string;
  selectedVariants: CartSelectedVariant[];
  unitPrice: number;
  quantity: number;
  qty: number;
  subtotal: number;
  customerInputs: Record<string, string>;
  customerInputLabels?: Record<string, string>;
  addedAt: string;
};

export type CartItemPayload = Omit<CartItem, "key" | "addedAt" | "qty" | "subtotal"> & {
  qty?: number;
  subtotal?: number;
};

function serializeInputs(inputs: Record<string, string>): string {
  return JSON.stringify(
    Object.keys(inputs)
      .sort()
      .reduce<Record<string, string>>((acc, key) => {
        acc[key] = inputs[key];
        return acc;
      }, {}),
  );
}

function serializeSelectedVariants(selectedVariants: CartSelectedVariant[]): string {
  return JSON.stringify(
    [...selectedVariants]
      .sort((a, b) => a.type.localeCompare(b.type))
      .map((item) => ({
        variantId: item.variantId,
        type: item.type,
        value: item.value,
      })),
  );
}

function createItemKey(payload: CartItemPayload): string {
  return `${payload.productId}::${serializeSelectedVariants(payload.selectedVariants)}::${serializeInputs(payload.customerInputs)}`;
}

function isValidSelectedVariant(value: unknown): value is CartSelectedVariant {
  if (!value || typeof value !== "object") {
    return false;
  }

  const variant = value as Partial<CartSelectedVariant>;

  return (
    typeof variant.variantId === "string" &&
    typeof variant.label === "string" &&
    typeof variant.type === "string" &&
    typeof variant.value === "string" &&
    typeof variant.price === "number"
  );
}

function normalizeLegacyCartItem(value: Record<string, unknown>): CartItem | null {
  const key = typeof value.key === "string" ? value.key : "";
  const productId = typeof value.productId === "string" ? value.productId : "";
  const productName = typeof value.productName === "string" ? value.productName : "";
  const category = typeof value.category === "string" ? value.category : "";
  const unitPrice = typeof value.unitPrice === "number" ? value.unitPrice : 0;
  const qtyFromStorage = typeof value.qty === "number" ? value.qty : null;
  const quantity =
    typeof value.quantity === "number"
      ? value.quantity
      : qtyFromStorage !== null
        ? qtyFromStorage
        : 1;
  const addedAt = typeof value.addedAt === "string" ? value.addedAt : new Date().toISOString();

  const customerInputs =
    value.customerInputs && typeof value.customerInputs === "object"
      ? (value.customerInputs as Record<string, string>)
      : {};

  const customerInputLabels =
    value.customerInputLabels && typeof value.customerInputLabels === "object"
      ? (value.customerInputLabels as Record<string, string>)
      : undefined;

  let selectedVariants: CartSelectedVariant[] = [];
  if (Array.isArray(value.selectedVariants)) {
    selectedVariants = value.selectedVariants.filter(isValidSelectedVariant);
  } else {
    const legacyVariantId = typeof value.variantId === "string" ? value.variantId : "";
    const legacyVariantLabel = typeof value.variantLabel === "string" ? value.variantLabel : "";
    if (legacyVariantId && legacyVariantLabel) {
      selectedVariants = [
        {
          variantId: legacyVariantId,
          label: legacyVariantLabel,
          type: "VARIAN",
          value: legacyVariantLabel,
          price: unitPrice,
        },
      ];
    }
  }

  if (!key || !productId || !productName || selectedVariants.length === 0 || quantity <= 0) {
    return null;
  }

  return {
    key,
    productId,
    productSlug: typeof value.productSlug === "string" ? value.productSlug : productId,
    productName,
    category,
    selectedVariants,
    unitPrice,
    quantity,
    qty: quantity,
    subtotal: typeof value.subtotal === "number" ? value.subtotal : unitPrice * quantity,
    customerInputs,
    customerInputLabels,
    addedAt,
  };
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const normalized = normalizeLegacyCartItem(value as Record<string, unknown>);
  return Boolean(normalized);
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isValidCartItem)
      .map((item) => normalizeLegacyCartItem(item as Record<string, unknown>))
      .filter((item): item is CartItem => Boolean(item));
  } catch {
    return [];
  }
}

function emitCartUpdate() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  emitCartUpdate();
}

export function addCartItem(payload: CartItemPayload) {
  const currentCart = readCart();
  const itemKey = createItemKey(payload);
  const existingIndex = currentCart.findIndex((item) => item.key === itemKey);

  if (existingIndex >= 0) {
    const currentItem = currentCart[existingIndex];
    currentCart[existingIndex] = {
      ...currentItem,
      quantity: currentItem.quantity + payload.quantity,
      qty: currentItem.quantity + payload.quantity,
      subtotal: currentItem.unitPrice * (currentItem.quantity + payload.quantity),
    };
  } else {
    currentCart.push({
      ...payload,
      key: itemKey,
      qty: payload.quantity,
      subtotal: payload.unitPrice * payload.quantity,
      addedAt: new Date().toISOString(),
    });
  }

  writeCart(currentCart);
}

export function updateCartItemQuantity(itemKey: string, quantity: number) {
  const currentCart = readCart();

  if (quantity <= 0) {
    const filtered = currentCart.filter((item) => item.key !== itemKey);
    writeCart(filtered);
    return;
  }

  const updated = currentCart.map((item) =>
    item.key === itemKey
      ? { ...item, quantity, qty: quantity, subtotal: item.unitPrice * quantity }
      : item,
  );

  writeCart(updated);
}

export function removeCartItem(itemKey: string) {
  const currentCart = readCart();
  const filtered = currentCart.filter((item) => item.key !== itemKey);
  writeCart(filtered);
}

export function clearCart() {
  writeCart([]);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(item: CartItem): number {
  return item.unitPrice * item.quantity;
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + getCartSubtotal(item), 0);
}
