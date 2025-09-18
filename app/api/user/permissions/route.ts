import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { syncUserWithDatabase, getUserPermissions } from "@/lib/auth-utils"

export async function GET() {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Sync user with database
    const dbUser = await syncUserWithDatabase()

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

    // Get user permissions
    const permissions = await getUserPermissions(dbUser.id)

    return NextResponse.json({
      success: true,
      permissions,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
      },
    })
  } catch (error) {
    console.error("Error fetching user permissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
