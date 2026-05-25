import { useState } from "react";
import { Bell, Moon, Sun, Search, ChevronDown, Building2, Menu, CheckCheck, X } from "lucide-react";
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
import { useCabang } from "@/hooks/use-cabang";
import { dummyCabang } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

const initialNotifications = [
  { id: 1, type: "warning", message: "3 transaksi jatuh tempo minggu ini", time: "5 mnt lalu", read: false },
  { id: 2, type: "error", message: "2 nasabah macet belum membayar ujrah", time: "1 jam lalu", read: false },
  { id: 3, type: "info", message: "Pembayaran dari Budi Raharjo diterima", time: "2 jam lalu", read: false },
  { id: 4, type: "warning", message: "Barang BRG-2026-003 mendekati jatuh tempo", time: "3 jam lalu", read: false },
];

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const { selectedCabang, setSelectedCabang } = useCabang();
  const [notifs, setNotifs] = useState(initialNotifications);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead = (id: number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotif = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const displayCabang = selectedCabang ? selectedCabang.nama_cabang : "Semua Cabang";

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
              <span className="text-sm font-medium hidden md:inline max-w-36 truncate">
                {displayCabang}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Pilih Cabang</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setSelectedCabang(null)}
              className={cn("gap-2 cursor-pointer", !selectedCabang && "text-primary font-medium")}
            >
              <Building2 className="w-4 h-4" />
              Semua Cabang
            </DropdownMenuItem>
            {dummyCabang.map((cabang) => (
              <DropdownMenuItem
                key={cabang.id}
                onClick={() => setSelectedCabang(cabang)}
                className={cn(
                  "gap-2 cursor-pointer",
                  selectedCabang?.id === cabang.id && "text-primary font-medium"
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
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifikasi</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">{unreadCount} baru</Badge>
                )}
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-primary"
                    onClick={markAllRead}
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Baca semua
                  </Button>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifs.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tidak ada notifikasi
              </div>
            ) : (
              notifs.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={cn(
                    "flex items-start gap-2 p-3 cursor-pointer group",
                    notif.read && "opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      notif.read && "opacity-0",
                      notif.type === "warning" && "bg-gold",
                      notif.type === "error" && "bg-destructive",
                      notif.type === "info" && "bg-primary"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
                  </div>
                  <button
                    onClick={(e) => removeNotif(notif.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-primary text-sm font-medium justify-center cursor-pointer">
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
