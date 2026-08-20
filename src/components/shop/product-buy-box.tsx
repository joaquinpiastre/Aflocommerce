"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import type { ProductDetailDTO } from "@/lib/data/products";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { SizeGuideModal } from "./size-guide-modal";

export function ProductBuyBox({ product, isClothing }: { product: ProductDetailDTO; isClothing: boolean }) {
  const colors = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of product.variants) map.set(v.colorName, v.colorHex);
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? "");

  const sizesForColor = useMemo(
    () => product.variants.filter((v) => v.colorName === selectedColor),
    [product.variants, selectedColor]
  );

  const [selectedSize, setSelectedSize] = useState(
    sizesForColor.find((v) => v.stock > 0)?.size ?? sizesForColor[0]?.size ?? ""
  );

  const currentVariant = product.variants.find(
    (v) => v.colorName === selectedColor && v.size === selectedSize
  );

  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const price = currentVariant?.price ?? product.salePrice ?? product.basePrice;
  const compareAtPrice =
    product.salePrice !== null && !currentVariant?.price ? product.basePrice : null;

  function handleColorChange(colorName: string) {
    setSelectedColor(colorName);
    const variants = product.variants.filter((v) => v.colorName === colorName);
    const nextSize = variants.find((v) => v.stock > 0)?.size ?? variants[0]?.size ?? "";
    setSelectedSize(nextSize);
    setQuantity(1);
  }

  function handleSizeChange(size: string) {
    setSelectedSize(size);
    setQuantity(1);
  }

  function handleAddToCart() {
    if (!currentVariant || currentVariant.stock <= 0) {
      toast.error("Esa combinación no tiene stock disponible.");
      return;
    }
    addItem(
      {
        variantId: currentVariant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        image: product.images[0] ?? "",
        size: currentVariant.size,
        colorName: currentVariant.colorName,
        colorHex: currentVariant.colorHex,
        unitPrice: price,
        maxStock: currentVariant.stock,
      },
      quantity
    );
    toast.success(`${product.name} agregado al carrito`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-foreground">{formatPrice(price)}</span>
        {compareAtPrice && (
          <span className="text-lg text-muted-foreground line-through">{formatPrice(compareAtPrice)}</span>
        )}
      </div>

      {colors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Color: <span className="text-foreground">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.name)}
                title={color.name}
                className={`size-9 rounded-full border-2 transition-all ${
                  selectedColor === color.name ? "border-accent scale-110" : "border-border"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {isClothing ? "Talle" : "Tamaño"}
          </p>
          <SizeGuideModal isClothing={isClothing} />
        </div>
        <div className="flex flex-wrap gap-2">
          {sizesForColor.map((variant) => (
            <button
              key={variant.id}
              onClick={() => handleSizeChange(variant.size)}
              disabled={variant.stock <= 0}
              className={`h-10 min-w-10 border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                selectedSize === variant.size
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:border-accent"
              }`}
            >
              {variant.size}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm">
        {currentVariant ? (
          currentVariant.stock <= 0 ? (
            <p className="font-medium text-destructive">Sin stock para esta combinación.</p>
          ) : currentVariant.stock <= LOW_STOCK_THRESHOLD ? (
            <p className="font-medium text-accent">¡Últimas {currentVariant.stock} unidades!</p>
          ) : (
            <p className="text-muted-foreground">En stock.</p>
          )
        ) : (
          <p className="text-muted-foreground">Elegí color y talle.</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-border">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-10 items-center justify-center text-foreground hover:text-accent"
            aria-label="Restar cantidad"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(currentVariant?.stock ?? 1, q + 1))}
            className="flex size-10 items-center justify-center text-foreground hover:text-accent"
            aria-label="Sumar cantidad"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={!currentVariant || currentVariant.stock <= 0}
        >
          Agregar al carrito
        </Button>
      </div>
    </div>
  );
}
