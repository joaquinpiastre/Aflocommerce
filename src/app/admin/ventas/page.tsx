import type { Metadata } from "next";
import { Download } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { getAdminOrders } from "@/lib/data/admin-orders";
import { OrdersFilters } from "@/components/admin/orders-filters";
import { OrdersTable } from "@/components/admin/orders-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Ventas" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const orders = await getAdminOrders({
    search: params.search,
    status: params.status as OrderStatus | undefined,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-foreground">Ventas</h1>
        <Button variant="outline" className="gap-1.5" render={<a href="/api/admin/export-orders" />}>
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>
      <OrdersFilters />
      <p className="text-sm text-muted-foreground">
        {orders.length} orden{orders.length !== 1 ? "es" : ""} encontrada{orders.length !== 1 ? "s" : ""}
      </p>
      <OrdersTable orders={orders} />
    </div>
  );
}
