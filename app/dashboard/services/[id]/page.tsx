import { getServiceById } from "../actions";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function ViewServicePage({
  params,
}: {
  params: { id: string };
}) {
  const service = await getServiceById(Number(params.id));

  if (!service) {
    notFound();
  }

  const formatPrice = (price: string | number) => {
    const numPrice =
      typeof price === "string" ? Number.parseFloat(price) : price;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(numPrice);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/dashboard/services">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{service.name}</CardTitle>
            <CardDescription>Detail informasi service</CardDescription>
          </div>
          <Link href={`/dashboard/services/${service.id}/edit`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full h-80">
            <Image
              src={service.imageUrl || "/placeholder.svg?height=320&width=400"}
              alt={service.name}
              className="rounded-lg object-cover"
              fill
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Harga</p>
              <p className="text-lg font-semibold text-green-600">
                {formatPrice(service.price)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Diskon</p>
              <p className="text-lg font-semibold">
                {service.discount ? `${service.discount}%` : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dibuat</p>
              <p className="text-lg font-semibold">
                {new Date(service.createdAt).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
