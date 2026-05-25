import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/dummy-data";
import { useCabang } from "@/hooks/use-cabang";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Wallet, Download, FileText, Printer,
  ArrowUpRight, ArrowDownRight, Plus, Pencil, Trash2, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const CURRENT_YEAR = new Date().getFullYear();

const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const MONTH_KEYS = ["jan","feb","mar","apr","mei","jun","jul","agu","sep","okt","nov","des"] as const;
type MonthKey = typeof MONTH_KEYS[number];

type Kategori = "masuk" | "keluar";
interface ArusKasRow {
  id: string;
  kategori: Kategori;
  nama: string;
  jan: number; feb: number; mar: number; apr: number; mei: number; jun: number;
  jul: number; agu: number; sep: number; okt: number; nov: number; des: number;
}

const defaultRows: ArusKasRow[] = [
  { id: "1", kategori: "masuk", nama: "Penerimaan Pinjaman Gadai",      jan:18000000,feb:22000000,mar:27000000,apr:24000000,mei:29000000,jun:34000000,jul:0,agu:0,sep:0,okt:0,nov:0,des:0 },
  { id: "2", kategori: "masuk", nama: "Ujrah / Biaya Pemeliharaan",     jan:5500000, feb:6200000, mar:7500000, apr:7200000, mei:8300000, jun:9600000, jul:0,agu:0,sep:0,okt:0,nov:0,des:0 },
  { id: "3", kategori: "masuk", nama: "Perpanjangan Akad",              jan:3000000, feb:4000000, mar:4500000, apr:5500000, mei:6000000, jun:6500000, jul:0,agu:0,sep:0,okt:0,nov:0,des:0 },
  { id: "4", kategori: "masuk", nama: "Pelunasan Barang",               jan:2000000, feb:2000000, mar:2000000, apr:2000000, mei:2000000, jun:2000000, jul:0,agu:0,sep:0,okt:0,nov:0,des:0 },
  { id: "5", kategori: "keluar", nama: "Beban Gaji Karyawan",           jan:8000000, feb:8000000, mar:8000000, apr:8000000, mei:8000000, jun:8500000, jul:0,agu:0,sep:0,okt:0,nov:0,des:0 },
  { id: "6", kategori: "keluar", nama: "Beban Sewa Tempat",             jan:3000000, feb:3000000, mar:3500000, apr:3500000, mei:3500000, jun:4000000, jul:0,agu:0,sep:0,okt:0,nov:0,des:0 },
  { id: "7", kategori: "keluar", nama: "Beban Operasional Lain",        jan:1500000, feb:2200000, mar:2300000, apr:1400000, mei:2600000, jun:2500000, jul:0,agu:0,sep:0,okt:0,nov:0,des:0 },
];

const emptyRow = (kat: Kategori): ArusKasRow => ({
  id: String(Date.now()),
  kategori: kat,
  nama: "",
  jan:0,feb:0,mar:0,apr:0,mei:0,jun:0,jul:0,agu:0,sep:0,okt:0,nov:0,des:0,
});

