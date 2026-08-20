import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Restablecer contraseña" };

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl text-foreground">Restablecer contraseña</h1>
        <p className="text-sm text-muted-foreground">Elegí tu nueva contraseña</p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
