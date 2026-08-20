"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutos

export type RequestResetResult =
  | { success: true; devResetUrl?: string }
  | { success: false; error: string };

export async function requestPasswordReset(input: { email: string }): Promise<RequestResetResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Ingresá un email válido." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Siempre respondemos éxito para no filtrar qué emails existen.
  if (!user) {
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      expires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/restablecer-contrasena/${token}`;

  // Hook de email transaccional: si hay RESEND_API_KEY configurada, se envía
  // el link por email. Si no, se muestra en pantalla (modo desarrollo).
  if (process.env.RESEND_API_KEY) {
    // TODO: integrar Resend (o el proveedor de email elegido) acá.
    // await resend.emails.send({ to: user.email, subject: "Restablecer contraseña", ... })
    return { success: true };
  }

  return { success: true, devResetUrl: resetUrl };
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordResult = { success: true } | { success: false; error: string };

export async function resetPassword(input: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const verification = await prisma.verificationToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (!verification || verification.expires < new Date()) {
    return { success: false, error: "El enlace expiró o no es válido. Solicitá uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.update({
    where: { email: verification.identifier },
    data: { passwordHash },
  });

  await prisma.verificationToken.delete({
    where: { token: parsed.data.token },
  });

  return { success: true };
}
