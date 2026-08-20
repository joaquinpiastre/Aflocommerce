import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserOrders } from "@/lib/data/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Mis pedidos" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await getUserOrders(session.user.id);

  if (orders.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="font-display text-xl uppercase text-foreground">Mis pedidos</h2>
        <p className="text-sm text-muted-foreground">Todavía no hiciste ningún pedido.</p>
        <Link href="/catalogo" className="text-sm text-accent hover:underline">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl uppercase text-foreground">Mis pedidos</h2>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/cuenta/pedidos/${order.orderNumber}`}
            className="flex flex-col gap-2 border border-border bg-card p-4 transition-colors hover:border-accent sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-foreground">{order.orderNumber}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)} · {order.items.length} producto
                {order.items.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{ORDER_STATUS_LABEL[order.status]}</Badge>
              <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
