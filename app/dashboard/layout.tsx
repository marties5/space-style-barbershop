import { UserProfileButton } from "@/components/auth/user-profile-button";
import { AppSidebar } from "@/components/dashboard/dashboard-nav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { Shield } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider className=" bg-background ">
      <AppSidebar />
      <div className="flex flex-col min-h-screen w-full">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex h-16 items-center pr-6 pl-2">
            <div className="p-2.5 bg-primary-50 mr-2 rounded border">
              <SidebarTrigger />
            </div>
            <Link href="/dashboard" className="flex items-center gap-2 mr-6">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold">Point Of Sales</span>
            </Link>
            <div className="flex-1" />
            <UserProfileButton />
          </div>
        </header>

        <main className="p-8 ">{children}</main>
      </div>
    </SidebarProvider>
  );
}
