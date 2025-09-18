"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/transactions-utils";
import {
  DollarSign,
  Download,
  Package,
  Scissors,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SalesData {
  date: string;
  revenue: number;
  transactions: number;
  services: number;
  products: number;
}

interface StaffPerformance {
  id: number;
  name: string;
  role: string;
  revenue: number;
  transactions: number;
  services: number;
  commission: number;
}

interface ProductPerformance {
  id: number;
  name: string;
  type: "service" | "product";
  revenue: number;
  quantity: number;
  profit: number;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d"); // 7d, 30d, 90d, 1y
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with API calls
  const [salesData, setSalesData] = useState<SalesData[]>([
    {
      date: "2024-01-15",
      revenue: 850000,
      transactions: 25,
      services: 18,
      products: 12,
    },
    {
      date: "2024-01-16",
      revenue: 920000,
      transactions: 28,
      services: 20,
      products: 15,
    },
    {
      date: "2024-01-17",
      revenue: 780000,
      transactions: 22,
      services: 16,
      products: 10,
    },
    {
      date: "2024-01-18",
      revenue: 1100000,
      transactions: 32,
      services: 24,
      products: 18,
    },
    {
      date: "2024-01-19",
      revenue: 950000,
      transactions: 29,
      services: 21,
      products: 14,
    },
    {
      date: "2024-01-20",
      revenue: 1200000,
      transactions: 35,
      services: 26,
      products: 20,
    },
    {
      date: "2024-01-21",
      revenue: 890000,
      transactions: 26,
      services: 19,
      products: 13,
    },
  ]);

  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([
    {
      id: 1,
      name: "Wahyudi",
      role: "Senior Barber",
      revenue: 2800000,
      transactions: 43,
      services: 43,
      commission: 420000,
    },
    {
      id: 2,
      name: "Suneo",
      role: "Barber",
      revenue: 2200000,
      transactions: 38,
      services: 38,
      commission: 264000,
    },
    {
      id: 3,
      name: "Djarwo",
      role: "Junior Barber",
      revenue: 1600000,
      transactions: 28,
      services: 28,
      commission: 160000,
    },
  ]);

  const [productPerformance, setProductPerformance] = useState<
    ProductPerformance[]
  >([
    {
      id: 1,
      name: "Hair Cut",
      type: "service",
      revenue: 1500000,
      quantity: 60,
      profit: 1500000,
    },
    {
      id: 2,
      name: "Hair Coloring",
      type: "service",
      revenue: 1200000,
      quantity: 16,
      profit: 1200000,
    },
    {
      id: 3,
      name: "Pomade",
      type: "product",
      revenue: 800000,
      quantity: 16,
      profit: 240000,
    },
    {
      id: 4,
      name: "Hair Trim",
      type: "service",
      revenue: 600000,
      quantity: 30,
      profit: 600000,
    },
    {
      id: 5,
      name: "Shampoo",
      type: "product",
      revenue: 420000,
      quantity: 12,
      profit: 120000,
    },
  ]);

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => setIsLoading(false), 1000);
  }, [dateRange]);

  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalTransactions = salesData.reduce(
    (sum, day) => sum + day.transactions,
    0
  );
  const totalServices = salesData.reduce((sum, day) => sum + day.services, 0);
  const totalProducts = salesData.reduce((sum, day) => sum + day.products, 0);
  const averageTransaction = totalRevenue / totalTransactions;

  const revenueGrowth =
    salesData.length > 1
      ? ((salesData[salesData.length - 1].revenue - salesData[0].revenue) /
          salesData[0].revenue) *
        100
      : 0;

  const topPerformer = staffPerformance.reduce(
    (top, staff) => (staff.revenue > top.revenue ? staff : top),
    staffPerformance[0]
  );

  const serviceVsProductRevenue = [
    {
      name: "Services",
      value: productPerformance
        .filter((p) => p.type === "service")
        .reduce((sum, p) => sum + p.revenue, 0),
      color: "#3B82F6",
    },
    {
      name: "Products",
      value: productPerformance
        .filter((p) => p.type === "product")
        .reduce((sum, p) => sum + p.revenue, 0),
      color: "#10B981",
    },
  ];

  const chartData = salesData.map((day) => ({
    date: new Date(day.date).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    }),
    revenue: day.revenue / 1000, // Convert to thousands for better chart display
    transactions: day.transactions,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sales Analytics
            </h1>
            <p className="text-gray-600">
              Track your business performance and insights
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    {revenueGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {Math.abs(revenueGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-bold">{totalTransactions}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Avg: {formatCurrency(averageTransaction)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Services Performed
                  </p>
                  <p className="text-2xl font-bold">{totalServices}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {(
                      (totalServices / (totalServices + totalProducts)) *
                      100
                    ).toFixed(1)}
                    % of total
                  </p>
                </div>
                <Scissors className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Products Sold
                  </p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {(
                      (totalProducts / (totalServices + totalProducts)) *
                      100
                    ).toFixed(1)}
                    % of total
                  </p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${value}K`} />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value * 1000),
                      "Revenue",
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Services vs Products */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceVsProductRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceVsProductRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {serviceVsProductRevenue.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium">{entry.name}</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Staff Performance</span>
              <Badge variant="secondary">
                Top Performer: {topPerformer.name}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffPerformance.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{staff.name}</p>
                      <p className="text-sm text-gray-600">{staff.role}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-8 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="font-bold">
                        {formatCurrency(staff.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transactions</p>
                      <p className="font-bold">{staff.transactions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Services</p>
                      <p className="font-bold">{staff.services}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Commission</p>
                      <p className="font-bold text-green-600">
                        {formatCurrency(staff.commission)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Revenue",
                  ]}
                />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Transactions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Best Selling Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Hair Cut</p>
                  <p className="text-sm text-gray-600">60 services performed</p>
                </div>
                <Badge variant="secondary">{formatCurrency(1500000)}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Best Selling Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Pomade</p>
                  <p className="text-sm text-gray-600">16 units sold</p>
                </div>
                <Badge variant="secondary">{formatCurrency(800000)}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Peak Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">2:00 PM - 5:00 PM</p>
                  <p className="text-sm text-gray-600">
                    Highest transaction volume
                  </p>
                </div>
                <Badge variant="secondary">65% of sales</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
