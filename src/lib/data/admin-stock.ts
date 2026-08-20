import { prisma } from "@/lib/prisma";

export async function getStockOverview() {
  const variants = await prisma.productVariant.findMany({
    include: { product: { select: { name: true, images: true, category: { select: { name: true } } } } },
    orderBy: [{ stock: "asc" }, { product: { name: "asc" } }],
  });

  return variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    size: v.size,
    colorName: v.colorName,
    colorHex: v.colorHex,
    stock: v.stock,
    productName: v.product.name,
    categoryName: v.product.category.name,
    image: v.product.images[0] ?? null,
  }));
}
