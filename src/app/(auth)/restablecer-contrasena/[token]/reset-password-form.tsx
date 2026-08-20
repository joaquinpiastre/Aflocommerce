"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { resetPassword } from "@/server/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type FormValues = { password: string; confirmPassword: string };

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  async function onSubmit(data: FormValues) {
    setServerError(null);
    setLoading(true);
    const result = await resetPassword({ token, ...data });
    setLoading(false);

    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (done) {
    return (
      <Alert>
        <AlertDescription>Contraseña actualizada. Redirigiendo a iniciar sesión...</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password", { required: true, minLength: 8 })}
          />
          {errors.password && (
            <p className="text-sm text-destructive">Debe tener al menos 8 caracteres.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword", { required: true })}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Guardando..." : "Restablecer contraseña"}
        </Button>
      </form>
    </div>
  );
}
