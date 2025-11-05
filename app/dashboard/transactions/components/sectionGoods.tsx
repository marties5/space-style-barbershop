"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { SelectPartnerForm } from "./patnert-selection-form";

interface GoodsItem {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

interface SectionGoodsProps {
  GoodsData: GoodsItem[];
}

export default function SectionGoods({ GoodsData }: SectionGoodsProps) {
  if (!GoodsData || GoodsData.length === 0) {
    return (
      <div className="px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Produk</h2>
        <div className="text-center text-muted-foreground py-8">
          Tidak ada produk tersedia
        </div>
      </div>
    );
  }
  return (
    <div className="px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Produk</h2>
      <div className="flex flex-wrap gap-4">
        {GoodsData.map((item) => (
          <Card
            key={item.id}
            className="p-1 h-fit w-60 hover:border hover:border-blue-600"
            id={`product-${item.id}`}
          >
            <CardContent className="p-1 pb-0">
              <div>
                <Image
                  src={item.imageUrl ?? "/default.png"}
                  alt={item.name}
                  width={500}
                  height={300}
                  className="h-32 w-full object-cover rounded-md"
                />
              </div>
            </CardContent>
            <CardFooter className="p-2 mt-0 pt-0 flex flex-col justify-start items-start w-full">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p>Harga Rp : {item.price?.toLocaleString("id-ID")}</p>
              </div>
              <SelectPartnerForm goodId={item} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
