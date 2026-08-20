import { prisma } from "@/lib/prisma";
import type { ProductCardDTO } from "@/lib/data/products";

export async function getUserWishlist(userId: string): Promise<ProductCardDTO[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { category: true, variants: true } } },
    orderBy: { createdAt: "desc" },
  });

  return items.map(({ product }) => {
    const colorsMap = new Map<string, string>();
    for (const v of product.variants) colorsMap.set(v.colorName, v.colorHex);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      images: product.images,
      basePrice: Number(product.basePrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      featured: product.featured,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      totalStock: product.variants.reduce((acc, v) => acc + v.stock, 0),
      colors: Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex })),
      createdAt: product.createdAt,
    };
  });
}
