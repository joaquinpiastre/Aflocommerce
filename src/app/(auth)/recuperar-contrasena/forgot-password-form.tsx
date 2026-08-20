"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/server/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordInput) {
    setLoading(true);
    const result = await requestPasswordReset(data);
    setLoading(false);
    setSent(true);
    if (result.success && result.devResetUrl) {
      setDevResetUrl(result.devResetUrl);
    }
  }

  if (sent) {
    return (
      <Alert>
        <AlertDescription className="space-y-2">
          <p>Si el email existe en nuestro sistema, vas a recibir un enlace para restablecer tu contraseña.</p>
          {devResetUrl && (
            <p className="text-xs text-muted-foreground">
              (Modo desarrollo, no hay envío de email configurado — usá este enlace):{" "}
              <a href={devResetUrl} className="break-all text-accent hover:underline">
                {devResetUrl}
              </a>
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar enlace"}
      </Button>
    </form>
  );
}
