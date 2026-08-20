"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado." };
  }

  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/ventas");
  return { success: true };
}
