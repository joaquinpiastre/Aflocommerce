import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductVariantDTO = {
  id: string;
  size: string;
  colorName: string;
  colorHex: string;
  sku: string;
  stock: number;
  price: number | null;
};

export type ProductCardDTO = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  basePrice: number;
  salePrice: number | null;
  featured: boolean;
  categoryName: string;
  categorySlug: string;
  totalStock: number;
  colors: { name: string; hex: string }[];
  createdAt: Date;
};

export type ProductDetailDTO = ProductCardDTO & {
  description: string;
  material: string | null;
  variants: ProductVariantDTO[];
};

const productWithRelations = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { category: true, variants: true },
});

type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>;

function toCardDTO(p: ProductWithRelations): ProductCardDTO {
  const colorsMap = new Map<string, string>();
  for (const v of p.variants) colorsMap.set(v.colorName, v.colorHex);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    images: p.images,
    basePrice: Number(p.basePrice),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    featured: p.featured,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    totalStock: p.variants.reduce((acc, v) => acc + v.stock, 0),
    colors: Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex })),
    createdAt: p.createdAt,
  };
}

function toDetailDTO(p: ProductWithRelations): ProductDetailDTO {
  return {
    ...toCardDTO(p),
    description: p.description,
    material: p.material,
    variants: p.variants.map((v) => ({
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

export type SortOption = "relevancia" | "precio-asc" | "precio-desc" | "nuevos" | "mas-vendidos";

export type ProductFilters = {
  search?: string;
  categorySlug?: string;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
};

export async function getProducts(filters: ProductFilters = {}) {
  const {
    search,
    categorySlug,
    sizes,
    colors,
    minPrice,
    maxPrice,
    inStockOnly,
    sort = "relevancia",
    page = 1,
    pageSize = 12,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    active: true,
  };

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  if (categorySlug) {
    where.category = {
      OR: [{ slug: categorySlug }, { parent: { slug: categorySlug } }],
    };
  }

  if (sizes?.length) {
    where.variants = { some: { size: { in: sizes } } };
  }

  if (colors?.length) {
    where.variants = {
      ...(where.variants as Prisma.ProductVariantListRelationFilter | undefined),
      some: {
        ...((where.variants as Prisma.ProductVariantListRelationFilter)?.some ?? {}),
        colorName: { in: colors },
      },
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePrice = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  if (inStockOnly) {
    where.variants = {
      ...(where.variants as Prisma.ProductVariantListRelationFilter | undefined),
      some: {
        ...((where.variants as Prisma.ProductVariantListRelationFilter)?.some ?? {}),
        stock: { gt: 0 },
      },
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "precio-asc"
      ? { basePrice: "asc" }
      : sort === "precio-desc"
        ? { basePrice: "desc" }
        : sort === "nuevos"
          ? { createdAt: "desc" }
          : sort === "mas-vendidos"
            ? { soldCount: "desc" }
            : { featured: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, variants: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(toCardDTO),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetailDTO | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  });
  if (!product || !product.active) return null;
  return toDetailDTO(product);
}

export async function getFeaturedProducts(limit = 4) {
  const items = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return items.map(toCardDTO);
}

export async function getNewProducts(limit = 8) {
  const items = await prisma.product.findMany({
    where: { active: true },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return items.map(toCardDTO);
}

export async function getDrinkwareProducts(limit = 8) {
  const items = await prisma.product.findMany({
    where: {
      active: true,
      category: { slug: { in: ["termos", "vasos", "mates"] } },
    },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return items.map(toCardDTO);
}

export async function getRelatedProducts(categorySlug: string, excludeId: string, limit = 4) {
  const items = await prisma.product.findMany({
    where: {
      active: true,
      id: { not: excludeId },
      category: { slug: categorySlug },
    },
    include: { category: true, variants: true },
    take: limit,
  });
  return items.map(toCardDTO);
}

export async function getAvailableFilterOptions() {
  const variants = await prisma.productVariant.findMany({
    where: { product: { active: true } },
    select: { size: true, colorName: true, colorHex: true },
    distinct: ["size", "colorName"],
  });

  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colorsMap = new Map<string, string>();
  for (const v of variants) colorsMap.set(v.colorName, v.colorHex);

  const priceRange = await prisma.product.aggregate({
    where: { active: true },
    _min: { basePrice: true },
    _max: { basePrice: true },
  });

  return {
    sizes,
    colors: Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex })),
    minPrice: priceRange._min.basePrice ? Number(priceRange._min.basePrice) : 0,
    maxPrice: priceRange._max.basePrice ? Number(priceRange._max.basePrice) : 100000,
  };
}
