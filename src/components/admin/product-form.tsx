"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { productSchema, type ProductFormInput } from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/server/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type CategoryOption = { id: string; name: string; parentName: string | null };

export function ProductForm({
  productId,
  defaultValues,
  categories,
}: {
  productId?: string;
  defaultValues?: ProductFormInput;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrlDraft, setImageUrlDraft] = useState("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      material: "",
      categoryId: categories[0]?.id ?? "",
      basePrice: 0,
      salePrice: null,
      images: [],
      featured: false,
      active: true,
      variants: [{ size: "", colorName: "", colorHex: "#0A0A0C", sku: "", stock: 0, price: null }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const images = watch("images");

  function addImage() {
    if (!imageUrlDraft) return;
    setValue("images", [...images, imageUrlDraft]);
    setImageUrlDraft("");
  }

  function removeImage(idx: number) {
    setValue("images", images.filter((_, i) => i !== idx));
  }

  async function onSubmit(data: ProductFormInput) {
    setLoading(true);
    const result = productId ? await updateProduct(productId, data) : await createProduct(data);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    if (result.warning) {
      toast.warning(result.warning, { duration: 10000 });
    } else {
      toast.success(productId ? "Producto actualizado" : "Producto creado");
    }
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errs) => {
        // Si la validación de un campo falla, avisamos en vez de fallar en silencio.
        function firstMessage(obj: unknown): string | undefined {
          if (!obj || typeof obj !== "object") return undefined;
          const o = obj as Record<string, unknown>;
          if (typeof o.message === "string") return o.message;
          for (const v of Object.values(o)) {
            const msg = firstMessage(v);
            if (msg) return msg;
          }
          return undefined;
        }
        toast.error(firstMessage(errs) ?? "Revisá los datos del formulario.");
      })}
      className="space-y-8"
    >
      <Card className="border-border bg-card">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nombre</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Descripción</Label>
            <Textarea rows={4} {...register("description")} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Material / detalles</Label>
            <Input {...register("material")} />
          </div>

          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={watch("categoryId")} onValueChange={(v) => v && setValue("categoryId", v)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => {
                    const cat = categories.find((c) => c.id === value);
                    if (!cat) return "Elegí una categoría";
                    return cat.parentName ? `${cat.parentName} / ${cat.name}` : cat.name;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.parentName ? `${c.parentName} / ${c.name}` : c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Precio base</Label>
            <Input type="number" step="0.01" {...register("basePrice", { valueAsNumber: true })} />
            {errors.basePrice && <p className="text-sm text-destructive">{errors.basePrice.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Precio de oferta (opcional)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("salePrice", {
                setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
              })}
            />
          </div>

          <div className="flex items-center gap-6 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Checkbox checked={watch("featured")} onCheckedChange={(v) => setValue("featured", Boolean(v))} />
              <Label className="font-normal">Destacado</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={watch("active")} onCheckedChange={(v) => setValue("active", Boolean(v))} />
              <Label className="font-normal">Activo (visible en la tienda)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="space-y-4 pt-6">
          <Label>Imágenes (URLs)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://..."
              value={imageUrlDraft}
              onChange={(e) => setImageUrlDraft(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={addImage}>
              Agregar
            </Button>
          </div>
          {errors.images && <p className="text-sm text-destructive">{errors.images.message as string}</p>}
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={img + idx} className="relative size-20 overflow-hidden border border-border">
                <img src={img} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute right-0 top-0 bg-destructive px-1 text-xs text-destructive-foreground"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            UploadThing está listo para conectar (ver <code>UPLOADTHING_TOKEN</code> en .env); mientras
            tanto se pueden cargar imágenes por URL.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <Label className="text-base">Variantes (talle / color / stock / SKU)</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() =>
                append({ size: "", colorName: "", colorHex: "#0A0A0C", sku: "", stock: 0, price: null })
              }
            >
              <Plus className="size-4" />
              Agregar variante
            </Button>
          </div>
          {errors.variants && typeof errors.variants.message === "string" && (
            <p className="text-sm text-destructive">{errors.variants.message}</p>
          )}

          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-2 gap-2 border border-border p-3 sm:grid-cols-6"
              >
                <div className="space-y-1">
                  <Label className="text-xs">Talle</Label>
                  <Input {...register(`variants.${idx}.size`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <Input {...register(`variants.${idx}.colorName`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Hex</Label>
                  <Input type="color" className="h-9 p-1" {...register(`variants.${idx}.colorHex`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">SKU</Label>
                  <Input {...register(`variants.${idx}.sku`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Stock</Label>
                  <Input type="number" {...register(`variants.${idx}.stock`, { valueAsNumber: true })} />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Precio (opcional)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`variants.${idx}.price`, {
                        setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
                      })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(idx)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : productId ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/productos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
