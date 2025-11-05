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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createTransaction, createTransactionWithRetry } from "../../transactions/actions";
import { getAllStaff } from "../action";

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
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const result = await getAllStaff(true);
        if (result.success) {
          setStaff(result.data);
        }
      } catch (error) {
        console.error("Error loading staff:", error);
        toast.error("Gagal memuat data staff");
      } finally {
        setIsLoadingStaff(false);
      }
    };

    loadStaff();
  }, []);

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

        toast.success("Transaksi berhasil disimpan.");
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
        toast.error(`Gagal: ${errorMessage}`);
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
          disabled={isLoading || isLoadingStaff}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isLoadingStaff ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
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
              : "Pilih Staff & Metode Pembayaran"}
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
            {/* Pilih Staff */}
            <div>
              <h3 className="text-lg font-medium mb-3">Pilih Staff</h3>
              {isLoadingStaff ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : staff.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  Tidak ada staff tersedia
                </div>
              ) : (
                <div className="flex justify-center items-center p-4 gap-3 flex-wrap">
                  {staff.map((s) => (
                    <div
                      key={s.id}
                      className={`grid gap-3 w-fit border p-3 rounded cursor-pointer transition-all ${
                        barberSelected === s.id.toString()
                          ? "bg-purple-100 border-purple-600 shadow-md"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setBarberSelected(s.id.toString())}
                    >
                      <Label
                        htmlFor={`staff-${s.id}`}
                        className="text-center font-medium cursor-pointer text-sm"
                      >
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
