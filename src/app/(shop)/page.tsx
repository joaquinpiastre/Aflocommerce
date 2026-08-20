import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/shop/product-grid";
import {
  getFeaturedProducts,
  getNewProducts,
  getDrinkwareProducts,
} from "@/lib/data/products";
import { getTopLevelCategories } from "@/lib/data/categories";

export default async function HomePage() {
  const [featured, newArrivals, drinkware, categories] = await Promise.all([
    getFeaturedProducts(4),
    getNewProducts(8),
    getDrinkwareProducts(4),
    getTopLevelCategories(),
  ]);

  const onSale = [...featured, ...newArrivals].filter((p) => p.salePrice !== null).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden border-b border-border bg-background px-4 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(183,38,45,0.18),transparent_60%)]" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <Image
            src="/brand/aflo-logo-original.jpeg"
            alt="Aflo"
            width={140}
            height={207}
            priority
            className="rounded-sm border border-accent/40"
          />
          <h1 className="max-w-3xl text-6xl leading-none text-foreground sm:text-8xl">
            Streetwear <span className="text-primary">con actitud</span>
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Remeras, buzos, camperas, joggers, gorras, termos, vasos y mates. La manada Aflo no pasa
            desapercibida.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" render={<Link href="/catalogo" />}>
              Ver catálogo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              render={<Link href="/catalogo?categoria=indumentaria" />}
            >
              Indumentaria
            </Button>
          </div>
        </div>
      </section>

      {/* Categorías destacadas */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-3xl text-foreground sm:text-4xl">Categorías</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group relative flex aspect-square items-end overflow-hidden border border-border bg-card p-4 transition-colors hover:border-accent"
            >
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="200px"
                  className="object-cover opacity-60 transition-opacity group-hover:opacity-80"
                />
              )}
              <span className="relative font-display text-lg uppercase text-foreground">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-3xl text-foreground sm:text-4xl">Destacados</h2>
            <Link href="/catalogo" className="text-sm text-accent hover:underline">
              Ver todo
            </Link>
          </div>
          <ProductGrid products={featured} />
        </section>
      )}

      {/* Banner de ofertas */}
      {onSale.length > 0 && (
        <section className="border-y border-border bg-card">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-3xl text-primary sm:text-4xl">Ofertas</h2>
                <p className="text-sm text-muted-foreground">Precios especiales por tiempo limitado.</p>
              </div>
              <Link href="/catalogo" className="text-sm text-accent hover:underline">
                Ver todo
              </Link>
            </div>
            <ProductGrid products={onSale} />
          </div>
        </section>
      )}

      {/* Nuevos ingresos */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl text-foreground sm:text-4xl">Nuevos ingresos</h2>
          <Link href="/catalogo?sort=nuevos" className="text-sm text-accent hover:underline">
            Ver todo
          </Link>
        </div>
        <ProductGrid products={newArrivals} />
      </section>

      {/* Drinkware */}
      {drinkware.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-3xl text-foreground sm:text-4xl">Termos, vasos y mates</h2>
                <p className="text-sm text-muted-foreground">
                  Acero inoxidable, doble capa térmica y estilo Aflo.
                </p>
              </div>
              <Link href="/catalogo?categoria=termos" className="text-sm text-accent hover:underline">
                Ver todo
              </Link>
            </div>
            <ProductGrid products={drinkware} />
          </div>
        </section>
      )}
    </div>
  );
}
