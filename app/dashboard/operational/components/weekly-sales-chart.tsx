"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Dot,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SalesData {
  saleDate: Date;
  grossSales: number;
  netSales: number;
  totalTransactions: number;
}

interface WeeklySalesChartProps {
  data: SalesData[];
}

export function WeeklySalesChart({ data }: WeeklySalesChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.saleDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
    value: item.grossSales,
    transactions: item.totalTransactions,
  }));

  const CustomDot = (props: any) => {
    const { cx, cy } = props;
    return <Dot cx={cx} cy={cy} r={3} fill="#000" stroke="none" />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Tren Penjualan Mingguan
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Grafik penjualan 7 hari terakhir
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="2 2"
                stroke="#e5e7eb"
                strokeWidth={1}
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />

              <Line
                type="linear"
                dataKey="value"
                stroke="#000"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 4, fill: "#000" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
