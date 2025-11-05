"use server";

import { prisma } from "@/lib/prisma";

export async function getStaffDailyData() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const staffDailyData = await prisma.staff.findMany({
      where: {
        isActive: true,
      },
      include: {
        dailySales: {
          where: {
            saleDate: {
              gte: today,
              lt: tomorrow,
            },
          },
          take: 1,
        },
        transactions: {
          where: {
            transactionDate: {
              gte: today,
              lt: tomorrow,
            },
          },
          select: {
            id: true,
            totalAmount: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const enrichedData = staffDailyData.map((staff) => {
      const dailySales = staff.dailySales[0];
      const totalTransactions = staff.transactions.length;
      const totalRevenue = staff.transactions.reduce(
        (sum, t) => sum + Number(t.totalAmount),
        0
      );

      return {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        jumlah_hari_ini: totalTransactions,
        revenue_hari_ini: totalRevenue,
        service_count: dailySales?.totalServices || 0,
        product_count: dailySales?.totalProducts || 0,
        commission: totalRevenue * (Number(staff.commissionRate) / 100),
      };
    });

    return {
      success: true,
      data: enrichedData.filter((item) => item.jumlah_hari_ini > 0),
    };
  } catch (error) {
    console.error("Error fetching staff daily data:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data staff harian",
    };
  }
}

export async function getOperationalCostToday() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOperational = await prisma.operasional.findMany({
      where: {
        tanggal: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalCost = todayOperational.reduce(
      (sum, op) => sum + Number(op.jumlah),
      0
    );

    const byCategory: Record<string, number> = {};
    todayOperational.forEach((op) => {
      byCategory[op.kategori] =
        (byCategory[op.kategori] || 0) + Number(op.jumlah);
    });

    return {
      success: true,
      data: {
        totalCost,
        byCategory,
        count: todayOperational.length,
        items: todayOperational.map((op) => ({
          ...op,
          jumlah: Number(op.jumlah), // ✅ Decimal → Number
          tanggal: op.tanggal.toISOString(), // ✅ Date → String aman untuk client
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching operational cost today:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil biaya operasional hari ini",
    };
  }
}
