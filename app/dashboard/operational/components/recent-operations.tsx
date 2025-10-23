import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Operation {
  id: number;
  tanggal: Date;
  kategori: string;
  deskripsi: string;
  jumlah: number; // Changed from any to number since we convert Decimal to number
}

interface RecentOperationsProps {
  operations: Operation[];
}

export function RecentOperations({ operations }: RecentOperationsProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Operasional Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {operations.map((operation) => (
            <Link
              key={operation.id}
              href={`/operational/${operation.id}`}
              className="block p-3 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className={getCategoryColor(operation.kategori)}>
                  {operation.kategori}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(operation.tanggal).toLocaleDateString("id-ID")}
                </span>
              </div>
              <p className="font-medium mb-1">{operation.deskripsi}</p>
              <p className="text-lg font-semibold text-primary">
                Rp {operation.jumlah.toLocaleString("id-ID")}{" "}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
