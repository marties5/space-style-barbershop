"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Types untuk transaction
interface TransactionItem {
  id: string;
  name: string;
  price: number;
  count: number;
  item_type: string;
}

interface CreateTransactionData {
  userId: string;
  customer_id?: number;
  staff_id: number;
  items: TransactionItem[];
  payment_method: string;
  notes?: string;
}

// Legacy interfaces untuk compatibility
interface TransactionData {
  userId: string;
  good: {
    id: number;
    price: number;
    name: string;
  };
  partnerId: string;
}

interface TransactionDataWithPayment extends TransactionData {
  paymentMethod: "cash" | "qris";
}

interface TransactionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

function generateTransactionNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const timestamp = now.getTime().toString().slice(-6);
  return `TRX${year}${month}${day}${timestamp}`;
}

function serializeTransaction(transaction: any) {
  return {
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
  };
}

/**
 * Fungsi untuk membuat transaction baru beserta items dan update daily sales
 * Support untuk multiple items
 */
export async function createTransaction(data: CreateTransactionData) {
  try {
    // Validasi input
    if (!data.items || data.items.length === 0) {
      throw new Error("Transaction harus memiliki minimal 1 item");
    }
    console.log("data ubmited : ", data);
    // Tentukan transaction type berdasarkan items
    const hasService = data.items.some((item) => item.item_type === "service");
    const hasProduct = data.items.some((item) => item.item_type === "product");

    let transactionType: string;
    if (hasService && hasProduct) {
      transactionType = "mixed"; // Kombinasi service dan product
    } else if (hasService) {
      transactionType = "service"; // Hanya service
    } else {
      transactionType = "product"; // Hanya product
    }

    // Hitung subtotal, tax, dan total
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );
    const taxRate = 0.1; // 10% tax
    const taxAmount = subtotal * taxRate;
    const discountAmount = 0; // Default no discount
    const totalAmount = subtotal + taxAmount - discountAmount;
    const transactionNumber = generateTransactionNumber();

    // Mulai database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat transaction record dengan transaction_type
      const transaction = await tx.transaction.create({
        data: {
          transactionNumber: transactionNumber,
          // Use customer relation instead of customerId
          customer: data.customer_id
            ? { connect: { id: data.customer_id } }
            : undefined,
          staff: { connect: { id: data.staff_id } },
          subtotal: subtotal,
          taxAmount: taxAmount,
          discountAmount: discountAmount,
          totalAmount: totalAmount,
          paymentMethod: data.payment_method,
          paymentStatus: "completed",
          transaction_type: transactionType,
          notes: data.notes || null,
        },
      });

      // 2. Buat transaction items (tetap sama)
      const transactionItems = await Promise.all(
        data.items.map((item) =>
          tx.transactionItem.create({
            data: {
              transactionId: transaction.id,
              itemType: item.item_type,
              itemId: Number.parseInt(item.id),
              itemName: item.name,
              quantity: item.count,
              unitPrice: item.price,
              totalPrice: item.price * item.count,
            },
          })
        )
      );

      // 3. Update daily sales (sudah ada logic untuk service/product count)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailySalesData = {
        saleDate: today,
        staffId: data.staff_id,
        totalTransactions: 1,
        totalServices: data.items.filter((item) => item.item_type === "service")
          .length,
        totalProducts: data.items.filter((item) => item.item_type === "product")
          .length,
        grossSales: subtotal,
        netSales: totalAmount,
      };

      const dailySales = await tx.dailySales.upsert({
        where: {
          saleDate_staffId: {
            saleDate: today,
            staffId: data.staff_id,
          },
        },
        update: {
          totalTransactions: { increment: 1 },
          totalServices: {
            increment: data.items.filter((item) => item.item_type === "service")
              .length,
          },
          totalProducts: {
            increment: data.items.filter((item) => item.item_type === "product")
              .length,
          },
          grossSales: { increment: subtotal },
          netSales: { increment: totalAmount },
        },
        create: dailySalesData,
      });

      return {
        transaction,
        transactionItems,
        dailySales,
      };
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/daily-sales");

    // Convert Decimal fields to numbers for serialization
    const serializedResult = {
      transaction: {
        ...result.transaction,
        subtotal: Number(result.transaction.subtotal),
        taxAmount: Number(result.transaction.taxAmount),
        discountAmount: Number(result.transaction.discountAmount),
        totalAmount: Number(result.transaction.totalAmount),
      },
      transactionItems: result.transactionItems.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      dailySales: {
        ...result.dailySales,
        grossSales: Number(result.dailySales.grossSales),
        netSales: Number(result.dailySales.netSales),
      },
    };

    return {
      success: true,
      data: serializedResult,
      message: "Transaction berhasil dibuat",
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

/**
 * Legacy function untuk single item transaction (compatibility)
 */
export async function createTransactionSingle(
  data: TransactionDataWithPayment
): Promise<TransactionResponse> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Transaction timeout")), 15000);
  });

  try {
    if (!data.userId || !data.good || !data.partnerId) {
      return {
        success: false,
        error: "Data tidak lengkap. userId, good, dan partnerId harus diisi.",
      };
    }

    const subtotal = Number(data.good.price);
    const taxAmount = 0;
    const discountAmount = 0;
    const totalAmount = subtotal + taxAmount - discountAmount;
    const transactionNumber = generateTransactionNumber();
    const staffId = Number.parseInt(data.partnerId);

    const result = await Promise.race([
      executeTransaction({
        transactionNumber,
        staffId,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paymentMethod: data.paymentMethod || "cash",
        transaction_type: "service",
        goodData: data.good,
        today,
      }),
      timeoutPromise,
    ]);

    return {
      success: true,
      data: {
        transactionId: result.transaction.id,
        transactionNumber: result.transaction.transactionNumber,
        totalAmount: Number(result.transaction.totalAmount),
        paymentMethod: result.transaction.paymentMethod,
        message: "Transaksi berhasil disimpan",
      },
    };
  } catch (error) {
    console.error("Transaction error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("timeout") ||
        error.message.includes("connection pool")
      ) {
        return {
          success: false,
          error: "Server sedang sibuk, silakan coba lagi dalam beberapa saat",
        };
      }

      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          error: "Nomor transaksi sudah ada, silakan coba lagi",
        };
      }
    }

    return {
      success: false,
      error: "Terjadi kesalahan saat memproses transaksi",
    };
  }
}

