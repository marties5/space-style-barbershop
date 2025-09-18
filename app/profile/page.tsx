import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserPermissions, syncUserWithDatabase } from "@/lib/auth-utils";
import { currentUser } from "@clerk/nextjs/server";
import { Calendar, Mail, Shield, Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Sync user with database and get permissions
  const dbUser = await syncUserWithDatabase();
  const permissions = dbUser ? await getUserPermissions(dbUser.id) : [];

  const initials = `${clerkUser.firstName?.[0] || ""}${
    clerkUser.lastName?.[0] || ""
  }`.toUpperCase();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your basic account details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={clerkUser.imageUrl || "/placeholder.svg"}
                    alt={clerkUser.fullName || ""}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {clerkUser.fullName}
                  </h3>
                  <p className="text-muted-foreground">
                    {clerkUser.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span>{clerkUser.emailAddresses[0]?.emailAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span>
                    {new Date(clerkUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Permissions & Access
              </CardTitle>
              <CardDescription>
                Your current access levels and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {permissions.length > 0 ? (
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div
                      key={permission.menu_id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{permission.menu_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {permission.menu_path}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {permission.can_read && (
                          <Badge variant="outline" className="text-xs">
                            View
                          </Badge>
                        )}
                        {permission.can_write && (
                          <Badge variant="outline" className="text-xs">
                            Create
                          </Badge>
                        )}
                        {permission.can_update && (
                          <Badge variant="outline" className="text-xs">
                            Edit
                          </Badge>
                        )}
                        {permission.can_delete && (
                          <Badge variant="outline" className="text-xs">
                            Delete
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No permissions assigned yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
