"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getProductReport } from "../actions";
import ProductTransactionTable from "../components/product-transaction-table";
import ProductDetailChart from "../components/product-detail-chart";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.productId);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      const data = await getProductReport(productId);
      setReport(data);
      setLoading(false);
    };
    loadReport();
  }, [productId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard/product/report">
            <Button variant="outline" className="mb-4 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <Card>
            <CardContent className="pt-6">Produk tidak ditemukan</CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/product/report">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{report.productName}</h1>
            <p className="text-muted-foreground">Detail transaksi produk</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Terjual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.totalQuantitySold} unit
              </div>
              <p className="text-xs text-muted-foreground mt-1">Semua waktu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {report.totalRevenue.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dari penjualan produk ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Kali terjual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Harga Rata-rata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp{" "}
                {report.averagePrice.toLocaleString("id-ID", {
                  maximumFractionDigits: 0,
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per transaksi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <ProductDetailChart productId={productId} />

        {/* Transaction Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
            <CardDescription>
              Daftar semua transaksi untuk produk ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductTransactionTable transactions={report.transactionHistory} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
