"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  price: z.number().positive("Harga harus lebih dari 0"),
  costPrice: z.number().positive("Harga modal harus lebih dari 0"),
  stockQuantity: z.number().int().min(0, "Stock tidak boleh negatif"),
  minStockLevel: z.number().int().min(1, "Min. stock minimal 1"),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export interface GoodsItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
}

export async function getProducts(): Promise<{
  success: boolean;
  data?: GoodsItem[];
}> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    const formattedProducts: GoodsItem[] = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl ?? null,
      costPrice: Number(product.costPrice),
      minStockLevel: product.minStockLevel,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
    }));
    return { success: true, data: formattedProducts };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false };
  }
}

export async function getProductById(id: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Gagal mengambil data produk" };
  }
}

export async function createProduct(formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      costPrice: Number(formData.get("cost_price")), // FIX
      stockQuantity: Number(formData.get("stock_quantity")), // FIX
      minStockLevel: Number(formData.get("min_stock_level")), // FIX
      imageUrl: formData.get("image_url")?.toString() || null, // FIX
      isActive:
        formData.get("is_active") === "true" ||
        formData.get("is_active") === "on", // FIX switch
    };

    const validated = productSchema.parse(data);

    const product = await prisma.product.create({
      data: {
        name: validated.name,
        price: validated.price,
        costPrice: validated.costPrice,
        stockQuantity: validated.stockQuantity,
        minStockLevel: validated.minStockLevel,
        imageUrl: validated.imageUrl || null,
        isActive: validated.isActive,
      },
    });

    revalidatePath("/dashboard/product");
    return {
      success: true,
      message: "Produk berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Gagal menambahkan produk" };
  }
}

export async function updateProduct(id: number, formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      costPrice: Number(formData.get("cost_price")), // FIX
      stockQuantity: Number(formData.get("stock_quantity")), // FIX
      minStockLevel: Number(formData.get("min_stock_level")), // FIX
      imageUrl: formData.get("image_url")?.toString() || null, // FIX
      isActive:
        formData.get("is_active") === "true" ||
        formData.get("is_active") === "on", // FIX switch
    };

    const validated = productSchema.parse(data);

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...validated,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/product");
    return {
      success: true,
      data: product,
      message: "Produk berhasil diupdate",
    };
  } catch (error) {
    console.error("Error updating product:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Gagal mengupdate produk" };
  }
}

export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/dashboard/product");
    return { success: true, message: "Produk berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Gagal menghapus produk" };
  }
}

export async function toggleProductStatus(id: number) {
  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        isActive: !product.isActive,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/product");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling product status:", error);
    return { success: false, error: "Gagal mengubah status produk" };
  }
}

export async function reduceProductStock(productId: number, quantity: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return {
        success: false,
        error: "Produk tidak ditemukan",
        needsWarning: false,
      };
    }

    const newStock = product.stockQuantity - quantity;

    if (newStock < 0) {
      return {
        success: false,
        error: `Stock tidak mencukupi. Tersedia: ${product.stockQuantity}, diminta: ${quantity}`,
        needsWarning: true,
        availableStock: product.stockQuantity,
      };
    }

    const stockWarning = newStock < product.minStockLevel;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: newStock,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: updated,
      stockWarning,
      warningMessage: stockWarning
        ? `Peringatan: Stock produk ${product.name} sudah di bawah minimum level (tersisa: ${newStock})`
        : null,
    };
  } catch (error) {
    console.error("Error reducing product stock:", error);
    return {
      success: false,
      error: "Gagal mengurangi stock produk",
      needsWarning: false,
    };
  }
}

export async function restoreProductStock(productId: number, quantity: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: product.stockQuantity + quantity,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: updated,
      message: `Stock produk ${product.name} berhasil dikembalikan (+${quantity})`,
    };
  } catch (error) {
    console.error("Error restoring product stock:", error);
    return { success: false, error: "Gagal mengembalikan stock produk" };
  }
}
