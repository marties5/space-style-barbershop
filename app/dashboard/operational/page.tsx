import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { getAllOperational, getOperationalStats } from "./action";
import { OperationalForm } from "./components/operational-form";
import { OperationalTable } from "./components/operational-table";

export const metadata = {
  title: "Manajemen Operational",
  description: "Kelola biaya operasional bisnis Anda",
};

export default async function OperationalPage() {
  const [operationalResult, statsResult] = await Promise.all([
    getAllOperational(),
    getOperationalStats(),
  ]);

  const operational = operationalResult.success ? operationalResult.data : [];
  const stats = statsResult.success
    ? statsResult.data
    : { totalExpense: 0, byCategory: {}, count: 0 };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Zap className="w-8 h-8" />
                Manajemen Operational
              </h1>
              <p className="text-muted-foreground mt-1">
                Kelola biaya dan pengeluaran operasional
              </p>
            </div>
          </div>
          <OperationalForm />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Rp {stats.totalExpense.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.count} transaksi
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Kategori Teratas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(stats.byCategory)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 3)
                  .map(([category, amount]) => (
                    <div
                      key={category}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{category}</span>
                      <span className="font-medium">
                        Rp {(amount as number).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operational Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <OperationalTable operational={operational} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
