"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateStaffInput {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  commissionRate?: number;
  levelId?: number;
}

export interface UpdateStaffInput extends CreateStaffInput {
  id: number;
  isActive?: boolean;
}

export async function createStaff(data: CreateStaffInput) {
  try {
    if (!data.name || data.name.trim() === "") {
      return {
        success: false,
        error: "Nama staff harus diisi",
      };
    }

    const staff = await prisma.staff.create({
      data: {
        name: data.name,
        role: data.role || null,
        phone: data.phone || null,
        email: data.email || null,
        commissionRate: data.commissionRate
          ? Number.parseFloat(String(data.commissionRate))
          : 0,
        levelId: data.levelId || null,
        isActive: true,
      },
      include: {
        level: true,
      },
    });

    revalidatePath("/dashboard/staff");
    return {
      success: true,
      message: "Staff berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating staff:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat staff",
    };
  }
}

export async function updateStaff(data: UpdateStaffInput) {
  try {
    if (!data.id) {
      return {
        success: false,
        error: "ID staff tidak valid",
      };
    }

    if (!data.name || data.name.trim() === "") {
      return {
        success: false,
        error: "Nama staff harus diisi",
      };
    }

    const staff = await prisma.staff.update({
      where: { id: data.id },
      data: {
        name: data.name,
        role: data.role || null,
        phone: data.phone || null,
        email: data.email || null,
        commissionRate: data.commissionRate
          ? Number.parseFloat(String(data.commissionRate))
          : 0,
        levelId: data.levelId || null,
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        level: true,
      },
    });

    revalidatePath("/dashboard/staff");
    return {
      success: true,
      message: "Staff berhasil diperbarui",
    };
  } catch (error) {
    console.error("Error updating staff:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui staff",
    };
  }
}

export async function deleteStaff(id: number) {
  try {
    if (!id) {
      return {
        success: false,
        error: "ID staff tidak valid",
      };
    }

    await prisma.staff.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/dashboard/staff");
    return {
      success: true,
      message: "Staff berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting staff:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus staff",
    };
  }
}

export async function getStaffById(id: number) {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        level: true,
        transactions: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!staff) {
      return {
        success: false,
        error: "Staff tidak ditemukan",
      };
    }

    return {
      success: true,
      data: staff,
    };
  } catch (error) {
    console.error("Error fetching staff:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal mengambil data staff",
    };
  }
}

export async function getAllStaff(activeOnly = true) {
  try {
    const staff = await prisma.staff.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        level: true,
        transactions: {
          select: { id: true },
        },
      },

      orderBy: { name: "asc" },
    });

    const formattedStaff = staff.map((s) => ({
      ...s,
      commissionRate: s.commissionRate ? s.commissionRate.toNumber() : null,
    }));
    return {
      success: true,
      data: formattedStaff,
    };
  } catch (error) {
    console.error("Error fetching all staff:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal mengambil data staff",
    };
  }
}

export async function getStaffLevels() {
  try {
    const levels = await prisma.staffLevel.findMany({
      where: { isActive: true },
      orderBy: { rank: "asc" },
    });

    return {
      success: true,
      data: levels,
    };
  } catch (error) {
    console.error("Error fetching staff levels:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data level staff",
    };
  }
}

export async function restoreStaff(id: number) {
  try {
    const staff = await prisma.staff.update({
      where: { id },
      data: { isActive: true },
      include: { level: true },
    });

    revalidatePath("/dashboard/staff");
    return {
      success: true,
      data: staff,
      message: "Staff berhasil dipulihkan",
    };
  } catch (error) {
    console.error("Error restoring staff:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memulihkan staff",
    };
  }
}
