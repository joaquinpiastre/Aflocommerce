import type { ProductCardDTO } from "@/lib/data/products";
import { ProductCard } from "./product-card";

export function ProductGrid({ products, emptyLabel }: { products: ProductCardDTO[]; emptyLabel?: string }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
        <p className="font-display text-lg uppercase text-foreground">Sin resultados</p>
        <p className="text-sm text-muted-foreground">
          {emptyLabel ?? "No encontramos productos que coincidan con tu búsqueda."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
