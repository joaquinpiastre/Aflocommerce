import { prisma } from "@/lib/prisma";

export async function getOrderByNumber(orderNumber: string, userId?: string) {
  const order = await prisma.order.findFirst({
    where: { orderNumber, ...(userId ? { userId } : {}) },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!order) return null;

  return {
    ...order,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
  };
}

export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    ...order,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
  }));
}
