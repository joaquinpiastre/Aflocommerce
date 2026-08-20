import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOrderByNumber } from "@/lib/data/orders";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Confirmación de compra" };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const order = await getOrderByNumber(orderNumber, session.user.id);
  if (!order) notFound();

  const isPaid = order.status === "PAGADO";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
      {isPaid ? (
        <CheckCircle2 className="mx-auto mb-4 size-16 text-primary" />
      ) : (
        <Clock className="mx-auto mb-4 size-16 text-accent" />
      )}
      <h1 className="text-3xl text-foreground sm:text-4xl">
        {isPaid ? "¡Gracias por tu compra!" : "Pedido recibido"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Orden <span className="font-medium text-foreground">{order.orderNumber}</span> ·{" "}
        {ORDER_STATUS_LABEL[order.status]}
      </p>

      {!isPaid && (
        <div className="mt-6 border border-accent/40 bg-card p-4 text-left text-sm text-foreground">
          <p className="font-medium text-accent">Método de pago: {PAYMENT_METHOD_LABEL[order.paymentMethod]}</p>
          <p className="mt-1 text-muted-foreground">
            Nos vamos a contactar para coordinar
            {order.paymentMethod === "TRANSFERENCIA"
              ? " los datos de la transferencia."
              : " el pago en efectivo."}{" "}
            Tu pedido queda reservado con el stock ya descontado.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-3 border border-border bg-card p-6 text-left">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-foreground">
              {item.productName} ({item.size} / {item.colorName}) × {item.quantity}
            </span>
            <span className="text-muted-foreground">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Envío a: {order.shippingStreet}, {order.shippingCity}, {order.shippingProvince} (
          {order.shippingPostalCode})
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button render={<Link href="/cuenta/pedidos" />}>Ver mis pedidos</Button>
        <Button variant="outline" render={<Link href="/catalogo" />}>
          Seguir comprando
        </Button>
      </div>
    </div>
  );
}
