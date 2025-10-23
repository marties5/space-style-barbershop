"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOperational(formData: FormData) {
  const tanggal = new Date(formData.get("tanggal") as string);
  const kategori = formData.get("kategori") as string;
  const deskripsi = formData.get("deskripsi") as string;
  const jumlah = Number.parseFloat(formData.get("jumlah") as string);

  try {
    await prisma.operasional.create({
      data: {
        tanggal,
        kategori,
        deskripsi,
        jumlah,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/operational");
  } catch (error) {
    console.error("Error creating operational record:", error);
    throw new Error("Failed to create operational record");
  }
}

export async function updateOperational(id: number, formData: FormData) {
  const tanggal = new Date(formData.get("tanggal") as string);
  const kategori = formData.get("kategori") as string;
  const deskripsi = formData.get("deskripsi") as string;
  const jumlah = Number.parseFloat(formData.get("jumlah") as string);

  try {
    await prisma.operasional.update({
      where: { id },
      data: {
        tanggal,
        kategori,
        deskripsi,
        jumlah,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/operational");
    revalidatePath(`/dashboard/operational/${id}`);
  } catch (error) {
    console.error("Error updating operational record:", error);
    throw new Error("Failed to update operational record");
  }
}

export async function deleteOperational(id: number) {
  try {
    await prisma.operasional.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/operational");
  } catch (error) {
    console.error("Error deleting operational record:", error);
    throw new Error("Failed to delete operational record");
  }

  redirect("/dashboard/operational");
}

export async function createDailySales(formData: FormData) {
  const saleDate = new Date(formData.get("saleDate") as string);
  const staffId = Number.parseInt(formData.get("staffId") as string);
  const totalTransactions = Number.parseInt(
    formData.get("totalTransactions") as string
  );
  const totalServices = Number.parseInt(
    formData.get("totalServices") as string
  );
  const totalProducts = Number.parseInt(
    formData.get("totalProducts") as string
  );
  const grossSales = Number.parseFloat(formData.get("grossSales") as string);
  const netSales = Number.parseFloat(formData.get("netSales") as string);

  try {
    await prisma.dailySales.create({
      data: {
        saleDate,
        staffId,
        totalTransactions,
        totalServices,
        totalProducts,
        grossSales,
        netSales,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/sales");
  } catch (error) {
    console.error("Error creating daily sales record:", error);
    throw new Error("Failed to create daily sales record");
  }
}

export async function updateDailySales(id: number, formData: FormData) {
  const saleDate = new Date(formData.get("saleDate") as string);
  const staffId = Number.parseInt(formData.get("staffId") as string);
  const totalTransactions = Number.parseInt(
    formData.get("totalTransactions") as string
  );
  const totalServices = Number.parseInt(
    formData.get("totalServices") as string
  );
  const totalProducts = Number.parseInt(
    formData.get("totalProducts") as string
  );
  const grossSales = Number.parseFloat(formData.get("grossSales") as string);
  const netSales = Number.parseFloat(formData.get("netSales") as string);

  try {
    await prisma.dailySales.update({
      where: { id },
      data: {
        saleDate,
        staffId,
        totalTransactions,
        totalServices,
        totalProducts,
        grossSales,
        netSales,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/sales");
    revalidatePath(`/sales/${id}`);
  } catch (error) {
    console.error("Error updating daily sales record:", error);
    throw new Error("Failed to update daily sales record");
  }
}

export async function deleteDailySales(id: number) {
  try {
    await prisma.dailySales.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/sales");
  } catch (error) {
    console.error("Error deleting daily sales record:", error);
    throw new Error("Failed to delete daily sales record");
  }

  redirect("/sales");
}

export async function getOperationalRecords() {
  return await prisma.operasional.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getDashboardData() {
  try {
    const [
      totalOperations,
      totalSales,
      recentOperations,
      recentSales,
      operationalByCategory,
      salesTrend,
    ] = await Promise.all([
      prisma.operasional.count(),
      prisma.dailySales.count(),
      prisma.operasional.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.dailySales.findMany({
        take: 7,
        orderBy: { saleDate: "desc" },
      }),
      prisma.operasional.groupBy({
        by: ["kategori"],
        _sum: { jumlah: true },
        _count: { id: true },
      }),
      prisma.dailySales.findMany({
        take: 7,
        orderBy: { saleDate: "asc" },
        select: {
          saleDate: true,
          grossSales: true,
          netSales: true,
          totalTransactions: true,
        },
      }),
    ]);

    const totalRevenueFromSales = await prisma.dailySales.aggregate({
      _sum: { netSales: true },
    });

    const totalExpenses = await prisma.operasional.aggregate({
      _sum: { jumlah: true },
    });

    const cashTransactions = await prisma.transaction.aggregate({
      where: { paymentMethod: "cash" },
      _sum: { totalAmount: true },
    });

    const qrisTransactions = await prisma.transaction.aggregate({
      where: { paymentMethod: "qris" },
      _sum: { totalAmount: true },
    });

    const grossRevenue = Number(totalRevenueFromSales._sum.netSales || 0);
    const totalExpensesAmount = Number(totalExpenses._sum.jumlah || 0);
    const cashAmount = Number(cashTransactions._sum.totalAmount || 0);
    const qrisAmount = Number(qrisTransactions._sum.totalAmount || 0);

    const netCashRevenue = cashAmount - totalExpensesAmount;
    const totalNetRevenue = netCashRevenue + qrisAmount;

    const processedRecentOperations = recentOperations.map((operation) => ({
      ...operation,
      jumlah: Number(operation.jumlah),
    }));

    const processedOperationalByCategory = operationalByCategory.map(
      (item) => ({
        ...item,
        _sum: { jumlah: Number(item._sum.jumlah || 0) },
      })
    );

    const processedSalesTrend = salesTrend.map((sale) => ({
      ...sale,
      grossSales: Number(sale.grossSales),
      netSales: Number(sale.netSales),
    }));

    const processedRecentSales = recentSales.map((sale) => ({
      ...sale,
      grossSales: Number(sale.grossSales),
      netSales: Number(sale.netSales),
    }));

    return {
      totalOperations,
      totalSales,
      totalRevenue: grossRevenue,
      totalExpenses: totalExpensesAmount,
      netRevenue: totalNetRevenue,
      cashRevenue: cashAmount,
      qrisRevenue: qrisAmount,
      netCashRevenue: netCashRevenue,
      recentOperations: processedRecentOperations,
      recentSales: processedRecentSales,
      operationalByCategory: processedOperationalByCategory,
      salesTrend: processedSalesTrend,
    };
  } catch (error) {
    console.error("Dashboard data error:", error);
    return {
      totalOperations: 0,
      totalSales: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      netRevenue: 0,
      cashRevenue: 0,
      qrisRevenue: 0,
      netCashRevenue: 0,
      recentOperations: [],
      recentSales: [],
      operationalByCategory: [],
      salesTrend: [],
    };
  }
}
