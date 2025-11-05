"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { formatDate } from "@/lib/utils";
import { deleteOperational } from "../action";
import { OperationalForm } from "./operational-form";

interface OperationalTableProps {
  operational: any[];
  onRefresh?: () => void;
}

export function OperationalTable({
  operational,
  onRefresh,
}: OperationalTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const result = await deleteOperational(id);
      if (result.success) {
        toast.success(result.message);
        onRefresh?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Gagal menghapus pengeluaran");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (operational.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Tidak ada data pengeluaran. Tambahkan pengeluaran baru untuk memulai.
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Tanggal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operational.map((op) => (
              <TableRow key={op.id}>
                <TableCell className="text-sm">
                  {formatDate(new Date(op.tanggal))}
                </TableCell>
                <TableCell>
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {op.kategori}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{op.deskripsi}</TableCell>
                <TableCell className="text-right font-medium">
                  Rp {Number(op.jumlah).toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <OperationalForm
                    operational={op}
                    onSuccess={onRefresh}
                    isEdit={true}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(op.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengeluaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Data pengeluaran akan dihapus secara permanen. Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteId && handleDelete(deleteId)}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
