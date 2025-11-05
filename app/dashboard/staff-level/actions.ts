"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateStaffLevelInput {
  name: string;
  description?: string;
  rank: number;
}

export interface UpdateStaffLevelInput extends CreateStaffLevelInput {
  id: number;
  isActive?: boolean;
}

export async function createStaffLevel(data: CreateStaffLevelInput) {
  try {
    if (!data.name || data.name.trim() === "") {
      return {
        success: false,
        error: "Nama level harus diisi",
      };
    }

    if (data.rank == null) {
      return {
        success: false,
        error: "Rank level harus diisi",
      };
    }

    const staffLevel = await prisma.staffLevel.create({
      data: {
        name: data.name,
        description: data.description || null,
        rank: Number.parseInt(String(data.rank)),
        isActive: true,
      },
    });

    revalidatePath("/dashboard/staff-level");
    return {
      success: true,
      data: staffLevel,
      message: "Level staff berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating staff level:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal membuat level staff",
    };
  }
}

export async function updateStaffLevel(data: UpdateStaffLevelInput) {
  try {
    if (!data.id) {
      return {
        success: false,
        error: "ID level tidak valid",
      };
    }

    if (!data.name || data.name.trim() === "") {
      return {
        success: false,
        error: "Nama level harus diisi",
      };
    }

    if (data.rank == null) {
      return {
        success: false,
        error: "Rank level harus diisi",
      };
    }

    const staffLevel = await prisma.staffLevel.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description || null,
        rank: Number.parseInt(String(data.rank)),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    revalidatePath("/dashboard/staff-level");
    return {
      success: true,
      data: staffLevel,
      message: "Level staff berhasil diperbarui",
    };
  } catch (error) {
    console.error("Error updating staff level:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui level staff",
    };
  }
}

export async function deleteStaffLevel(id: number) {
  try {
    if (!id) {
      return {
        success: false,
        error: "ID level tidak valid",
      };
    }

    // Check if any staff uses this level
    const staffCount = await prisma.staff.count({
      where: { levelId: id, isActive: true },
    });

    if (staffCount > 0) {
      return {
        success: false,
        error: `Tidak dapat menghapus level. Masih ada ${staffCount} staff yang menggunakan level ini.`,
      };
    }

    await prisma.staffLevel.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/dashboard/staff-level");
    return {
      success: true,
      message: "Level staff berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting staff level:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal menghapus level staff",
    };
  }
}

export async function getAllStaffLevels(activeOnly = true) {
  try {
    const levels = await prisma.staffLevel.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        staff: {
          where: { isActive: true },
          select: { id: true },
        },
      },
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

export async function restoreStaffLevel(id: number) {
  try {
    const staffLevel = await prisma.staffLevel.update({
      where: { id },
      data: { isActive: true },
    });

    revalidatePath("/dashboard/staff-level");
    return {
      success: true,
      data: staffLevel,
      message: "Level staff berhasil dipulihkan",
    };
  } catch (error) {
    console.error("Error restoring staff level:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal memulihkan level staff",
    };
  }
}
