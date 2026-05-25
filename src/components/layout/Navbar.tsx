import { useState } from "react";
import { Bell, Moon, Sun, Search, ChevronDown, Building2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { dummyCabang } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

const notifications = [
  { id: 1, type: "warning", message: "3 transaksi jatuh tempo hari ini", time: "5 mnt lalu" },
  { id: 2, type: "error", message: "2 nasabah macet belum membayar", time: "1 jam lalu" },
  { id: 3, type: "info", message: "Pembayaran dari Budi Raharjo diterima", time: "2 jam lalu" },
];

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const [selectedCabang, setSelectedCabang] = useState(dummyCabang[0]);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-4 sticky top-0 z-30">
      {/* Mobile menu */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden text-muted-foreground hover:text-foreground transition-smooth"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nasabah, transaksi..."
            className="pl-9 h-9 bg-muted/50 border-transparent focus:border-border text-sm"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Cabang Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9 hidden sm:flex border-border/60">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium hidden md:inline max-w-32 truncate">
                {selectedCabang.nama_cabang}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Pilih Cabang</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dummyCabang.map((cabang) => (
              <DropdownMenuItem
                key={cabang.id}
                onClick={() => setSelectedCabang(cabang)}
                className={cn(
                  "gap-2 cursor-pointer",
                  selectedCabang.id === cabang.id && "text-primary font-medium"
                )}
              >
                <Building2 className="w-4 h-4" />
                {cabang.nama_cabang}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-9 h-9 text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-9 h-9 relative text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                {notifications.length}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifikasi
              <Badge variant="secondary" className="text-xs">{notifications.length} baru</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notif) => (
              <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex items-start gap-2 w-full">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      notif.type === "warning" && "bg-gold",
                      notif.type === "error" && "bg-destructive",
                      notif.type === "info" && "bg-primary"
                    )}
                  />
                  <p className="text-sm text-foreground leading-snug">{notif.message}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-4">{notif.time}</p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-primary text-sm font-medium justify-center">
              Lihat semua notifikasi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold cursor-pointer">
          {profile?.nama_lengkap?.charAt(0).toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}