export default function ArusKasPage() {
  const { toast } = useToast();
  const { selectedCabang } = useCabang();
  const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));
  const [rows, setRows] = useLocalStorage<ArusKasRow[]>("shiela-arus-kas", defaultRows);

  const [editRow, setEditRow] = useState<ArusKasRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addKat, setAddKat] = useState<Kategori>("masuk");
  const [newRow, setNewRow] = useState<ArusKasRow>(emptyRow("masuk"));
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"semua" | "masuk" | "keluar">("semua");

  const masukRows = rows.filter(r => r.kategori === "masuk");
  const keluarRows = rows.filter(r => r.kategori === "keluar");

  // Monthly totals for chart
  const chartData = MONTH_KEYS.map((k, i) => {
    const masuk = masukRows.reduce((s, r) => s + r[k], 0);
    const keluar = keluarRows.reduce((s, r) => s + r[k], 0);
    return { bulan: MONTH_NAMES[i].slice(0,3), masuk, keluar, neto: masuk - keluar };
  });

  const totalMasuk = masukRows.reduce((s, r) => s + MONTH_KEYS.reduce((m, k) => m + r[k], 0), 0);
  const totalKeluar = keluarRows.reduce((s, r) => s + MONTH_KEYS.reduce((m, k) => m + r[k], 0), 0);
  const totalNeto = totalMasuk - totalKeluar;

  const rowTotal = (r: ArusKasRow) => MONTH_KEYS.reduce((s, k) => s + r[k], 0);

  // Visible months based on tab
  const visibleMonths = MONTH_KEYS;

  // Edit helpers
  const openEdit = (r: ArusKasRow) => { setEditRow({ ...r }); setEditOpen(true); };
  const saveEdit = () => {
    if (!editRow) return;
    if (!editRow.nama.trim()) { toast({ title: "Nama wajib diisi", variant: "destructive" }); return; }
    setRows(rows.map(r => r.id === editRow.id ? editRow : r));
    setEditOpen(false);
    toast({ title: "Berhasil disimpan" });
  };
  const openAdd = (kat: Kategori) => { setAddKat(kat); setNewRow({ ...emptyRow(kat), kategori: kat }); setAddOpen(true); };
  const saveAdd = () => {
    if (!newRow.nama.trim()) { toast({ title: "Nama wajib diisi", variant: "destructive" }); return; }
    setRows([...rows, { ...newRow, id: String(Date.now()) }]);
    setAddOpen(false);
    toast({ title: "Berhasil ditambahkan" });
  };
  const confirmDelete = () => {
    if (!deleteId) return;
    setRows(rows.filter(r => r.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Baris dihapus" });
  };
  const resetDefault = () => { setRows(defaultRows); toast({ title: "Data direset ke default" }); };

  // Number input helper
  const numField = (val: ArusKasRow, key: MonthKey | "nama", onChange: (v: ArusKasRow) => void) => {
    if (key === "nama") return (
      <div className="space-y-1.5">
        <Label>Nama Item</Label>
        <Input value={val.nama} onChange={e => onChange({ ...val, nama: e.target.value })} placeholder="Contoh: Beban listrik" />
      </div>
    );
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{MONTH_NAMES[MONTH_KEYS.indexOf(key as MonthKey)]}</Label>
        <Input type="number" min={0} value={val[key as MonthKey] || ""} placeholder="0"
          onChange={e => onChange({ ...val, [key]: parseFloat(e.target.value) || 0 })} />
      </div>
    );
  };

  // CSV Export
  const handleExportExcel = () => {
    const headerRow = ["Kategori", "Nama Item", ...MONTH_NAMES, "Total"];
    const dataRows = rows.map(r => [
      r.kategori === "masuk" ? "Kas Masuk" : "Kas Keluar",
      r.nama,
      ...MONTH_KEYS.map(k => String(r[k])),
      String(rowTotal(r)),
    ]);
    const sumMasuk = ["TOTAL KAS MASUK", "", ...MONTH_KEYS.map(k => String(masukRows.reduce((s, r) => s + r[k], 0))), String(totalMasuk)];
    const sumKeluar = ["TOTAL KAS KELUAR", "", ...MONTH_KEYS.map(k => String(keluarRows.reduce((s, r) => s + r[k], 0))), String(totalKeluar)];
    const sumNeto = ["ARUS KAS NETO", "", ...MONTH_KEYS.map(k => String(masukRows.reduce((s,r)=>s+r[k],0) - keluarRows.reduce((s,r)=>s+r[k],0))), String(totalNeto)];
    const all = [
      [`LAPORAN ARUS KAS — SHIELA GADAI SYARIAH`],
      [`Tahun: ${selectedYear}`, `Cabang: ${selectedCabang?.nama_cabang ?? "Semua Cabang"}`],
      [],
      headerRow,
      ...dataRows,
      [],
      sumMasuk,
      sumKeluar,
      sumNeto,
    ];
    const csv = "\uFEFF" + all.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `arus-kas-${selectedYear}.csv`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    toast({ title: "Excel diunduh", description: `arus-kas-${selectedYear}.csv` });
  };

  const fmtM = (v: number) => v === 0 ? <span className="text-muted-foreground/30">—</span> : <span>{(v/1000000).toFixed(1)}Jt</span>;

  const displayRows = activeTab === "semua" ? rows : rows.filter(r => r.kategori === activeTab);

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #arus-kas-print { display: block !important; }
        }
        #arus-kas-print { display: none; }
      `}</style>

      {/* Print View */}
      <div id="arus-kas-print" className="p-8 font-sans text-black bg-white">
        <div className="text-center mb-5 border-b-2 pb-4">
          <h1 className="text-xl font-bold">LAPORAN ARUS KAS — SHIELA GADAI SYARIAH</h1>
          <p className="text-sm">Tahun {selectedYear} · {selectedCabang?.nama_cabang ?? "Semua Cabang"}</p>
          <p className="text-xs text-gray-500">Dicetak: {new Date().toLocaleDateString("id-ID", {day:"2-digit",month:"long",year:"numeric"})}</p>
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Item</th>
              {MONTH_NAMES.map(m => <th key={m} className="border px-1 py-1 text-right">{m.slice(0,3)}</th>)}
              <th className="border px-2 py-1 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={14} className="border px-2 py-1 font-bold bg-gray-50 text-green-800">KAS MASUK</td></tr>
            {masukRows.map(r => (
              <tr key={r.id}>
                <td className="border px-2 py-1 pl-4">{r.nama}</td>
                {MONTH_KEYS.map(k => <td key={k} className="border px-1 py-1 text-right">{r[k]===0?"-":r[k].toLocaleString("id-ID")}</td>)}
                <td className="border px-2 py-1 text-right font-bold">{rowTotal(r).toLocaleString("id-ID")}</td>
              </tr>
            ))}
            <tr className="bg-green-50 font-bold">
              <td className="border px-2 py-1">TOTAL KAS MASUK</td>
              {MONTH_KEYS.map(k=><td key={k} className="border px-1 py-1 text-right">{masukRows.reduce((s,r)=>s+r[k],0).toLocaleString("id-ID")}</td>)}
              <td className="border px-2 py-1 text-right">{totalMasuk.toLocaleString("id-ID")}</td>
            </tr>
            <tr><td colSpan={14} className="border px-2 py-1 font-bold bg-gray-50 text-red-800">KAS KELUAR</td></tr>
            {keluarRows.map(r => (
              <tr key={r.id}>
                <td className="border px-2 py-1 pl-4">{r.nama}</td>
                {MONTH_KEYS.map(k => <td key={k} className="border px-1 py-1 text-right">{r[k]===0?"-":r[k].toLocaleString("id-ID")}</td>)}
                <td className="border px-2 py-1 text-right font-bold">{rowTotal(r).toLocaleString("id-ID")}</td>
              </tr>
            ))}
            <tr className="bg-red-50 font-bold">
              <td className="border px-2 py-1">TOTAL KAS KELUAR</td>
              {MONTH_KEYS.map(k=><td key={k} className="border px-1 py-1 text-right">{keluarRows.reduce((s,r)=>s+r[k],0).toLocaleString("id-ID")}</td>)}
              <td className="border px-2 py-1 text-right">{totalKeluar.toLocaleString("id-ID")}</td>
            </tr>
            <tr className="bg-blue-50 font-bold">
              <td className="border px-2 py-1">ARUS KAS NETO</td>
              {MONTH_KEYS.map(k=>{const v=masukRows.reduce((s,r)=>s+r[k],0)-keluarRows.reduce((s,r)=>s+r[k],0);return<td key={k} className="border px-1 py-1 text-right">{v===0?"-":v.toLocaleString("id-ID")}</td>;})}
              <td className="border px-2 py-1 text-right">{totalNeto.toLocaleString("id-ID")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Main */}
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Arus Kas</h1>
            <p className="text-muted-foreground text-sm">
              Laporan cash flow · <span className="text-primary font-medium">{selectedCabang?.nama_cabang ?? "Semua Cabang"}</span>
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
            <Button variant="outline" size="sm" className="h-9 gap-2 text-muted-foreground" onClick={resetDefault}>
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-9 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => { toast({title:"Membuka dialog cetak..."}); setTimeout(()=>window.print(),400); }}>
              <FileText className="w-4 h-4" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-9 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" onClick={handleExportExcel}>
              <Download className="w-4 h-4" /> Excel
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => window.print()}>
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
                <TrendingUp className="w-3.5 h-3.5" /> {masukRows.length} item kas masuk
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
                <TrendingDown className="w-3.5 h-3.5" /> {keluarRows.length} item kas keluar
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
              <p className={cn("text-2xl font-bold", totalNeto >= 0 ? "text-primary" : "text-destructive")}>{formatCurrency(totalNeto)}</p>
              <Badge className={cn("mt-1 text-xs border", totalNeto >= 0 ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20")}>
                {totalNeto >= 0 ? "Surplus" : "Defisit"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Grafik Arus Kas Bulanan {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top:5, right:10, left:0, bottom:5 }}>
                <defs>
                  <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(158,64%,32%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(158,64%,32%)" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gK" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(0,84%,60%)" stopOpacity={0.25}/><stop offset="95%" stopColor="hsl(0,84%,60%)" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(43,96%,50%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(43,96%,50%)" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false}/>
                <XAxis dataKey="bulan" tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false} tickFormatter={v=>v===0?"0":`${(v/1e6).toFixed(0)}Jt`}/>
                <Tooltip contentStyle={{backgroundColor:"hsl(var(--card))",border:"1px solid hsl(var(--border))",borderRadius:"8px",fontSize:"12px",color:"hsl(var(--foreground))"}} formatter={(v:number)=>[v===0?"—":formatCurrency(v),""]}/>
                <Legend wrapperStyle={{fontSize:"12px"}}/>
                <Area type="monotone" dataKey="masuk" name="Kas Masuk" stroke="hsl(158,64%,32%)" strokeWidth={2} fill="url(#gM)"/>
                <Area type="monotone" dataKey="keluar" name="Kas Keluar" stroke="hsl(0,84%,60%)" strokeWidth={2} fill="url(#gK)"/>
                <Area type="monotone" dataKey="neto" name="Arus Neto" stroke="hsl(43,96%,50%)" strokeWidth={2} fill="url(#gN)"/>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Editable Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Rincian Arus Kas — {selectedYear}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Klik ikon pensil untuk mengedit nominal</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Filter tabs */}
                <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
                  {(["semua","masuk","keluar"] as const).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={cn("px-3 py-1.5 transition-smooth capitalize", activeTab===t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50")}>
                      {t}
                    </button>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-primary border-primary/30 hover:bg-primary/5" onClick={() => openAdd("masuk")}>
                  <Plus className="w-3.5 h-3.5" /> Kas Masuk
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => openAdd("keluar")}>
                  <Plus className="w-3.5 h-3.5" /> Kas Keluar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 min-w-[180px] sticky left-0 bg-muted/30">Item</th>
                    {MONTH_NAMES.map(m => (
                      <th key={m} className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-3 min-w-[72px]">{m.slice(0,3)}</th>
                    ))}
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 min-w-[90px]">Total</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-3 w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* Kas Masuk section */}
                  {(activeTab === "semua" || activeTab === "masuk") && (
                    <>
                      <tr className="bg-primary/5">
                        <td colSpan={15} className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">Kas Masuk</span>
                          </div>
                        </td>
                      </tr>
                      {masukRows.map(row => (
                        <tr key={row.id} className="hover:bg-muted/20 group">
                          <td className="px-4 py-2.5 sticky left-0 bg-card group-hover:bg-muted/20">
                            <span className="text-sm font-medium text-foreground pl-2">{row.nama}</span>
                          </td>
                          {MONTH_KEYS.map(k => (
                            <td key={k} className="px-2 py-2.5 text-right text-sm">{fmtM(row[k])}</td>
                          ))}
                          <td className="px-4 py-2.5 text-right font-bold text-sm text-primary">{(rowTotal(row)/1e6).toFixed(1)}Jt</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(row)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(row.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {/* Total Masuk */}
                      <tr className="bg-primary/5 font-semibold border-t border-primary/20">
                        <td className="px-4 py-2.5 sticky left-0 bg-primary/5 text-sm text-primary font-bold pl-6">Total Kas Masuk</td>
                        {MONTH_KEYS.map(k => {
                          const v = masukRows.reduce((s,r)=>s+r[k],0);
                          return <td key={k} className="px-2 py-2.5 text-right text-sm font-semibold text-primary">{fmtM(v)}</td>;
                        })}
                        <td className="px-4 py-2.5 text-right font-bold text-primary">{(totalMasuk/1e6).toFixed(1)}Jt</td>
                        <td className="px-3 py-2.5" />
                      </tr>
                    </>
                  )}

                  {/* Kas Keluar section */}
                  {(activeTab === "semua" || activeTab === "keluar") && (
                    <>
                      <tr className="bg-destructive/5">
                        <td colSpan={15} className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <ArrowDownRight className="w-4 h-4 text-destructive" />
                            <span className="text-xs font-bold text-destructive uppercase tracking-wider">Kas Keluar</span>
                          </div>
                        </td>
                      </tr>
                      {keluarRows.map(row => (
                        <tr key={row.id} className="hover:bg-muted/20 group">
                          <td className="px-4 py-2.5 sticky left-0 bg-card group-hover:bg-muted/20">
                            <span className="text-sm font-medium text-foreground pl-2">{row.nama}</span>
                          </td>
                          {MONTH_KEYS.map(k => (
                            <td key={k} className="px-2 py-2.5 text-right text-sm">{fmtM(row[k])}</td>
                          ))}
                          <td className="px-4 py-2.5 text-right font-bold text-sm text-destructive">{(rowTotal(row)/1e6).toFixed(1)}Jt</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(row)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(row.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {/* Total Keluar */}
                      <tr className="bg-destructive/5 font-semibold border-t border-destructive/20">
                        <td className="px-4 py-2.5 sticky left-0 bg-destructive/5 text-sm text-destructive font-bold pl-6">Total Kas Keluar</td>
                        {MONTH_KEYS.map(k => {
                          const v = keluarRows.reduce((s,r)=>s+r[k],0);
                          return <td key={k} className="px-2 py-2.5 text-right text-sm font-semibold text-destructive">{fmtM(v)}</td>;
                        })}
                        <td className="px-4 py-2.5 text-right font-bold text-destructive">{(totalKeluar/1e6).toFixed(1)}Jt</td>
                        <td className="px-3 py-2.5" />
                      </tr>
                    </>
                  )}

                  {/* Neto row */}
                  {activeTab === "semua" && (
                    <tr className="bg-gold/5 border-t-2 border-gold/30 font-bold">
                      <td className="px-4 py-3 sticky left-0 bg-gold/5 text-sm text-gold font-bold">Arus Kas Neto</td>
                      {MONTH_KEYS.map(k => {
                        const v = masukRows.reduce((s,r)=>s+r[k],0) - keluarRows.reduce((s,r)=>s+r[k],0);
                        return <td key={k} className={cn("px-2 py-3 text-right text-sm font-bold", v>0?"text-primary":v<0?"text-destructive":"text-muted-foreground/30")}>{v===0?<span className="text-muted-foreground/30">—</span>:<span>{(v/1e6).toFixed(1)}Jt</span>}</td>;
                      })}
                      <td className={cn("px-4 py-3 text-right font-bold text-sm", totalNeto>=0?"text-primary":"text-destructive")}>{(totalNeto/1e6).toFixed(1)}Jt</td>
                      <td className="px-3 py-3"/>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit: {editRow?.nama}</DialogTitle>
          </DialogHeader>
          {editRow && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <Badge className={cn("text-xs", editRow.kategori === "masuk" ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20")}>
                  {editRow.kategori === "masuk" ? "Kas Masuk" : "Kas Keluar"}
                </Badge>
                <Select value={editRow.kategori} onValueChange={v => setEditRow({...editRow, kategori: v as Kategori})}>
                  <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Kas Masuk</SelectItem>
                    <SelectItem value="keluar">Kas Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nama Item</Label>
                <Input value={editRow.nama} onChange={e => setEditRow({...editRow, nama: e.target.value})} placeholder="Nama item arus kas" />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-3 block">Nominal per Bulan (Rp)</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {MONTH_KEYS.map((k, i) => (
                    <div key={k} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{MONTH_NAMES[i].slice(0,3)}</Label>
                      <Input
                        type="number" min={0}
                        value={editRow[k] || ""}
                        placeholder="0"
                        className="h-8 text-sm"
                        onChange={e => setEditRow({...editRow, [k]: parseFloat(e.target.value)||0})}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total setahun:</span>
                <span className="font-bold text-foreground">{formatCurrency(MONTH_KEYS.reduce((s,k)=>s+editRow[k],0))}</span>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
                <Button className="gradient-primary shadow-emerald" onClick={saveEdit}>Simpan</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Item {addKat === "masuk" ? "Kas Masuk" : "Kas Keluar"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
              <Select value={newRow.kategori} onValueChange={v => setNewRow({...newRow, kategori: v as Kategori})}>
                <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">Kas Masuk</SelectItem>
                  <SelectItem value="keluar">Kas Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Nama Item *</Label>
              <Input value={newRow.nama} onChange={e => setNewRow({...newRow, nama: e.target.value})} placeholder="Contoh: Beban Listrik" />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-3 block">Nominal per Bulan (Rp)</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {MONTH_KEYS.map((k, i) => (
                  <div key={k} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{MONTH_NAMES[i].slice(0,3)}</Label>
                    <Input
                      type="number" min={0}
                      value={newRow[k] || ""}
                      placeholder="0"
                      className="h-8 text-sm"
                      onChange={e => setNewRow({...newRow, [k]: parseFloat(e.target.value)||0})}
                    />
                  </div>
                ))}
              </div>
            </div>
            {MONTH_KEYS.reduce((s,k)=>s+newRow[k],0) > 0 && (
              <div className="p-3 rounded-lg bg-muted/40 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total setahun:</span>
                <span className="font-bold text-foreground">{formatCurrency(MONTH_KEYS.reduce((s,k)=>s+newRow[k],0))}</span>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
              <Button className="gradient-primary shadow-emerald gap-2" onClick={saveAdd}>
                <Plus className="w-4 h-4" /> Tambah
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus item ini?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
