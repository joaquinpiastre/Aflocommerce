"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type FilterOptions = {
  sizes: string[];
  colors: { name: string; hex: string }[];
  minPrice: number;
  maxPrice: number;
};

export function CatalogFilters({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedSizes = searchParams.getAll("talle");
  const selectedColors = searchParams.getAll("color");
  const inStockOnly = searchParams.get("stock") === "1";
  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");

  const updateParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      params.delete("page");
      router.push(`/catalogo?${params.toString()}`);
    },
    [router, searchParams]
  );

  function toggleMultiValue(key: string, value: string) {
    updateParams((params) => {
      const current = params.getAll(key);
      params.delete(key);
      if (current.includes(value)) {
        current.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        [...current, value].forEach((v) => params.append(key, v));
      }
    });
  }

  function applyPriceRange() {
    updateParams((params) => {
      if (minPrice) params.set("min", minPrice);
      else params.delete("min");
      if (maxPrice) params.set("max", maxPrice);
      else params.delete("max");
    });
  }

  function toggleInStock() {
    updateParams((params) => {
      if (inStockOnly) params.delete("stock");
      else params.set("stock", "1");
    });
  }

  function clearAll() {
    router.push("/catalogo");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm uppercase tracking-wide text-foreground">Filtros</h3>
        <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-accent">
          Limpiar
        </button>
      </div>

      <Separator />

      {options.sizes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs uppercase text-muted-foreground">Talle</Label>
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleMultiValue("talle", size)}
                  className={`flex h-9 min-w-9 items-center justify-center border px-2 text-xs font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:border-accent"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      {options.colors.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs uppercase text-muted-foreground">Color</Label>
          <div className="flex flex-wrap gap-2">
            {options.colors.map((color) => {
              const active = selectedColors.includes(color.name);
              return (
                <button
                  key={color.name}
                  onClick={() => toggleMultiValue("color", color.name)}
                  title={color.name}
                  className={`size-8 rounded-full border-2 transition-all ${
                    active ? "border-accent scale-110" : "border-border"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs uppercase text-muted-foreground">Precio</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={String(options.minPrice)}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder={String(options.maxPrice)}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9"
          />
        </div>
        <Button size="sm" variant="outline" className="w-full" onClick={applyPriceRange}>
          Aplicar precio
        </Button>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <Checkbox id="in-stock" checked={inStockOnly} onCheckedChange={toggleInStock} />
        <Label htmlFor="in-stock" className="text-sm font-normal text-foreground">
          Solo con stock disponible
        </Label>
      </div>
    </div>
  );
}
