"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";

export type UpdateProfileResult = { success: true } | { success: false; error: string };

export async function updateProfile(input: ProfileInput): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "No autenticado." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone },
  });

  revalidatePath("/cuenta");
  return { success: true };
}
