import { InstallButton } from "@/components/InstallButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { syncUserWithDatabase } from "@/lib/auth-utils";
import { sql } from "@/lib/database";
import { currentUser } from "@clerk/nextjs/server";
import { BarChart3, Menu, Shield, Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    console.log("No clerk user found, redirecting to sign-in.");
    redirect("/sign-in");
  }

  const dbUser = await syncUserWithDatabase();

  if (!dbUser) {
    console.log(
      "No database user found after sync, redirecting to error page."
    );
    redirect("/sign-in");
  }

  // Get dashboard statistics
  const [userCount, groupCount, menuCount, activeUsers] = await Promise.all([
    sql`SELECT COUNT(id) as count FROM users WHERE is_active = true`,
    sql`SELECT COUNT(id) as count FROM groups WHERE is_active = true`,
    sql`SELECT COUNT(id) as count FROM menus WHERE is_active = true`,
    sql`SELECT COUNT(id) as count FROM users WHERE is_active = true AND updated_at > NOW() - INTERVAL '30 days'`,
  ]);

  const stats = {
    totalUsers: userCount[0]?.count || 0,
    totalGroups: groupCount[0]?.count || 0,
    totalMenus: menuCount[0]?.count || 0,
    activeUsers: activeUsers[0]?.count || 0,
  };

  return (
    <div className="space-y-6">
      <InstallButton />
      <div>
        <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {clerkUser.firstName}! Here's your system overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Groups</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">Role groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Menu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMenus}</div>
            <p className="text-xs text-muted-foreground">Navigation items</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest user registrations and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-secondary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">User role updated</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-accent rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New group created</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication Service</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-muted-foreground">
                    Operational
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Connection</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-muted-foreground">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SSO Integration</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
