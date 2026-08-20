import { NextRequest, NextResponse } from "next/server";
import { Payment, MercadoPagoConfig } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { isMercadoPagoEnabled } from "@/lib/mercadopago";

/**
 * Webhook de Mercado Pago (Checkout Pro). Recibe notificaciones de pago y
 * actualiza el estado de la orden asociada (external_reference = orderNumber).
 * En modo mock (sin credenciales) esta ruta no se usa: las órdenes se
 * confirman al instante desde el server action de checkout.
 */
export async function POST(request: NextRequest) {
  if (!isMercadoPagoEnabled) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const body = await request.json().catch(() => null);
  const paymentId = body?.data?.id;
  if (!paymentId) {
    return NextResponse.json({ ok: true });
  }

  const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const payment = await new Payment(client).get({ id: paymentId });

  const orderNumber = payment.external_reference;
  if (!orderNumber) return NextResponse.json({ ok: true });

  const status =
    payment.status === "approved"
      ? "PAGADO"
      : payment.status === "rejected" || payment.status === "cancelled"
        ? "CANCELADO"
        : "PENDIENTE";

  await prisma.order.updateMany({
    where: { orderNumber },
    data: { status, paymentId: String(payment.id) },
  });

  return NextResponse.json({ ok: true });
}
