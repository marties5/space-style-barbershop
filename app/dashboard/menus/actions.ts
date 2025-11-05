"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type MenuWithGroups = {
  id: string;
  name: string;
  path: string | null;
  icon: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  groups?: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  children?: MenuWithGroups[];
};

// Schema validasi
const menuSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  path: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const menuPermissionSchema = z.object({
  groupId: z.string().min(1, "Group is required"),
  canRead: z.boolean().optional(),
  canWrite: z.boolean().optional(),
  canUpdate: z.boolean().optional(),
  canDelete: z.boolean().optional(),
});

// Get all menus
export async function getAllMenus(): Promise<MenuWithGroups[]> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const menus = await prisma.menu.findMany({
      where: {
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        menuRoles: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return menus.map((menu) => ({
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      parentId: menu.parentId,
      sortOrder: menu.sortOrder,
      isActive: menu.isActive,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      groups: menu.menuRoles.map((mr) => mr.group),
      children: menu.children,
    }));
  } catch (error) {
    console.error("Error fetching menus:", error);
    throw new Error("Failed to fetch menus");
  }
}

// Get menu by ID
export async function getMenuById(menuId: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const menu = await prisma.menu.findUnique({
      where: {
        id: menuId,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        menuRoles: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!menu) return null;

    return {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      parentId: menu.parentId,
      sortOrder: menu.sortOrder,
      isActive: menu.isActive,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      groups: menu.menuRoles.map((mr) => mr.group),
      children: menu.children,
    };
  } catch (error) {
    console.error("Error fetching menu:", error);
    throw new Error("Failed to fetch menu");
  }
}

// Create menu
export async function createMenu(data: z.infer<typeof menuSchema>) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const validatedData = menuSchema.parse(data);

    const menu = await prisma.menu.create({
      data: {
        name: validatedData.name,
        path: validatedData.path,
        icon: validatedData.icon,
        parentId: validatedData.parentId,
        sortOrder: validatedData.sortOrder || 0,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/menu");
    return { success: true, data: menu };
  } catch (error) {
    console.error("Error creating menu:", error);
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw new Error("Failed to create menu");
  }
}

// Update menu
export async function updateMenu(
  menuId: string,
  data: Partial<z.infer<typeof menuSchema>>
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const menu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        name: data.name,
        path: data.path,
        icon: data.icon,
        parentId: data.parentId,
        sortOrder: data.sortOrder,
      },
    });

    revalidatePath("/dashboard/menu");
    return { success: true, data: menu };
  } catch (error) {
    console.error("Error updating menu:", error);
    throw new Error("Failed to update menu");
  }
}

// Delete menu (soft delete)
export async function deleteMenu(menuId: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    // Check if menu has children
    const childrenCount = await prisma.menu.count({
      where: {
        parentId: menuId,
        isActive: true,
      },
    });

    if (childrenCount > 0) {
      throw new Error("Cannot delete menu with active children");
    }

    await prisma.menu.update({
      where: { id: menuId },
      data: { isActive: false },
    });

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    console.error("Error deleting menu:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete menu");
  }
}

// Assign menu to group
export async function assignMenuToGroup(
  menuId: string,
  data: z.infer<typeof menuPermissionSchema>
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const validatedData = menuPermissionSchema.parse(data);

    const menuRole = await prisma.menuRole.upsert({
      where: {
        groupId_menuId: {
          groupId: validatedData.groupId,
          menuId,
        },
      },
      update: {
        canRead: validatedData.canRead ?? true,
        canWrite: validatedData.canWrite ?? false,
        canUpdate: validatedData.canUpdate ?? false,
        canDelete: validatedData.canDelete ?? false,
      },
      create: {
        groupId: validatedData.groupId,
        menuId,
        canRead: validatedData.canRead ?? true,
        canWrite: validatedData.canWrite ?? false,
        canUpdate: validatedData.canUpdate ?? false,
        canDelete: validatedData.canDelete ?? false,
      },
    });

    revalidatePath("/dashboard/menu");
    return { success: true, data: menuRole };
  } catch (error) {
    console.error("Error assigning menu to group:", error);
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw new Error("Failed to assign menu to group");
  }
}

// Remove menu from group
export async function removeMenuFromGroup(menuId: string, groupId: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    await prisma.menuRole.delete({
      where: {
        groupId_menuId: {
          groupId,
          menuId,
        },
      },
    });

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    console.error("Error removing menu from group:", error);
    throw new Error("Failed to remove menu from group");
  }
}
