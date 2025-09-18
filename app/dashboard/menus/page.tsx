import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs/server";
import { Edit, Eye, Menu, Plus, PlusIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { getAllMenus } from "./actions";

export default async function MenusPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dataMenu = await getAllMenus();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Menus</h1>
          <p className="text-muted-foreground">
            Manage navigation menus and access permissions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu
        </Button>
      </div>
      <div className="grid gap-4">
        {dataMenu.map((menu) => (
          <Card key={menu.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Menu className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{menu.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Path: {menu.path || "No path"}</span>
                      <span>Order: {menu.sort_order}</span>
                      <Badge variant="outline">permissions</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Permissions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
