import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl text-foreground">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">Sumate a la manada Aflo</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
