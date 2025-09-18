import {
  getUserPermissions,
  hasPermission,
  syncUserWithDatabase,
} from "@/lib/auth-utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Test permission system
    const tests = {
      userSyncWorks: false,
      permissionsRetrieved: false,
      hasViewPermission: false,
      hasCreatePermission: false,
      hasEditPermission: false,
      hasDeletePermission: false,
    };

    // Test 1: User sync
    try {
      const dbUser = await syncUserWithDatabase();
      tests.userSyncWorks = !!dbUser;
    } catch (error) {
      console.error("User sync test failed:", error);
    }

    if (tests.userSyncWorks) {
      const dbUser = await syncUserWithDatabase();

      // Test 2: Get user permissions
      try {
        const permissions = await getUserPermissions(dbUser!.id);
        tests.permissionsRetrieved = permissions.length > 0;
      } catch (error) {
        console.error("Permissions retrieval test failed:", error);
      }

      // Test 3-6: Check specific permissions
      try {
        tests.hasViewPermission = await hasPermission(
          dbUser!.id,
          "/dashboard",
          "read"
        );
        tests.hasCreatePermission = await hasPermission(
          dbUser!.id,
          "/users",
          "write"
        );
        tests.hasEditPermission = await hasPermission(
          dbUser!.id,
          "/users",
          "update"
        );
        tests.hasDeletePermission = await hasPermission(
          dbUser!.id,
          "/users",
          "delete"
        );
      } catch (error) {
        console.error("Permission check tests failed:", error);
      }
    }

    const allTestsPassed = Object.values(tests).every(Boolean);

    return NextResponse.json({
      success: allTestsPassed,
      tests,
      message: allTestsPassed
        ? "All permission tests passed!"
        : "Some permission tests failed.",
    });
  } catch (error) {
    console.error("Permission test error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
