import { syncUserWithDatabase } from "@/lib/auth-utils";
import { sql } from "@/lib/database";
import { currentUser } from "@clerk/nextjs/server";


export interface StaffMember {
  id: number;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  salary?: number;
  hireDate?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateStaffData {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  salary?: number;
  hireDate?: Date;
  isActive?: boolean;
}

export interface UpdateStaffData {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  salary?: number;
  hireDate?: Date;
  isActive?: boolean;
}

// Helper function for authentication
async function authenticateUser() {
  const clerkUser = await currentUser();

  //   if (!clerkUser) {
  //     console.log("No clerk user found, redirecting to sign-in.");
  //     redirect("/sign-in");
  //   }

  // Sync user with database
  const dbUser = await syncUserWithDatabase();

  //   if (!dbUser) {
  //     console.log(
  //       "No database user found after sync, redirecting to error page."
  //     );
  //     redirect("/fsfsdfsfuhiosdfsjin");
  //   }

  return { clerkUser, dbUser };
}

// Get all staff members
export async function getAllStaff(): Promise<StaffMember[]> {
  await authenticateUser();

  try {
    const staff = await sql.staff.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return staff;
  } catch (error) {
    console.error("Error fetching all staff:", error);
    throw new Error("Failed to fetch staff members");
  }
}

// Get staff member by ID
export async function getStaffById(id: number): Promise<StaffMember | null> {
  await authenticateUser();

  try {
    const staff = await sql.staff.findUnique({
      where: {
        id: id,
      },
    });

    return staff;
  } catch (error) {
    console.error("Error fetching staff by ID:", error);
    throw new Error("Failed to fetch staff member");
  }
}

// Create new staff member
export async function createStaff(data: CreateStaffData): Promise<StaffMember> {
  await authenticateUser();

  try {
    const newStaff = await sql.staff.create({
      data: {
        name: data.name,
        role: data.role,
        phone: data.phone,
        email: data.email,
        salary: data.salary,
        hireDate: data.hireDate || new Date(),
        isActive: data.isActive ?? true,
      },
    });

    return newStaff;
  } catch (error) {
    console.error("Error creating staff:", error);
    throw new Error("Failed to create staff member");
  }
}

// Update staff member
export async function updateStaff(
  id: number,
  data: UpdateStaffData
): Promise<StaffMember> {
  await authenticateUser();

  try {
    const updatedStaff = await sql.staff.update({
      where: {
        id: id,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return updatedStaff;
  } catch (error) {
    console.error("Error updating staff:", error);
    throw new Error("Failed to update staff member");
  }
}

// Delete staff member (soft delete - set isActive to false)
export async function deleteStaff(id: number): Promise<StaffMember> {
  await authenticateUser();

  try {
    const deletedStaff = await sql.staff.update({
      where: {
        id: id,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return deletedStaff;
  } catch (error) {
    console.error("Error deleting staff:", error);
    throw new Error("Failed to delete staff member");
  }
}

// Hard delete staff member (permanently remove from database)
export async function hardDeleteStaff(id: number): Promise<void> {
  await authenticateUser();

  try {
    await sql.staff.delete({
      where: {
        id: id,
      },
    });
  } catch (error) {
    console.error("Error hard deleting staff:", error);
    throw new Error("Failed to permanently delete staff member");
  }
}

// Get active staff members only
export async function getActiveStaff(): Promise<StaffMember[]> {
  await authenticateUser();

  try {
    const staff = await sql.staff.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return staff;
  } catch (error) {
    console.error("Error fetching active staff:", error);
    throw new Error("Failed to fetch active staff members");
  }
}

// Get staff with today's service count
export async function getStaffWithTodayServices(): Promise<StaffMember[]> {
  await authenticateUser();

  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const staff = await sql.staff.findMany({
      where: {
        isActive: true,
      },
      include: {
        services: {
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to include todayServices count
    const staffWithServiceCount = staff.map((member) => ({
      ...member,
      todayServices: member.services.length,
      services: undefined, // Remove services array from response
    }));

    return staffWithServiceCount;
  } catch (error) {
    console.error("Error fetching staff with today's services:", error);
    throw new Error("Failed to fetch staff with service counts");
  }
}
