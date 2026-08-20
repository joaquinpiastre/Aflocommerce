import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { isGoogleAuthEnabled } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl text-foreground">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground">Ingresá a tu cuenta Aflo</p>
      </div>
      <Suspense>
        <LoginForm googleEnabled={isGoogleAuthEnabled} />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="font-medium text-accent hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}
