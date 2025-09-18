"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, CreditCard, DollarSign, FileText, User } from "lucide-react";

export const TransactionDetailModal = ({
  transaction,
  isOpen,
  onClose,
}: any) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  console.log(transaction);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg">Detail Transaksi</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {transaction?.transactionNumber}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Tanggal</p>
                <p className="text-muted-foreground">
                  {transaction && formatDate(transaction.transactionDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Staff</p>
                <p className="text-muted-foreground">
                  {transaction?.staff?.name || "Tidak ada staff"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {transaction?.paymentMethod === "cash" ? (
                <DollarSign className="w-4 h-4 text-green-500" />
              ) : (
                <CreditCard className="w-4 h-4 text-blue-500" />
              )}
              <div>
                <p className="font-medium">Pembayaran</p>
                <p className="text-muted-foreground">
                  {transaction?.paymentMethod === "cash" ? "Cash" : "QRIS"}
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="h-8">
                  <TableHead className="text-xs py-2">Item</TableHead>
                  <TableHead className="text-xs text-center py-2 w-16">
                    Qty
                  </TableHead>
                  <TableHead className="text-xs text-right py-2 w-20">
                    Harga
                  </TableHead>
                  <TableHead className="text-xs text-right py-2 w-24">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transaction?.transactionItems?.map(
                  (item: any, index: number) => (
                    <TableRow key={index} className="h-8">
                      <TableCell className="text-xs py-2 font-medium">
                        {item.itemName}
                      </TableCell>
                      <TableCell className="text-xs text-center py-2">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-xs text-right py-2">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-xs text-right py-2 font-medium">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="font-semibold text-lg">
                {transaction && formatCurrency(transaction.totalAmount)}
              </span>
            </div>
          </div>

          {transaction?.notes && (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium mb-1">Catatan</p>
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {transaction.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
