"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { addressSchema, type AddressInput } from "@/lib/validations/auth";
import { createAddress, updateAddress, deleteAddress } from "@/server/actions/addresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type Address = {
  id: string;
  label: string | null;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string | null;
  isDefault: boolean;
};

function AddressForm({
  defaultValues,
  onSaved,
  onCancel,
}: {
  defaultValues?: Partial<AddressInput>;
  onSaved: (data: AddressInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      street: "",
      city: "",
      province: "",
      postalCode: "",
      phone: "",
      isDefault: false,
      ...defaultValues,
    },
  });

  async function onSubmit(data: AddressInput) {
    setLoading(true);
    await onSaved(data);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 border border-border bg-card p-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label>Etiqueta (opcional)</Label>
        <Input placeholder="Casa, trabajo..." {...register("label")} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Calle y número</Label>
        <Input {...register("street")} />
        {errors.street && <p className="text-sm text-destructive">{errors.street.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Ciudad</Label>
        <Input {...register("city")} />
        {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Provincia</Label>
        <Input {...register("province")} />
        {errors.province && <p className="text-sm text-destructive">{errors.province.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Código postal</Label>
        <Input {...register("postalCode")} />
        {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Teléfono</Label>
        <Input {...register("phone")} />
      </div>
      <div className="flex items-center gap-2 sm:col-span-2">
        <Checkbox
          checked={watch("isDefault")}
          onCheckedChange={(v) => setValue("isDefault", Boolean(v))}
        />
        <Label className="font-normal">Marcar como predeterminada</Label>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
        {onCancel && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

export function AddressesManager({ addresses: initial }: { addresses: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  async function handleCreate(data: AddressInput) {
    const result = await createAddress(data);
    if (result.success) {
      toast.success("Dirección agregada");
      setShowNew(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  }

  async function handleUpdate(id: string, data: AddressInput) {
    const result = await updateAddress(id, data);
    if (result.success) {
      toast.success("Dirección actualizada");
      setEditingId(null);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteAddress(id);
    if (result.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Dirección eliminada");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr) =>
        editingId === addr.id ? (
          <AddressForm
            key={addr.id}
            defaultValues={{
              label: addr.label ?? "",
              street: addr.street,
              city: addr.city,
              province: addr.province,
              postalCode: addr.postalCode,
              phone: addr.phone ?? "",
              isDefault: addr.isDefault,
            }}
            onSaved={(data) => handleUpdate(addr.id, data)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div key={addr.id} className="flex items-start justify-between gap-3 border border-border bg-card p-4">
            <div className="text-sm text-foreground">
              {addr.label && <p className="font-medium">{addr.label}</p>}
              <p>
                {addr.street}, {addr.city}, {addr.province} ({addr.postalCode})
              </p>
              {addr.phone && <p className="text-muted-foreground">Tel: {addr.phone}</p>}
              {addr.isDefault && <p className="mt-1 text-xs text-accent">Predeterminada</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingId(addr.id)} className="text-muted-foreground hover:text-accent">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => handleDelete(addr.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        )
      )}

      {showNew ? (
        <AddressForm onSaved={handleCreate} onCancel={() => setShowNew(false)} />
      ) : (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowNew(true)}>
          <Plus className="size-4" />
          Agregar dirección
        </Button>
      )}
    </div>
  );
}
