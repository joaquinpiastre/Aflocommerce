import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  size: string;
  colorName: string;
  colorHex: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  replaceAll: (items: CartItem[]) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === item.variantId);
        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, existing.maxStock || 999);
          set({
            items: items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: Math.min(quantity, item.maxStock || 999) }] });
        }
      },
      removeItem: (variantId) => set({ items: get().items.filter((i) => i.variantId !== variantId) }),
      updateQuantity: (variantId, quantity) =>
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock || 999)) } : i
          ),
        }),
      clear: () => set({ items: [] }),
      replaceAll: (items) => set({ items }),
    }),
    { name: "aflo-cart" }
  )
);

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((acc, i) => acc + i.quantity, 0);
}
