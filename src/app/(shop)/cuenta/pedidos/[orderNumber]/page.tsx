import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrderByNumber } from "@/lib/data/orders";
import { formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_FLOW } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Detalle del pedido" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber, session.user.id);
  if (!order) notFound();

  const currentStepIndex = ORDER_STATUS_FLOW.indexOf(
    order.status as (typeof ORDER_STATUS_FLOW)[number]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl uppercase text-foreground">{order.orderNumber}</h2>
          <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
        </div>
        <Badge variant="outline">{ORDER_STATUS_LABEL[order.status]}</Badge>
      </div>

      {order.status !== "CANCELADO" && (
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {ORDER_STATUS_FLOW.map((step, idx) => (
            <div key={step} className="flex items-center gap-1">
              <div
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                  idx <= currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {ORDER_STATUS_LABEL[step]}
              </div>
              {idx < ORDER_STATUS_FLOW.length - 1 && <div className="h-px w-4 bg-border" />}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 border border-border bg-card p-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-foreground">
              {item.productName} ({item.size} / {item.colorName}) × {item.quantity}
            </span>
            <span className="text-muted-foreground">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        <div className="space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span>{order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}</span>
          </div>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="border border-border bg-card p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Dirección de envío</p>
        <p>
          {order.shippingStreet}, {order.shippingCity}, {order.shippingProvince} (
          {order.shippingPostalCode})
        </p>
        {order.shippingPhone && <p>Tel: {order.shippingPhone}</p>}
      </div>
    </div>
  );
}
