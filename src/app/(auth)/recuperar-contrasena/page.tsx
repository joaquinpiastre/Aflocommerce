import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl text-foreground">Recuperar contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Ingresá tu email y te enviamos un enlace para restablecerla.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-accent hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
