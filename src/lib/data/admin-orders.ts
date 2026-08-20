import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminOrderFilters = {
  status?: OrderStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function getAdminOrders(filters: AdminOrderFilters = {}) {
  const where: Prisma.OrderWhereInput = {};

  if (filters.status) where.status = filters.status;

  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: "insensitive" } },
      { user: { name: { contains: filters.search, mode: "insensitive" } } },
      { user: { email: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59`) } : {}),
    };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { user: { select: { name: true, email: true } }, items: true },
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
