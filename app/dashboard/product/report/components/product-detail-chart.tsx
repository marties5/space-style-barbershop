"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductReportByDateRange } from "../actions";

interface Props {
  productId: number;
}

export default function ProductDetailChart({ productId }: Props) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      const data = await getProductReportByDateRange(
        productId,
        startDate,
        endDate
      );
      if (data) {
        setChartData(data.dailySummary);
      }
      setLoading(false);
    };
    loadChartData();
  }, [productId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Penjualan 30 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "numeric",
                })
              }
            />
            <YAxis />
            <Tooltip
              formatter={(value: any) => [value.toLocaleString("id-ID"), ""]}
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "numeric",
                })
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="quantity"
              stroke="#3b82f6"
              name="Unit Terjual"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              name="Pendapatan (Rp)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
