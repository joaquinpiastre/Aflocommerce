import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

const PAID_STATUSES = ["PAGADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO"] as const;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardMetrics() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(todayStart);
  monthStart.setDate(1);
  const chartStart = new Date(todayStart);
  chartStart.setDate(chartStart.getDate() - 13);

  const [paidOrders, ordersCount, topProducts, lowStockVariants, chartOrders] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: [...PAID_STATUSES] } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.count(),
    prisma.product.findMany({
      where: { soldCount: { gt: 0 } },
      orderBy: { soldCount: "desc" },
      take: 5,
      select: { id: true, name: true, soldCount: true },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      include: { product: { select: { name: true } } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    prisma.order.findMany({
      where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: chartStart } },
      select: { total: true, createdAt: true },
    }),
  ]);

  const sum = (orders: { total: unknown }[]) =>
    orders.reduce((acc, o) => acc + Number(o.total), 0);

  const revenueTotal = sum(paidOrders);
  const revenueToday = sum(paidOrders.filter((o) => o.createdAt >= todayStart));
  const revenueWeek = sum(paidOrders.filter((o) => o.createdAt >= weekStart));
  const revenueMonth = sum(paidOrders.filter((o) => o.createdAt >= monthStart));

  const topVariantsRaw = await prisma.orderItem.groupBy({
    by: ["variantId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const topVariantIds = topVariantsRaw.map((v) => v.variantId);
  const variantDetails = await prisma.productVariant.findMany({
    where: { id: { in: topVariantIds } },
    include: { product: { select: { name: true } } },
  });
  const topVariants = topVariantsRaw.map((v) => {
    const detail = variantDetails.find((d) => d.id === v.variantId);
    return {
      label: detail ? `${detail.product.name} (${detail.size} / ${detail.colorName})` : "—",
      quantity: v._sum.quantity ?? 0,
    };
  });

  const chartMap = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    chartMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const order of chartOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    chartMap.set(key, (chartMap.get(key) ?? 0) + Number(order.total));
  }
  const salesByDay = Array.from(chartMap.entries()).map(([date, total]) => ({
    date: date.slice(5),
    total,
  }));

  return {
    revenueTotal,
    revenueToday,
    revenueWeek,
    revenueMonth,
    ordersCount,
    topProducts,
    topVariants,
    lowStockVariants,
    salesByDay,
  };
}
