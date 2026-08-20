import { prisma } from "@/lib/prisma";

export async function getCustomers() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: { select: { total: true, status: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    createdAt: u.createdAt,
    ordersCount: u.orders.length,
    totalSpent: u.orders
      .filter((o) => o.status !== "CANCELADO")
      .reduce((acc, o) => acc + Number(o.total), 0),
    lastOrderAt: u.orders.length
      ? u.orders.reduce((latest, o) => (o.createdAt > latest ? o.createdAt : latest), u.orders[0].createdAt)
      : null,
  }));
}
