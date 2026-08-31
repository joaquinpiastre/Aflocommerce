"use server";

import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export type UploadImageResult = { success: true; url: string } | { success: false; error: string };

export async function uploadImage(file: File, folder: string): Promise<UploadImageResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No se recibió ningún archivo." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Formato no soportado. Usá JPG, PNG, WEBP, AVIF o GIF." };
  }
  if (file.size > MAX_SIZE) {
    return { success: false, error: "La imagen no puede superar los 5MB." };
  }

  try {
    const blob = await put(`${folder}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return { success: true, url: blob.url };
  } catch {
    return { success: false, error: "No se pudo subir la imagen. Probá de nuevo." };
  }
}
