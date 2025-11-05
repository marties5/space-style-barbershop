import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { getStaffDetailReport } from "../action";

export async function generateMetadata({
  params,
}: {
  params: { staffId: string };
}) {
  return {
    title: `Detail Staff Report`,
    description: "Detail laporan transaksi staff",
  };
}

export default async function StaffDetailReportPage({
  params,
}: {
  params: { staffId: string };
}) {
  const result = await getStaffDetailReport(Number(params.staffId));

  if (!result.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Staff tidak ditemukan</h1>
          <Link href="/dashboard/staff/report">
            <Button variant="outline">Kembali ke Report</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { staff, stats } = result.data;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/staff/report">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{staff.name}</h1>
            <p className="text-muted-foreground mt-1">{staff.role}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                Rp {stats.totalRevenue.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Komisi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">
                Rp {stats.commission.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.totalTransactions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Produk Terjual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Avg Transaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                Rp{" "}
                {stats.avgTransactionValue.toLocaleString("id-ID", {
                  maximumFractionDigits: 0,
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {staff.transactions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Tidak ada transaksi untuk staff ini
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead>No. Transaksi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead className="text-right">Jumlah Item</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">
                          {tx.transactionNumber}
                        </TableCell>
                        <TableCell>
                          {formatDate(new Date(tx.transactionDate))}
                        </TableCell>
                        <TableCell>{tx.customer?.name || "Umum"}</TableCell>
                        <TableCell>
                          <span className="capitalize text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {tx.transaction_type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {tx.transactionItems?.length || 0} item
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          Rp {Number(tx.totalAmount).toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
