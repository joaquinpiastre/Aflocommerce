import { MercadoPagoConfig, Preference } from "mercadopago";

export const isMercadoPagoEnabled = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);

const client = isMercadoPagoEnabled
  ? new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
  : null;

export type PreferenceItem = {
  title: string;
  quantity: number;
  unitPrice: number;
};

/**
 * Crea una preferencia de pago (Checkout Pro). Si no hay credenciales de
 * Mercado Pago configuradas, devuelve `null` y el checkout sigue en modo
 * mock: la orden se confirma como pagada al instante sin pasarela real.
 */
export async function createPaymentPreference(params: {
  orderNumber: string;
  items: PreferenceItem[];
  payerEmail?: string;
}): Promise<{ initPoint: string } | null> {
  if (!client) return null;

  const preference = new Preference(client);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const result = await preference.create({
    body: {
      items: params.items.map((item) => ({
        id: item.title,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: "ARS",
      })),
      payer: params.payerEmail ? { email: params.payerEmail } : undefined,
      external_reference: params.orderNumber,
      back_urls: {
        success: `${siteUrl}/checkout/confirmacion/${params.orderNumber}`,
        pending: `${siteUrl}/checkout/confirmacion/${params.orderNumber}`,
        failure: `${siteUrl}/checkout/confirmacion/${params.orderNumber}`,
      },
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
      auto_return: "approved",
    },
  });

  return { initPoint: result.init_point! };
}
