"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.string(),
  productSlug: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type AddReviewResult = { success: true } | { success: false; error: string };

export async function addReview(input: z.infer<typeof reviewSchema>): Promise<AddReviewResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Necesitás iniciar sesión para dejar una reseña." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos." };
  }

  await prisma.review.upsert({
    where: { productId_userId: { productId: parsed.data.productId, userId: session.user.id } },
    create: {
      productId: parsed.data.productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  revalidatePath(`/productos/${parsed.data.productSlug}`);
  return { success: true };
}
