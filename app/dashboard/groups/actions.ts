// app/actions/group-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type Group = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GroupWithMembers = Group & {
  members: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl: string | null;
  }>;
  _count: {
    groupRoles: number;
  };
};

// Get all active groups
export async function getAllGroups(): Promise<Group[]> {
  try {
    return await prisma.group.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw new Error("Failed to fetch groups");
  }
}

// Get all groups with member count
export async function getAllGroupsWithMembers(): Promise<GroupWithMembers[]> {
  try {
    return await prisma.group
      .findMany({
        where: {
          isActive: true,
        },
        include: {
          groupRoles: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
            where: {
              user: {
                isActive: true,
              },
            },
          },
          _count: {
            select: {
              groupRoles: {
                where: {
                  user: {
                    isActive: true,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
      .then((groups) =>
        groups.map((group) => ({
          ...group,
          members: group.groupRoles.map((gr) => gr.user),
        }))
      );
  } catch (error) {
    console.error("Error fetching groups with members:", error);
    throw new Error("Failed to fetch groups with members");
  }
}

// Get group by ID
export async function getGroupById(
  groupId: string
): Promise<GroupWithMembers | null> {
  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
        isActive: true,
      },
      include: {
        groupRoles: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            user: {
              isActive: true,
            },
          },
        },
        _count: {
          select: {
            groupRoles: {
              where: {
                user: {
                  isActive: true,
                },
              },
            },
          },
        },
      },
    });

    if (!group) return null;

    return {
      ...group,
      members: group.groupRoles.map((gr) => gr.user),
    };
  } catch (error) {
    console.error("Error fetching group:", error);
    throw new Error("Failed to fetch group");
  }
}

// Create new group
const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100),
  description: z.string().optional(),
});

export async function createGroup(data: z.infer<typeof createGroupSchema>) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const validatedData = createGroupSchema.parse(data);

    // Check if group name already exists
    const existingGroup = await prisma.group.findFirst({
      where: {
        name: validatedData.name,
        isActive: true,
      },
    });

    if (existingGroup) {
      throw new Error("Group name already exists");
    }

    const group = await prisma.group.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
    });

    revalidatePath("/groups");
    revalidatePath("/users");
    return group;
  } catch (error) {
    console.error("Error creating group:", error);
    throw new Error("Failed to create group");
  }
}

// Update group
const updateGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Group name is required").max(100),
  description: z.string().optional(),
});

export async function updateGroup(data: z.infer<typeof updateGroupSchema>) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const validatedData = updateGroupSchema.parse(data);

    // Check if group name already exists (excluding current group)
    const existingGroup = await prisma.group.findFirst({
      where: {
        name: validatedData.name,
        isActive: true,
        id: {
          not: validatedData.id,
        },
      },
    });

    if (existingGroup) {
      throw new Error("Group name already exists");
    }

    const group = await prisma.group.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
    });

    revalidatePath("/groups");
    revalidatePath("/users");
    return group;
  } catch (error) {
    console.error("Error updating group:", error);
    throw new Error("Failed to update group");
  }
}

// Deactivate group
export async function deactivateGroup(groupId: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    // Remove all group roles first
    await prisma.groupRole.deleteMany({
      where: { groupId },
    });

    // Deactivate the group
    await prisma.group.update({
      where: { id: groupId },
      data: { isActive: false },
    });

    revalidatePath("/groups");
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error deactivating group:", error);
    throw new Error("Failed to deactivate group");
  }
}
