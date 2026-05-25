import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Moon, Sun, Search, ChevronDown, Building2, Menu, CheckCheck, X, Users, Package, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useCabang } from "@/hooks/use-cabang";
import { dummyCabang, dummyNasabah, dummyBarang, dummyTransaksi } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

const initialNotifications = [
  { id: 1, type: "warning", message: "3 transaksi jatuh tempo minggu ini", time: "5 mnt lalu", read: false },
  { id: 2, type: "error",   message: "2 nasabah macet belum membayar ujrah", time: "1 jam lalu", read: false },
  { id: 3, type: "info",    message: "Pembayaran dari Budi Raharjo diterima", time: "2 jam lalu", read: false },
  { id: 4, type: "warning", message: "Barang BRG-2026-003 mendekati jatuh tempo", time: "3 jam lalu", read: false },
];

function getLocalList<T>(key: string, fallback: T[]): T[] {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T[]) : fallback;
  } catch { return fallback; }
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const { selectedCabang, setSelectedCabang } = useCabang();

  const [notifs, setNotifs] = useState(initialNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search across all data from localStorage
  const searchResults = (() => {
    if (searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase();
    const nasabahList = getLocalList("shiela-nasabah", dummyNasabah);
    const barangList = getLocalList("shiela-barang", dummyBarang);
    const transaksiList = getLocalList("shiela-transaksi", dummyTransaksi);

    const results: Array<{ type: string; icon: typeof Users; label: string; sub: string; path: string }> = [];

    nasabahList
      .filter(n => n.nama_lengkap.toLowerCase().includes(q) || n.nik?.includes(q) || n.nomor_hp?.includes(q))
      .slice(0, 3)
      .forEach(n => results.push({ type: "Nasabah", icon: Users, label: n.nama_lengkap, sub: n.nik || n.nomor_hp || "", path: "/nasabah" }));

    barangList
      .filter(b => b.nama_barang.toLowerCase().includes(q) || b.kode_barang.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(b => results.push({ type: "Barang", icon: Package, label: b.nama_barang, sub: b.kode_barang, path: "/barang" }));

    (transaksiList as typeof dummyTransaksi)
      .filter(t => t.nomor_transaksi.toLowerCase().includes(q) || (t.nasabah_nama || "").toLowerCase().includes(q) || (t.barang_nama || "").toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(t => results.push({ type: "Transaksi", icon: HandCoins, label: t.nomor_transaksi, sub: t.nasabah_nama || "", path: "/transaksi" }));

    return results;
  })();

  const handleSearchSelect = (path: string) => {
    navigate(path);
    setShowResults(false);
    setSearchQuery("");
  };

  const markRead = (id: number) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const removeNotif = (id: number, e: React.MouseEvent) => { e.stopPropagation(); setNotifs(p => p.filter(n => n.id !== id)); };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-4 sticky top-0 z-30">
      <button onClick={onMobileMenuToggle} className="md:hidden text-muted-foreground hover:text-foreground transition-smooth">
        <Menu className="w-5 h-5" />
      </button>

      {/* Global Search */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowResults(e.target.value.length >= 2); }}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            placeholder="Cari nasabah, barang, transaksi..."
            className="w-full pl-9 pr-4 h-9 rounded-md border border-input bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setShowResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full mt-1.5 w-full bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tidak ada hasil untuk <span className="font-medium">"{searchQuery}"</span>
              </div>
            ) : (
              <>
                <div className="px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border">
                  {searchResults.length} hasil ditemukan
                </div>
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearchSelect(r.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-smooth text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <r.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">{r.type}</Badge>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Cabang Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9 hidden sm:flex border-border/60">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium hidden md:inline max-w-36 truncate">
                {selectedCabang ? selectedCabang.nama_cabang : "Semua Cabang"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Pilih Cabang</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectedCabang(null)} className={cn("gap-2 cursor-pointer", !selectedCabang && "text-primary font-medium")}>
              <Building2 className="w-4 h-4" /> Semua Cabang
            </DropdownMenuItem>
            {dummyCabang.map(c => (
              <DropdownMenuItem key={c.id} onClick={() => setSelectedCabang(c)} className={cn("gap-2 cursor-pointer", selectedCabang?.id === c.id && "text-primary font-medium")}>
                <Building2 className="w-4 h-4" /> {c.nama_cabang}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dark Mode */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9 text-muted-foreground hover:text-foreground">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-9 h-9 relative text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">{unreadCount}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifikasi</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} baru</Badge>}
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary" onClick={markAllRead}>
                    <CheckCheck className="w-3 h-3 mr-1" /> Baca semua
                  </Button>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifs.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">Tidak ada notifikasi</div>
            ) : notifs.map(notif => (
              <DropdownMenuItem key={notif.id} onClick={() => markRead(notif.id)} className={cn("flex items-start gap-2 p-3 cursor-pointer group", notif.read && "opacity-60")}>
                <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", notif.read && "opacity-0", notif.type === "warning" && "bg-gold", notif.type === "error" && "bg-destructive", notif.type === "info" && "bg-primary")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
                </div>
                <button onClick={e => removeNotif(notif.id, e)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuItem>
            ))}
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
