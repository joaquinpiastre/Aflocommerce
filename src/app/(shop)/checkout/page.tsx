import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUserAddresses } from "@/lib/data/addresses";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  const addresses = session?.user ? await getUserAddresses(session.user.id) : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-4xl text-foreground">Checkout</h1>
      <CheckoutForm addresses={addresses} />
    </div>
  );
}
