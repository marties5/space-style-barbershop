"use client";

import { useEffect, useState } from "react";
import { deleteService, getServices } from "./actions";
import { DeleteButton } from "./components/Deletebutton";

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

import { getViewMode, setViewMode, ViewMode } from "@/lib/getViewMode";
import { Edit, Eye, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [viewMode, setMode] = useState<ViewMode>("table");

  useEffect(() => {
    (async () => {
      const data = await getServices();
      setServices(data);
      setMode(getViewMode());
    })();
  }, []);

  const toggleView = () => {
    const newMode = viewMode === "table" ? "card" : "table";
    setMode(newMode);
    setViewMode(newMode);
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(numPrice);
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

          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleView}>
              {viewMode === "table" ? "Tampilkan Card" : "Tampilkan Daftar"}
            </Button>

            <Link href="/dashboard/services/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Service
              </Button>
            </Link>
          </div>
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
          ) : viewMode === "table" ? (
            // ===================== TABLE VIEW =====================
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
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.id}</TableCell>
                    <TableCell>
                      <Image
                        src={service.imageUrl || "/dark-logo.png"}
                        alt={service.name}
                        className="rounded-md object-cover"
                        width={50}
                        height={50}
                      />
                    </TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      {formatPrice(service.price)}
                    </TableCell>
                    <TableCell>
                      {service.discount ? `${service.discount}%` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
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
          ) : (
            // ===================== CARD VIEW =====================
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="relative w-full h-40">
                    <Image
                      src={service.imageUrl || "/dark-logo.png"}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
                        {service.isActive ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>

                    <p className="text-green-600 font-bold">
                      {formatPrice(service.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {service.discount
                        ? `Diskon ${service.discount}%`
                        : "Tanpa Diskon"}
                    </p>

                    <div className=" w-fit gap-4 flex justify-between pt-3">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
