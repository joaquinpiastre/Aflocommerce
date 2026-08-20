import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/data/orders";
import { formatDateTime, formatPrice } from "@/lib/format";
import { AdminOrderStatusSelect } from "./status-select";

export const metadata: Metadata = { title: "Detalle de venta" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl text-foreground">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
        </div>
        <AdminOrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border border-border bg-card p-4 text-sm">
          <p className="mb-1 font-medium text-foreground">Cliente</p>
          <p className="text-muted-foreground">{order.user.name}</p>
          <p className="text-muted-foreground">{order.user.email}</p>
        </div>
        <div className="border border-border bg-card p-4 text-sm">
          <p className="mb-1 font-medium text-foreground">Envío</p>
          <p className="text-muted-foreground">
            {order.shippingStreet}, {order.shippingCity}, {order.shippingProvince} (
            {order.shippingPostalCode})
          </p>
          {order.shippingPhone && <p className="text-muted-foreground">Tel: {order.shippingPhone}</p>}
        </div>
      </div>

      <div className="space-y-3 border border-border bg-card p-4">
        <p className="font-medium text-foreground">Productos</p>
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
        <p className="text-xs text-muted-foreground">
          Método de pago: {order.paymentMethod}
          {order.paymentId && ` · ID de pago: ${order.paymentId}`}
        </p>
      </div>
    </div>
  );
}
