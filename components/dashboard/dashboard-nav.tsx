"use client";

import { cn } from "@/lib/utils";
import { BarChart3, LayoutDashboard, Menu, Shield, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstallButton } from "../InstallButton";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Barber",
    href: "/dashboard/transactions",
    icon: LayoutDashboard,
  },
  {
    title: "Riwayat",
    href: "/dashboard/transactions/history",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Groups",
    href: "/dashboard/groups",
    icon: Shield,
  },
  {
    title: "Menus",
    href: "/dashboard/menus",
    icon: Menu,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    
    </nav>
  );
}
