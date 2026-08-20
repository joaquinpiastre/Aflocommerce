"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export function TopProductsChart({ data }: { data: { name: string; soldCount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2523" horizontal={false} />
        <XAxis type="number" stroke="#A8A29A" fontSize={12} allowDecimals={false} />
        <YAxis type="category" dataKey="name" stroke="#A8A29A" fontSize={11} width={140} />
        <Tooltip contentStyle={{ background: "#1A1616", border: "1px solid #2A2523", color: "#E7E1DA" }} />
        <Bar dataKey="soldCount" fill="#C3966A" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
