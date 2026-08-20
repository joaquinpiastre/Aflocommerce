import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getDashboardMetrics } from "@/lib/data/admin";
import { formatPrice } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SalesChart } from "@/components/admin/sales-chart";
import { TopProductsChart } from "@/components/admin/top-products-chart";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  const statCards = [
    { label: "Ventas hoy", value: formatPrice(metrics.revenueToday) },
    { label: "Ventas esta semana", value: formatPrice(metrics.revenueWeek) },
    { label: "Ventas este mes", value: formatPrice(metrics.revenueMonth) },
    { label: "Ingresos totales", value: formatPrice(metrics.revenueTotal) },
    { label: "Órdenes totales", value: String(metrics.ordersCount) },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.label} className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base uppercase text-foreground">
              Ventas (últimos 14 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={metrics.salesByDay} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base uppercase text-foreground">
              Productos más vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topProducts.length > 0 ? (
              <TopProductsChart data={metrics.topProducts} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Todavía no hay ventas registradas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base uppercase text-foreground">
              Talles/colores más vendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.topVariants.length > 0 ? (
              metrics.topVariants.map((v) => (
                <div key={v.label} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{v.label}</span>
                  <Badge variant="outline">{v.quantity} und.</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-accent/40 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-base uppercase text-accent">
              <AlertTriangle className="size-4" />
              Alertas de stock bajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.lowStockVariants.length > 0 ? (
              metrics.lowStockVariants.map((v) => (
                <Link
                  key={v.id}
                  href="/admin/stock"
                  className="flex items-center justify-between text-sm hover:text-accent"
                >
                  <span className="text-foreground">
                    {v.product.name} ({v.size} / {v.colorName})
                  </span>
                  <Badge variant={v.stock === 0 ? "destructive" : "outline"}>{v.stock} und.</Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin alertas de stock.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
