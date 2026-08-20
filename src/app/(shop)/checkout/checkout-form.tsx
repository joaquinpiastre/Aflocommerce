"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useCartStore, cartSubtotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_COST } from "@/lib/constants";
import { createOrder } from "@/server/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Address = {
  id: string;
  label: string | null;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string | null;
};

export function CheckoutForm({ addresses }: { addresses: Address[] }) {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id ?? "new");
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
  });
  const [saveAddress, setSaveAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  const total = subtotal + shipping;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    const usingNew = selectedAddressId === "new";
    if (usingNew) {
      const { street, city, province, postalCode } = newAddress;
      if (!street || !city || !province || !postalCode) {
        setError("Completá todos los campos de la dirección de envío.");
        return;
      }
    }

    setLoading(true);
    const result = await createOrder({
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      addressId: usingNew ? undefined : selectedAddressId,
      newAddress: usingNew ? newAddress : undefined,
      saveAddress: usingNew ? saveAddress : undefined,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    clear();
    if (result.mock) {
      toast.success("Pago confirmado (modo sandbox de Mercado Pago).");
    }
    window.location.href = result.redirectUrl;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Button render={<Link href="/catalogo" />}>Ver catálogo</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="font-display text-lg uppercase text-foreground">Dirección de envío</h2>
          <div className="space-y-3">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                  selectedAddressId === addr.id ? "border-accent" : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  className="mt-1"
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                />
                <span className="text-sm text-foreground">
                  {addr.label && <span className="font-medium">{addr.label}: </span>}
                  {addr.street}, {addr.city}, {addr.province} ({addr.postalCode})
                </span>
              </label>
            ))}
            <label
              className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                selectedAddressId === "new" ? "border-accent" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="address"
                className="mt-1"
                checked={selectedAddressId === "new"}
                onChange={() => setSelectedAddressId("new")}
              />
              <span className="text-sm text-foreground">Usar una dirección nueva</span>
            </label>
          </div>

          {selectedAddressId === "new" && (
            <div className="space-y-4 border border-border bg-card p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="checkout-street">Calle y número</Label>
                  <Input
                    id="checkout-street"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-city">Ciudad</Label>
                  <Input
                    id="checkout-city"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-province">Provincia</Label>
                  <Input
                    id="checkout-province"
                    value={newAddress.province}
                    onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-postal">Código postal</Label>
                  <Input
                    id="checkout-postal"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-phone">Teléfono (opcional)</Label>
                  <Input
                    id="checkout-phone"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="save-address"
                  checked={saveAddress}
                  onCheckedChange={(v) => setSaveAddress(Boolean(v))}
                />
                <Label htmlFor="save-address" className="text-sm font-normal">
                  Guardar esta dirección para próximas compras
                </Label>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg uppercase text-foreground">Método de pago</h2>
          <div className="border border-accent/40 bg-card p-4 text-sm text-foreground">
            Mercado Pago (Checkout Pro)
            <p className="mt-1 text-xs text-muted-foreground">
              Serás redirigido a Mercado Pago para completar el pago de forma segura.
            </p>
          </div>
        </section>
      </div>

      <div className="h-fit space-y-4 border border-border bg-card p-6">
        <h2 className="font-display text-lg uppercase text-foreground">Tu pedido</h2>
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden bg-secondary">
                {item.image && <Image src={item.image} alt={item.productName} fill className="object-cover" />}
              </div>
              <div className="flex-1 text-sm">
                <p className="text-foreground">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.size} / {item.colorName} × {item.quantity}
                </p>
              </div>
              <span className="text-sm text-foreground">{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
          </div>
        </div>
        <div className="flex justify-between border-t border-border pt-4 text-lg font-semibold text-foreground">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Procesando..." : "Pagar con Mercado Pago"}
        </Button>
      </div>
    </form>
  );
}
