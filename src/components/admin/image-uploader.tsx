"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/server/actions/upload";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export function ImageUploader({
  value,
  onChange,
  folder = "uploads",
  label = "Imagen",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Formato no soportado. Usá JPG, PNG, WEBP, AVIF o GIF.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("La imagen no puede superar los 5MB.");
      return;
    }

    setUploading(true);
    const result = await uploadImage(file, folder);
    setUploading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    onChange(result.url);
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative size-32 overflow-hidden border border-border">
          <Image src={value} alt="" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1 top-1 flex size-6 items-center justify-center bg-destructive text-destructive-foreground"
            aria-label="Quitar imagen"
          >
            <X className="size-3.5" />
          </button>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-6 animate-spin text-accent" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex size-32 flex-col items-center justify-center gap-1.5 border border-dashed border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed"
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="size-6" />
              <span className="text-xs">Subir imagen</span>
            </>
          )}
        </button>
      )}

      {value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          Cambiar imagen
        </Button>
      )}
      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, AVIF o GIF. Máximo 5MB.</p>
    </div>
  );
}
