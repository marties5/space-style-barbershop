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
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { createTransactionWithRetry } from "../actions";

type PaymentMethod = "cash" | "qris";

export function SelectPartnerForm({
  partnerList,
  goodId,
}: {
  partnerList: { id: string; name: string; image: string }[];
  goodId: any;
}) {
  const user = useUser();
  const [barberSelected, setBarberSelected] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Memproses transaksi..."
  );

  if (!user.isLoaded || !user.user) {
    return <div>Loading...</div>;
  }

  const SelectPartner = async (partnerId: string) => {
    if (!partnerId) return;

    setIsLoading(true);
    setLoadingMessage("Memproses transaksi...");

    try {
      const dataSubmit = {
        userId: user.user.id,
        good: {
          id: goodId.id,
          price: goodId.price,
          name: goodId.name,
        },
        partnerId,
        paymentMethod,
      };

      const result = await createTransactionWithRetry(dataSubmit);

      if (result.success) {
        setLoadingMessage("Berhasil!");

        setBarberSelected("");
        setPaymentMethod("cash");
        setIsDialogOpen(false);

        toast.success("Transaksi  berhasil disimpan.");
      } else {
        let errorMessage = result.error || "Terjadi kesalahan";

        if (errorMessage.includes("sibuk")) {
          errorMessage =
            "Server sedang sibuk, transaksi sudah dicoba beberapa kali. Silakan cek riwayat transaksi atau coba lagi nanti.";
        } else if (errorMessage.includes("timeout")) {
          errorMessage =
            "Koneksi timeout. Silakan periksa koneksi internet dan coba lagi.";
        } else if (errorMessage.includes("sudah ada")) {
          errorMessage = "Nomor transaksi sudah ada, silakan coba lagi.";
        }
        toast.error(`Gagal," ${errorMessage}`);
      }
    } catch (error) {
      console.error("Transaction error:", error);
      alert("❌ Terjadi kesalahan tidak terduga. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("Memproses transaksi...");
    }
  };

  const handleDialogClose = () => {
    if (!isLoading) {
      setBarberSelected("");
      setPaymentMethod("cash");
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild className="w-full">
        <Button
          className="mt-2 bg-purple-600 hover:bg-purple-700 w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Pilih"
          )}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-2xl"
        onInteractOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isLoading
              ? "Memproses Transaksi..."
              : "Pilih Barber & Metode Pembayaran"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-sm text-gray-600">{loadingMessage}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>
        ) : (
          // Normal State
          <div className="space-y-4">
            {/* Pilih Barber */}
            <div>
              <h3 className="text-lg font-medium mb-3">Pilih Barber</h3>
              <div className="flex justify-center items-center p-4 gap-3 flex-wrap">
                {partnerList.map((partner) => (
                  <div
                    key={partner.id}
                    className={`grid gap-3 w-fit border p-3 rounded cursor-pointer transition-all ${
                      barberSelected === partner.id
                        ? "bg-purple-100 border-purple-600 shadow-md"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setBarberSelected(partner.id)}
                  >
                    <Label
                      htmlFor={`image-${partner.id}`}
                      className="text-center font-medium cursor-pointer"
                    >
                      {partner.name}
                    </Label>
                    <Image
                      src={partner.image || "/default-avatar.png"}
                      className="rounded h-20 w-20 object-cover mx-auto"
                      alt={partner.name}
                      width={80}
                      height={80}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pilih Metode Pembayaran */}
            <div>
              <h3 className="text-lg font-medium mb-3">Metode Pembayaran</h3>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    paymentMethod === "cash"
                      ? "bg-green-100 border-green-600 text-green-800"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("qris")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    paymentMethod === "qris"
                      ? "bg-blue-100 border-blue-600 text-blue-800"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  QRIS
                </button>
              </div>
            </div>

            {/* Ringkasan Pesanan */}
            {barberSelected && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Ringkasan Pesanan</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span>{goodId.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Barber:</span>
                    <span>
                      {partnerList.find((p) => p.id === barberSelected)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="uppercase font-medium text-gray-700">
                      {paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total:</span>
                    <span>Rp {goodId.price?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex sm:justify-between w-full">
          <DialogClose asChild>
            <Button
              className="w-24 bg-transparent text-destructive hover:text-white hover:bg-destructive border border-destructive"
              disabled={isLoading}
              onClick={handleDialogClose}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            disabled={!barberSelected || isLoading}
            onClick={() => SelectPartner(barberSelected)}
            className="w-44 bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
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
