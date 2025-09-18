"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "../users/actions";

export type menuWithGroups = {
  id: number;
  name: string;
  path: string | null;
  icon: string | null;
  parentId: number | null;
  sort_order: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  groups: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
};

export async function getAllMenus(): Promise<menuWithGroups[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }
  console.log("Current User in getAllMenusWithGroups:", currentUser);

  try {
    const menus = await prisma.menu.findMany({
      where: {
        isActive: true,
      },
    });

    return menus as [];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getAllMenusWithGroups(): Promise<menuWithGroups[]> {
  try {
    const menus = await prisma.menu.findMany({
      where: {
        isActive: true,
      },
    });

    return menus as [];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getStaffById(staffId: number) {
  try {
    const staff = await prisma.staff.findUnique({
      where: {
        id: staffId,
        isActive: true,
      },
    });

    if (!staff) return null;

    return staff;
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
    return staff;
  } catch (error) {
    console.error("Error creating manual staff:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create staff");
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
