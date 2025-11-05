import * as z from "zod";

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, "Nama service wajib diisi")
    .max(255, "Nama terlalu panjang"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  imageUrl: z
    .string()
    .url("URL gambar tidak valid")
    .max(500, "URL terlalu panjang"),
  isActive: z.boolean().default(true),
  discount: z.number().min(0).max(100).optional().nullable(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
