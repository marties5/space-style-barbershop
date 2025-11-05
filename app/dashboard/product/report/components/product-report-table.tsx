"use client";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

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

export default function ProductReportTable({ products }: Props) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk</TableHead>
            <TableHead className="text-right">Jumlah Terjual</TableHead>
            <TableHead className="text-right">Total Transaksi</TableHead>
            <TableHead className="text-right">Harga Rata-rata</TableHead>
            <TableHead className="text-right">Total Pendapatan</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                Tidak ada data transaksi produk
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.productId}>
                <TableCell className="font-medium">
                  {product.productName}
                </TableCell>
                <TableCell className="text-right">
                  {product.totalQuantitySold} unit
                </TableCell>
                <TableCell className="text-right">
                  {product.totalTransactions}
                </TableCell>
                <TableCell className="text-right">
                  Rp{" "}
                  {product.averagePrice.toLocaleString("id-ID", {
                    maximumFractionDigits: 0,
                  })}
                </TableCell>
                <TableCell className="text-right font-medium">
                  Rp {product.totalRevenue.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-center">
                  <Link href={`/dashboard/product/report/${product.productId}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
