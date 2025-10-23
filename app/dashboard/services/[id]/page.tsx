import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Edit,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteService, getServiceById } from "../actions";
import { DeleteButton } from "../components/Deletebutton";

interface ServiceDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const serviceId = parseInt(params.id);

  if (isNaN(serviceId)) {
    notFound();
  }

  const service = await getServiceById(serviceId);

  if (!service) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const finalPrice = service.discount
    ? service.price - (service.price * service.discount) / 100
    : service.price;

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/services">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Services
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Detail Service</h1>
        <p className="text-muted-foreground">
          Informasi lengkap tentang service
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Gambar Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-64 lg:h-80 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={service.image_url}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Service</CardTitle>
              <CardDescription>
                Detail lengkap tentang service ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Name */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Nama Service
                </Label>
                <p className="text-2xl font-bold mt-1">{service.name}</p>
              </div>

              <Separator />

              {/* Pricing Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Harga Asli
                  </Label>
                  <p
                    className={`text-xl font-semibold mt-1 ${
                      service.discount
                        ? "line-through text-muted-foreground"
                        : "text-green-600"
                    }`}
                  >
                    {formatPrice(service.price)}
                  </p>
                </div>

                {service.discount && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Harga Setelah Diskon
                    </Label>
                    <p className="text-xl font-semibold text-green-600 mt-1">
                      {formatPrice(finalPrice)}
                    </p>
                  </div>
                )}
              </div>

              {service.discount && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Diskon
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {service.discount}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Hemat {formatPrice(service.price - finalPrice)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Status */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Status
                </Label>
                <div className="mt-1">
                  <Badge
                    variant={service.is_active ? "default" : "secondary"}
                    className="text-sm px-3 py-1"
                  >
                    {service.is_active ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
              <CardDescription>Kelola service ini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href={`/dashboard/services/${service.id}/edit`}
                className="w-full"
              >
                <Button className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Service
                </Button>
              </Link>

              <DeleteButton
                id={service.id}
                name={service.name}
                deleteAction={deleteService}
              />
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informasi Waktu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Dibuat
                </Label>
                {/* <p className="text-sm mt-1">{formatDate(service.c)}</p> */}
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Terakhir Diupdate
                </Label>
                <p className="text-sm mt-1">{formatDate(service.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Service ID */}
          <Card>
            <CardHeader>
              <CardTitle>ID Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-3">
                <code className="text-sm font-mono">#{service.id}</code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </label>
  );
}
