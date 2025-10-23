import { prisma } from "@/lib/prisma";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteOperationalButton } from "../components/delete-operational-button";

async function getOperational(id: number) {
  const operation = await prisma.operasional.findUnique({
    where: { id },
  });

  if (!operation) {
    notFound();
  }

  return operation;
}

export default async function OperationalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const operation = await getOperational(Number.parseInt(params.id));

  const getCategoryColor = (kategori: string) => {
    switch (kategori.toLowerCase()) {
      case "penjualan":
        return "bg-chart-1 text-white";
      case "pembelian":
        return "bg-chart-3 text-white";
      case "operasional":
        return "bg-chart-4 text-white";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/operational">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Detail Operasional
              </h1>
              <p className="text-muted-foreground">
                Informasi lengkap catatan operasional
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informasi Operasional</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/operational/${operation.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteOperationalButton id={operation.id} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tanggal
                  </label>
                  <p className="text-lg font-semibold">
                    {new Date(operation.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Kategori
                  </label>
                  <div className="mt-1">
                    <Badge className={getCategoryColor(operation.kategori)}>
                      {operation.kategori}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Deskripsi
                </label>
                <p className="text-lg mt-1">{operation.deskripsi}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Jumlah
                </label>
                <p className="text-3xl font-bold text-primary mt-1">
                  Rp {Number(operation.jumlah).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Dibuat
                  </label>
                  <p className="text-sm">
                    {new Date(operation.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Diperbarui
                  </label>
                  <p className="text-sm">
                    {new Date(operation.updatedAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
