"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Router, Smartphone, WifiOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();
  const handleRetry = () => {
    setIsRetrying(true);
    router.push("/");
    setTimeout(() => {
      setIsRetrying(false);
      window.location.reload();
    }, 2000);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <WifiOff className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
            <span className="text-destructive-foreground text-sm font-bold">
              !
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground text-balance">
            Oops! Kamu sedang offline
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
            Jangan khawatir! Periksa koneksi internet kamu dan coba lagi.
          </p>
        </div>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Langkah-langkah troubleshooting:
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <WifiOff className="w-4 h-4 text-accent-foreground" />
                </div>
                <span>Periksa koneksi Wi-Fi kamu</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Router className="w-4 h-4 text-accent-foreground" />
                </div>
                <span>Restart router atau modem</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-4 h-4 text-accent-foreground" />
                </div>
                <span>Coba gunakan data seluler</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Mencoba ulang...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Halaman akan dimuat ulang secara otomatis ketika koneksi kembali
          </p>
        </div>
        <div className="pt-8 border-t border-border/50">
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <Button
              variant={"ghost"}
              className="hover:text-primary transition-colors"
            >
              Butuh Bantuan?
            </Button>
            <Link href={"https://wa.me/081515254030"} target="_blank">
              <Button
                variant={"ghost"}
                className="hover:text-primary transition-colors"
              >
                Hubungi Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
