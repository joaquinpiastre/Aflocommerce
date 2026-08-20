import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminOrders } from "@/lib/data/admin-orders";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orders = await getAdminOrders();

  const header = [
    "Número de orden",
    "Fecha",
    "Cliente",
    "Email",
    "Productos",
    "Cantidad total",
    "Subtotal",
    "Envío",
    "Total",
    "Método de pago",
    "Estado",
  ];

  const rows = orders.map((order) => [
    order.orderNumber,
    formatDateTime(order.createdAt),
    order.user.name ?? "",
    order.user.email,
    order.items.map((i) => `${i.productName} (${i.size}/${i.colorName}) x${i.quantity}`).join(" | "),
    String(order.items.reduce((acc, i) => acc + i.quantity, 0)),
    order.subtotal.toFixed(2),
    order.shippingCost.toFixed(2),
    order.total.toFixed(2),
    PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod,
    ORDER_STATUS_LABEL[order.status] ?? order.status,
  ]);

  const csv = [header, ...rows].map((row) => row.map((c) => csvEscape(String(c))).join(",")).join("\n");
  const bom = "﻿"; // para que Excel detecte UTF-8 correctamente

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ventas-aflo-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
