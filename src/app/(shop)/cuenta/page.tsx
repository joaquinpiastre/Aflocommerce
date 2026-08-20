import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function AccountProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="max-w-md space-y-6">
      <h2 className="font-display text-xl uppercase text-foreground">Datos personales</h2>
      <ProfileForm
        defaultValues={{ name: user.name ?? "", phone: user.phone ?? "" }}
        email={user.email}
      />
    </div>
  );
}