async function executeTransaction(params: {
  transactionNumber: string;
  staffId: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  transaction_type: string;
  paymentMethod: string;
  goodData: { id: number; name: string; price: number };
  today: Date;
}) {
  return await prisma.$transaction(
    async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          transactionNumber: params.transactionNumber,
          customerId: null,
          staffId: params.staffId,
          subtotal: params.subtotal,
          taxAmount: params.taxAmount,
          discountAmount: params.discountAmount,
          totalAmount: params.totalAmount,
          transaction_type : params.transaction_type,
          paymentMethod: params.paymentMethod,
          paymentStatus: "completed",
          notes: `Transaksi untuk ${params.goodData.name}`,
        },
      });

      const transactionItem = await tx.transactionItem.create({
        data: {
          transactionId: transaction.id,
          itemType: "service",
          itemId: params.goodData.id,
          itemName: params.goodData.name,
          quantity: 1,
          unitPrice: params.goodData.price,
          totalPrice: params.goodData.price,
        },
      });

      const dailySalesData = {
        saleDate: params.today,
        staffId: params.staffId,
        totalTransactions: 1,
        totalServices: 1,
        totalProducts: 0,
        grossSales: params.totalAmount,
        netSales: params.totalAmount,
      };

      await tx.dailySales.upsert({
        where: {
          saleDate_staffId: {
            saleDate: params.today,
            staffId: params.staffId,
          },
        },
        update: {
          totalTransactions: { increment: 1 },
          totalServices: { increment: 1 },
          grossSales: { increment: params.totalAmount },
          netSales: { increment: params.totalAmount },
        },
        create: dailySalesData,
      });

      return { transaction, transactionItem };
    },
    {
      maxWait: 5000, // 5 seconds max wait
      timeout: 10000, // 10 seconds timeout
      isolationLevel: "ReadCommitted", // Less restrictive isolation
    }
  );
}

export async function createTransactionFallback(
  data: TransactionDataWithPayment
): Promise<TransactionResponse> {
  try {
    if (!data.userId || !data.good || !data.partnerId) {
      return {
        success: false,
        error: "Data tidak lengkap",
      };
    }

    const subtotal = Number(data.good.price);
    const totalAmount = subtotal;
    const transactionNumber = generateTransactionNumber();
    const staffId = parseInt(data.partnerId);

    const transaction = await prisma.transaction.create({
      data: {
        transactionNumber,
        customerId: null,
        staffId,
        subtotal,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount,
        paymentMethod: data.paymentMethod || "cash",
        paymentStatus: "completed",
        notes: `Transaksi untuk ${data.good.name}`,
      },
    });

    await prisma.transactionItem.create({
      data: {
        transactionId: transaction.id,
        itemType: "service",
        itemId: data.good.id,
        itemName: data.good.name,
        quantity: 1,
        unitPrice: data.good.price,
        totalPrice: data.good.price,
      },
    });

    updateDailySalesAsync(staffId, totalAmount).catch(console.error);

    return {
      success: true,
      data: {
        transactionId: transaction.id,
        transactionNumber: transaction.transactionNumber,
        totalAmount: Number(transaction.totalAmount),
        paymentMethod: transaction.paymentMethod,
        message: "Transaksi berhasil disimpan",
      },
    };
  } catch (error) {
    console.error("Fallback transaction error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses transaksi",
    };
  }
}

