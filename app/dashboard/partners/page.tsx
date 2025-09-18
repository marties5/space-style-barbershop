import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs/server";
import { Calendar, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllStaff } from "./add/actions";

const page = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const staff = await getAllStaff();
  return (
    <div className="grid gap-4">
      <div className="flex w-full justify-between">
        <h1 className="text-2xl font-semibold mb-6">Daftar Partner</h1>
        <Link href="/dashboard/partners/add">
          <Button className="text-white w-44 bg-purple-600 h-10">
            Tambah Partner
          </Button>
        </Link>
      </div>
      {staff.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <p className="text-muted-foreground">No staff found</p>
              <Link href="/users/add">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Staff
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        staff.map((user) => {
          const initials = `${user.name?.[0] || ""}${
            user.name?.[0] || ""
          }`.toUpperCase();

          return (
            <Card key={user.id}>
              <CardContent className="px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={"/placeholder.svg"}
                        alt={user.name || ""}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {initials || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {user.name
                          ? `${user.name || ""} ${user.name || ""}`.trim()
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
                  <Link href={`/users/${user.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default page;
