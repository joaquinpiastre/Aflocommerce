import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { ProductCardDTO } from "@/lib/data/products";
import { Badge } from "@/components/ui/badge";

const NEW_THRESHOLD_DAYS = 21;

export function ProductCard({ product }: { product: ProductCardDTO }) {
  const isNew =
    (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24) < NEW_THRESHOLD_DAYS;
  const onSale = product.salePrice !== null && product.salePrice < product.basePrice;
  const outOfStock = product.totalStock <= 0;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group block overflow-hidden border border-transparent transition-colors hover:border-border"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {onSale && <Badge className="bg-primary text-primary-foreground">Oferta</Badge>}
          {isNew && !onSale && (
            <Badge variant="outline" className="border-accent text-accent-foreground bg-card">
              Nuevo
            </Badge>
          )}
          {outOfStock && <Badge variant="outline" className="bg-card text-muted-foreground">Sin stock</Badge>}
        </div>
        {product.colors.length > 1 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c.name}
                className="size-3 rounded-full border border-white/40"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>
      <div className="space-y-1 pt-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.categoryName}</p>
        <h3 className="font-display text-sm uppercase leading-tight text-foreground sm:text-base">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {onSale ? (
            <>
              <span className="font-semibold text-primary">{formatPrice(product.salePrice!)}</span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.basePrice)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-foreground">{formatPrice(product.basePrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
