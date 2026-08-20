import { prisma } from "@/lib/prisma";

export async function getAdminProducts(search?: string) {
  const products = await prisma.product.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryName: p.category.name,
    basePrice: Number(p.basePrice),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    active: p.active,
    featured: p.featured,
    totalStock: p.variants.reduce((acc, v) => acc + v.stock, 0),
    variantCount: p.variants.length,
    image: p.images[0] ?? null,
  }));
}

export async function getAdminProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    material: product.material,
    categoryId: product.categoryId,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    images: product.images,
    featured: product.featured,
    active: product.active,
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      colorName: v.colorName,
      colorHex: v.colorHex,
      sku: v.sku,
      stock: v.stock,
      price: v.price ? Number(v.price) : null,
    })),
  };
}
