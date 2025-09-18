import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Test database connectivity and basic queries
    const tests = {
      databaseConnection: false,
      userTableExists: false,
      groupTableExists: false,
      menuTableExists: false,
      defaultGroupsExist: false,
      defaultMenusExist: false,
      userSyncWorks: false,
    }

    // Test 1: Database connection
    try {
      await sql`SELECT 1`
      tests.databaseConnection = true
    } catch (error) {
      console.error("Database connection test failed:", error)
    }

    // Test 2: Check if tables exist
    try {
      await sql`SELECT COUNT(*) FROM users LIMIT 1`
      tests.userTableExists = true
    } catch (error) {
      console.error("Users table test failed:", error)
    }

    try {
      await sql`SELECT COUNT(*) FROM groups LIMIT 1`
      tests.groupTableExists = true
    } catch (error) {
      console.error("Groups table test failed:", error)
    }

    try {
      await sql`SELECT COUNT(*) FROM menus LIMIT 1`
      tests.menuTableExists = true
    } catch (error) {
      console.error("Menus table test failed:", error)
    }

    // Test 3: Check default data
    try {
      const defaultGroups = await sql`SELECT COUNT(*) as count FROM groups WHERE name IN ('Admin', 'Manager', 'User')`
      tests.defaultGroupsExist = defaultGroups[0]?.count >= 3
    } catch (error) {
      console.error("Default groups test failed:", error)
    }

    try {
      const defaultMenus =
        await sql`SELECT COUNT(*) as count FROM menus WHERE name IN ('Dashboard', 'Users', 'Groups', 'Settings')`
      tests.defaultMenusExist = defaultMenus[0]?.count >= 4
    } catch (error) {
      console.error("Default menus test failed:", error)
    }

    // Test 4: User sync functionality
    try {
      const existingUser = await sql`SELECT * FROM users WHERE clerk_id = ${clerkUser.id}`
      if (existingUser.length > 0) {
        tests.userSyncWorks = true
      } else {
        // Try to create user
        const newUser = await sql`
          INSERT INTO users (clerk_id, email, first_name, last_name, avatar_url)
          VALUES (${clerkUser.id}, ${clerkUser.emailAddresses[0]?.emailAddress || ""}, ${clerkUser.firstName || ""}, ${clerkUser.lastName || ""}, ${clerkUser.imageUrl || ""})
          RETURNING *
        `
        tests.userSyncWorks = newUser.length > 0
      }
    } catch (error) {
      console.error("User sync test failed:", error)
    }

    const allTestsPassed = Object.values(tests).every(Boolean)

    return NextResponse.json({
      success: allTestsPassed,
      tests,
      message: allTestsPassed ? "All database tests passed!" : "Some tests failed. Check the details above.",
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
