"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { getTopProductsByRevenue } from "./actions"
import ProductReportTable from "./components/product-report-table"
import RevenueChart from "./components/revenue-chart"

export default function ProductReportPage() {
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTopProducts = async () => {
      const data = await getTopProductsByRevenue(10)
      setTopProducts(data)
      setLoading(false)
    }
    loadTopProducts()
  }, [])

  const totalRevenue = topProducts.reduce((sum, product) => sum + product.totalRevenue, 0)
  const totalQuantitySold = topProducts.reduce((sum, product) => sum + product.totalQuantitySold, 0)

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/product">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Laporan Transaksi Produk</h1>
              <p className="text-muted-foreground">Analisis penjualan produk secara real-time</p>
            </div>
          </div>
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</div>
              <p className="text-xs text-muted-foreground mt-1">Dari semua produk</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Terjual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuantitySold} unit</div>
              <p className="text-xs text-muted-foreground mt-1">Dari semua transaksi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topProducts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Produk dengan penjualan</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <RevenueChart products={topProducts} />

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Penjualan Produk</CardTitle>
            <CardDescription>Detail penjualan setiap produk dengan transaksi</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductReportTable products={topProducts} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
