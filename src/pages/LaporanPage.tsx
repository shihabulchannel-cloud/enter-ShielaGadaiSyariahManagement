import { useState } from "react";
import {
  dummyTransaksi, dummyPembayaran, dummyBarang,
  chartDataPendapatan, formatCurrency, getStatusTransaksiColor, getLabelStatus,
} from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from "recharts";
import {
  BarChart3, Download, Printer, FileText, TrendingUp,
  TrendingDown, DollarSign, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function LaporanPage() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("05");

  const totalPinjaman = dummyTransaksi.reduce((s, t) => s + t.nilai_pinjaman, 0);
  const totalUjrah = dummyPembayaran.filter(p => p.jenis_pembayaran === "ujrah").reduce((s, p) => s + p.jumlah, 0);
  const totalPelunasan = dummyPembayaran.filter(p => p.jenis_pembayaran === "pelunasan").reduce((s, p) => s + p.jumlah, 0);

  const handleExport = (format: string) => {
    toast({ title: "Ekspor", description: `Laporan sedang diunduh dalam format ${format}.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan Keuangan</h1>
          <p className="text-muted-foreground text-sm">Rekap data operasional</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2 h-9" onClick={() => handleExport("PDF")}>
            <FileText className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2 h-9" onClick={() => handleExport("Excel")}>
            <Download className="w-4 h-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={() => handleExport("Print")}>
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Dana Tersalurkan", value: formatCurrency(totalPinjaman), icon: DollarSign, trend: "+12.5%", up: true },
          { label: "Total Ujrah Diterima", value: formatCurrency(totalUjrah), icon: TrendingUp, trend: "+8.3%", up: true },
          { label: "Total Pelunasan", value: formatCurrency(totalPelunasan), icon: TrendingDown, trend: "+5.1%", up: true },
          { label: "Barang Aktif", value: dummyBarang.filter(b => b.status === "aktif").length, icon: Package, trend: "+3", up: true },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className={cn("text-xs mt-1 font-medium", s.up ? "text-primary" : "text-destructive")}>
                  {s.trend} vs tahun lalu
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="pendapatan">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="pendapatan">Pendapatan</TabsTrigger>
          <TabsTrigger value="transaksi">Transaksi</TabsTrigger>
          <TabsTrigger value="barang">Barang</TabsTrigger>
          <TabsTrigger value="laba">Laba Rugi</TabsTrigger>
        </TabsList>

        {/* Pendapatan Tab */}
        <TabsContent value="pendapatan" className="mt-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Grafik Pendapatan Bulanan {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartDataPendapatan} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Jt`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }} formatter={(v: number) => [formatCurrency(v), ""]} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="ujrah" name="Ujrah" fill="hsl(158, 64%, 32%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pinjaman" name="Pinjaman Baru" fill="hsl(43, 96%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Rincian Pendapatan</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Bulan", "Pinjaman Baru", "Ujrah Diterima", "% Ujrah"].map(h => (
                        <th key={h} className={cn("text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3", h !== "Bulan" && "text-right")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {chartDataPendapatan.map((d) => (
                      <tr key={d.bulan} className="hover:bg-muted/30 transition-smooth">
                        <td className="px-6 py-3 text-sm font-medium">{d.bulan} {selectedYear}</td>
                        <td className="px-6 py-3 text-sm text-right">{formatCurrency(d.pinjaman)}</td>
                        <td className="px-6 py-3 text-sm text-right text-primary font-medium">{formatCurrency(d.ujrah)}</td>
                        <td className="px-6 py-3 text-sm text-right text-muted-foreground">{((d.ujrah / d.pinjaman) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-primary/20 bg-primary/5">
                      <td className="px-6 py-3 text-sm font-bold">TOTAL</td>
                      <td className="px-6 py-3 text-sm text-right font-bold">{formatCurrency(chartDataPendapatan.reduce((s,d)=>s+d.pinjaman,0))}</td>
                      <td className="px-6 py-3 text-sm text-right font-bold text-primary">{formatCurrency(chartDataPendapatan.reduce((s,d)=>s+d.ujrah,0))}</td>
                      <td className="px-6 py-3 text-sm text-right text-muted-foreground">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaksi Tab */}
        <TabsContent value="transaksi" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Laporan Transaksi Gadai</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["No. Transaksi", "Nasabah", "Barang", "Pinjaman", "Ujrah/Bln", "Status"].map(h => (
                        <th key={h} className={cn("text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3", h === "Pinjaman" || h === "Ujrah/Bln" ? "text-right" : "", h === "Status" ? "text-center" : "", ["Barang"].includes(h) && "hidden md:table-cell")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dummyTransaksi.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-smooth">
                        <td className="px-4 py-3 text-sm font-medium text-primary">{t.nomor_transaksi}</td>
                        <td className="px-4 py-3 text-sm">{t.nasabah_nama}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{t.barang_nama}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(t.nilai_pinjaman)}</td>
                        <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatCurrency(t.ujrah_per_bulan)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusTransaksiColor(t.status))}>{getLabelStatus(t.status)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Barang Tab */}
        <TabsContent value="barang" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Aktif", count: dummyBarang.filter(b=>b.status==="aktif").length, color: "bg-primary/10 text-primary" },
              { label: "Ditebus", count: dummyBarang.filter(b=>b.status==="ditebus").length, color: "bg-emerald-500/10 text-emerald-600" },
              { label: "Jatuh Tempo", count: dummyBarang.filter(b=>b.status==="jatuh_tempo").length, color: "bg-orange-500/10 text-orange-600" },
              { label: "Dilelang", count: dummyBarang.filter(b=>b.status==="dilelang").length, color: "bg-destructive/10 text-destructive" },
            ].map(s => (
              <div key={s.label} className={cn("p-4 rounded-xl border border-border", s.color)}>
                <p className="text-3xl font-bold">{s.count}</p>
                <p className="text-sm font-medium opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Laporan Barang Jaminan</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Kode", "Barang", "Kategori", "Estimasi Nilai", "Status"].map(h => (
                        <th key={h} className={cn("text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3", h==="Estimasi Nilai"&&"text-right", h==="Status"&&"text-center")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dummyBarang.map(b => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-smooth">
                        <td className="px-4 py-3 text-xs font-mono text-primary">{b.kode_barang}</td>
                        <td className="px-4 py-3 text-sm">{b.nama_barang}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{getLabelStatus(b.kategori)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(b.estimasi_nilai)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusTransaksiColor(b.status as never))}>{getLabelStatus(b.status)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Laba Rugi Tab */}
        <TabsContent value="laba" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Laporan Laba Rugi Sederhana</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-3">PENDAPATAN</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Pendapatan Ujrah</span><span className="font-semibold text-primary">{formatCurrency(totalUjrah)}</span></div>
                    <div className="flex justify-between"><span>Pendapatan Lain-lain</span><span className="font-semibold">Rp 0</span></div>
                    <div className="flex justify-between border-t border-border pt-2 font-bold"><span>Total Pendapatan</span><span className="text-primary">{formatCurrency(totalUjrah)}</span></div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <h3 className="font-semibold text-foreground mb-3">BEBAN OPERASIONAL</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Beban Gaji</span><span className="font-semibold text-destructive">{formatCurrency(8000000)}</span></div>
                    <div className="flex justify-between"><span>Beban Sewa</span><span className="font-semibold text-destructive">{formatCurrency(3000000)}</span></div>
                    <div className="flex justify-between"><span>Beban Operasional Lain</span><span className="font-semibold text-destructive">{formatCurrency(1500000)}</span></div>
                    <div className="flex justify-between border-t border-border pt-2 font-bold"><span>Total Beban</span><span className="text-destructive">{formatCurrency(12500000)}</span></div>
                  </div>
                </div>
                <div className="p-4 rounded-xl gradient-primary text-primary-foreground">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">LABA BERSIH</span>
                    <span className="font-bold text-2xl">{formatCurrency(totalUjrah - 12500000)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
