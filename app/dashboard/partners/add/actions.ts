"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type UserWithGroups = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const createStaffSchema = z.object({
  id: z.number().optional(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
});

export async function createOrUpdateStaff(
  staffData: z.infer<typeof createStaffSchema>
) {
  try {
    const validatedData = createStaffSchema.parse(staffData);

    if (validatedData.id) {
      const staff = await prisma.staff.upsert({
        where: {
          id: validatedData.id,
        },
        update: {
          email: validatedData.email,
          name: validatedData.name,
          phone: validatedData.phone,
        },
        create: {
          id: validatedData.id,
          email: validatedData.email,
          name: validatedData.name,
          phone: validatedData.phone,
        },
      });

      revalidatePath("/partner");
      return staff;
    }

    const existingUser = await prisma.staff.findFirst({
      where: {
        email: validatedData.email,
        isActive: true,
      },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const staff = await prisma.staff.create({
      data: {
        id: validatedData.id,
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone,
        isActive: true,
      },
    });

    revalidatePath("/partner");
    return staff;
  } catch (error) {
    console.error("Error creating/updating staff:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create or update staff");
  }
}

export async function getAllStaff() {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
    
        levelId: true,
        phone: true,
      },
    });

    return { success: true, data: staff as any[] };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getStaffById(
  staffId: number
): Promise<UserWithGroups | null> {
  try {
    const staff = await prisma.staff.findUnique({
      where: {
        id: staffId,
        isActive: true,
      },
    });

    if (!staff) return null;

    return staff as UserWithGroups;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
}

const createManualStaffSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
});

export async function createManualStaff(
  staffData: z.infer<typeof createManualStaffSchema>
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const validatedData = createManualStaffSchema.parse(staffData);

    const existingUser = await prisma.staff.findFirst({
      where: {
        email: validatedData.email,
        isActive: true,
      },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const staff = await prisma.staff.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone,
        isActive: true,
      },
    });

    revalidatePath("/partner");
    return { success: true, staff };
  } catch (error) {
    console.error("Error creating manual staff:", error);

    if (error instanceof Error) {
      throw error;
    }

    return { success: false };
  }
}

export async function deactivateUser(staffId: number) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    await prisma.staff.update({
      where: { id: staffId },
      data: { isActive: false },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error deactivating user:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to deactivate user");
  }
}

export async function deleteStaff(staffId: number) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    await prisma.staff.delete({
      where: { id: staffId },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete user");
  }
}


export async function createStaff(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = (formData.get("role") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const commissionRate =
    Number.parseFloat(formData.get("commissionRate") as string) || 0;
  const levelId = formData.get("levelId")
    ? Number.parseInt(formData.get("levelId") as string)
    : null;
  const isActive = formData.get("isActive") === "on";

  try {
    await prisma.staff.create({
      data: {
        name,
        email,
        role,
        phone,
        commissionRate,
        levelId,
        isActive,
      },
    });

    revalidatePath("/staff");
  } catch (error) {
    console.error("Error creating staff:", error);
    throw new Error("Failed to create staff");
  }
}

export async function updateStaff(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = (formData.get("role") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const commissionRate =
    Number.parseFloat(formData.get("commissionRate") as string) || 0;
  const levelId = formData.get("levelId")
    ? Number.parseInt(formData.get("levelId") as string)
    : null;
  const isActive = formData.get("isActive") === "on";

  try {
    await prisma.staff.update({
      where: { id },
      data: {
        name,
        email,
        role,
        phone,
        commissionRate,
        levelId,
        isActive,
      },
    });

    revalidatePath("/staff");
    revalidatePath(`/staff/${id}`);
  } catch (error) {
    console.error("Error updating staff:", error);
    throw new Error("Failed to update staff");
  }
}

