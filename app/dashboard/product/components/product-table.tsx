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
import { useToast } from "@/components/ui/use-toast";
import { Edit2, Eye, EyeOff, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProduct, toggleProductStatus } from "../actions";
import ProductDialog from "./product-dialog";

interface ProductTableProps {
  products: any[];
}

export default function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (selectedId === null) return;

    setIsDeleting(true);
    const result = await deleteProduct(selectedId);

    if (result.success) {
      toast({
        title: "Berhasil",
        description: "Produk berhasil dihapus",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Gagal menghapus produk",
        variant: "destructive",
      });
    }
    setIsDeleting(false);
    setSelectedId(null);
  };

  const handleToggleStatus = async (id: number) => {
    const result = await toggleProductStatus(id);
    if (result.success) {
      router.refresh();
    }
  };
console.log(products)
  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>

              <TableHead>Nama Produk</TableHead>
              <TableHead>Harga Jual</TableHead>
              <TableHead>Harga Modal</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Min. Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <Image
                    src={product.imageUrl ?? "/default.png"}
                    height={100}
                    width={100}
                    alt={"gambar_" + product.name}
                  />
                </TableCell>

                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  Rp {Number(product.costPrice).toLocaleString("id-ID")}
                </TableCell>
                <TableCell
                  className={
                    product.stockQuantity < product.minStockLevel
                      ? "text-red-600 font-semibold"
                      : ""
                  }
                >
                  {product.stockQuantity}
                  {product.stockQuantity < product.minStockLevel && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Minimum
                    </span>
                  )}
                </TableCell>
                <TableCell>{product.minStockLevel}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleStatus(product.id)}
                  >
                    {product.isActive ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <ProductDialog mode="edit" product={product}>
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </ProductDialog>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedId(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={selectedId !== null}
        onOpenChange={() => setSelectedId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
