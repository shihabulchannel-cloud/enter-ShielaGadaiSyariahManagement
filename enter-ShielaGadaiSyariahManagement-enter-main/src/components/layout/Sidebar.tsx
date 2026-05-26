import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Package, FileText,
  CreditCard, BarChart3, Building2, Settings,
  ChevronLeft, ChevronRight, LogOut, UserCircle, HandCoins, Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { canAccess } from "@/lib/access-control";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard",      icon: LayoutDashboard, path: "/dashboard" },
  { label: "Data Nasabah",   icon: Users,           path: "/nasabah" },
  { label: "Barang Jaminan", icon: Package,         path: "/barang" },
  { label: "Transaksi Gadai",icon: HandCoins,       path: "/transaksi" },
  { label: "Pembayaran",     icon: CreditCard,      path: "/pembayaran" },
  { label: "Laporan",        icon: BarChart3,       path: "/laporan" },
  { label: "Arus Kas",       icon: Wallet,          path: "/arus-kas" },
  { label: "Data Cabang",    icon: Building2,       path: "/cabang" },
  { label: "Pengaturan",     icon: Settings,        path: "/pengaturan" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const visibleItems = navItems.filter(item => canAccess(profile?.role, item.path));

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full transition-all duration-300 ease-in-out",
        "bg-sidebar border-r border-sidebar-border",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-gold">
          <img
            src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059471/b1dd8944-57af-49.png"
            alt="Shiela Gadai Syariah"
            crossOrigin="anonymous"
            className="w-8 h-8 object-contain"
          />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className="text-sidebar-foreground font-bold text-sm leading-tight">Shiela Gadai</h1>
            <p className="text-sidebar-foreground/50 text-xs">Syariah</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-16 z-10 w-6 h-6 rounded-full",
          "bg-sidebar border-2 border-sidebar-border",
          "flex items-center justify-center",
          "text-sidebar-foreground/60 hover:text-sidebar-foreground",
          "transition-smooth hover:scale-110"
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-3">
            Menu Utama
          </p>
        )}

        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          const linkContent = (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "transition-smooth text-sm font-medium",
                "group relative",
                active
                  ? "gradient-gold text-sidebar-primary-foreground shadow-gold"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-smooth",
                  active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                )}
              />
              {!collapsed && (
                <span className="truncate animate-fade-in">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto px-1.5 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="space-y-2">
            <NavLink
              to="/profile"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "transition-smooth text-sm",
                isActive("/profile")
                  ? "gradient-gold text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-5 h-5 text-primary-glow" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate">{profile?.nama_lengkap || "User"}</p>
                <p className="text-xs text-sidebar-foreground/40 truncate capitalize">{profile?.role?.replace("_", " ") || "kasir"}</p>
              </div>
            </NavLink>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-smooth"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to="/profile"
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent transition-smooth"
                >
                  <UserCircle className="w-5 h-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">Profil</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={signOut}
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-smooth"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Keluar</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
}
