"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { addReview } from "@/server/actions/reviews";

type ReviewDTO = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { name: string | null };
};

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5 text-accent">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= rating ? "fill-accent" : "text-muted-foreground"} />
      ))}
    </div>
  );
}

export function ProductReviews({
  productId,
  productSlug,
  reviews,
  average,
  count,
  isLoggedIn,
}: {
  productId: string;
  productSlug: string;
  reviews: ReviewDTO[];
  average: number;
  count: number;
  isLoggedIn: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    startTransition(async () => {
      const result = await addReview({ productId, productSlug, rating, comment });
      if (result.success) {
        toast.success("¡Gracias por tu reseña!");
        setSubmitted(true);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <StarRow rating={Math.round(average)} size={20} />
        <span className="text-sm text-muted-foreground">
          {count > 0 ? `${average.toFixed(1)} de 5 · ${count} reseña${count !== 1 ? "s" : ""}` : "Sin reseñas todavía"}
        </span>
      </div>

      {isLoggedIn && !submitted && (
        <div className="space-y-3 border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Dejá tu reseña</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => setRating(i)} aria-label={`${i} estrellas`}>
                <Star size={24} className={i <= rating ? "fill-accent text-accent" : "text-muted-foreground"} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Contanos qué te pareció (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button size="sm" onClick={handleSubmit} disabled={pending}>
            {pending ? "Enviando..." : "Publicar reseña"}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{review.user.name ?? "Usuario Aflo"}</span>
              <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
            </div>
            <StarRow rating={review.rating} />
            {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
