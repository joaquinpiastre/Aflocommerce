"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUS_LABEL } from "@/lib/constants";
import { updateOrderStatus } from "@/server/actions/admin-orders";

export function AdminOrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();

  async function handleChange(value: string | null) {
    if (!value) return;
    const result = await updateOrderStatus(orderId, value as OrderStatus);
    if (result.success) {
      toast.success("Estado actualizado");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
