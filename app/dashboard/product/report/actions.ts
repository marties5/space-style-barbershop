"use server";

import { prisma } from "@/lib/prisma";

interface ProductReportData {
  productId: number;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  averagePrice: number;
  totalTransactions: number;
  lastTransaction: Date;
  transactionHistory: Array<{
    id: string;
    transactionNumber: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    staffName: string;
    customerName?: string;
    paymentMethod: string;
    createdAt: Date;
  }>;
}

interface TransactionSummary {
  totalQuantitySold: number;
  totalRevenue: number;
  totalTransactions: number;
  lastTransaction: Date | null;
}

export async function getProductReport(
  productId: number
): Promise<ProductReportData | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return null;
    }

    const transactionItems = await prisma.transactionItem.findMany({
      where: {
        itemType: "product",
        itemId: productId,
      },
      include: {
        transaction: {
          include: {
            staff: true,
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalQuantitySold = transactionItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalRevenue = transactionItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0
    );
    const totalTransactions = transactionItems.length;
    const lastTransaction =
      transactionItems.length > 0 ? transactionItems[0].createdAt : null;

    const transactionHistory = transactionItems.map((item) => ({
      id: item.id,
      transactionNumber: item.transaction.transactionNumber,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      staffName: item.transaction.staff.name,
      customerName: item.transaction.customer?.name,
      paymentMethod: item.transaction.paymentMethod,
      createdAt: item.transaction.createdAt,
    }));

    const averagePrice =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      productId,
      productName: product.name,
      totalQuantitySold,
      totalRevenue,
      averagePrice,
      totalTransactions,
      lastTransaction: lastTransaction || new Date(),
      transactionHistory,
    };
  } catch (error) {
    console.error("[v0] Error getting product report:", error);
    return null;
  }
}

export async function getAllProductsReport() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
    });

    const reports = await Promise.all(
      products.map(async (product) => {
        const report = await getProductReport(product.id);
        return report;
      })
    );

    return reports.filter((report) => report !== null);
  } catch (error) {
    console.error("[v0] Error getting all products report:", error);
    return [];
  }
}

export async function getProductReportByDateRange(
  productId: number,
  startDate: Date,
  endDate: Date
) {
  try {
    const transactionItems = await prisma.transactionItem.findMany({
      where: {
        itemType: "product",
        itemId: productId,
        transaction: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        transaction: {
          include: {
            staff: true,
            customer: true,
          },
        },
      },
      orderBy: {
        transaction: {
          createdAt: "desc",
        },
      },
    });

    const totalQuantitySold = transactionItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalRevenue = transactionItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0
    );
    const totalTransactions = transactionItems.length;

    const dailySummary: Record<
      string,
      {
        date: string;
        quantity: number;
        revenue: number;
        transactions: number;
      }
    > = {};

    transactionItems.forEach((item) => {
      const dateStr = item.transaction.createdAt.toISOString().split("T")[0];
      if (!dailySummary[dateStr]) {
        dailySummary[dateStr] = {
          date: dateStr,
          quantity: 0,
          revenue: 0,
          transactions: 0,
        };
      }
      dailySummary[dateStr].quantity += item.quantity;
      dailySummary[dateStr].revenue += Number(item.totalPrice);
      dailySummary[dateStr].transactions += 1;
    });

    return {
      totalQuantitySold,
      totalRevenue,
      totalTransactions,
      dailySummary: Object.values(dailySummary).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    };
  } catch (error) {
    console.error("[v0] Error getting product report by date range:", error);
    return null;
  }
}

export async function getTopProductsByRevenue(limit = 10) {
  try {
    const topProducts = await prisma.transactionItem.groupBy({
      by: ["itemId"],
      where: {
        itemType: "product",
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalPrice: "desc",
        },
      },
      take: limit,
    });

    const products = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.itemId },
        });

        return {
          productId: item.itemId,
          productName: product?.name || "Unknown Product",
          totalQuantitySold: item._sum.quantity || 0,
          totalRevenue: Number(item._sum.totalPrice || 0),
          totalTransactions: item._count.id || 0,
          averagePrice:
            Number(item._sum.totalPrice || 0) / (item._count.id || 1) || 0,
        };
      })
    );

    return products;
  } catch (error) {
    console.error("[v0] Error getting top products by revenue:", error);
    return [];
  }
}