async function updateDailySalesAsync(staffId: number, totalAmount: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.dailySales.upsert({
      where: {
        saleDate_staffId: {
          saleDate: today,
          staffId,
        },
      },
      update: {
        totalTransactions: { increment: 1 },
        totalServices: { increment: 1 },
        grossSales: { increment: totalAmount },
        netSales: { increment: totalAmount },
      },
      create: {
        saleDate: today,
        staffId,
        totalTransactions: 1,
        totalServices: 1,
        totalProducts: 0,
        grossSales: totalAmount,
        netSales: totalAmount,
      },
    });
  } catch (error) {
    console.error("Daily sales update failed:", error);
  }
}

export async function createTransactionWithRetry(
  data: TransactionDataWithPayment
): Promise<TransactionResponse> {
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await createTransactionSingle(data);

      if (result.success) {
        return result;
      }

      if (attempt === maxRetries && result.error?.includes("sibuk")) {
        console.log("Using fallback method...");
        return await createTransactionFallback(data);
      }

      return result;
    } catch (error) {
      console.error(`Transaction attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        return {
          success: false,
          error: "Transaksi gagal setelah beberapa percobaan",
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return {
    success: false,
    error: "Transaksi gagal",
  };
}

/**
 * Fungsi untuk mendapatkan transaction berdasarkan ID
 */
export async function getTransactionById(
  transactionId: string
): Promise<TransactionResponse> {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
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
      data: serializeTransaction(transaction),
    };
  } catch (error) {
    console.error("Get transaction error:", error);
    return {
      success: false,
      error: "Gagal mengambil data transaksi",
    };
  }
}

/**
 * Fungsi untuk mendapatkan semua transactions dengan pagination
 */
export async function getTransactions(page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          transactionItems: {
            select: {
              itemName: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
            },
          },
        },
      }),
      prisma.transaction.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

/**
 * Fungsi untuk mendapatkan daily sales berdasarkan staff dan tanggal
 */
export async function getDailySales(staffId: number, date?: Date) {
  try {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split("T")[0];

    const dailySales = await prisma.dailySales.findFirst({
      where: {
        staffId: staffId,
        saleDate: {
          gte: new Date(dateStr),
          lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      success: true,
      data: dailySales,
    };
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

/**
 * Fungsi untuk mendapatkan ringkasan penjualan berdasarkan range tanggal
 */
export async function getSalesReport(
  startDate: Date,
  endDate: Date,
  staffId?: number
) {
  try {
    const whereClause: any = {
      saleDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (staffId) {
      whereClause.staffId = staffId;
    }

    const salesData = await prisma.dailySales.findMany({
      where: whereClause,
      orderBy: { saleDate: "desc" },
    });

    const summary = salesData.reduce(
      (acc, sale) => ({
        totalTransactions:
          acc.totalTransactions + (sale.totalTransactions || 0),
        totalServices: acc.totalServices + (sale.totalServices || 0),
        totalProducts: acc.totalProducts + (sale.totalProducts || 0),
        totalGrossSales:
          acc.totalGrossSales + (sale.grossSales?.toNumber() || 0),
        totalNetSales: acc.totalNetSales + (sale.netSales?.toNumber() || 0),
      }),
      {
        totalTransactions: 0,
        totalServices: 0,
        totalProducts: 0,
        totalGrossSales: 0,
        totalNetSales: 0,
      }
    );

    return {
      success: true,
      data: {
        dailySales: salesData,
        summary,
      },
    };
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

export async function getAllTransactionPartner() {
  try {
    const TransactionStaffToday = await prisma.staff.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        transactions: {
          select: { id: true },
        },
      },
    });
    return { success: true, data: TransactionStaffToday };
  } catch (error) {
    console.error("Get all transaction partners error:", error);
    return {
      success: false,
      error: "Gagal mengambil data Staff",
    };
  }
}

export async function getAllPartnerTransactionDay({ date, partnerId }: any) {
  try {
    const defaultDate = date ?? today;
    const tomorrow = new Date(defaultDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const staffToday = await prisma.staff.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,

        transactions: {
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          },
          select: { id: true },
        },
      },
    });

    return { success: true, data: staffToday };
  } catch (error) {
    console.error("Get transaction todays partner error:", error);
    return {
      success: false,
      error: "Gagal mengambil data Staff Hari ini",
    };
  }
}

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
