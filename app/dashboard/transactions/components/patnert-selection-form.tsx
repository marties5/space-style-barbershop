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
import { CreditCard, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getAllStaff } from "../../staff/action";
import { createTransaction } from "../actions";

type PaymentMethod = "cash" | "qris";

export function SelectPartnerForm({ goodId }: { goodId: any }) {
  const user = useUser();
  const [staff, setStaff] = useState<any[]>([]);
  const [barberSelected, setBarberSelected] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Memproses transaksi..."
  );

  if (!user.isLoaded || !user.user) return <div>Loading...</div>;

  const loadStaff = async () => {
    try {
      const result = await getAllStaff(true);
      if (result.success) setStaff(result.data);
      else toast.error("Gagal memuat data staff");
    } catch (error) {
      console.error("Error loading staff:", error);
      toast.error("Gagal memuat data staff");
    }
  };

  const SelectPartner = async (partnerId: string) => {
    if (!partnerId) return;

    setIsLoading(true);
    setLoadingMessage("Memproses transaksi...");

    try {
      const staffId = Number(partnerId);
      const itemType = goodId.imageUrl ? "service" : "product";

      const dataSubmit = {
        userId: user.user.id,
        staff_id: staffId,
        items: [
          {
            id: String(goodId.id),
            name: goodId.name,
            price: goodId.price,
            count: 1,
            item_type: itemType,
          },
        ],
        payment_method: paymentMethod,
      };

      const result = await createTransaction(dataSubmit);

      if (result.success) {
        toast.success("Transaksi berhasil disimpan.");
        if (result.warning) toast.warning(result.warning);

        setBarberSelected("");
        setPaymentMethod("cash");
        setIsDialogOpen(false);
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Terjadi kesalahan tidak terduga");
    } finally {
      setIsLoading(false);
      setLoadingMessage("Memproses transaksi...");
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (open) {
          if (staff.length === 0) loadStaff();
        } else {
          setBarberSelected("");
          setPaymentMethod("cash");
        }
      }}
    >
      <DialogTrigger asChild className="w-full">
        <Button
          className="mt-2 bg-purple-600 hover:bg-purple-700 w-full"
          disabled={isLoading}
        >
          Pilih
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-2xl"
        onInteractOutside={(e) => isLoading && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isLoading
              ? "Memproses Transaksi..."
              : "Pilih Staff & Metode Pembayaran"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-sm text-gray-600">{loadingMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* STAFF LIST */}
            <div>
              <h3 className="text-lg font-medium mb-3">Pilih Staff</h3>
              {staff.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  Tidak ada staff tersedia
                </div>
              ) : (
                <div className="flex justify-center flex-wrap gap-3 p-4">
                  {staff.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setBarberSelected(s.id.toString())}
                      className={`grid gap-2 p-3 rounded border cursor-pointer transition-all ${
                        barberSelected === s.id.toString()
                          ? "bg-purple-100 border-purple-600 shadow-md"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Label className="font-medium text-sm text-center">
                        {s.name}
                      </Label>
                      <div className="text-xs text-muted-foreground text-center">
                        {s.role || "Staff"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Metode Pembayaran</h3>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    paymentMethod === "cash"
                      ? "bg-green-100 border-green-600 text-green-800"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <DollarSign className="w-4 h-4" /> Cash
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("qris")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    paymentMethod === "qris"
                      ? "bg-blue-100 border-blue-600 text-blue-800"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> QRIS
                </button>
              </div>
            </div>

            {/* SUMMARY */}
            {barberSelected && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Ringkasan Pesanan</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Service/Produk:</span>
                    <span>{goodId.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff:</span>
                    <span>
                      {
                        staff.find((s) => s.id.toString() === barberSelected)
                          ?.name
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="uppercase">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total:</span>
                    <span>Rp {goodId.price?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <DialogClose asChild>
            <Button
              className="w-24 bg-transparent text-destructive border border-destructive hover:bg-destructive hover:text-white"
              disabled={isLoading}
            >
              Batal
            </Button>
          </DialogClose>

          <Button
            disabled={!barberSelected || isLoading}
            onClick={() => SelectPartner(barberSelected)}
            className="w-44 bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              "Konfirmasi Pesanan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
