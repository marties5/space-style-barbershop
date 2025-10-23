"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Save } from "lucide-react";
import Link from "next/link";
import { createOperational, updateOperational } from "../action";

interface Operation {
  id: number;
  tanggal: Date;
  kategori: string;
  deskripsi: string;
  jumlah: any;
}

interface OperationalFormProps {
  operation?: Operation;
}

export function OperationalForm({ operation }: OperationalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      if (operation) {
        await updateOperational(operation.id, formData);
        router.push(`/dashboard/operational/${operation.id}`);
      } else {
        await createOperational(formData);
        router.push("/dashboard/operational");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultDate = operation
    ? new Date(operation.tanggal).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <CardTitle>{operation ? "Edit Catatan" : "Catatan Baru"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                defaultValue={defaultDate}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                name="kategori"
                defaultValue={operation?.kategori}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Penjualan">Penjualan</SelectItem>
                  <SelectItem value="Pembelian">Pembelian</SelectItem>
                  <SelectItem value="Operasional">Operasional</SelectItem>
                  <SelectItem value="Investasi">Investasi</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              name="deskripsi"
              placeholder="Masukkan deskripsi operasional..."
              defaultValue={operation?.deskripsi}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah (Rp)</Label>
            <Input
              id="jumlah"
              name="jumlah"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              defaultValue={operation ? Number(operation.jumlah) : ""}
              required
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link
                href={
                  operation
                    ? `/dashboard/operational/${operation.id}`
                    : "/dashboard/operational"
                }
              >
                Batal
              </Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
