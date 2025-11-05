"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Shield, Menu, BarChart3 } from "lucide-react";

const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Barber", href: "/dashboard/transactions", icon: LayoutDashboard },
  {
    title: "Riwayat",
    href: "/dashboard/transactions/history",
    icon: LayoutDashboard,
  },
  {
    title: "Operasional",
    href: "/dashboard/operational",
    icon: LayoutDashboard,
  },
  { title: "Users", href: "/dashboard/users", icon: Users },
  { title: "Jasa", href: "/dashboard/services", icon: Users },
  { title: "Product", href: "/dashboard/product", icon: Users },
  { title: "Groups", href: "/dashboard/groups", icon: Shield },
  { title: "Menus", href: "/dashboard/menus", icon: Menu },
  { title: "Partner Report", href: "/dashboard/staff/report", icon: BarChart3 },
  {
    title: "Product Report",
    href: "/dashboard/product/report",
    icon: BarChart3,
  },
  { title: "Profile", href: "/dashboard/profile", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
