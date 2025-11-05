"use server";

import { prisma } from "@/lib/prisma";

export async function getServices() {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: services,
    };
  } catch (error) {
    console.error("Error fetching services:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data services",
      data: [],
    };
  }
}

export async function getServiceById(id: number) {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return {
        success: false,
        error: "Service tidak ditemukan",
      };
    }

    return {
      success: true,
      data: service,
    };
  } catch (error) {
    console.error("Error fetching service:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal mengambil data service",
    };
  }
}

export async function createService(data: {
  name: string;
  price: number;
  imageUrl?: string;
}) {
  try {
    if (!data.name || data.name.trim() === "") {
      return {
        success: false,
        error: "Nama service harus diisi",
      };
    }

    if (data.price <= 0) {
      return {
        success: false,
        error: "Harga harus lebih dari 0",
      };
    }

    const service = await prisma.service.create({
      data: {
        name: data.name,
        price: data.price,
        imageUrl: data.imageUrl || null,
        isActive: true,
      },
    });

    return {
      success: true,
      data: service,
    };
  } catch (error) {
    console.error("Error creating service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat service",
    };
  }
}
