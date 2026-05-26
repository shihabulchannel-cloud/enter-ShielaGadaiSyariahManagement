import { useState, useMemo } from "react";
import { useCabang } from "@/hooks/use-cabang";
import { useSupabaseTransaksi } from "@/hooks/use-supabase-transaksi";
import { useSupabasePembayaran } from "@/hooks/use-supabase-pembayaran";
import { useSupabaseBarang } from "@/hooks/use-supabase-barang";
import { formatCurrency, getStatusTransaksiColor, getLabelStatus } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  BarChart3, Download, Printer, FileText, TrendingUp,
  TrendingDown, DollarSign, Package, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = String(new Date().getMonth() + 1).padStart(2, "0");
const NAMA_BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function LaporanPage() {
  const { toast } = useToast();
  const { selectedCabang } = useCabang();
  const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);

  const cabangId = selectedCabang?.id ?? null;
  const { data: transaksiData, loading: loadingTrx } = useSupabaseTransaksi(cabangId);
  const { data: pembayaranData, loading: loadingPay } = useSupabasePembayaran(cabangId);
  const { data: barangData, loading: loadingBrg } = useSupabaseBarang(cabangId);
  const loading = loadingTrx || loadingPay || loadingBrg;

  const getNasabahNama = (t: typeof transaksiData[0]) =>
    (t.nasabah as { nama_lengkap: string } | null)?.nama_lengkap || "-";
  const getBarangNama = (t: typeof transaksiData[0]) =>
    (t.barang as { nama_barang: string } | null)?.nama_barang || "-";

  const totalPinjaman = transaksiData.reduce((s, t) => s + t.nilai_pinjaman, 0);
  const totalUjrah = pembayaranData.filter(p => p.jenis_pembayaran === "ujrah").reduce((s, p) => s + p.jumlah, 0);
  const totalPelunasan = pembayaranData.filter(p => p.jenis_pembayaran === "pelunasan").reduce((s, p) => s + p.jumlah, 0);
  const bebanOperasional = 12500000;

  // Monthly chart data computed from real data
  const monthlyData = useMemo(() => {
    return NAMA_BULAN.map((nama, idx) => {
      const yr = parseInt(selectedYear);
      const monthTrx = transaksiData.filter(t => {
        const d = new Date(t.tanggal_gadai);
        return d.getMonth() === idx && d.getFullYear() === yr;
      });
      const monthPay = pembayaranData.filter(p => {
        const d = new Date(p.tanggal_bayar);
        return d.getMonth() === idx && d.getFullYear() === yr;
      });
      return {
        bulan: nama.slice(0, 3),
        pinjaman: monthTrx.reduce((s, t) => s + t.nilai_pinjaman, 0),
        ujrah: monthPay.filter(p => p.jenis_pembayaran === "ujrah").reduce((s, p) => s + p.jumlah, 0),
      };
    });
  }, [transaksiData, pembayaranData, selectedYear]);

  // ─── Export ─────────────────────────────────────────────────────────────────
  const downloadCSV = (rows: string[][], fileName: string) => {
    const csv = "\uFEFF" + rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const rows: string[][] = [
      ["LAPORAN KEUANGAN SHIELA GADAI SYARIAH"],
      [`Tahun: ${selectedYear}`, `Cabang: ${selectedCabang?.nama_cabang ?? "Semua Cabang"}`],
      [],
      ["LAPORAN PENDAPATAN BULANAN"],
      ["Bulan", "Pinjaman Baru (Rp)", "Ujrah Diterima (Rp)"],
      ...monthlyData.map(d => [`${d.bulan} ${selectedYear}`, String(d.pinjaman), String(d.ujrah)]),
      [],
      ["LAPORAN TRANSAKSI GADAI"],
      ["No. Transaksi", "Nasabah", "Barang", "Pinjaman (Rp)", "Ujrah/Hari (Rp)", "Status"],
      ...transaksiData.map(t => [t.nomor_transaksi, getNasabahNama(t), getBarangNama(t), String(t.nilai_pinjaman), String(t.ujrah_per_hari || Math.round(t.ujrah_per_bulan / 30)), getLabelStatus(t.status)]),
      [],
      ["LAPORAN BARANG JAMINAN"],
      ["Kode Barang", "Nama Barang", "Kategori", "Estimasi Nilai (Rp)", "Status"],
      ...barangData.map(b => [b.kode_barang, b.nama_barang, b.kategori, String(b.estimasi_nilai ?? 0), getLabelStatus(b.status)]),
      [],
      ["RINGKASAN KEUANGAN"],
      ["Total Dana Tersalurkan", String(totalPinjaman)],
      ["Total Ujrah Diterima", String(totalUjrah)],
      ["Total Pelunasan", String(totalPelunasan)],
      ["Total Beban Operasional", String(bebanOperasional)],
      ["LABA BERSIH", String(totalUjrah - bebanOperasional)],
    ];
    downloadCSV(rows, `laporan-shiela-gadai-${selectedYear}.csv`);
    toast({ title: "Excel berhasil diunduh", description: `laporan-shiela-gadai-${selectedYear}.csv` });
  };

  const handlePrint = () => window.print();
  const handleExportPDF = () => {
    toast({ title: "Membuka dialog cetak...", description: "Pilih 'Save as PDF' di dialog cetak." });
    setTimeout(() => window.print(), 400);
  };

  const yearOptions = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map(String);

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #laporan-print { display: block !important; }
          .no-print { display: none !important; }
        }
        #laporan-print { display: none; }
      `}</style>

      {/* Hidden Print View */}
      <div id="laporan-print" className="p-8 font-sans text-black bg-white">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">LAPORAN KEUANGAN</h1>
          <h2 className="text-lg font-semibold">SHIELA GADAI SYARIAH</h2>
          <p className="text-sm mt-1">Tahun {selectedYear} — {selectedCabang?.nama_cabang ?? "Semua Cabang"}</p>
          <p className="text-xs text-gray-500 mt-1">Dicetak pada: {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>
        <h3 className="font-bold mt-4 mb-2 text-base border-b pb-1">Ringkasan Keuangan</h3>
        <table className="w-full text-sm border-collapse mb-4">
          <tbody>
            {[["Total Dana Tersalurkan", formatCurrency(totalPinjaman)], ["Total Ujrah Diterima", formatCurrency(totalUjrah)], ["Total Pelunasan", formatCurrency(totalPelunasan)], ["Laba Bersih", formatCurrency(totalUjrah - bebanOperasional)]].map(([k, v]) => (
              <tr key={k} className="border-b"><td className="py-1.5 pr-4">{k}</td><td className="py-1.5 font-bold text-right">{v}</td></tr>
            ))}
          </tbody>
        </table>
        <h3 className="font-bold mt-4 mb-2 text-base border-b pb-1">Transaksi Gadai</h3>
        <table className="w-full text-xs border-collapse mb-4">
          <thead><tr className="bg-gray-100">{["No. Transaksi","Nasabah","Barang","Pinjaman","Status"].map(h=><th key={h} className="border px-2 py-1 text-left">{h}</th>)}</tr></thead>
          <tbody>{transaksiData.map(t=><tr key={t.id}><td className="border px-2 py-1">{t.nomor_transaksi}</td><td className="border px-2 py-1">{getNasabahNama(t)}</td><td className="border px-2 py-1">{getBarangNama(t)}</td><td className="border px-2 py-1 text-right">{formatCurrency(t.nilai_pinjaman)}</td><td className="border px-2 py-1">{getLabelStatus(t.status)}</td></tr>)}</tbody>
        </table>
        <h3 className="font-bold mt-4 mb-2 text-base border-b pb-1">Barang Jaminan</h3>
        <table className="w-full text-xs border-collapse">
          <thead><tr className="bg-gray-100">{["Kode","Nama Barang","Kategori","Nilai","Status"].map(h=><th key={h} className="border px-2 py-1 text-left">{h}</th>)}</tr></thead>
          <tbody>{barangData.map(b=><tr key={b.id}><td className="border px-2 py-1">{b.kode_barang}</td><td className="border px-2 py-1">{b.nama_barang}</td><td className="border px-2 py-1">{b.kategori}</td><td className="border px-2 py-1 text-right">{formatCurrency(b.estimasi_nilai ?? 0)}</td><td className="border px-2 py-1">{getLabelStatus(b.status)}</td></tr>)}</tbody>
        </table>
      </div>

      {/* Main Content */}
      <div className="space-y-6 animate-fade-in no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Laporan Keuangan</h1>
            <p className="text-muted-foreground text-sm">
              <span className="text-primary font-medium">{selectedCabang?.nama_cabang ?? "Semua Cabang"}</span>
              {" · "}
              <span className="text-primary font-medium">{NAMA_BULAN[parseInt(selectedMonth) - 1]} {selectedYear}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{NAMA_BULAN.map((b, i) => <SelectItem key={i} value={String(i+1).padStart(2,"0")}>{b}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2 h-9 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={handleExportPDF}>
              <FileText className="w-4 h-4" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-9 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" onClick={handleExportExcel}>
              <Download className="w-4 h-4" /> Excel
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2" onClick={handlePrint}>
              <Printer className="w-4 h-4" /> Print
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Dana Tersalurkan", value: formatCurrency(totalPinjaman), icon: DollarSign },
            { label: "Total Ujrah Diterima",   value: formatCurrency(totalUjrah),    icon: TrendingUp },
            { label: "Total Pelunasan",         value: formatCurrency(totalPelunasan), icon: TrendingDown },
            { label: "Barang Aktif",            value: barangData.filter(b => b.status === "aktif").length, icon: Package },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-foreground">{loading ? "—" : s.value}</p>
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

          {/* Pendapatan */}
          <TabsContent value="pendapatan" className="mt-4 space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Grafik Pendapatan Bulanan {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? "0" : `${(v/1e6).toFixed(0)}Jt`} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [formatCurrency(v), ""]} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="ujrah" name="Ujrah" fill="hsl(158, 64%, 32%)" radius={[4,4,0,0]} />
                    <Bar dataKey="pinjaman" name="Pinjaman Baru" fill="hsl(43, 96%, 50%)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                {totalPinjaman === 0 && !loading && (
                  <p className="text-center text-xs text-muted-foreground mt-2">Grafik akan terisi setelah ada data transaksi</p>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-base">Rincian Pendapatan {selectedYear}</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {["Bulan", "Pinjaman Baru", "Ujrah Diterima"].map(h => (
                          <th key={h} className={cn("text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3", h !== "Bulan" && "text-right")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {monthlyData.map(d => (
                        <tr key={d.bulan} className="hover:bg-muted/30 transition-smooth">
                          <td className="px-6 py-3 text-sm font-medium">{d.bulan} {selectedYear}</td>
                          <td className="px-6 py-3 text-sm text-right">{formatCurrency(d.pinjaman)}</td>
                          <td className="px-6 py-3 text-sm text-right text-primary font-medium">{formatCurrency(d.ujrah)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-primary/20 bg-primary/5">
                        <td className="px-6 py-3 text-sm font-bold">TOTAL</td>
                        <td className="px-6 py-3 text-sm text-right font-bold">{formatCurrency(monthlyData.reduce((s,d) => s+d.pinjaman, 0))}</td>
                        <td className="px-6 py-3 text-sm text-right font-bold text-primary">{formatCurrency(monthlyData.reduce((s,d) => s+d.ujrah, 0))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaksi */}
          <TabsContent value="transaksi" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Laporan Transaksi Gadai
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({transaksiData.length} transaksi)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {["No. Transaksi", "Nasabah", "Barang", "Pinjaman", "Ujrah/Hari", "Jatuh Tempo", "Status"].map(h => (
                            <th key={h} className={cn("text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3", (h==="Pinjaman"||h==="Ujrah/Hari") && "text-right", h==="Status" && "text-center", h==="Barang" && "hidden md:table-cell")}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {transaksiData.length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada transaksi</td></tr>
                        ) : transaksiData.map(t => (
                          <tr key={t.id} className="hover:bg-muted/30 transition-smooth">
                            <td className="px-4 py-3 text-sm font-medium text-primary">{t.nomor_transaksi}</td>
                            <td className="px-4 py-3 text-sm">{getNasabahNama(t)}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{getBarangNama(t)}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(t.nilai_pinjaman)}</td>
                            <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatCurrency(t.ujrah_per_hari || Math.round(t.ujrah_per_bulan / 30))}/hari</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{t.tanggal_jatuh_tempo}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusTransaksiColor(t.status as "aktif" | "diperpanjang" | "lunas" | "macet" | "lelang"))}>{getLabelStatus(t.status)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Barang */}
          <TabsContent value="barang" className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Aktif",        count: barangData.filter(b => b.status==="aktif").length,        color: "bg-primary/10 text-primary" },
                { label: "Ditebus",      count: barangData.filter(b => b.status==="ditebus").length,      color: "bg-emerald-500/10 text-emerald-600" },
                { label: "Jatuh Tempo",  count: barangData.filter(b => b.status==="jatuh_tempo").length,  color: "bg-orange-500/10 text-orange-600" },
                { label: "Dilelang",     count: barangData.filter(b => b.status==="dilelang").length,     color: "bg-destructive/10 text-destructive" },
              ].map(s => (
                <div key={s.label} className={cn("p-4 rounded-xl border border-border", s.color)}>
                  <p className="text-3xl font-bold">{loading ? "—" : s.count}</p>
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
                          <th key={h} className={cn("text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3", h==="Estimasi Nilai" && "text-right", h==="Status" && "text-center")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {barangData.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada data barang</td></tr>
                      ) : barangData.map(b => (
                        <tr key={b.id} className="hover:bg-muted/30 transition-smooth">
                          <td className="px-4 py-3 text-xs font-mono text-primary">{b.kode_barang}</td>
                          <td className="px-4 py-3 text-sm">{b.nama_barang}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{b.kategori}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(b.estimasi_nilai ?? 0)}</td>
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

          {/* Laba Rugi */}
          <TabsContent value="laba" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Laporan Laba Rugi — {NAMA_BULAN[parseInt(selectedMonth)-1]} {selectedYear}</CardTitle>
              </CardHeader>
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
                      <div className="flex justify-between border-t border-border pt-2 font-bold"><span>Total Beban</span><span className="text-destructive">{formatCurrency(bebanOperasional)}</span></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl gradient-primary text-primary-foreground">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">LABA BERSIH</span>
                      <span className="font-bold text-2xl">{formatCurrency(totalUjrah - bebanOperasional)}</span>
                    </div>
                    <p className="text-xs opacity-70 mt-1">{NAMA_BULAN[parseInt(selectedMonth)-1]} {selectedYear}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
