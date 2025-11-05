"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateOperationalInput {
  kategori: string;
  deskripsi: string;
  jumlah: number;
  tanggal?: Date;
  userId?: string;
}

export interface UpdateOperationalInput extends CreateOperationalInput {
  id: number;
}

export async function createOperational(data: CreateOperationalInput) {
  try {
    if (!data.kategori || data.kategori.trim() === "") {
      return {
        success: false,
        error: "Kategori harus diisi",
      };
    }

    if (!data.deskripsi || data.deskripsi.trim() === "") {
      return {
        success: false,
        error: "Deskripsi harus diisi",
      };
    }

    if (data.jumlah <= 0) {
      return {
        success: false,
        error: "Jumlah harus lebih dari 0",
      };
    }

    const operational = await prisma.operasional.create({
      data: {
        kategori: data.kategori,
        deskripsi: data.deskripsi,
        jumlah: Number(data.jumlah),
        tanggal: data.tanggal || new Date(),
        userId: data.userId || null,
      },
      include: {
        User: true,
      },
    });

    revalidatePath("/dashboard/operational");
    return {
      success: true,
      message: "Operational berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating operational:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal membuat operational",
    };
  }
}

export async function updateOperational(data: UpdateOperationalInput) {
  try {
    if (!data.id) {
      return {
        success: false,
        error: "ID operational tidak valid",
      };
    }

    if (!data.kategori || data.kategori.trim() === "") {
      return {
        success: false,
        error: "Kategori harus diisi",
      };
    }

    if (!data.deskripsi || data.deskripsi.trim() === "") {
      return {
        success: false,
        error: "Deskripsi harus diisi",
      };
    }

    if (data.jumlah <= 0) {
      return {
        success: false,
        error: "Jumlah harus lebih dari 0",
      };
    }

    const operational = await prisma.operasional.update({
      where: { id: data.id },
      data: {
        kategori: data.kategori,
        deskripsi: data.deskripsi,
        jumlah: Number(data.jumlah),
        tanggal: data.tanggal || new Date(),
        userId: data.userId || null,
      },
      include: {
        User: true,
      },
    });

    revalidatePath("/dashboard/operational");
    return {
      success: true,
      message: "Operational berhasil diperbarui",
    };
  } catch (error) {
    console.error("Error updating operational:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui operational",
    };
  }
}

export async function deleteOperational(id: number) {
  try {
    if (!id) {
      return {
        success: false,
        error: "ID operational tidak valid",
      };
    }

    await prisma.operasional.delete({
      where: { id },
    });

    revalidatePath("/dashboard/operational");
    return {
      success: true,
      message: "Operational berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting operational:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal menghapus operational",
    };
  }
}

export async function getAllOperational(filters?: {
  kategori?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const where: any = {};

    if (filters?.kategori) {
      where.kategori = filters.kategori;
    }

    if (filters?.startDate || filters?.endDate) {
      where.tanggal = {};
      if (filters.startDate) where.tanggal.gte = filters.startDate;
      if (filters.endDate) where.tanggal.lte = filters.endDate;
    }

    const operational = await prisma.operasional.findMany({
      where,
      include: { User: true },
      orderBy: { tanggal: "desc" },
    });

    const formatted = operational.map((item) => ({
      ...item,
      jumlah: Number(item.jumlah),
      tanggal:
        item.tanggal instanceof Date
          ? item.tanggal.toISOString()
          : item.tanggal,
    }));

    return {
      success: true,
      data: formatted,
    };
  } catch (error) {
    console.error("Error fetching operational:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data operational",
    };
  }
}

export async function getOperationalStats(startDate?: Date, endDate?: Date) {
  try {
    const where: any = {};

    if (startDate || endDate) {
      where.tanggal = {};
      if (startDate) {
        where.tanggal.gte = startDate;
      }
      if (endDate) {
        where.tanggal.lte = endDate;
      }
    }

    const operational = await prisma.operasional.findMany({
      where,
    });

    const totalExpense = operational.reduce(
      (sum, op) => sum + Number(op.jumlah),
      0
    );

    const byCategory: Record<string, number> = {};
    operational.forEach((op) => {
      byCategory[op.kategori] =
        (byCategory[op.kategori] || 0) + Number(op.jumlah);
    });

    return {
      success: true,
      data: {
        totalExpense,
        byCategory,
        count: operational.length,
      },
    };
  } catch (error) {
    console.error("Error fetching operational stats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil statistik operational",
    };
  }
}
