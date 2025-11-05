"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Transaction {
  id: string;
  transactionNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  staffName: string;
  customerName?: string;
  paymentMethod: string;
  createdAt: Date;
}

interface Props {
  transactions: Transaction[];
}

export default function ProductTransactionTable({ transactions }: Props) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Transaksi</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead className="text-right">Harga Satuan</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Metode Bayar</TableHead>
            <TableHead>Tanggal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-8 text-muted-foreground"
              >
                Tidak ada transaksi untuk produk ini
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.transactionNumber}
                </TableCell>
                <TableCell className="text-right">
                  {transaction.quantity} unit
                </TableCell>
                <TableCell className="text-right">
                  Rp{" "}
                  {transaction.unitPrice.toLocaleString("id-ID", {
                    maximumFractionDigits: 0,
                  })}
                </TableCell>
                <TableCell className="text-right font-medium">
                  Rp {transaction.totalPrice.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>{transaction.staffName}</TableCell>
                <TableCell>{transaction.customerName || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.paymentMethod}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(new Date(transaction.createdAt))}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
