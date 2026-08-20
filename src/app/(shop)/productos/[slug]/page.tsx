import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getProductReviews } from "@/lib/data/reviews";
import { isProductInWishlist } from "@/server/actions/wishlist";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductBuyBox } from "@/components/shop/product-buy-box";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { ProductReviews } from "@/components/shop/product-reviews";
import { ProductGrid } from "@/components/shop/product-grid";

const CLOTHING_CATEGORIES = ["remeras", "buzos", "camperas", "joggers", "gorras", "musculosas"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, session] = await Promise.all([getProductBySlug(slug), auth()]);

  if (!product) notFound();

  const [related, { reviews, average, count }, inWishlist] = await Promise.all([
    getRelatedProducts(product.categorySlug, product.id, 4),
    getProductReviews(product.id),
    isProductInWishlist(product.id),
  ]);

  const isClothing = CLOTHING_CATEGORIES.includes(product.categorySlug);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.categoryName}</p>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl uppercase text-foreground sm:text-4xl">{product.name}</h1>
              <WishlistButton
                productId={product.id}
                initialInWishlist={inWishlist}
                isLoggedIn={Boolean(session?.user)}
              />
            </div>
          </div>

          <ProductBuyBox product={product} isClothing={isClothing} />

          <div className="space-y-2 border-t border-border pt-6">
            <h2 className="font-display text-sm uppercase tracking-wide text-foreground">Descripción</h2>
            <p className="text-sm text-muted-foreground">{product.description}</p>
            {product.material && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Material: </span>
                {product.material}
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="mb-6 text-2xl text-foreground">Reseñas</h2>
        <ProductReviews
          productId={product.id}
          productSlug={product.slug}
          reviews={reviews}
          average={average}
          count={count}
          isLoggedIn={Boolean(session?.user)}
        />
      </section>

      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="mb-6 text-2xl text-foreground">También te puede interesar</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
