"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/lib/cart-store";

export async function getServerCart(): Promise<CartItem[]> {
  const session = await auth();
  if (!session?.user) return [];

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { variant: { include: { product: true } } },
      },
    },
  });

  if (!cart) return [];

  return cart.items.map((item) => ({
    variantId: item.variant.id,
    productId: item.variant.productId,
    productName: item.variant.product.name,
    productSlug: item.variant.product.slug,
    image: item.variant.product.images[0] ?? "",
    size: item.variant.size,
    colorName: item.variant.colorName,
    colorHex: item.variant.colorHex,
    unitPrice: Number(item.variant.price ?? item.variant.product.salePrice ?? item.variant.product.basePrice),
    quantity: item.quantity,
    maxStock: item.variant.stock,
  }));
}

export async function syncCartToDb(items: { variantId: string; quantity: number }[]) {
  const session = await auth();
  if (!session?.user) return;

  const cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  if (items.length) {
    await prisma.cartItem.createMany({
      data: items.map((i) => ({ cartId: cart.id, variantId: i.variantId, quantity: i.quantity })),
      skipDuplicates: true,
    });
  }
}
