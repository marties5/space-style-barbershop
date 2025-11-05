"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductReport {
  productId: number;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalTransactions: number;
  averagePrice: number;
}

interface Props {
  products: ProductReport[];
}

export default function RevenueChart({ products }: Props) {
  const chartData = products.slice(0, 10).map((product) => ({
    name: product.productName.substring(0, 15),
    pendapatan: product.totalRevenue,
    terjual: product.totalQuantitySold,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Pendapatan Produk</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                `Rp ${value.toLocaleString("id-ID")}`
              }
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
            <Bar dataKey="pendapatan" fill="#3b82f6" name="Pendapatan (Rp)" />
            <Bar dataKey="terjual" fill="#10b981" name="Unit Terjual" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
