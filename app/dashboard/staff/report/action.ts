"use server";

import { prisma } from "@/lib/prisma";

export async function getStaffReportData() {
  try {
    const staff = await prisma.staff.findMany({
      where: { isActive: true },
      include: {
        level: true,
        transactions: {
          select: { id: true, totalAmount: true, transactionDate: true },
        },
        dailySales: {
          select: {
            saleDate: true,
            totalTransactions: true,
            grossSales: true,
            netSales: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const enrichedStaff = staff.map((s) => {
      const totalTransactions = s.transactions.length;
      const totalRevenue = s.transactions.reduce(
        (sum, t) => sum + Number(t.totalAmount),
        0
      );
      const commission = totalRevenue * (Number(s.commissionRate) / 100);

      return {
        ...s,
        commissionRate: Number(s.commissionRate),
        totalTransactions,
        totalRevenue,
        commission,
        transactions: s.transactions.map((t) => ({
          ...t,
          totalAmount: Number(t.totalAmount),
          transactionDate: t.transactionDate.toISOString(),
        })),
        dailySales: s.dailySales.map((d) => ({
          ...d,
          grossSales: Number(d.grossSales),
          netSales: Number(d.netSales),
          saleDate: d.saleDate.toISOString(),
        })),
      };
    });

    return {
      success: true,
      data: enrichedStaff,
    };
  } catch (error) {
    console.error("Error fetching staff report data:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data report staff",
    };
  }
}

export async function getStaffDetailReport(staffId: number) {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        level: true,
        transactions: {
          include: {
            customer: true,
            transactionItems: true,
          },
          orderBy: { transactionDate: "desc" },
        },
        dailySales: {
          orderBy: { saleDate: "desc" },
          take: 30,
        },
      },
    });

    if (!staff) {
      return {
        success: false,
        error: "Staff tidak ditemukan",
      };
    }

    const totalRevenue = staff.transactions.reduce(
      (sum, t) => sum + Number(t.totalAmount),
      0
    );
    const commission = totalRevenue * (Number(staff.commissionRate) / 100);
    const totalTransactions = staff.transactions.length;
    const totalProducts = staff.transactions.reduce((sum, t) => {
      const productItems =
        t.transactionItems?.filter((item) => item.itemType === "product") || [];
      return (
        sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0)
      );
    }, 0);
    const totalServices = staff.transactions.reduce((sum, t) => {
      const serviceItems =
        t.transactionItems?.filter((item) => item.itemType === "service") || [];
      return sum + serviceItems.length;
    }, 0);

    const avgTransactionValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    return {
      success: true,
      data: {
        staff: {
          ...staff,
          commissionRate: Number(staff.commissionRate),
          transactions: staff.transactions.map((t) => ({
            ...t,
            totalAmount: Number(t.totalAmount),
            transactionDate: t.transactionDate.toISOString(),
            transactionItems: t.transactionItems.map((i) => ({
              ...i,
              price: Number(i.price),
            })),
          })),
          dailySales: staff.dailySales.map((d) => ({
            ...d,
            grossSales: Number(d.grossSales),
            netSales: Number(d.netSales),
            saleDate: d.saleDate.toISOString(),
          })),
        },
        stats: {
          totalRevenue,
          commission,
          totalTransactions,
          totalProducts,
          totalServices,
          avgTransactionValue,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching staff detail report:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil detail report staff",
    };
  }
}
