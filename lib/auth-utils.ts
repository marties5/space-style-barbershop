import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function syncUserWithDatabase() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  try {
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";

    let existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { clerkId: clerkUser.id }],
      },
    });

    if (!existingUser) {
      // insert user baru
      const newUser = await prisma.user.upsert({
        where: { email },
        update: {
          clerkId: clerkUser.id,
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          avatarUrl: clerkUser.imageUrl || "",
          updatedAt: new Date(),
        },
        create: {
          clerkId: clerkUser.id,
          email,
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          avatarUrl: clerkUser.imageUrl || "",
        },
      });

      // tambahkan ke group default "User"
      const defaultGroup = await prisma.group.findFirst({
        where: { name: "User" },
      });

      if (defaultGroup) {
        await prisma.groupRole.upsert({
          where: {
            userId_groupId: {
              userId: newUser.id,
              groupId: defaultGroup.id,
            },
          },
          update: {},
          create: {
            userId: newUser.id,
            groupId: defaultGroup.id,
          },
        });
      }

      return newUser;
    } else {
      // update jika sudah ada
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          clerkId: clerkUser.id,
          email,
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          avatarUrl: clerkUser.imageUrl || "",
          updatedAt: new Date(),
        },
      });

      return updatedUser;
    }
  } catch (error) {
    console.error("Error syncing user with database:", error);
    return null;
  }
}

export async function getUserPermissions(userId: string) {
  try {
    const permissions = await prisma.menu.findMany({
      where: {
        isActive: true,
        menuRoles: {
          some: {
            group: {
              isActive: true,
              groupRoles: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        path: true,
        icon: true,
        menuRoles: {
          where: {
            group: {
              groupRoles: { some: { userId } },
            },
          },
          select: {
            canRead: true,
            canWrite: true,
            canUpdate: true,
            canDelete: true,
          },
        },
      },
    });

    return permissions.map((m) => ({
      menu_id: m.id,
      menu_name: m.name,
      menu_path: m.path,
      menu_icon: m.icon,
      ...m.menuRoles[0],
    }));
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
}

export async function hasPermission(
  userId: string,
  menuPath: string,
  permission: "read" | "write" | "update" | "delete"
) {
  try {
    const menu = await prisma.menu.findFirst({
      where: {
        path: menuPath,
        isActive: true,
        menuRoles: {
          some: {
            group: {
              isActive: true,
              groupRoles: { some: { userId } },
            },
          },
        },
      },
      select: {
        menuRoles: {
          where: {
            group: { groupRoles: { some: { userId } } },
          },
          select: {
            canRead: true,
            canWrite: true,
            canUpdate: true,
            canDelete: true,
          },
        },
      },
    });

    if (!menu || menu.menuRoles.length === 0) return false;

    const role = menu.menuRoles[0];
    switch (permission) {
      case "read":
        return role.canRead;
      case "write":
        return role.canWrite;
      case "update":
        return role.canUpdate;
      case "delete":
        return role.canDelete;
      default:
        return false;
    }
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}
