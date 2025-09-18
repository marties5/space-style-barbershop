"use server";

import { prisma } from "@/lib/prisma";
interface TransactionHistoryFilters {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: "cash" | "qris" | "all";
  transactionType?: "service" | "product" | "mixed" | "all";
  staffId?: number;
  search?: string;
}

interface TransactionHistoryResponse {
  success: boolean;
  data?: {
    transactions: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    summary: {
      totalAmount: number;
      totalTransactions: number;
      cashTransactions: number;
      qrisTransactions: number;
      serviceTransactions: number;
      productTransactions: number;
      mixedTransactions: number;
    };
  };
  error?: string;
}

function serializeTransactionHistory(transactions: any[]) {
  return transactions.map((transaction) => ({
    ...transaction,
    subtotal: Number(transaction.subtotal),
    taxAmount: Number(transaction.taxAmount),
    discountAmount: Number(transaction.discountAmount),
    totalAmount: Number(transaction.totalAmount),
    transactionItems: transaction.transactionItems?.map((item: any) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
  }));
}

export async function getTransactionHistory(
  filters: TransactionHistoryFilters = {}
): Promise<TransactionHistoryResponse> {
  try {
    const {
      page = 1,
      limit = 10,
      dateFrom,
      dateTo,
      paymentMethod = "all",
      transactionType = "all",
      staffId,
      search,
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (dateFrom || dateTo) {
      whereClause.transactionDate = {};
      if (dateFrom) {
        whereClause.transactionDate.gte = new Date(dateFrom + "T00:00:00.000Z");
      }
      if (dateTo) {
        whereClause.transactionDate.lte = new Date(dateTo + "T23:59:59.999Z");
      }
    }

    if (paymentMethod !== "all") {
      whereClause.paymentMethod = paymentMethod;
    }

    if (transactionType !== "all") {
      whereClause.transactionType = transactionType;
    }

    if (staffId) {
      whereClause.staffId = staffId;
    }

    if (search) {
      whereClause.OR = [
        {
          transactionNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          notes: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          staff: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [transactions, totalCount, summaryData] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        select: {
          id: true,
          transactionNumber: true,
          transactionDate: true,
          totalAmount: true,
          paymentMethod: true,
          transaction_type: true,
          notes: true,
          transactionItems: {
            select: {
              id: true,
              itemType: true,
              itemName: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          transactionDate: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.transaction.count({
        where: whereClause,
      }),
      prisma.transaction.aggregate({
        where: whereClause,
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const transactionTypeBreakdown = await prisma.transaction.groupBy({
      by: ["transaction_type"],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    const paymentBreakdown = await prisma.transaction.groupBy({
      by: ["paymentMethod"],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    const cashCount =
      paymentBreakdown.find((p) => p.paymentMethod === "cash")?._count.id || 0;
    const qrisCount =
      paymentBreakdown.find((p) => p.paymentMethod === "qris")?._count.id || 0;

    const serviceCount =
      transactionTypeBreakdown.find(
        (t: any) => t.transaction_type === "service"
      )?._count.id || 0;
    const productCount =
      transactionTypeBreakdown.find(
        (t: any) => t.transaction_type === "product"
      )?._count.id || 0;
    const mixedCount =
      transactionTypeBreakdown.find((t: any) => t.transaction_type === "mixed")
        ?._count.id || 0;

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        transactions: serializeTransactionHistory(transactions),
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
        },
        summary: {
          totalAmount: Number(summaryData._sum.totalAmount || 0),
          totalTransactions: summaryData._count.id,
          cashTransactions: cashCount,
          qrisTransactions: qrisCount,
          serviceTransactions: serviceCount,
          productTransactions: productCount,
          mixedTransactions: mixedCount,
        },
      },
    };
  } catch (error) {
    console.error("Error getting transaction history:", error);
    return {
      success: false,
      error: "Gagal mengambil riwayat transaksi",
    };
  }
}

export async function getTransactionDetail(transactionId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        transactionItems: true,
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      return {
        success: false,
        error: "Transaksi tidak ditemukan",
      };
    }
    return {
      success: true,
      data: serializeTransactionHistory([transaction])[0],
    };
  } catch (error) {
    console.error("Error getting transaction detail:", error);
    return {
      success: false,
      error: "Gagal mengambil detail transaksi",
    };
  }
}

export async function getDailyTransactionSummary(
  date: string,
  staffId?: number
) {
  try {
    const startDate = new Date(date + "T00:00:00.000Z");
    const endDate = new Date(date + "T23:59:59.999Z");

    const whereClause: any = {
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (staffId) {
      whereClause.staffId = staffId;
    }

    const summary = await prisma.transaction.aggregate({
      where: whereClause,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const paymentBreakdown = await prisma.transaction.groupBy({
      by: ["paymentMethod"],
      where: whereClause,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      success: true,
      data: {
        totalAmount: Number(summary._sum.totalAmount || 0),
        totalTransactions: summary._count.id,
        paymentBreakdown: paymentBreakdown.map((item) => ({
          method: item.paymentMethod,
          count: item._count.id,
          total: Number(item._sum.totalAmount || 0),
        })),
      },
    };
  } catch (error) {
    console.error("Error getting daily summary:", error);
    return {
      success: false,
      error: "Gagal mengambil ringkasan harian",
    };
  }
}
