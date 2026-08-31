"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUS_LABEL } from "@/lib/constants";

export function OrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/admin/ventas?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="Buscar por N° de orden o cliente..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => update("search", e.target.value)}
        className="max-w-xs"
      />
      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => update("status", v === "all" ? "" : (v ?? ""))}
      >
        <SelectTrigger className="w-48">
          <SelectValue>{(value: string) => (value === "all" ? "Todos los estados" : (ORDER_STATUS_LABEL[value] ?? value))}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        defaultValue={searchParams.get("dateFrom") ?? ""}
        onChange={(e) => update("dateFrom", e.target.value)}
        className="w-40"
      />
      <Input
        type="date"
        defaultValue={searchParams.get("dateTo") ?? ""}
        onChange={(e) => update("dateTo", e.target.value)}
        className="w-40"
      />
    </div>
  );
}
