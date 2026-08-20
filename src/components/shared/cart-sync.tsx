"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/cart-store";
import { getServerCart, syncCartToDb } from "@/server/actions/cart";

export function CartSync() {
  const { status } = useSession();
  const mergedForSession = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || mergedForSession.current) return;
    mergedForSession.current = true;

    (async () => {
      const serverItems = await getServerCart();
      const localItems = useCartStore.getState().items;

      const map = new Map(serverItems.map((i) => [i.variantId, i]));
      for (const local of localItems) {
        const existing = map.get(local.variantId);
        if (existing) {
          existing.quantity = Math.min(existing.quantity + local.quantity, existing.maxStock || 999);
        } else {
          map.set(local.variantId, local);
        }
      }
      const merged = Array.from(map.values());
      useCartStore.getState().replaceAll(merged);
      await syncCartToDb(merged.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
    })();
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const unsub = useCartStore.subscribe((state) => {
      if (!mergedForSession.current) return;
      syncCartToDb(state.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
    });
    return unsub;
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      mergedForSession.current = false;
    }
  }, [status]);

  return null;
}
