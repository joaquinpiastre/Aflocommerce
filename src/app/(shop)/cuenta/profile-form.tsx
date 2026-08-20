"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import { updateProfile } from "@/server/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  defaultValues,
  email,
}: {
  defaultValues: ProfileInput;
  email: string;
}) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues });

  async function onSubmit(data: ProfileInput) {
    setLoading(true);
    const result = await updateProfile(data);
    setLoading(false);
    if (result.success) toast.success("Datos actualizados");
    else toast.error(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input value={email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre completo</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" {...register("phone")} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
