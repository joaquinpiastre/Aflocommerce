import { prisma } from "@/lib/prisma";

export async function getTopLevelCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { name: "asc" },
  });
}

export async function getAllCategoriesFlat() {
  return prisma.category.findMany({
    include: { parent: true },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { children: true, parent: true },
  });
}
