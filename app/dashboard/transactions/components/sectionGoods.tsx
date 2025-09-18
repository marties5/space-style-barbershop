"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { createTransaction } from "../actions";

import { useUser } from "@clerk/clerk-react";
interface SelectedItem {
  id: string;
  name: string;
  price: number;
  count: number;
  item_type: string; // 'product' or 'service'
  image?: string;
}

interface GoodConfirmationFormProps {
  goodId: any;
  onConfirm: (good: any, count: number) => void;
}

function GoodConfirmationForm({
  goodId,
  onConfirm,
}: GoodConfirmationFormProps) {
  const [count, setCount] = useState(1);

  const handleConfirm = () => {
    onConfirm(goodId, count);
    setCount(1); // Reset count after confirmation
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleConfirm}
        size="sm"
        className="bg-purple-600 hover:bg-purple-700"
      >
        Tambah
      </Button>
    </div>
  );
}

const SectionGoods = ({ GoodsData }: any) => {
  const { user } = useUser();
  const [selectedGoods, setSelectedGoods] = useState<SelectedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");

  const handleConfirm = (good: any, count: number) => {
    setSelectedGoods((prev) => {
      const exist = prev.find((item) => item.id === good.id);
      if (exist) {
        return prev.map((item) =>
          item.id === good.id ? { ...item, count: item.count + count } : item
        );
      }
      return [
        ...prev,
        {
          ...good,
          count,
          item_type: good.item_type || "product", // Default to 'product' if not specified
        },
      ];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedGoods((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, newCount: number) => {
    if (newCount <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setSelectedGoods((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, count: newCount } : item
      )
    );
  };

  // Calculate totals
  const subtotal = selectedGoods.reduce(
    (sum, item) => sum + item.price * item.count,
    0
  );
  const taxRate = 0.1; // 10%
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  const handleProcessTransaction = async () => {
    if (!user?.id) {
      toast.error("User tidak terautentikasi");
      return;
    }

    if (selectedGoods.length === 0) {
      toast.error("Pilih minimal 1 barang untuk transaksi");
      return;
    }

    setIsProcessing(true);

    try {
      const transactionData = {
        userId: user.id,
        staff_id: 1, // You'll need to get the actual staff ID from your auth system
        items: selectedGoods.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          count: item.count,
          item_type: item.item_type,
        })),
        payment_method: paymentMethod,
        notes: `Transaction processed by ${user.firstName || "User"} ${
          user.lastName || ""
        }`,
      };

      const result = await createTransaction(transactionData);

      if (result.success) {
        toast.success("Transaksi berhasil diproses!");
        // Clear selected goods
        setSelectedGoods([]);
        // You might want to redirect to transaction detail or receipt page
        console.log("Transaction created:", result.data);
      } else {
        toast.error(result.error || "Gagal memproses transaksi");
      }
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Terjadi kesalahan saat memproses transaksi");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="py-2 mt-10 border-t-2 border-gray-200">
      <h1 className="text-xl font-semibold mb-6">Barang</h1>
      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="flex flex-wrap gap-4 col-span-2">
          {GoodsData.map((item: any) => (
            <Card
              key={item.id}
              className="p-0 h-fit w-full hover:border hover:border-purple-600"
              id={`transaction-${item.id}`}
            >
              <CardContent className="p-1 flex">
                <div>
                  <Image
                    src={item.image || "/placeholder.svg?height=80&width=80"}
                    alt="Transaction Image"
                    width={80}
                    height={80}
                    className="h-20 w-20 object-cover rounded-md"
                  />
                </div>
                <div className="p-2 mt-0 pt-0 flex justify-between items-center w-full">
                  <div className="flex flex-col items-start h-full">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Harga: Rp {item.price.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {item.item_type || "product"}
                    </p>
                  </div>
                  <GoodConfirmationForm
                    goodId={item}
                    onConfirm={handleConfirm}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bagian list barang yang dipilih */}
        <div className="col-span-1 border rounded p-4 sticky top-4 h-fit">
          <h2 className="text-lg font-semibold mb-2">Keranjang</h2>

          {selectedGoods.length === 0 ? (
            <p className="text-gray-500">Belum ada barang dipilih</p>
          ) : (
            <>
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {selectedGoods.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col border p-2 rounded bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className="font-medium text-sm">{item.name}</span>
                        <p className="text-xs text-gray-500 capitalize">
                          {item.item_type}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 h-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.count - 1)
                          }
                          className="h-6 w-6 p-0"
                        >
                          -
                        </Button>
                        <span className="mx-2 text-sm font-medium min-w-[20px] text-center">
                          {item.count}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.count + 1)
                          }
                          className="h-6 w-6 p-0"
                        >
                          +
                        </Button>
                      </div>
                      <span className="font-semibold text-sm">
                        Rp {(item.price * item.count).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transaction Summary */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pajak (10%):</span>
                  <span>Rp {taxAmount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>Rp {totalAmount.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Metode Pembayaran:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Kartu</option>
                  <option value="transfer">Transfer</option>
                  <option value="e_wallet">E-Wallet</option>
                </select>
              </div>

              {/* Process Transaction Button */}
              <Button
                onClick={handleProcessTransaction}
                disabled={isProcessing}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? "Memproses..." : "Proses Transaksi"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionGoods;
