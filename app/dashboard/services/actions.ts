"use server";

import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serviceSchema } from "./schema";

export interface Service {
  id: number;
  name: string;
  price: string | number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  discount: number | null;
}

export async function getServices(): Promise<Service[]> {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
    return services.map((service) => ({
      ...service,
      price: service.price.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch services:", error);
    throw new Error("Failed to fetch services");
  }
}

export async function getServiceById(id: number): Promise<Service | null> {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
    });
    return service
      ? {
          ...service,
          price: service.price.toString(),
        }
      : null;
  } catch (error) {
    console.error("Failed to fetch service:", error);
    throw new Error("Failed to fetch service");
  }
}

export async function createService(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    price: formData.get("price") as string,
    imageUrl: formData.get("imageUrl") as string,
    isActive: formData.get("isActive") === "true",
    discount: formData.get("discount")
      ? Number(formData.get("discount"))
      : null,
  };

  try {
    const validatedData = serviceSchema.parse({
      ...rawData,
      price: Number(rawData.price),
    });

    const { price, ...rest } = validatedData;
    await prisma.service.create({
      data: {
        ...rest,
        price: new Decimal(price),
      },
    });

    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (error) {
    console.error("[v0] createService error:", error);
    return { success: false, message: "Gagal membuat service" };
  }
}

export async function updateService(id: number, formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    price: formData.get("price") as string,
    imageUrl: formData.get("imageUrl") as string,
    isActive: formData.get("isActive") === "true",
    discount: formData.get("discount")
      ? Number(formData.get("discount"))
      : null,
  };

  try {
    const validatedData = serviceSchema.parse({
      ...rawData,
      price: Number(rawData.price),
    });

    const { price, ...rest } = validatedData;
    await prisma.service.update({
      where: { id },
      data: {
        ...rest,
        price: new Decimal(price),
      },
    });

    revalidatePath("/dashboard/services");
    revalidatePath(`/dashboard/services/${id}`);
    return { success: true };
  } catch (error) {
    console.error("[v0] updateService error:", error);
    return { success: false, message: "Gagal mengupdate service" };
  }
}

export async function deleteService(id: number) {
  try {
    await prisma.service.delete({
      where: { id },
    });

    revalidatePath("/dashboard/services");
  } catch (error) {
    console.error("Failed to delete service:", error);
    throw new Error("Failed to delete service");
  }

  redirect("/dashboard/services");
}
