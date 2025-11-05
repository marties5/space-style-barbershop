"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getMenusByUserGroup() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
        data: [],
      };
    }

    // Fetch user's groups through GroupRole
    const userGroups = await prisma.groupRole.findMany({
      where: {
        userId: userId,
      },
      select: {
        groupId: true,
      },
    });

    if (userGroups.length === 0) {
      return {
        success: false,
        error: "User has no assigned groups",
        data: [],
      };
    }

    const groupIds = userGroups.map((g) => g.groupId);

    // Fetch menus accessible by user's groups
    const menus = await prisma.menu.findMany({
      where: {
        isActive: true,
        menuRoles: {
          some: {
            groupId: {
              in: groupIds,
            },
            canRead: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        path: true,
        icon: true,
        parentId: true,
        sortOrder: true,
        children: {
          where: {
            isActive: true,
            menuRoles: {
              some: {
                groupId: {
                  in: groupIds,
                },
                canRead: true,
              },
            },
          },
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            id: true,
            name: true,
            path: true,
            icon: true,
            sortOrder: true,
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // Filter only parent menus (no parentId)
    const parentMenus = menus.filter((m) => !m.parentId);

    return {
      success: true,
      data: parentMenus,
    };
  } catch (error) {
    console.error("Error fetching menus:", error);
    return {
      success: false,
      error: "Failed to fetch menus",
      data: [],
    };
  }
}

export async function createMenu(data: {
  name: string;
  path?: string;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
}) {
  try {
    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        path: data.path,
        icon: data.icon,
        parentId: data.parentId,
        sortOrder: data.sortOrder || 0,
      },
    });

    return {
      success: true,
      data: menu,
    };
  } catch (error) {
    console.error("Error creating menu:", error);
    return {
      success: false,
      error: "Failed to create menu",
    };
  }
}

export async function updateMenu(
  menuId: string,
  data: {
    name?: string;
    path?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  try {
    const menu = await prisma.menu.update({
      where: { id: menuId },
      data,
    });

    return {
      success: true,
      data: menu,
    };
  } catch (error) {
    console.error("Error updating menu:", error);
    return {
      success: false,
      error: "Failed to update menu",
    };
  }
}

export async function deleteMenu(menuId: string) {
  try {
    await prisma.menu.delete({
      where: { id: menuId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting menu:", error);
    return {
      success: false,
      error: "Failed to delete menu",
    };
  }
}

export async function assignMenuToGroup(
  menuId: string,
  groupId: string,
  permissions: {
    canRead?: boolean;
    canWrite?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  } = { canRead: true }
) {
  try {
    const menuRole = await prisma.menuRole.upsert({
      where: {
        groupId_menuId: {
          groupId,
          menuId,
        },
      },
      update: {
        ...permissions,
      },
      create: {
        groupId,
        menuId,
        ...permissions,
      },
    });

    return {
      success: true,
      data: menuRole,
    };
  } catch (error) {
    console.error("Error assigning menu to group:", error);
    return {
      success: false,
      error: "Failed to assign menu to group",
    };
  }
}
