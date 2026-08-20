"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema, type CategoryFormInput } from "@/lib/validations/product";

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function createCategory(input: CategoryFormInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const slug = await uniqueSlug(parsed.data.name);
  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      image: parsed.data.image || null,
      parentId: parsed.data.parentId || null,
    },
  });
  revalidatePath("/admin/categorias");
  return { success: true };
}

export async function updateCategory(id: string, input: CategoryFormInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Categoría no encontrada." };

  const slug = parsed.data.name !== existing.name ? await uniqueSlug(parsed.data.name, id) : existing.slug;

  await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      image: parsed.data.image || null,
      parentId: parsed.data.parentId || null,
    },
  });
  revalidatePath("/admin/categorias");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return {
      success: false,
      error: "No se puede eliminar: la categoría tiene productos o subcategorías asociadas.",
    };
  }
  revalidatePath("/admin/categorias");
  return { success: true };
}
