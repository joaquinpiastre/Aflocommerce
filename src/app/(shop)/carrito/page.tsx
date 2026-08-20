"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore, cartSubtotal } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_COST } from "@/lib/constants";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = cartSubtotal(items);
  const shipping = items.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-3xl text-foreground">Tu carrito está vacío</h1>
        <p className="text-muted-foreground">Explorá el catálogo y encontrá tu próxima pieza Aflo.</p>
        <Button size="lg" render={<Link href="/catalogo" />}>
          Ver catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-4xl text-foreground">Carrito</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 border-b border-border pb-6">
              <Link href={`/productos/${item.productSlug}`} className="relative size-24 shrink-0 overflow-hidden bg-secondary sm:size-32">
                {item.image && <Image src={item.image} alt={item.productName} fill className="object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/productos/${item.productSlug}`} className="font-display text-sm uppercase text-foreground hover:text-accent sm:text-base">
                    {item.productName}
                  </Link>
                  <button onClick={() => removeItem(item.variantId)} aria-label="Quitar" className="text-muted-foreground hover:text-destructive">
                    <X className="size-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Talle {item.size} · Color {item.colorName}
                </p>
                <p className="font-medium text-foreground">{formatPrice(item.unitPrice)}</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="flex size-8 items-center justify-center text-foreground hover:text-accent"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="flex size-8 items-center justify-center text-foreground hover:text-accent disabled:opacity-30"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Subtotal: {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit space-y-4 border border-border bg-card p-6">
          <h2 className="font-display text-lg uppercase text-foreground">Resumen</h2>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Envío</span>
            <span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
          </div>
          {shipping > 0 && (
            <p className="text-xs text-muted-foreground">
              Envío gratis en compras desde {formatPrice(FREE_SHIPPING_THRESHOLD)}.
            </p>
          )}
          <div className="flex justify-between border-t border-border pt-4 text-lg font-semibold text-foreground">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button size="lg" className="w-full" render={<Link href="/checkout" />}>
            Iniciar compra
          </Button>
        </div>
      </div>
    </div>
  );
}
