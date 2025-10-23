import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calculator,
  DollarSign,
  FileText,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

interface DashboardStatsProps {
  totalOperations: number;
  totalSales: number;
  totalRevenue: number;
  totalExpenses: number;
}

export function DashboardStats({
  totalOperations,
  totalSales,
  totalRevenue,
  totalExpenses,
}: DashboardStatsProps) {
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
      <Card className="p-2 gap-1">
        <CardHeader className="flex px-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">
            Total Operasional
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-2">
          <div className="text-2xl font-bold">{totalOperations}</div>
          <p className="text-xs text-muted-foreground">Catatan operasional</p>
        </CardContent>
      </Card>

      <Card className="p-2 gap-1">
        <CardHeader className="flex px-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Data Penjualan</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-2">
          <div className="text-2xl font-bold">{totalSales}</div>
          <p className="text-xs text-muted-foreground">
            Hari penjualan tercatat
          </p>
        </CardContent>
      </Card>

      <Card className="p-2 gap-1">
        <CardHeader className="flex px-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">
            Total Pendapatan
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent className="px-2">
          <div className="text-2xl font-bold">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-muted-foreground">
            Dari kategori penjualan
          </p>
        </CardContent>
      </Card>

      <Card className="p-2 gap-1">
        <CardHeader className="flex px-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">
            Total Pengeluaran
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent className="px-2">
          <div className="text-2xl font-bold">
            Rp {totalExpenses.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-muted-foreground">
            Dari Pengeluaran dan Operasional
          </p>
        </CardContent>
      </Card>

      <Card className="p-2 gap-1">
        <CardHeader className="flex px-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Laba Bersih</CardTitle>
          {netProfit >= 0 ? (
            <DollarSign className="h-4 w-4 text-chart-1" />
          ) : (
            <Calculator className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent className="px-2">
          <div
            className={`text-2xl font-bold ${
              netProfit >= 0 ? "text-green-500" : "text-destructive"
            }`}
          >
            Rp {netProfit.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-muted-foreground">
            Pendapatan - Pengeluaran
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
