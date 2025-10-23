"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as z from "zod";


import { toast } from "sonner";
import { createService, Service, updateService } from "../actions";

interface ServiceFormProps {
  initialData?: Service;
  isEditing?: boolean;
}

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, "Nama service wajib diisi")
    .max(255, "Nama terlalu panjang"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  image_url: z
    .string()
    .url("URL gambar tidak valid")
    .max(500, "URL terlalu panjang"),
  is_active: z.boolean().default(true),
  discount: z.number().min(0).max(100).optional().nullable(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

export function ServiceForm({
  initialData,
  isEditing = false,
}: ServiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      if (isEditing && initialData) {
        await updateService(initialData.id, formData);
      } else {
        await createService(formData);
      }
      toast.success(
        isEditing
          ? "Service berhasil diupdate!"
          : "Service berhasil ditambahkan!"
      );
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan service");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Service" : "Tambah Service"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update informasi service"
            : "Tambahkan service baru ke dalam sistem"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Service</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name || ""}
              placeholder="Masukkan nama service"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Harga</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initialData?.price || 0}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL Gambar</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              defaultValue={initialData?.image_url || ""}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Diskon (%)</Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              min="0"
              max="100"
              defaultValue={initialData?.discount || ""}
              placeholder="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={initialData?.is_active ?? true}
            />
            <Label htmlFor="is_active">Service Aktif</Label>
            <input
              type="hidden"
              name="is_active"
              value={initialData?.is_active ?? true ? "true" : "false"}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Menyimpan..."
                : isEditing
                ? "Update Service"
                : "Tambah Service"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/services")}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
