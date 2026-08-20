"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleWishlist } from "@/server/actions/wishlist";

export function WishlistButton({
  productId,
  initialInWishlist,
  isLoggedIn,
}: {
  productId: string;
  initialInWishlist: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (result.success) {
        setInWishlist(result.inWishlist);
        toast.success(result.inWishlist ? "Agregado a favoritos" : "Quitado de favoritos");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={pending}
      className={inWishlist ? "border-primary text-primary" : ""}
      aria-label="Agregar a favoritos"
    >
      <Heart className={inWishlist ? "fill-primary" : ""} />
    </Button>
  );
}
