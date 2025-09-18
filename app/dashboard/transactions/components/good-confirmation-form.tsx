"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import React, { useState } from "react";
import { Plus } from "lucide-react";

interface GoodItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  item_type?: string;
  description?: string;
  stock?: number;
}

interface GoodConfirmationFormProps {
  goodId: GoodItem;
  onConfirm: (good: GoodItem, count: number) => void;
}

export function GoodConfirmationForm({
  goodId,
  onConfirm,
}: GoodConfirmationFormProps) {
  const user = useUser();
  const [count, setCount] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  if (!user.isLoaded || !user.user) {
    return <div className="w-24 h-10 bg-gray-200 animate-pulse rounded"></div>;
  }

  const ConfirmSubmit = () => {
    const dataSubmit = {
      userId: user.user.id,
      good: {
        id: goodId.id,
        price: goodId.price,
        name: goodId.name,
        item_type: goodId.item_type || "product",
      },
      count,
    };

    console.log("Submited data:", dataSubmit);
    onConfirm(goodId, count);

    // Reset form and close dialog
    setCount(1);
    setIsOpen(false);
  };

  const incrementCount = () => {
    // Check stock if available
    if (goodId.stock && count >= goodId.stock) {
      return; // Don't allow more than available stock
    }
    setCount((prev) => prev + 1);
  };

  const decrementCount = () => {
    setCount((prev) => Math.max(1, prev - 1));
  };

  const handleCountChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1) {
      // Check stock if available
      if (goodId.stock && numValue > goodId.stock) {
        setCount(goodId.stock);
      } else {
        setCount(numValue);
      }
    }
  };

  // Calculate total price
  const totalPrice = goodId.price * count;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="h-4 w-4" />
          Pilih
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Tambah ke Keranjang</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {/* Product Image and Info */}
          <div className="text-center space-y-2">
            <div className="relative mx-auto w-32 h-32 rounded-lg overflow-hidden border">
              <Image
                src={goodId.image || "/default-product.png"}
                alt={goodId.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{goodId.name}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {goodId.item_type || "product"}
              </p>
              {goodId.description && (
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  {goodId.description}
                </p>
              )}
              <p className="font-medium text-purple-600">
                Rp {goodId.price.toLocaleString("id-ID")} / unit
              </p>
              {goodId.stock && (
                <p className="text-xs text-gray-500">
                  Stok tersedia: {goodId.stock}
                </p>
              )}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="w-full space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Jumlah
            </Label>

            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={decrementCount}
                disabled={count <= 1}
                className="h-10 w-10 p-0"
              >
                -
              </Button>

              <input
                type="number"
                id="quantity"
                value={count}
                onChange={(e) => handleCountChange(e.target.value)}
                className="w-20 h-10 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                max={goodId.stock || undefined}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={incrementCount}
                disabled={goodId.stock ? count >= goodId.stock : false}
                className="h-10 w-10 p-0"
              >
                +
              </Button>
            </div>

            {/* Total Price Display */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">Total Harga:</p>
              <p className="font-semibold text-lg text-purple-600">
                Rp {totalPrice.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCount(1)} // Reset count when cancelled
            >
              Batal
            </Button>
          </DialogClose>

          <Button
            type="button"
            onClick={ConfirmSubmit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Tambah ke Keranjang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
