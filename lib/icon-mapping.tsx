import type React from "react";
import {
  BarChart3,
  LayoutDashboard,
  Menu,
  Shield,
  Users,
  Package,
  TrendingUp,
  Settings,
  Home,
  FileText,
  DollarSign,
  Clock,
  type LucideIcon,
} from "lucide-react";

// Map icon names to Lucide React icons
const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  transactions: LayoutDashboard,
  history: Clock,
  operational: DollarSign,
  users: Users,
  services: Menu,
  product: Package,
  groups: Shield,
  menus: Menu,
  analytics: BarChart3,
  settings: Settings,
  home: Home,
  report: FileText,
  trending: TrendingUp,
};

export function getIconComponent(
  iconName: string | undefined | null,
  className = "h-4 w-4"
): React.ReactNode {
  if (!iconName) return null;

  const Icon = iconMap[iconName.toLowerCase()] || LayoutDashboard;
  return <Icon className={className} />;
}

export function getIconName(displayName: string): string {
  const nameMap: Record<string, string> = {
    overview: "dashboard",
    barber: "transactions",
    riwayat: "history",
    operasional: "operational",
    users: "users",
    jasa: "services",
    product: "product",
    groups: "groups",
    menus: "menus",
    analytics: "analytics",
    staff: "users",
    "staff level": "settings",
  };

  return nameMap[displayName.toLowerCase()] || "dashboard";
}
