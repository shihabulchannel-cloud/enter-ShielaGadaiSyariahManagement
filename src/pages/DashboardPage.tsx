import { useCabang } from "@/hooks/use-cabang";
import { useSupabaseNasabah } from "@/hooks/use-supabase-nasabah";
import { useSupabaseBarang } from "@/hooks/use-supabase-barang";
import { useSupabaseTransaksi } from "@/hooks/use-supabase-transaksi";
import { useSupabaseCabang } from "@/hooks/use-supabase-cabang";
import { formatCurrency, formatDate, getStatusTransaksiColor, getLabelStatus } from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  TrendingUp, Users, Package, Building2,
  AlertTriangle, CheckCircle, Clock, HandCoins, Loader2, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Static chart data — filled in as you accumulate real monthly data
const chartDataPendapatan = [
  { bulan: "Jan", pendapatan: 0 }, { bulan: "Feb", pendapatan: 0 }, { bulan: "Mar", pendapatan: 0 },
  { bulan: "Apr", pendapatan: 0 }, { bulan: "Mei", pendapatan: 0 }, { bulan: "Jun", pendapatan: 0 },
];

const chartDataTransaksi = [
  { bulan: "Jan", masuk: 0, lunas: 0 }, { bulan: "Feb", masuk: 0, lunas: 0 },
  { bulan: "Mar", masuk: 0, lunas: 0 }, { bulan: "Apr", masuk: 0, lunas: 0 },
  { bulan: "Mei", masuk: 0, lunas: 0 }, { bulan: "Jun", masuk: 0, lunas: 0 },
];

