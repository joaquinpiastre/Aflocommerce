import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserWishlist } from "@/lib/data/wishlist";
import { ProductGrid } from "@/components/shop/product-grid";

export const metadata: Metadata = { title: "Favoritos" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const products = await getUserWishlist(session.user.id);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl uppercase text-foreground">Favoritos</h2>
      <ProductGrid products={products} emptyLabel="Todavía no agregaste productos a favoritos." />
    </div>
  );
}
