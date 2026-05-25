import { useState, useMemo } from "react";
import { dummyTransaksi, dummyPembayaran, formatCurrency } from "@/lib/dummy-data";
import { useCabang } from "@/hooks/use-cabang";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, Download, FileText, Printer, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const CURRENT_YEAR = new Date().getFullYear();

// Monthly cash flow data for 2026
const MONTHLY_DATA = [
  { bulan: "Jan", masuk: 28500000, keluar: 12500000 },
  { bulan: "Feb", masuk: 34200000, keluar: 13200000 },
  { bulan: "Mar", masuk: 41000000, keluar: 13800000 },
  { bulan: "Apr", masuk: 38700000, keluar: 12900000 },
  { bulan: "Mei", masuk: 45300000, keluar: 14100000 },
  { bulan: "Jun", masuk: 52100000, keluar: 15000000 },
  { bulan: "Jul", masuk: 0, keluar: 0 },
  { bulan: "Agu", masuk: 0, keluar: 0 },
  { bulan: "Sep", masuk: 0, keluar: 0 },
  { bulan: "Okt", masuk: 0, keluar: 0 },
  { bulan: "Nov", masuk: 0, keluar: 0 },
  { bulan: "Des", masuk: 0, keluar: 0 },
].map(d => ({ ...d, neto: d.masuk - d.keluar }));

const DETAIL_ROWS = [
  { kategori: "ARUS KAS MASUK", isHeader: true },
  { kategori: "Penerimaan Pinjaman Gadai", jan: 18000000, feb: 22000000, mar: 27000000, apr: 24000000, mei: 29000000, jun: 34000000 },
  { kategori: "Ujrah/Biaya Pemeliharaan", jan: 5500000, feb: 6200000, mar: 7500000, apr: 7200000, mei: 8300000, jun: 9600000 },
  { kategori: "Perpanjangan Akad", jan: 3000000, feb: 4000000, mar: 4500000, apr: 5500000, mei: 6000000, jun: 6500000 },
  { kategori: "Pelunasan Barang", jan: 2000000, feb: 2000000, mar: 2000000, apr: 2000000, mei: 2000000, jun: 2000000 },
  { kategori: "TOTAL MASUK", isTotal: true, jan: 28500000, feb: 34200000, mar: 41000000, apr: 38700000, mei: 45300000, jun: 52100000 },
  { kategori: "ARUS KAS KELUAR", isHeader: true },
  { kategori: "Beban Gaji Karyawan", jan: 8000000, feb: 8000000, mar: 8000000, apr: 8000000, mei: 8000000, jun: 8500000 },
  { kategori: "Beban Sewa Tempat", jan: 3000000, feb: 3000000, mar: 3500000, apr: 3500000, mei: 3500000, jun: 4000000 },
  { kategori: "Beban Operasional Lain", jan: 1500000, feb: 2200000, mar: 2300000, apr: 1400000, mei: 2600000, jun: 2500000 },
  { kategori: "TOTAL KELUAR", isTotal: true, jan: 12500000, feb: 13200000, mar: 13800000, apr: 12900000, mei: 14100000, jun: 15000000 },
  { kategori: "ARUS KAS NETO", isNeto: true, jan: 16000000, feb: 21000000, mar: 27200000, apr: 25800000, mei: 31200000, jun: 37100000 },
];

const cols = ["jan","feb","mar","apr","mei","jun"] as const;

