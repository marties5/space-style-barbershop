import { UserRoleManager } from "@/components/dashboard/user-role-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs/server";
import { Calendar, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getAllUsersWithGroups } from "./actions";

function UsersPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
                  <div>
                    <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function UsersContent() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const users = await getAllUsersWithGroups();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and role assignments
          </p>
        </div>
        <Link href="/users/add">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </Link>
      </div>
      <div className="grid gap-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground">No users found</p>
                <Link href="/users/add">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Your First User
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => {
            const initials = `${user.firstName?.[0] || ""}${
              user.lastName?.[0] || ""
            }`.toUpperCase();

            return (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={user.avatarUrl || "/placeholder.svg"}
                          alt={user.firstName || ""}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {initials || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${
                                user.lastName || ""
                              }`.trim()
                            : user.email}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {user.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-wrap gap-1">
                        {user.groups.length > 0 ? (
                          user.groups.map((group) => (
                            <Badge key={group.id} variant="secondary">
                              {group.name}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">No Groups</Badge>
                        )}
                      </div>
                      <UserRoleManager
                        userId={user.id}
                        currentGroups={user.groups}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersPageSkeleton />}>
      <UsersContent />
    </Suspense>
  );
}
