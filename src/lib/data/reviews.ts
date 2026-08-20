import { prisma } from "@/lib/prisma";

export async function getProductReviews(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const average =
    reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  return { reviews, average, count: reviews.length };
}
