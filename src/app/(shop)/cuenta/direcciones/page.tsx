import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserAddresses } from "@/lib/data/addresses";
import { AddressesManager } from "./addresses-manager";

export const metadata: Metadata = { title: "Mis direcciones" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const addresses = await getUserAddresses(session.user.id);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl uppercase text-foreground">Mis direcciones</h2>
      <AddressesManager addresses={addresses} />
    </div>
  );
}
