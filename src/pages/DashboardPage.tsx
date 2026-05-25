import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  HandCoins, Users, TrendingUp, AlertTriangle,
  Clock, Banknote, Building2, Activity
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  chartDataPendapatan, chartDataTransaksi, dummyTransaksi,
  formatCurrency, formatDate, getStatusTransaksiColor, getLabelStatus
} from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Selamat datang, <span className="text-primary font-medium">{profile?.nama_lengkap || "Admin"}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Cabang</SelectItem>
              <SelectItem value="cbg-001">Cabang Pusat</SelectItem>
              <SelectItem value="cbg-002">Bandung</SelectItem>
              <SelectItem value="cbg-003">Surabaya</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Activity className="w-4 h-4" />
            Hari Ini
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Gadai Aktif"
          value="142"
          subtitle="Transaksi berjalan"
          icon={HandCoins}
          variant="primary"
          trend={{ value: 8.2, label: "vs bulan lalu" }}
        />
        <StatsCard
          title="Total Pinjaman"
          value="Rp 1,2M"
          subtitle="Dana tersalurkan"
          icon={Banknote}
          variant="gold"
          trend={{ value: 12.5, label: "vs bulan lalu" }}
        />
        <StatsCard
          title="Jatuh Tempo"
          value="18"
          subtitle="Perlu tindak lanjut"
          icon={Clock}
          variant="warning"
          trend={{ value: -3, label: "vs minggu lalu" }}
        />
        <StatsCard
          title="Barang Macet"
          value="7"
          subtitle="Perlu perhatian"
          icon={AlertTriangle}
          variant="danger"
          trend={{ value: 2, label: "baru hari ini" }}
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pemasukan Ujrah"
          value="Rp 52,4Jt"
          subtitle="Bulan Mei 2024"
          icon={TrendingUp}
          trend={{ value: 6.8, label: "vs April" }}
        />
        <StatsCard
          title="Total Nasabah"
          value="1.247"
          subtitle="Nasabah terdaftar"
          icon={Users}
          trend={{ value: 4.1, label: "baru bulan ini" }}
        />
        <StatsCard
          title="Transaksi Hari Ini"
          value="23"
          subtitle="8 gadai baru, 15 bayar"
          icon={Activity}
        />
        <StatsCard
          title="Jumlah Cabang"
          value="4"
          subtitle="Cabang aktif"
          icon={Building2}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Grafik Pendapatan Bulanan</CardTitle>
              <Select defaultValue="2024">
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartDataPendapatan} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="ujrahGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(158, 64%, 32%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(158, 64%, 32%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pinjamanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(43, 96%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(43, 96%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Jt`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(v: number) => [formatCurrency(v), ""]}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area
                  type="monotone"
                  dataKey="ujrah"
                  name="Ujrah"
                  stroke="hsl(158, 64%, 32%)"
                  strokeWidth={2}
                  fill="url(#ujrahGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="pinjaman"
                  name="Pinjaman Baru"
                  stroke="hsl(43, 96%, 50%)"
                  strokeWidth={2}
                  fill="url(#pinjamanGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Transaction Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Transaksi Minggu Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartDataTransaksi} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="hari" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="aktif" name="Aktif" fill="hsl(158, 64%, 32%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="lunas" name="Lunas" fill="hsl(43, 96%, 50%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="macet" name="Macet" fill="hsl(0, 84%, 60%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Transaksi Terbaru</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary text-sm h-8">
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">No. Transaksi</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Nasabah</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Barang</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Pinjaman</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Jatuh Tempo</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dummyTransaksi.slice(0, 6).map((trx) => (
                  <tr key={trx.id} className="hover:bg-muted/30 transition-smooth">
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-medium text-primary">{trx.nomor_transaksi}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-foreground">{trx.nasabah_nama}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground truncate max-w-[140px] block">{trx.barang_nama}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-foreground">{formatCurrency(trx.nilai_pinjaman)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">{formatDate(trx.tanggal_jatuh_tempo)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        getStatusTransaksiColor(trx.status)
                      )}>
                        {getLabelStatus(trx.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
