"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serviceSchema } from "./components/ServiceForm";

export interface Service {
  id: number;
  name: string;
  price: number;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  discount: number | null;
}

export async function getServices(): Promise<Service[]> {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
    return services as any;
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
    return service as any;
  } catch (error) {
    console.error("Failed to fetch service:", error);
    throw new Error("Failed to fetch service");
  }
}

export async function createService(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    price: parseFloat(formData.get("price") as string),
    image_url: formData.get("image_url") as string,
    is_active: formData.get("is_active") === "true",
    discount: formData.get("discount")
      ? parseInt(formData.get("discount") as string)
      : null,
  };

  try {
    const validatedData = serviceSchema.parse(rawData);

    await prisma.service.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/services");
  } catch (error) {
    console.error("Failed to create service:", error);
    throw new Error("Failed to create service");
  }

  redirect("/dashboard/services");
}

export async function updateService(id: number, formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    price: parseFloat(formData.get("price") as string),
    image_url: formData.get("image_url") as string,
    is_active: formData.get("is_active") === "true",
    discount: formData.get("discount")
      ? parseInt(formData.get("discount") as string)
      : null,
  };

  try {
    const validatedData = serviceSchema.parse(rawData);

    await prisma.service.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/dashboard/services");
    revalidatePath(`/dashboard/services/${id}`);
  } catch (error) {
    console.error("Failed to update service:", error);
    throw new Error("Failed to update service");
  }

  redirect("/dashboard/services");
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