export default function DashboardPage() {
  const { selectedCabang, setSelectedCabang } = useCabang();
  const cabangFilter = selectedCabang?.id ?? null;

  const { data: transaksiList, loading: loadingTrx } = useSupabaseTransaksi(cabangFilter);
  const { data: nasabahList,   loading: loadingNsb } = useSupabaseNasabah(cabangFilter);
  const { data: barangList,    loading: loadingBrg } = useSupabaseBarang(cabangFilter);
  const { data: cabangList,    loading: loadingCbg } = useSupabaseCabang();

  const loading = loadingTrx || loadingNsb || loadingBrg || loadingCbg;

  const now = Date.now();
  const gadaiAktif  = transaksiList.filter(t => t.status === "aktif" || t.status === "diperpanjang").length;
  const totalNasabah = nasabahList.length;
  const jatuhTempo  = transaksiList.filter(t => {
    const diff = (new Date(t.tanggal_jatuh_tempo).getTime() - now) / 86400000;
    return diff <= 7 && diff >= 0 && (t.status === "aktif" || t.status === "diperpanjang");
  }).length;
  const macet       = transaksiList.filter(t => t.status === "macet").length;
  const lunas       = transaksiList.filter(t => t.status === "lunas").length;
  const totalPinjaman = transaksiList
    .filter(t => t.status === "aktif" || t.status === "diperpanjang")
    .reduce((sum, t) => sum + t.nilai_pinjaman, 0);

  const getNasabahNama = (t: typeof transaksiList[0]) =>
    (t.nasabah as { nama_lengkap: string } | null)?.nama_lengkap || "-";
  const getBarangNama = (t: typeof transaksiList[0]) =>
    (t.barang as { nama_barang: string } | null)?.nama_barang || "-";

  const recentTransaksi = transaksiList.slice(0, 5);

  const statCards = [
    {
      title: "Gadai Aktif",
      value: gadaiAktif,
      icon: HandCoins,
      change: "",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Total Nasabah",
      value: totalNasabah,
      icon: Users,
      change: "",
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "Jatuh Tempo (7hr)",
      value: jatuhTempo,
      icon: Clock,
      change: "",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Transaksi Macet",
      value: macet,
      icon: AlertTriangle,
      change: "",
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Cabang Selector — visible on all screen sizes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-9 border-primary/30 text-primary hover:bg-primary/5">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium max-w-40 truncate">
                  {selectedCabang ? selectedCabang.nama_cabang : "Semua Cabang"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Pilih Cabang</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedCabang(null)} className={cn("gap-2 cursor-pointer", !selectedCabang && "text-primary font-medium")}>
                <Building2 className="w-4 h-4" /> Semua Cabang
              </DropdownMenuItem>
              {cabangList.map(c => (
                <DropdownMenuItem key={c.id} onClick={() => setSelectedCabang(c as Parameters<typeof setSelectedCabang>[0])} className={cn("gap-2 cursor-pointer", selectedCabang?.id === c.id && "text-primary font-medium")}>
                  <Building2 className="w-4 h-4" /> {c.nama_cabang}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {loading && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
                  <s.icon className={cn("w-5 h-5", s.color)} />
                </div>
              </div>
              <p className={cn("text-2xl sm:text-3xl font-bold", s.color)}>{loading ? "—" : s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total Pinjaman + Cabang + Lunas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-l-4 border-l-primary sm:col-span-1">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Pinjaman Aktif</p>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-primary">{loading ? "—" : formatCurrency(totalPinjaman)}</p>
            <p className="text-xs text-muted-foreground mt-1">{gadaiAktif} transaksi aktif</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Jumlah Cabang</p>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{loading ? "—" : cabangList.length}</p>
            <p className="text-xs text-muted-foreground mt-1">cabang aktif</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Transaksi Lunas</p>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">{loading ? "—" : lunas}</p>
            <p className="text-xs text-muted-foreground mt-1">total diselesaikan</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tren Pendapatan 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartDataPendapatan}>
                <defs>
                  <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => v === 0 ? "0" : `${(v/1e6).toFixed(0)}Jt`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="pendapatan" stroke="hsl(var(--primary))" fill="url(#colorPendapatan)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            {totalPinjaman === 0 && !loading && (
              <p className="text-center text-xs text-muted-foreground mt-2">Grafik akan terisi setelah ada data transaksi</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transaksi Masuk vs Lunas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartDataTransaksi}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip />
                <Bar dataKey="masuk" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Masuk" />
                <Bar dataKey="lunas" fill="hsl(var(--gold))" radius={[4,4,0,0]} name="Lunas" />
              </BarChart>
            </ResponsiveContainer>
            {transaksiList.length === 0 && !loading && (
              <p className="text-center text-xs text-muted-foreground mt-2">Grafik akan terisi setelah ada data transaksi</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
            <span className="text-xs text-muted-foreground">{transaksiList.length} total transaksi</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
            </div>
          ) : recentTransaksi.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <HandCoins className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Belum ada transaksi. Mulai tambah transaksi di menu Transaksi Gadai.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">No. Transaksi</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Nasabah</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Barang</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Pinjaman</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Jatuh Tempo</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentTransaksi.map((t) => {
                    const diff = (new Date(t.tanggal_jatuh_tempo).getTime() - now) / 86400000;
                    const soonExpire = diff <= 7 && diff >= 0 && (t.status === "aktif" || t.status === "diperpanjang");
                    return (
                      <tr key={t.id} className={cn("hover:bg-muted/30 transition-smooth", soonExpire && "bg-orange-500/5")}>
                        <td className="px-4 py-3.5">
                          <div>
                            <span className="text-sm font-medium text-primary">{t.nomor_transaksi}</span>
                            {soonExpire && <span className="ml-2 text-xs text-orange-500 font-medium">Segera JT</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-sm text-foreground">{getNasabahNama(t)}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground truncate max-w-[120px] block">{getBarangNama(t)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-sm font-semibold">{formatCurrency(t.nilai_pinjaman)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">{formatDate(t.tanggal_jatuh_tempo)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusTransaksiColor(t.status as "aktif" | "diperpanjang" | "lunas" | "macet" | "lelang"))}>
                            {getLabelStatus(t.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
