import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Eye } from "lucide-react";
import Link from "next/link";
import { getDashboardData, getOperationalRecords } from "./action";
import { DashboardStats } from "./components/dashboard-stats";
import { DeleteOperationalButton } from "./components/delete-operational-button";
import { OperationalChart } from "./components/operational-chart";
import { OperationalForm } from "./components/operational-form";
import { RecentOperations } from "./components/recent-operations";
import { WeeklySalesChart } from "./components/weekly-sales-chart";

export default async function OperationalPage() {
  const operations = await getOperationalRecords();
  const data = await getDashboardData();
  const getCategoryColor = (kategori: string) => {
    switch (kategori.toLowerCase()) {
      case "penjualan":
        return "bg-chart-1 text-white";
      case "pembelian":
        return "bg-chart-3 text-white";
      case "operasional":
        return "bg-chart-4 text-white";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-foreground ">
              Dashboard Operasional
            </h1>
            <p className="text-muted-foreground">
              Ringkasan aktivitas bisnis dan kinerja operasional
            </p>
          </div>

          <DashboardStats
            totalOperations={data.totalOperations}
            totalSales={data.totalSales}
            totalRevenue={data.totalRevenue}
            totalExpenses={data.totalExpenses}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <WeeklySalesChart data={data.salesTrend} />
            <Card>
              <CardHeader>
                <CardTitle>Operasional per Kategori</CardTitle>
                <CardDescription>
                  Distribusi transaksi berdasarkan kategori
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OperationalChart data={data.operationalByCategory} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentOperations operations={data.recentOperations} />

            <Card>
              <CardHeader>
                <CardTitle>Penjualan Terbaru</CardTitle>
                <CardDescription>Data penjualan harian terbaru</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentSales.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Belum ada data penjualan
                      </p>
                    </div>
                  ) : (
                    data.recentSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {new Date(sale.saleDate).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {sale.totalTransactions} transaksi
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            Rp {sale.grossSales.toLocaleString("id-ID")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Net: Rp {sale.netSales.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Catatan Operasional
            </h1>
            <p className="text-muted-foreground">
              Kelola semua transaksi operasional bisnis
            </p>
          </div>
        </div>

        <OperationalForm />
        <Card>
          <CardHeader>
            <CardTitle>Daftar Operasional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Belum ada catatan operasional
                  </p>
                </div>
              ) : (
                operations.map((operation) => (
                  <div
                    key={operation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getCategoryColor(operation.kategori)}>
                          {operation.kategori}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(operation.tanggal).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">
                        {operation.deskripsi}
                      </h3>
                      <p className="text-lg font-bold text-primary">
                        Rp {Number(operation.jumlah).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/operational/${operation.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/dashboard/operational/${operation.id}/edit`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteOperationalButton id={operation.id} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
