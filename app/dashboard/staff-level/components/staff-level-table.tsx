"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { RotateCcw, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteStaffLevel, restoreStaffLevel } from "../actions";
import { StaffLevelForm } from "./staff-level-form";

interface StaffLevelTableProps {
  levels: any[];
  onRefresh?: () => void;
}

export function StaffLevelTable({ levels, onRefresh }: StaffLevelTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const result = await deleteStaffLevel(id);
      if (result.success) {
        toast.success(result.message);
        onRefresh?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Gagal menghapus level");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const result = await restoreStaffLevel(id);
      if (result.success) {
        toast.success(result.message);
        onRefresh?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Gagal memulihkan level");
    }
  };

  const activeLevels = levels.filter((l) => l.isActive);
  const inactiveLevels = levels.filter((l) => !l.isActive);

  const renderLevelTable = (levelList: any[], isInactive = false) => (
    <>
      {levelList.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={5}
            className="text-center text-muted-foreground py-8"
          >
            {isInactive
              ? "Tidak ada level yang dihapus"
              : "Tidak ada level aktif"}
          </TableCell>
        </TableRow>
      ) : (
        levelList.map((level) => (
          <TableRow key={level.id} className={isInactive ? "bg-muted/50" : ""}>
            <TableCell className="font-medium">{level.name}</TableCell>
            <TableCell className="text-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                {level.rank}
              </span>
            </TableCell>
            <TableCell>{level.description || "-"}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{level.staff?.length || 0}</span>
              </div>
            </TableCell>
            <TableCell className="text-right space-x-2">
              {!isInactive && (
                <>
                  <StaffLevelForm
                    level={level}
                    onSuccess={onRefresh}
                    isEdit={true}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(level.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              {isInactive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(level.id)}
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
      {/* Active Levels Table */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Level Aktif</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Nama Level</TableHead>
                  <TableHead className="text-center">Ranking</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jumlah Staff</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderLevelTable(activeLevels)}</TableBody>
            </Table>
          </div>
        </div>

        {/* Inactive Levels Table */}
        {inactiveLevels.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Level Tidak Aktif</h3>
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Nama Level</TableHead>
                    <TableHead className="text-center">Ranking</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Jumlah Staff</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderLevelTable(inactiveLevels, true)}</TableBody>
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
            <AlertDialogTitle>Hapus Level Staff?</AlertDialogTitle>
            <AlertDialogDescription>
              Level akan dinonaktifkan dan tidak lagi tampil di data aktif. Anda
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
