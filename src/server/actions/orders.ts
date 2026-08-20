"use server";

import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/order";
import { createPaymentPreference, isMercadoPagoEnabled } from "@/lib/mercadopago";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_COST } from "@/lib/constants";

export type CreateOrderResult =
  | { success: true; orderNumber: string; redirectUrl: string; mock: boolean }
  | { success: false; error: string };

function generateOrderNumber() {
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `AFLO-${Date.now().toString().slice(-7)}${suffix}`;
}

export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Necesitás iniciar sesión para completar la compra." };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { items, addressId, newAddress, saveAddress } = parsed.data;

  // Resolver dirección de envío
  let shipping: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string | null;
  };
  let resolvedAddressId: string | undefined;

  if (addressId) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });
    if (!address) {
      return { success: false, error: "La dirección seleccionada no es válida." };
    }
    shipping = address;
    resolvedAddressId = address.id;
  } else if (newAddress) {
    if (saveAddress) {
      const created = await prisma.address.create({
        data: { ...newAddress, userId: session.user.id },
      });
      resolvedAddressId = created.id;
      shipping = created;
    } else {
      shipping = { ...newAddress, phone: newAddress.phone ?? null };
    }
  } else {
    return { success: false, error: "Ingresá una dirección de envío." };
  }

  // Validar stock y precios contra la base de datos (nunca confiar en el cliente)
  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));
  const orderItemsData: {
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    productName: string;
    size: string;
    colorName: string;
  }[] = [];

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant || !variant.product.active) {
      return { success: false, error: "Alguno de los productos ya no está disponible." };
    }
    if (variant.stock < item.quantity) {
      return {
        success: false,
        error: `No hay stock suficiente de ${variant.product.name} (${variant.size} / ${variant.colorName}).`,
      };
    }
    const unitPrice = Number(variant.price ?? variant.product.salePrice ?? variant.product.basePrice);
    orderItemsData.push({
      productId: variant.productId,
      variantId: variant.id,
      quantity: item.quantity,
      unitPrice,
      subtotal: unitPrice * item.quantity,
      productName: variant.product.name,
      size: variant.size,
      colorName: variant.colorName,
    });
  }

  const subtotal = orderItemsData.reduce((acc, i) => acc + i.subtotal, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  const total = subtotal + shippingCost;
  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    for (const item of orderItemsData) {
      const updated = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new Error(`STOCK_INSUFICIENTE:${item.productName}`);
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { soldCount: { increment: item.quantity } },
      });
    }

    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: "PENDIENTE",
        paymentMethod: "MERCADO_PAGO",
        subtotal,
        shippingCost,
        total,
        addressId: resolvedAddressId,
        shippingStreet: shipping.street,
        shippingCity: shipping.city,
        shippingProvince: shipping.province,
        shippingPostalCode: shipping.postalCode,
        shippingPhone: shipping.phone,
        items: { create: orderItemsData },
      },
    });

    const cart = await tx.cart.findUnique({ where: { userId: session.user.id } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return createdOrder;
  });

  if (!isMercadoPagoEnabled) {
    // Modo mock/sandbox: no hay credenciales de Mercado Pago configuradas,
    // se confirma el pago al instante para poder probar el flujo completo.
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAGADO", paymentId: `MOCK-${order.orderNumber}` },
    });
    return {
      success: true,
      orderNumber: order.orderNumber,
      redirectUrl: `/checkout/confirmacion/${order.orderNumber}`,
      mock: true,
    };
  }

  const preference = await createPaymentPreference({
    orderNumber: order.orderNumber,
    items: orderItemsData.map((i) => ({
      title: `${i.productName} (${i.size} / ${i.colorName})`,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    payerEmail: session.user.email ?? undefined,
  });

  return {
    success: true,
    orderNumber: order.orderNumber,
    redirectUrl: preference?.initPoint ?? `/checkout/confirmacion/${order.orderNumber}`,
    mock: false,
  };
}
