"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema, type AddressInput } from "@/lib/validations/auth";

type ActionResult = { success: true } | { success: false; error: string };

export async function createAddress(input: AddressInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "No autenticado." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  await prisma.address.create({ data: { ...parsed.data, userId: session.user.id } });
  revalidatePath("/cuenta/direcciones");
  return { success: true };
}

export async function updateAddress(id: string, input: AddressInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "No autenticado." };

  const existing = await prisma.address.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return { success: false, error: "Dirección no encontrada." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  await prisma.address.update({ where: { id }, data: parsed.data });
  revalidatePath("/cuenta/direcciones");
  return { success: true };
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "No autenticado." };

  const existing = await prisma.address.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return { success: false, error: "Dirección no encontrada." };

  await prisma.address.delete({ where: { id } });
  revalidatePath("/cuenta/direcciones");
  return { success: true };
}
