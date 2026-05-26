import { useState } from "react";
import { useCabang } from "@/hooks/use-cabang";
import { useAuth } from "@/hooks/use-auth";
import { useSupabaseTransaksi } from "@/hooks/use-supabase-transaksi";
import { useSupabaseNasabah } from "@/hooks/use-supabase-nasabah";
import { useSupabaseBarang } from "@/hooks/use-supabase-barang";
import { useSupabaseCabang } from "@/hooks/use-supabase-cabang";
import { formatCurrency, formatDate, getStatusTransaksiColor, getLabelStatus } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  HandCoins, Plus, Search, Eye, RefreshCw, CheckCircle,
  ChevronLeft, ChevronRight, FileText, Printer, Calculator, Loader2, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ---------- Akad HTML Generator ----------
function generateAkadHtml(trx: {
  nomor_transaksi: string; nilai_pinjaman: number; ujrah_per_bulan: number;
  tanggal_gadai: string; tanggal_jatuh_tempo: string;
  nasabah_nama?: string; barang_nama?: string; cabang_nama?: string;
}, ujrahTotal: number): string {
  const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
<title>Akad Rahn - ${trx.nomor_transaksi}</title>
<style>
body{font-family:Arial,sans-serif;font-size:12px;margin:0;padding:32px;color:#111}
.header{text-align:center;border-bottom:3px double #333;padding-bottom:12px;margin-bottom:16px}
.logo-area{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:6px}
.logo-area img{width:48px;height:48px;object-fit:contain}
h1{font-size:16px;margin:4px 0;letter-spacing:1px}h2{font-size:13px;margin:2px 0;color:#555;font-weight:normal}
.nomor{font-size:13px;font-weight:bold;margin-top:8px}
.section{margin:14px 0}.section-title{font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #999;padding-bottom:4px;margin-bottom:8px}
table{width:100%;border-collapse:collapse}td{padding:5px 8px;vertical-align:top}td:first-child{width:42%;color:#555}td:last-child{font-weight:600}
.value-box{background:#f5f5f5;border:1px solid #ddd;border-radius:6px;padding:10px 14px;margin:10px 0}
.value-box .amount{font-size:20px;font-weight:bold;color:#1a6a42}
.terms{font-size:10.5px;line-height:1.7;color:#444}.terms ol{margin:4px 0;padding-left:18px}
.sign-area{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:32px}
.sign-box{text-align:center}.sign-line{border-top:1px solid #333;margin-top:60px;padding-top:4px}
@media print{body{margin:20px}}
</style></head><body>
<div class="header">
  <div class="logo-area">
    <img src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059471/b1dd8944-57af-49.png" crossorigin="anonymous"/>
    <div><h1>SHIELA GADAI SYARIAH</h1><h2>Jasa Gadai Berbasis Prinsip Syariah Islam — Bebas Riba</h2></div>
  </div>
  <div class="nomor">AKAD GADAI SYARIAH (RAHN) — ${trx.nomor_transaksi}</div>
</div>
<div class="section"><div class="section-title">Data Akad</div>
<table><tr><td>Tanggal Akad</td><td>${today}</td></tr><tr><td>Cabang</td><td>${trx.cabang_nama || "-"}</td></tr><tr><td>No. Transaksi</td><td>${trx.nomor_transaksi}</td></tr></table></div>
<div class="section"><div class="section-title">Pihak Pertama — Rahin (Nasabah)</div>
<table><tr><td>Nama Lengkap</td><td>${trx.nasabah_nama || "-"}</td></tr></table></div>
<div class="section"><div class="section-title">Barang Jaminan — Marhun</div>
<table><tr><td>Nama Barang</td><td>${trx.barang_nama || "-"}</td></tr><tr><td>Lokasi Simpan</td><td>${trx.cabang_nama || "-"}</td></tr></table></div>
<div class="section"><div class="section-title">Rincian Pembiayaan</div>
<div class="value-box"><div style="color:#555;font-size:11px;margin-bottom:2px">Nilai Pinjaman (Marhun Bih)</div>
<div class="amount">Rp ${trx.nilai_pinjaman.toLocaleString("id-ID")}</div></div>
<table>
<tr><td>Ujrah per Bulan</td><td>Rp ${trx.ujrah_per_bulan.toLocaleString("id-ID")}</td></tr>
<tr><td>Total Ujrah</td><td>Rp ${ujrahTotal.toLocaleString("id-ID")}</td></tr>
<tr><td>Tanggal Gadai</td><td>${trx.tanggal_gadai}</td></tr>
<tr><td>Jatuh Tempo</td><td><strong>${trx.tanggal_jatuh_tempo}</strong></td></tr>
</table></div>
<div class="section"><div class="section-title">Ketentuan Akad Rahn Syariah</div>
<div class="terms"><ol>
<li>Akad ini dilaksanakan atas dasar prinsip syariah Islam dengan sistem <strong>Rahn</strong> (gadai syariah) yang bebas dari unsur riba.</li>
<li>Nasabah (Rahin) menyerahkan barang jaminan (Marhun) kepada Shiela Gadai Syariah (Murtahin) sebagai jaminan atas pinjaman yang diterima.</li>
<li>Biaya penyimpanan dan pemeliharaan (Ujrah) dihitung dari nilai taksiran barang jaminan.</li>
<li>Nasabah berhak menebus barang jaminan kapan saja dengan membayar pokok pinjaman beserta ujrah yang telah berjalan.</li>
<li>Apabila nasabah tidak menebus setelah jatuh tempo, murtahin berhak menjual melalui lelang terbuka.</li>
<li>Kelebihan hasil penjualan akan dikembalikan kepada nasabah.</li>
</ol></div></div>
<div class="sign-area">
<div class="sign-box"><p>Pihak Kedua — Murtahin</p><p style="color:#555;font-size:10px">Shiela Gadai Syariah</p>
<div class="sign-line"><strong>( __________________ )</strong><p style="font-size:10px;color:#555">Kepala Cabang / Pengelola</p></div></div>
<div class="sign-box"><p>Pihak Pertama — Rahin</p><p style="color:#555;font-size:10px">${trx.nasabah_nama || "Nasabah"}</p>
<div class="sign-line"><strong>( __________________ )</strong><p style="font-size:10px;color:#555">Tanda Tangan / Cap Jempol</p></div></div>
</div>
<p style="text-align:center;margin-top:24px;font-size:10px;color:#999">Dokumen ini dicetak pada ${today} — Shiela Gadai Syariah</p>
</body></html>`;
}

function printAkad(trx: { nomor_transaksi: string; nilai_pinjaman: number; ujrah_per_bulan: number; tanggal_gadai: string; tanggal_jatuh_tempo: string; nasabah_nama?: string; barang_nama?: string; cabang_nama?: string; }, ujrahTotal: number) {
  const win = window.open("", "_blank", "width=850,height=700");
  if (win) { win.document.write(generateAkadHtml(trx, ujrahTotal)); win.document.close(); setTimeout(() => { win.focus(); win.print(); }, 600); }
}

export default function TransaksiPage() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { selectedCabang } = useCabang();
  const { data: cabangList } = useSupabaseCabang();
  const { data: nasabahList } = useSupabaseNasabah(null);
  const { data: barangList } = useSupabaseBarang(null);
  const { data: transaksiList, loading, insert, updateStatus, remove } = useSupabaseTransaksi(selectedCabang?.id ?? null);

  const isOwner = profile?.role === "owner" || profile?.role === "super_admin";

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<typeof transaksiList[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nasabah_id: "", barang_id: "", cabang_id: "",
    nilai_pinjaman: "", ujrah_per_bulan: "", tanggal_gadai: new Date().toISOString().split("T")[0],
    durasi_bulan: "3",
  });

  const ujrahEstimasi = form.nilai_pinjaman ? parseFloat(form.nilai_pinjaman) * 0.02 : 0;

  const perPage = 8;
  const filtered = transaksiList.filter((t) => {
    const q = search.toLowerCase();
    const nasabahNama = (t.nasabah as { nama_lengkap: string } | null)?.nama_lengkap || "";
    const barangNama = (t.barang as { nama_barang: string } | null)?.nama_barang || "";
    const matchSearch = t.nomor_transaksi.toLowerCase().includes(q) || nasabahNama.toLowerCase().includes(q) || barangNama.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const buildJatuhTempo = () => {
    const d = new Date(form.tanggal_gadai);
    d.setMonth(d.getMonth() + parseInt(form.durasi_bulan));
    return d.toISOString().split("T")[0];
  };

  const handleSave = async () => {
    if (!form.nilai_pinjaman || !form.nasabah_id || !form.barang_id) {
      toast({ title: "Error", description: "Nasabah, barang, dan nilai pinjaman wajib diisi.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const ujrahPerBulan = form.ujrah_per_bulan ? parseFloat(form.ujrah_per_bulan) : ujrahEstimasi;
      const nomor = `TRX-${new Date().getFullYear()}-${String(transaksiList.length + 1).padStart(3, "0")}`;
      await insert({
        nomor_transaksi: nomor,
        nasabah_id: form.nasabah_id,
        barang_id: form.barang_id,
        cabang_id: form.cabang_id || selectedCabang?.id || cabangList[0]?.id || null,
        nilai_pinjaman: parseFloat(form.nilai_pinjaman),
        ujrah_per_bulan: ujrahPerBulan,
        tanggal_gadai: form.tanggal_gadai,
        tanggal_jatuh_tempo: buildJatuhTempo(),
        status: "aktif",
      });
      setOpen(false);
      toast({ title: "Berhasil", description: `Transaksi ${nomor} berhasil disimpan.` });
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleBuatAkad = async () => {
    if (!form.nilai_pinjaman || !form.nasabah_id || !form.barang_id) {
      toast({ title: "Error", description: "Nasabah, barang, dan nilai pinjaman wajib diisi.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const ujrahPerBulan = form.ujrah_per_bulan ? parseFloat(form.ujrah_per_bulan) : ujrahEstimasi;
      const nomor = `TRX-${new Date().getFullYear()}-${String(transaksiList.length + 1).padStart(3, "0")}`;
      const nasabah = nasabahList.find(n => n.id === form.nasabah_id);
      const barang = barangList.find(b => b.id === form.barang_id);
      const cabang = cabangList.find(c => c.id === (form.cabang_id || selectedCabang?.id || cabangList[0]?.id));
      const jatuhTempo = buildJatuhTempo();
      await insert({
        nomor_transaksi: nomor, nasabah_id: form.nasabah_id, barang_id: form.barang_id,
        cabang_id: cabang?.id || null,
        nilai_pinjaman: parseFloat(form.nilai_pinjaman), ujrah_per_bulan: ujrahPerBulan,
        tanggal_gadai: form.tanggal_gadai, tanggal_jatuh_tempo: jatuhTempo, status: "aktif",
      });
      setOpen(false);
      printAkad({
        nomor_transaksi: nomor, nilai_pinjaman: parseFloat(form.nilai_pinjaman),
        ujrah_per_bulan: ujrahPerBulan, tanggal_gadai: form.tanggal_gadai, tanggal_jatuh_tempo: jatuhTempo,
        nasabah_nama: nasabah?.nama_lengkap, barang_nama: barang?.nama_barang, cabang_nama: cabang?.nama_cabang,
      }, ujrahPerBulan * parseInt(form.durasi_bulan));
      toast({ title: "Akad dibuat!", description: `${nomor} — Dialog cetak akan terbuka.` });
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const stats = {
    aktif: transaksiList.filter(t => t.status === "aktif").length,
    macet: transaksiList.filter(t => t.status === "macet").length,
    jatuhTempo: transaksiList.filter(t => {
      const diff = (new Date(t.tanggal_jatuh_tempo).getTime() - Date.now()) / 86400000;
      return diff <= 7 && diff >= 0 && t.status === "aktif";
    }).length,
    lunas: transaksiList.filter(t => t.status === "lunas").length,
  };

  const getNasabahNama = (t: typeof transaksiList[0]) => (t.nasabah as { nama_lengkap: string } | null)?.nama_lengkap || "-";
  const getBarangNama = (t: typeof transaksiList[0]) => (t.barang as { nama_barang: string } | null)?.nama_barang || "-";
  const getCabangNama = (t: typeof transaksiList[0]) => (t.cabang as { nama_cabang: string } | null)?.nama_cabang || "-";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transaksi Gadai</h1>
          <p className="text-muted-foreground text-sm">Akad Rahn Syariah</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary shadow-emerald"><Plus className="w-4 h-4" /> Transaksi Baru</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Transaksi Gadai Syariah (Akad Rahn)</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="col-span-2 space-y-1.5">
                <Label>Nasabah *</Label>
                <Select value={form.nasabah_id} onValueChange={v => setForm({...form, nasabah_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih nasabah" /></SelectTrigger>
                  <SelectContent>{nasabahList.map(n => <SelectItem key={n.id} value={n.id}>{n.nama_lengkap}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Barang Jaminan *</Label>
                <Select value={form.barang_id} onValueChange={v => setForm({...form, barang_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih barang" /></SelectTrigger>
                  <SelectContent>
                    {barangList.filter(b => b.status === "aktif").map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.nama_barang} — {b.kode_barang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nilai Pinjaman (Rp) *</Label>
                <Input type="number" placeholder="0" value={form.nilai_pinjaman} onChange={e => setForm({...form, nilai_pinjaman: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Ujrah/Bulan (Rp)</Label>
                <Input type="number" placeholder={ujrahEstimasi ? String(Math.round(ujrahEstimasi)) : "otomatis 2%"} value={form.ujrah_per_bulan} onChange={e => setForm({...form, ujrah_per_bulan: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Gadai</Label>
                <Input type="date" value={form.tanggal_gadai} onChange={e => setForm({...form, tanggal_gadai: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Durasi (Bulan)</Label>
                <Select value={form.durasi_bulan} onValueChange={v => setForm({...form, durasi_bulan: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["1","2","3","4"].map(v => <SelectItem key={v} value={v}>{v} Bulan</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Cabang</Label>
                <Select value={form.cabang_id || cabangList[0]?.id || ""} onValueChange={v => setForm({...form, cabang_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih cabang" /></SelectTrigger>
                  <SelectContent>{cabangList.map(c => <SelectItem key={c.id} value={c.id}>{c.nama_cabang}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.nilai_pinjaman && (
                <div className="col-span-2 p-3 rounded-lg bg-accent/50 border border-accent flex items-center gap-2 text-sm">
                  <Calculator className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">Estimasi ujrah 2%/bulan:</span>
                  <span className="font-semibold text-primary">{formatCurrency(ujrahEstimasi)}/bulan</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end mt-4 flex-wrap">
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button variant="outline" className="gap-2" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Simpan Saja
              </Button>
              <Button className="gradient-primary shadow-emerald gap-2" onClick={handleBuatAkad} disabled={saving}>
                <FileText className="w-4 h-4" /> Buat Akad
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Aktif", value: stats.aktif, color: "bg-primary/10 text-primary border-primary/20", status: "aktif" },
          { label: "Jatuh Tempo", value: stats.jatuhTempo, color: "bg-orange-500/10 text-orange-600 border-orange-500/20", status: "all" },
          { label: "Macet", value: stats.macet, color: "bg-destructive/10 text-destructive border-destructive/20", status: "macet" },
          { label: "Lunas", value: stats.lunas, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", status: "lunas" },
        ].map((s) => (
          <button key={s.label} onClick={() => { setFilterStatus(s.status); setPage(1); }}
            className={cn("p-3 rounded-xl border text-left transition-smooth hover:scale-[1.02]", s.color)}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-80">{s.label}</p>
          </button>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari nomor transaksi, nasabah..." className="pl-9 h-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="diperpanjang">Diperpanjang</SelectItem>
                <SelectItem value="lunas">Lunas</SelectItem>
                <SelectItem value="macet">Macet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">No. Transaksi</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Nasabah</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Barang</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Pinjaman</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Jatuh Tempo</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      <HandCoins className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      {search ? "Tidak ada transaksi ditemukan" : "Belum ada transaksi."}
                    </td></tr>
                  ) : paginated.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-smooth">
                      <td className="px-4 py-3.5"><span className="text-sm font-medium text-primary">{t.nomor_transaksi}</span></td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-foreground">{getNasabahNama(t)}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{getCabangNama(t)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground truncate max-w-[140px] block">{getBarangNama(t)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold">{formatCurrency(t.nilai_pinjaman)}</span></td>
                      <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">{formatDate(t.tanggal_jatuh_tempo)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusTransaksiColor(t.status as "aktif" | "diperpanjang" | "lunas" | "macet" | "lelang"))}>
                          {getLabelStatus(t.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => { setSelected(t); setViewOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(t.status === "aktif" || t.status === "diperpanjang") && (<>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-blue-600" onClick={async () => { await updateStatus(t.id, "diperpanjang"); toast({ title: "Diperpanjang" }); }}><RefreshCw className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-emerald-600" onClick={async () => { await updateStatus(t.id, "lunas", { tanggal_pelunasan: new Date().toISOString().split("T")[0] }); toast({ title: "Lunas" }); }}><CheckCircle className="w-4 h-4" /></Button>
                          </>)}
                          {isOwner && (
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(t.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-wrap gap-2">
              <p className="text-xs text-muted-foreground">{(page-1)*perPage+1}–{Math.min(page*perPage, filtered.length)} dari {filtered.length}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="w-8 h-8" disabled={page===1} onClick={()=>setPage(p=>p-1)}><ChevronLeft className="w-4 h-4"/></Button>
                {Array.from({length:Math.min(totalPages,5)},(_,i)=>(
                  <Button key={i} variant={page===i+1?"default":"outline"} size="icon" className={cn("w-8 h-8 text-xs",page===i+1&&"gradient-primary")} onClick={()=>setPage(i+1)}>{i+1}</Button>
                ))}
                <Button variant="outline" size="icon" className="w-8 h-8" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}><ChevronRight className="w-4 h-4"/></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detail Transaksi</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl gradient-primary text-primary-foreground">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs opacity-80 font-medium uppercase">Nomor Transaksi</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20">{getLabelStatus(selected.status)}</span>
                </div>
                <h3 className="text-xl font-bold">{selected.nomor_transaksi}</h3>
                <p className="text-sm opacity-80 mt-1">{selected.tanggal_gadai} · {getCabangNama(selected)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Nasabah</p><p className="font-semibold">{getNasabahNama(selected)}</p></div>
                <div><p className="text-xs text-muted-foreground">Barang</p><p className="font-semibold">{getBarangNama(selected)}</p></div>
                <div><p className="text-xs text-muted-foreground">Nilai Pinjaman</p><p className="font-bold text-primary text-lg">{formatCurrency(selected.nilai_pinjaman)}</p></div>
                <div><p className="text-xs text-muted-foreground">Ujrah/Bulan</p><p className="font-bold text-gold text-lg">{formatCurrency(selected.ujrah_per_bulan)}</p></div>
                <div><p className="text-xs text-muted-foreground">Tanggal Gadai</p><p className="font-medium">{formatDate(selected.tanggal_gadai)}</p></div>
                <div><p className="text-xs text-muted-foreground">Jatuh Tempo</p><p className="font-medium">{formatDate(selected.tanggal_jatuh_tempo)}</p></div>
                {selected.tanggal_pelunasan && <div><p className="text-xs text-muted-foreground">Dilunasi</p><p className="font-medium text-emerald-600">{formatDate(selected.tanggal_pelunasan)}</p></div>}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="gap-2 flex-1" onClick={() => printAkad({ nomor_transaksi: selected.nomor_transaksi, nilai_pinjaman: selected.nilai_pinjaman, ujrah_per_bulan: selected.ujrah_per_bulan, tanggal_gadai: selected.tanggal_gadai, tanggal_jatuh_tempo: selected.tanggal_jatuh_tempo, nasabah_nama: getNasabahNama(selected), barang_nama: getBarangNama(selected), cabang_nama: getCabangNama(selected) }, selected.ujrah_per_bulan * 3)}>
                  <Printer className="w-4 h-4" /> Cetak Akad
                </Button>
                <Button variant="outline" size="sm" className="gap-2 flex-1" onClick={() => printAkad({ nomor_transaksi: selected.nomor_transaksi, nilai_pinjaman: selected.nilai_pinjaman, ujrah_per_bulan: selected.ujrah_per_bulan, tanggal_gadai: selected.tanggal_gadai, tanggal_jatuh_tempo: selected.tanggal_jatuh_tempo, nasabah_nama: getNasabahNama(selected), barang_nama: getBarangNama(selected), cabang_nama: getCabangNama(selected) }, selected.ujrah_per_bulan * 3)}>
                  <FileText className="w-4 h-4" /> Bukti PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus transaksi ini?</AlertDialogTitle>
            <AlertDialogDescription>Data transaksi akan dihapus permanen dari database.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => {
              try { await remove(deleteId!); toast({ title: "Transaksi dihapus" }); } catch(e: unknown) { toast({ title: "Gagal", description: (e as Error).message, variant: "destructive" }); }
              setDeleteId(null);
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
