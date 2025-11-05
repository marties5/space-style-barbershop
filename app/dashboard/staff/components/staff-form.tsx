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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createStaff, updateStaff } from "../action";


interface StaffFormProps {
  staff?: any;
  levels?: any[];
  onSuccess?: () => void;
  isEdit?: boolean;
}

export function StaffForm({
  staff,
  levels = [],
  onSuccess,
  isEdit = false,
}: StaffFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: staff?.name || "",
    role: staff?.role || "",
    phone: staff?.phone || "",
    email: staff?.email || "",
    commissionRate: staff?.commissionRate || "0",
    levelId: staff?.levelId?.toString() || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        name: formData.name,
        role: formData.role || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        commissionRate: formData.commissionRate
          ? Number.parseFloat(formData.commissionRate)
          : 0,
        levelId: formData.levelId
          ? Number.parseInt(formData.levelId)
          : undefined,
      };

      let result;
      if (isEdit && staff?.id) {
        result = await updateStaff({ ...submitData, id: staff.id });
      } else {
        result = await createStaff(submitData);
      }

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        setFormData({
          name: "",
          role: "",
          phone: "",
          email: "",
          commissionRate: "0",
          levelId: "",
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
          className={isEdit ? "" : "bg-purple-600 hover:bg-purple-700"}
        >
          {isEdit ? (
            <>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Staff
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Staff" : "Tambah Staff Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi staff"
              : "Masukkan informasi staff baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Staff *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nama staff"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Posisi/Role</Label>
            <Input
              id="role"
              name="role"
              placeholder="Contoh: Barber, Stylist"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="levelId">Level Staff</Label>
            <Select
              value={formData.levelId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, levelId: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger id="levelId">
                <SelectValue placeholder="Pilih level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+62812345678"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commissionRate">Komisi (%)</Label>
            <Input
              id="commissionRate"
              name="commissionRate"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
              max="100"
              value={formData.commissionRate}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
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
