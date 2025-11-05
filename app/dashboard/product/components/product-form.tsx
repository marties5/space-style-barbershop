"use client";

import { createProduct, updateProduct } from "@/app/dashboard/product/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface ProductFormProps {
  product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: product
            ? "Produk berhasil diupdate"
            : "Produk berhasil ditambahkan",
        });
        router.push("/dashboard/product");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: result.error,
        });
      }
    });
  };
  console.log("product", product);
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Produk *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={product?.name}
          required
          placeholder="Masukkan nama produk"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Harga Jual (Rp) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            defaultValue={product?.price.toString()}
            required
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_price">Harga Modal (Rp) *</Label>
          <Input
            id="cost_price"
            name="cost_price"
            type="number"
            step="0.01"
            defaultValue={product?.costPrice.toString()}
            required
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Jumlah Stock *</Label>
          <Input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
            defaultValue={product?.stockQuantity ?? 0}
            required
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_stock_level">Min. Stock Level *</Label>
          <Input
            id="min_stock_level"
            name="min_stock_level"
            type="number"
            defaultValue={product?.minStockLevel ?? 5}
            required
            placeholder="5"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">URL Gambar</Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          defaultValue={product?.imageUrl || ""}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          name="is_active"
          defaultChecked={product?.isActive ?? true}
          value="true"
        />
        <Label htmlFor="is_active">Produk Aktif</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
          className="flex-1"
        >
          Batal
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? "Simpan Perubahan" : "Tambah Produk"}
        </Button>
      </div>
    </form>
  );
}
