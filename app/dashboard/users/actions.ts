"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type UserWithGroups = {
  id: string;
  clerkId: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  groups: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
};

export async function getAllUsersWithGroups(): Promise<UserWithGroups[]> {
  try {
    const users = await prisma.user.findMany({
      include: {
        groupRoles: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
          where: {
            group: {
              isActive: true,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map((user) => ({
      ...user,
      groups: user.groupRoles.map((gr) => gr.group),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getAllActiveUser() {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getUserById(
  userId: string
): Promise<UserWithGroups | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
      include: {
        groupRoles: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
          where: {
            group: {
              isActive: true,
            },
          },
        },
      },
    });

    if (!user) return null;

    return {
      ...user,
      groups: user.groupRoles.map((gr) => gr.group),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
}

export async function getCurrentUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }
  console.log("Clerk User in getCurrentUser:", clerkUser);
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkUser.id,
        isActive: true,
      },
      include: {
        groupRoles: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
          where: {
            group: {
              isActive: true,
            },
          },
        },
      },
    });

    if (!user) return null;

    return {
      ...user,
      groups: user.groupRoles.map((gr) => gr.group),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
}

const createUserSchema = z.object({
  clerkId: z.string().optional(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export async function createOrUpdateUser(
  userData: z.infer<typeof createUserSchema>
) {
  try {
    const validatedData = createUserSchema.parse(userData);

    if (validatedData.clerkId) {
      const user = await prisma.user.upsert({
        where: {
          clerkId: validatedData.clerkId,
        },
        update: {
          email: validatedData.email,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          avatarUrl: validatedData.avatarUrl,
        },
        create: {
          clerkId: validatedData.clerkId,
          email: validatedData.email,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          avatarUrl: validatedData.avatarUrl,
        },
      });

      revalidatePath("/users");
      return user;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        isActive: true,
      },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const user = await prisma.user.create({
      data: {
        clerkId: "",
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        avatarUrl: validatedData.avatarUrl,
        isActive: true,
      },
    });

    revalidatePath("/users");
    return user;
  } catch (error) {
    console.error("Error creating/updating user:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create or update user");
  }
}

const createManualUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function createManualUser(
  userData: z.infer<typeof createManualUserSchema>
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const validatedData = createManualUserSchema.parse(userData);

    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        isActive: true,
      },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const user = await prisma.user.create({
      data: {
        clerkId: "",
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        avatarUrl: validatedData.avatarUrl || null,
        isActive: true,
      },
    });

    revalidatePath("/users");
    return user;
  } catch (error) {
    console.error("Error creating manual user:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create user");
  }
}

const assignUserToGroupSchema = z.object({
  userId: z.string().uuid(),
  groupId: z.string().uuid(),
});

export async function assignUserToGroup(
  data: z.infer<typeof assignUserToGroupSchema>
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const currentDbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: clerkUser.id },
          { email: clerkUser.emailAddresses[0]?.emailAddress },
        ],
      },
    });

    if (!currentDbUser) {
      throw new Error("Current user not found in database");
    }

    const validatedData = assignUserToGroupSchema.parse(data);

    const existingRole = await prisma.groupRole.findUnique({
      where: {
        userId_groupId: {
          userId: validatedData.userId,
          groupId: validatedData.groupId,
        },
      },
    });

    if (existingRole) {
      throw new Error("User is already assigned to this group");
    }

    const groupRole = await prisma.groupRole.create({
      data: {
        userId: validatedData.userId,
        groupId: validatedData.groupId,
        assignedBy: currentDbUser.id,
      },
      include: {
        group: true,
        user: true,
      },
    });

    revalidatePath("/users");
    return groupRole;
  } catch (error) {
    console.error("Error assigning user to group:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to assign user to group");
  }
}

const removeUserFromGroupSchema = z.object({
  userId: z.string().uuid(),
  groupId: z.string().uuid(),
});

export async function removeUserFromGroup(
  data: z.infer<typeof removeUserFromGroupSchema>
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const validatedData = removeUserFromGroupSchema.parse(data);

    await prisma.groupRole.delete({
      where: {
        userId_groupId: {
          userId: validatedData.userId,
          groupId: validatedData.groupId,
        },
      },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error removing user from group:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to remove user from group");
  }
}

export async function deactivateUser(userId: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    await prisma.user.update({
      where: { id: userId },
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
