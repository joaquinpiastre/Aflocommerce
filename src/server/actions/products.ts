"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema, type ProductFormInput } from "@/lib/validations/product";

type ActionResult =
  | { success: true; id?: string; warning?: string }
  | { success: false; error: string };

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
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function createProduct(input: ProductFormInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(data.name);

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      material: data.material || null,
      categoryId: data.categoryId,
      basePrice: data.basePrice,
      salePrice: data.salePrice ?? null,
      images: data.images,
      featured: Boolean(data.featured),
      active: data.active ?? true,
      variants: {
        create: data.variants.map((v) => ({
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          sku: v.sku,
          stock: v.stock,
          price: v.price ?? null,
        })),
      },
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  return { success: true, id: product.id };
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!existing) return { success: false, error: "Producto no encontrado." };

  const slug = data.name !== existing.name ? await uniqueSlug(data.name, id) : existing.slug;

  const incomingIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id));
  const toDelete = existing.variants.filter((v) => !incomingIds.has(v.id));

  // Una variante con ventas asociadas no se puede borrar (la FK de OrderItem
  // lo impide). En vez de abortar todo el guardado, la dejamos como está y
  // avisamos, para que el resto de los cambios (producto + otras variantes)
  // se guarde igual.
  let blockedVariants: typeof toDelete = [];
  if (toDelete.length > 0) {
    const referenced = await prisma.orderItem.findMany({
      where: { variantId: { in: toDelete.map((v) => v.id) } },
      select: { variantId: true },
      distinct: ["variantId"],
    });
    const referencedIds = new Set(referenced.map((r) => r.variantId));
    blockedVariants = toDelete.filter((v) => referencedIds.has(v.id));
  }
  const blockedIds = new Set(blockedVariants.map((v) => v.id));
  const deletableVariants = toDelete.filter((v) => !blockedIds.has(v.id));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug,
          description: data.description,
          material: data.material || null,
          categoryId: data.categoryId,
          basePrice: data.basePrice,
          salePrice: data.salePrice ?? null,
          images: data.images,
          featured: Boolean(data.featured),
          active: data.active ?? true,
        },
      });

      for (const del of deletableVariants) {
        await tx.productVariant.delete({ where: { id: del.id } });
      }

      for (const v of data.variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              size: v.size,
              colorName: v.colorName,
              colorHex: v.colorHex,
              sku: v.sku,
              stock: v.stock,
              price: v.price ?? null,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              size: v.size,
              colorName: v.colorName,
              colorHex: v.colorHex,
              sku: v.sku,
              stock: v.stock,
              price: v.price ?? null,
            },
          });
        }
      }
    });
  } catch {
    return {
      success: false,
      error: "No se pudo guardar el producto. Probá de nuevo en unos segundos.",
    };
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}`);
  revalidatePath("/catalogo");
  revalidatePath(`/productos/${slug}`);

  const warning =
    blockedVariants.length > 0
      ? `Se guardaron los cambios, pero ${blockedVariants.length === 1 ? "esta variante no se pudo eliminar porque tiene" : "estas variantes no se pudieron eliminar porque tienen"} ventas asociadas y quedaron sin cambios: ${blockedVariants
          .map((v) => `${v.size} / ${v.colorName}`)
          .join(", ")}. Desactivá el producto si no querés que se sigan vendiendo.`
      : undefined;

  return { success: true, id, warning };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    return {
      success: false,
      error: "No se puede eliminar: el producto tiene ventas asociadas. Desactivalo en su lugar.",
    };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  return { success: true };
}

export async function toggleProductField(
  id: string,
  field: "active" | "featured",
  value: boolean
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { [field]: value } });
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  return { success: true };
}