export default function ArusKasPage() {
  const { toast } = useToast();
  const { selectedCabang } = useCabang();
  const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));

  const [transaksiList] = useLocalStorage("shiela-transaksi", dummyTransaksi);
  const [pembayaranList] = useLocalStorage("shiela-pembayaran", dummyPembayaran);

  const totalMasuk = MONTHLY_DATA.reduce((s, d) => s + d.masuk, 0);
  const totalKeluar = MONTHLY_DATA.reduce((s, d) => s + d.keluar, 0);
  const totalNeto = totalMasuk - totalKeluar;

  // CSV export helper
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
      ["LAPORAN ARUS KAS — SHIELA GADAI SYARIAH"],
      [`Tahun: ${selectedYear}`, `Cabang: ${selectedCabang?.nama_cabang ?? "Semua Cabang"}`],
      [],
      ["Kategori", "Januari","Februari","Maret","April","Mei","Juni","TOTAL"],
      ...DETAIL_ROWS.filter(r => !r.isHeader).map(r => {
        if (r.isTotal || r.isNeto) {
          const vals = cols.map(c => String((r as Record<string, number>)[c] || 0));
          const total = cols.reduce((s, c) => s + ((r as Record<string, number>)[c] || 0), 0);
          return [r.kategori, ...vals, String(total)];
        }
        const vals = cols.map(c => String((r as Record<string, number>)[c] || 0));
        const total = cols.reduce((s, c) => s + ((r as Record<string, number>)[c] || 0), 0);
        return [r.kategori, ...vals, String(total)];
      }),
      [],
      ["RINGKASAN"],
      ["Total Kas Masuk", String(totalMasuk)],
      ["Total Kas Keluar", String(totalKeluar)],
      ["Arus Kas Neto", String(totalNeto)],
    ];
    downloadCSV(rows, `arus-kas-${selectedYear}.csv`);
    toast({ title: "Excel diunduh", description: `arus-kas-${selectedYear}.csv` });
  };

  const handlePrint = () => window.print();
  const handlePDF = () => {
    toast({ title: "Membuka dialog cetak...", description: "Pilih 'Save as PDF' untuk menyimpan sebagai PDF." });
    setTimeout(() => window.print(), 400);
  };

  const fmtShort = (v: number) => v === 0 ? "-" : `${(v/1000000).toFixed(1)}Jt`;

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #arus-kas-print { display: block !important; }
          .no-print { display: none !important; }
        }
        #arus-kas-print { display: none; }
      `}</style>

      {/* Print view */}
      <div id="arus-kas-print" className="p-8 font-sans text-black bg-white">
        <div className="text-center mb-6 border-b-2 pb-4">
          <h1 className="text-xl font-bold">LAPORAN ARUS KAS</h1>
          <h2 className="text-base">SHIELA GADAI SYARIAH</h2>
          <p className="text-sm">Tahun {selectedYear} — {selectedCabang?.nama_cabang ?? "Semua Cabang"}</p>
          <p className="text-xs text-gray-500">Dicetak: {new Date().toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" })}</p>
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1.5 text-left">Kategori</th>
              {["Jan","Feb","Mar","Apr","Mei","Jun"].map(m => <th key={m} className="border px-2 py-1.5 text-right">{m}</th>)}
              <th className="border px-2 py-1.5 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {DETAIL_ROWS.map((row, i) => {
              if (row.isHeader) return <tr key={i}><td colSpan={8} className="border px-2 py-1 font-bold bg-gray-50">{row.kategori}</td></tr>;
              const vals = cols.map(c => (row as Record<string, number>)[c] || 0);
              const total = vals.reduce((s, v) => s + v, 0);
              return (
                <tr key={i} className={cn(row.isTotal && "bg-gray-50 font-bold", row.isNeto && "bg-green-50 font-bold")}>
                  <td className="border px-2 py-1 pl-4">{row.kategori}</td>
                  {vals.map((v, j) => <td key={j} className="border px-2 py-1 text-right">{v === 0 ? "-" : v.toLocaleString("id-ID")}</td>)}
                  <td className="border px-2 py-1 text-right font-bold">{total.toLocaleString("id-ID")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          {[["Total Kas Masuk", totalMasuk, "text-green-700"], ["Total Kas Keluar", totalKeluar, "text-red-600"], ["Arus Kas Neto", totalNeto, "text-blue-700"]].map(([l, v, c]) => (
            <div key={String(l)} className="border rounded p-3 text-center">
              <p className="text-gray-500 text-xs">{String(l)}</p>
              <p className={cn("font-bold text-base", String(c))}>{formatCurrency(Number(v))}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 animate-fade-in no-print">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Arus Kas</h1>
            <p className="text-muted-foreground text-sm">
              Laporan cash flow — <span className="text-primary font-medium">{selectedCabang?.nama_cabang ?? "Semua Cabang"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[CURRENT_YEAR, CURRENT_YEAR-1, CURRENT_YEAR-2].map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2 h-9 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={handlePDF}>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground font-medium">Total Kas Masuk</p>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalMasuk)}</p>
              <p className="text-xs text-primary mt-1 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +18.5% vs tahun lalu
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-destructive">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground font-medium">Total Kas Keluar</p>
                <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-destructive" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalKeluar)}</p>
              <p className="text-xs text-destructive mt-1 font-medium flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> +8.2% vs tahun lalu
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-gold">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground font-medium">Arus Kas Neto</p>
                <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-gold" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalNeto)}</p>
              <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 text-xs">Surplus</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Grafik Arus Kas Bulanan {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={MONTHLY_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="masukGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(158, 64%, 32%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(158, 64%, 32%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="keluarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="netoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(43, 96%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(43, 96%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? "0" : `${(v/1000000).toFixed(0)}Jt`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }}
                  formatter={(v: number) => [v === 0 ? "Belum ada data" : formatCurrency(v), ""]}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area type="monotone" dataKey="masuk" name="Kas Masuk" stroke="hsl(158, 64%, 32%)" strokeWidth={2} fill="url(#masukGrad)" />
                <Area type="monotone" dataKey="keluar" name="Kas Keluar" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fill="url(#keluarGrad)" />
                <Area type="monotone" dataKey="neto" name="Arus Neto" stroke="hsl(43, 96%, 50%)" strokeWidth={2} fill="url(#netoGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detail Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rincian Arus Kas — {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-48">Kategori</th>
                    {MONTHS.slice(0, 6).map(m => (
                      <th key={m} className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3">{m}</th>
                    ))}
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {DETAIL_ROWS.map((row, i) => {
                    if (row.isHeader) return (
                      <tr key={i} className="bg-muted/20">
                        <td colSpan={8} className="px-4 py-2 text-xs font-bold text-foreground uppercase tracking-wider">
                          {row.kategori}
                        </td>
                      </tr>
                    );
                    const vals = cols.map(c => (row as Record<string, number>)[c] || 0);
                    const total = vals.reduce((s, v) => s + v, 0);
                    return (
                      <tr key={i} className={cn(
                        "hover:bg-muted/20",
                        row.isTotal && "bg-muted/30 font-semibold",
                        row.isNeto && "bg-primary/5 font-bold border-t-2 border-primary/20"
                      )}>
                        <td className={cn("px-4 py-3 text-sm", !row.isTotal && !row.isNeto && "pl-7 text-muted-foreground", row.isNeto && "text-primary")}>
                          {row.kategori}
                        </td>
                        {vals.map((v, j) => (
                          <td key={j} className={cn(
                            "px-3 py-3 text-right text-sm",
                            row.isNeto && "text-primary font-bold",
                            row.isTotal && row.kategori.includes("MASUK") && "text-primary",
                            row.isTotal && row.kategori.includes("KELUAR") && "text-destructive",
                            v === 0 && "text-muted-foreground/40"
                          )}>
                            {fmtShort(v)}
                          </td>
                        ))}
                        <td className={cn(
                          "px-4 py-3 text-right font-bold text-sm",
                          row.isNeto && "text-primary",
                          row.isTotal && row.kategori.includes("MASUK") && "text-primary",
                          row.isTotal && row.kategori.includes("KELUAR") && "text-destructive"
                        )}>
                          {fmtShort(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
