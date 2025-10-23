"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesData {
  saleDate: Date;
  grossSales: any;
  netSales: any;
  totalTransactions: number;
}

interface SalesChartProps {
  data: SalesData[];
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.saleDate).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    }),
    gross: Number(item.grossSales),
    net: Number(item.netSales),
    transactions: item.totalTransactions,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [
            `Rp ${Number(value).toLocaleString("id-ID")}`,
            name === "gross" ? "Penjualan Kotor" : "Penjualan Bersih",
          ]}
        />
        <Line
          type="monotone"
          dataKey="gross"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--chart-1))" }}
        />
        <Line
          type="monotone"
          dataKey="net"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--chart-2))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
