import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { deleteService, getServices } from "./actions";
import { DeleteButton } from "./components/Deletebutton";

export default async function ServicesPage() {
  const services = await getServices();
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">
              Manajemen Services
            </CardTitle>
            <CardDescription>
              Kelola semua services dalam sistem Anda
            </CardDescription>
          </div>
          <Link href="/dashboard/services/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Service
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                Belum ada services yang ditambahkan
              </p>
              <Link href="/dashboard/services/create">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Service Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Gambar</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Diskon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service: any) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.id}</TableCell>
                    <TableCell>
                      <div className="relative w-12 h-12">
                        <Image
                          src={service.image_url || "/dark-logo.png"}
                          alt={service.name}
                          className="rounded-md object-cover"
                          width={500}
                          height={500}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatPrice(service.price)}
                    </TableCell>
                    <TableCell>
                      {service.discount ? `${service.discount}%` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={service.is_active ? "default" : "secondary"}
                      >
                        {service.isActive ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(service.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/dashboard/services/${service.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/services/${service.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteButton
                          id={service.id}
                          name={service.name}
                          deleteAction={deleteService}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
