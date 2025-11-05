"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createOperational, updateOperational } from "../action";

interface OperationalFormProps {
  operational?: any;
  onSuccess?: () => void;
  isEdit?: boolean;
}

const categories = [
  "Sewa Tempat",
  "Listrik",
  "Air",
  "Gaji",
  "Maintenance",
  "Supplies",
  "Marketing",
  "Transportasi",
  "Lainnya",
];

export function OperationalForm({
  operational,
  onSuccess,
  isEdit = false,
}: OperationalFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    kategori: operational?.kategori || "",
    deskripsi: operational?.deskripsi || "",
    jumlah: operational?.jumlah || "",
    tanggal: operational?.tanggal
      ? new Date(operational.tanggal).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        kategori: formData.kategori,
        deskripsi: formData.deskripsi,
        jumlah: Number.parseFloat(formData.jumlah),
        tanggal: new Date(formData.tanggal),
      };

      let result;
      if (isEdit && operational?.id) {
        result = await updateOperational({ ...submitData, id: operational.id });
      } else {
        result = await createOperational(submitData);
      }

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        setFormData({
          kategori: "",
          deskripsi: "",
          jumlah: "",
          tanggal: new Date().toISOString().split("T")[0],
        });
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Form error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size={isEdit ? "sm" : "default"}
          className={isEdit ? "" : "bg-blue-600 hover:bg-blue-700"}
        >
          {isEdit ? (
            <>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pengeluaran
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Pengeluaran" : "Tambah Pengeluaran Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi pengeluaran"
              : "Masukkan informasi pengeluaran operational"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori *</Label>
            <select
              id="kategori"
              name="kategori"
              value={formData.kategori}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, kategori: e.target.value }))
              }
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={isLoading}
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi *</Label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              placeholder="Deskripsi pengeluaran"
              value={formData.deskripsi}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-24"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah (Rp) *</Label>
              <Input
                id="jumlah"
                name="jumlah"
                type="number"
                placeholder="0"
                step="1000"
                min="0"
                value={formData.jumlah}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal *</Label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
