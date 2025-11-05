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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createStaffLevel, updateStaffLevel } from "../actions";

interface StaffLevelFormProps {
  level?: any;
  onSuccess?: () => void;
  isEdit?: boolean;
}

export function StaffLevelForm({
  level,
  onSuccess,
  isEdit = false,
}: StaffLevelFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: level?.name || "",
    description: level?.description || "",
    rank: level?.rank?.toString() || "",
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
        name: formData.name,
        description: formData.description || undefined,
        rank: formData.rank ? Number.parseInt(formData.rank) : 0,
      };

      let result;
      if (isEdit && level?.id) {
        result = await updateStaffLevel({ ...submitData, id: level.id });
      } else {
        result = await createStaffLevel(submitData);
      }

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        setFormData({
          name: "",
          description: "",
          rank: "",
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
              Tambah Level
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Level Staff" : "Tambah Level Staff Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi level staff"
              : "Masukkan informasi level staff baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Level *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Contoh: Junior, Senior, Manager"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rank">Ranking *</Label>
            <Input
              id="rank"
              name="rank"
              type="number"
              placeholder="1, 2, 3..."
              value={formData.rank}
              onChange={handleChange}
              min="1"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Deskripsi level staff..."
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
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
