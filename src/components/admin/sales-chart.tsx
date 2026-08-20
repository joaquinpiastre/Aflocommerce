"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatPrice } from "@/lib/format";

export function SalesChart({ data }: { data: { date: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2523" />
        <XAxis dataKey="date" stroke="#A8A29A" fontSize={12} />
        <YAxis stroke="#A8A29A" fontSize={12} tickFormatter={(v) => formatPrice(v)} width={90} />
        <Tooltip
          contentStyle={{ background: "#1A1616", border: "1px solid #2A2523", color: "#E7E1DA" }}
          formatter={(value) => formatPrice(Number(value))}
        />
        <Line type="monotone" dataKey="total" stroke="#B7262D" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
