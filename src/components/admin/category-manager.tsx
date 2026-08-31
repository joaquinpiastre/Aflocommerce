"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { categorySchema, type CategoryFormInput } from "@/lib/validations/product";
import { createCategory, updateCategory, deleteCategory } from "@/server/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/admin/image-uploader";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
};

function CategoryForm({
  defaultValues,
  parents,
  onSaved,
}: {
  defaultValues?: Partial<CategoryFormInput>;
  parents: Category[];
  onSaved: (data: CategoryFormInput) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", image: "", parentId: null, ...defaultValues },
  });

  async function onSubmit(data: CategoryFormInput) {
    setLoading(true);
    await onSaved(data);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nombre</Label>
        <Input {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Descripción</Label>
        <Textarea rows={2} {...register("description")} />
      </div>
      <ImageUploader
        label="Imagen (opcional)"
        value={watch("image") ?? ""}
        onChange={(url) => setValue("image", url)}
        folder="categorias"
      />
      <div className="space-y-1.5">
        <Label>Categoría padre (opcional)</Label>
        <Select
          value={watch("parentId") ?? "none"}
          onValueChange={(v) => setValue("parentId", v === "none" ? null : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => {
                if (value === "none") return "Ninguna (categoría principal)";
                return parents.find((p) => p.id === value)?.name ?? "Ninguna (categoría principal)";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ninguna (categoría principal)</SelectItem>
            {parents.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const topLevel = categories.filter((c) => !c.parentId);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);

  async function handleCreate(data: CategoryFormInput) {
    const result = await createCategory(data);
    if (result.success) {
      toast.success("Categoría creada");
      setOpenNew(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleUpdate(id: string, data: CategoryFormInput) {
    const result = await updateCategory(id, data);
    if (result.success) {
      toast.success("Categoría actualizada");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const result = await deleteCategory(id);
    if (result.success) {
      toast.success("Categoría eliminada");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogTrigger render={<Button className="gap-1.5" />}>
          <Plus className="size-4" />
          Nueva categoría
        </DialogTrigger>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display uppercase text-foreground">Nueva categoría</DialogTitle>
          </DialogHeader>
          <CategoryForm parents={topLevel} onSaved={handleCreate} />
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {topLevel.map((cat) => (
          <div key={cat.id} className="border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden border border-border bg-secondary">
                  {cat.image && <Image src={cat.image} alt={cat.name} fill className="object-cover" />}
                </div>
                <p className="font-display uppercase text-foreground">{cat.name}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(cat)} className="text-muted-foreground hover:text-accent">
                  <Pencil className="size-4" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            {childrenOf(cat.id).length > 0 && (
              <div className="mt-2 space-y-1 pl-4">
                {childrenOf(cat.id).map((child) => (
                  <div key={child.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="relative size-6 shrink-0 overflow-hidden border border-border bg-secondary">
                        {child.image && (
                          <Image src={child.image} alt={child.name} fill className="object-cover" />
                        )}
                      </span>
                      {child.name}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(child)} className="text-muted-foreground hover:text-accent">
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(child.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display uppercase text-foreground">Editar categoría</DialogTitle>
          </DialogHeader>
          {editing && (
            <CategoryForm
              parents={topLevel.filter((p) => p.id !== editing.id)}
              defaultValues={{
                name: editing.name,
                description: editing.description ?? "",
                image: editing.image ?? "",
                parentId: editing.parentId,
              }}
              onSaved={(data) => handleUpdate(editing.id, data)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
