import { UserProfileButton } from "@/components/auth/user-profile-button";
import { currentUser } from "@clerk/nextjs/server";
import { Shield } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type React from "react";
import { DashboardNav } from "../../components/dashboard/dashboard-nav";

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-2 mr-6">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold">Barber Aplikasi</span>
          </Link>
          <div className="flex-1" />
          <UserProfileButton />
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 border-r border-border bg-muted/30 min-h-[calc(100vh-4rem)]">
          <DashboardNav />
        </aside>
        <main className="flex-1 py-4">{children}</main>
      </div>
    </div>
  );
}
