import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { getProducts } from "./actions";
import ProductDialog from "./components/product-dialog";
import ProductView from "./components/product-view";

async function ProductsContent() {
  const result = await getProducts();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produk</h1>
          <p className="text-muted-foreground mt-2">
            Kelola inventory produk dan harga penjualan
          </p>
        </div>
        <ProductDialog mode="create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </ProductDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Total: {result.success ? result.data?.length || 0 : 0} produk
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.success && result.data ? (
            <ProductView products={result.data} />
          ) : (
            <p className="text-muted-foreground">Gagal memuat data produk</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Suspense fallback={<div>Loading...</div>}>
          <ProductsContent />
        </Suspense>
      </div>
    </div>
  );
}
