"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface OperationalData {
  kategori: string;
  _sum: { jumlah: number }; // Changed from any to number since we convert Decimal to number
  _count: { id: number };
}

interface OperationalChartProps {
  data: OperationalData[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function OperationalChart({ data }: OperationalChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.kategori,
    value: item._sum.jumlah, // Removed Number() conversion since it's already a number
    count: item._count.id,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [
            `Rp ${Number(value).toLocaleString("id-ID")}`,
            "Total",
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
