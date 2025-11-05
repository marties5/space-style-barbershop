"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import ProductDialog from "./product-dialog";

export default function ProductCard({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="border rounded-lg p-4 shadow-sm bg-white"
        >
          <Image
            src={product.imageUrl ?? "/default.png"}
            width={200}
            height={200}
            alt={product.name}
            className="w-full h-40 object-cover rounded"
          />
          <h3 className="mt-2 font-semibold">{product.name}</h3>
          <p>Rp {Number(product.price).toLocaleString("id-ID")}</p>
          <div className="flex gap-2 mt-3">
            <ProductDialog mode="edit" product={product}>
              <Button size="sm" variant="outline">
                <Edit2 className="h-4 w-4" />
              </Button>
            </ProductDialog>
            <Button size="sm" variant="outline">
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
