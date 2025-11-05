import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { getStaffReportData } from "./action";
import { StaffReportTable } from "./components/staff-report-table";

export const metadata = {
  title: "Report Staff",
  description: "Analisis performa dan transaksi staff",
};

export default async function StaffReportPage() {
  const result = await getStaffReportData();
  const staff = result.success ? result.data : [];

  const totalRevenue = staff.reduce(
    (sum: number, s: any) => sum + s.totalRevenue,
    0
  );
  const totalCommission = staff.reduce(
    (sum: number, s: any) => sum + s.commission,
    0
  );
  const totalTransactions = staff.reduce(
    (sum: number, s: any) => sum + s.totalTransactions,
    0
  );

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
                <TrendingUp className="w-8 h-8" />
                Report Staff
              </h1>
              <p className="text-muted-foreground mt-1">
                Analisis performa dan pendapatan staff
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Komisi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Rp {totalCommission.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTransactions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Report Table */}
        <Card>
          <CardHeader>
            <CardTitle>Performa Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffReportTable staff={staff} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
