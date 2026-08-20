"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type WishlistResult = { success: true; inWishlist: boolean } | { success: false; error: string };

export async function toggleWishlist(productId: string): Promise<WishlistResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Necesitás iniciar sesión para guardar favoritos." };
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/cuenta/favoritos");
    return { success: true, inWishlist: false };
  }

  await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } });
  revalidatePath("/cuenta/favoritos");
  return { success: true, inWishlist: true };
}

export async function isProductInWishlist(productId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });
  return Boolean(existing);
}
