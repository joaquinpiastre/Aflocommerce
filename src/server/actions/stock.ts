"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateVariantStock(variantId: string, stock: number): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado." };
  }
  if (stock < 0) return { success: false, error: "El stock no puede ser negativo." };

  await prisma.productVariant.update({ where: { id: variantId }, data: { stock } });
  revalidatePath("/admin/stock");
  revalidatePath("/catalogo");
  return { success: true };
}
