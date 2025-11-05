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
import { Trash2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteStaff, restoreStaff } from "../action";
import { StaffForm } from "./staff-form";


interface StaffTableProps {
  staff: any[];
  levels?: any[];
  onRefresh?: () => void;
}

export function StaffTable({ staff, levels = [], onRefresh }: StaffTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const result = await deleteStaff(id);
      if (result.success) {
        toast.success(result.message);
        onRefresh?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Gagal menghapus staff");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const result = await restoreStaff(id);
      if (result.success) {
        toast.success(result.message);
        onRefresh?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Gagal memulihkan staff");
    }
  };

  const activeStaff = staff.filter((s) => s.isActive);
  const inactiveStaff = staff.filter((s) => !s.isActive);

  const renderStaffTable = (staffList: any[], isInactive = false) => (
    <>
      {staffList.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={7}
            className="text-center text-muted-foreground py-8"
          >
            {isInactive
              ? "Tidak ada staff yang dihapus"
              : "Tidak ada staff aktif"}
          </TableCell>
        </TableRow>
      ) : (
        staffList.map((s) => (
          <TableRow key={s.id} className={isInactive ? "bg-muted/50" : ""}>
            <TableCell className="font-medium">{s.name}</TableCell>
            <TableCell>{s.role || "-"}</TableCell>
            <TableCell>{s.level?.name || "-"}</TableCell>
            <TableCell>{s.phone || "-"}</TableCell>
            <TableCell>{s.email || "-"}</TableCell>
            <TableCell className="text-right">{s.commissionRate}%</TableCell>
            <TableCell className="text-right space-x-2">
              {!isInactive && (
                <>
                  <StaffForm
                    staff={s}
                    levels={levels}
                    onSuccess={onRefresh}
                    isEdit={true}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(s.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              {isInactive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(s.id)}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Pulihkan
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))
      )}
    </>
  );

  return (
    <>
      {/* Active Staff Table */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Staff Aktif</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Nama</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Komisi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderStaffTable(activeStaff)}</TableBody>
            </Table>
          </div>
        </div>

        {/* Inactive Staff Table */}
        {inactiveStaff.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Staff Tidak Aktif</h3>
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Nama</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Komisi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderStaffTable(inactiveStaff, true)}</TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Staff?</AlertDialogTitle>
            <AlertDialogDescription>
              Staff akan dinonaktifkan dan tidak lagi tampil di data aktif. Anda
              dapat memulihkannya nanti.
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
