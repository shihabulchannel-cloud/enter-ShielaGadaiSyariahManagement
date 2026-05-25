import { useState } from "react";
import {
  dummyTransaksi, dummyNasabah, dummyBarang, dummyCabang,
  TransaksiGadai, formatCurrency, formatDate,
  getStatusTransaksiColor, getLabelStatus,
} from "@/lib/dummy-data";
import { useCabang } from "@/hooks/use-cabang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HandCoins, Plus, Search, Eye, RefreshCw, CheckCircle,
  ChevronLeft, ChevronRight, FileText, Printer, Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function TransaksiPage() {
  const { toast } = useToast();
  const { selectedCabang } = useCabang();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<TransaksiGadai | null>(null);
  const [transaksiList, setTransaksiList] = useState<TransaksiGadai[]>(dummyTransaksi);

  const [form, setForm] = useState({
    nasabah_id: "nsb-001", barang_id: "brg-001", cabang_id: "cbg-001",
    nilai_pinjaman: "", ujrah_per_bulan: "", tanggal_gadai: new Date().toISOString().split("T")[0],
    durasi_bulan: "3",
  });

  const ujrahEstimasi = form.nilai_pinjaman ? parseFloat(form.nilai_pinjaman) * 0.02 : 0;

  const perPage = 8;
  const filtered = transaksiList.filter((t) => {
    const matchSearch = t.nomor_transaksi.toLowerCase().includes(search.toLowerCase()) ||
      (t.nasabah_nama || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.barang_nama || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchCabang = !selectedCabang || t.cabang_id === selectedCabang.id;
    return matchSearch && matchStatus && matchCabang;
  });
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSave = () => {
    if (!form.nilai_pinjaman || !form.nasabah_id) {
      toast({ title: "Error", description: "Isi semua field yang wajib.", variant: "destructive" });
      return;
    }
    const nasabah = dummyNasabah.find(n => n.id === form.nasabah_id);
    const barang = dummyBarang.find(b => b.id === form.barang_id);
    const cabang = dummyCabang.find(c => c.id === form.cabang_id);
    const jatuhTempo = new Date(form.tanggal_gadai);
    jatuhTempo.setMonth(jatuhTempo.getMonth() + parseInt(form.durasi_bulan));

    const newTrx: TransaksiGadai = {
      id: `trx-${Date.now()}`,
      nomor_transaksi: `TRX-2026-${String(transaksiList.length + 1).padStart(3, "0")}`,
      nasabah_id: form.nasabah_id,
      nasabah_nama: nasabah?.nama_lengkap,
      barang_id: form.barang_id,
      barang_nama: barang?.nama_barang,
      cabang_id: form.cabang_id,
      cabang_nama: cabang?.nama_cabang,
      nilai_pinjaman: parseFloat(form.nilai_pinjaman),
      ujrah_per_bulan: form.ujrah_per_bulan ? parseFloat(form.ujrah_per_bulan) : ujrahEstimasi,
      tanggal_gadai: form.tanggal_gadai,
      tanggal_jatuh_tempo: jatuhTempo.toISOString().split("T")[0],
      status: "aktif",
      created_at: new Date().toISOString().split("T")[0],
    };
    setTransaksiList([...transaksiList, newTrx]);
    setOpen(false);
    toast({ title: "Berhasil", description: `Transaksi ${newTrx.nomor_transaksi} berhasil dibuat.` });
  };

  const handlePerpanjang = (trx: TransaksiGadai) => {
    setTransaksiList(prev => prev.map(t => t.id === trx.id ? { ...t, status: "diperpanjang" as const } : t));
    toast({ title: "Berhasil", description: `Transaksi ${trx.nomor_transaksi} diperpanjang.` });
  };

  const handleLunas = (trx: TransaksiGadai) => {
    setTransaksiList(prev => prev.map(t => t.id === trx.id ? {
      ...t, status: "lunas" as const,
      tanggal_pelunasan: new Date().toISOString().split("T")[0],
    } : t));
    toast({ title: "Berhasil", description: `Transaksi ${trx.nomor_transaksi} telah dilunasi.` });
  };

  const stats = {
    aktif: transaksiList.filter(t => t.status === "aktif").length,
    macet: transaksiList.filter(t => t.status === "macet").length,
    jatuhTempo: transaksiList.filter(t => {
      const d = new Date(t.tanggal_jatuh_tempo);
      const today = new Date();
      const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7 && diff >= 0 && t.status === "aktif";
    }).length,
    lunas: transaksiList.filter(t => t.status === "lunas").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transaksi Gadai</h1>
          <p className="text-muted-foreground text-sm">Akad Rahn Syariah</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary shadow-emerald">
              <Plus className="w-4 h-4" /> Transaksi Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Transaksi Gadai Syariah (Akad Rahn)</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="col-span-2 space-y-1.5">
                <Label>Nasabah *</Label>
                <Select value={form.nasabah_id} onValueChange={v => setForm({...form, nasabah_id: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{dummyNasabah.map(n => <SelectItem key={n.id} value={n.id}>{n.nama_lengkap}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Barang Jaminan *</Label>
                <Select value={form.barang_id} onValueChange={v => setForm({...form, barang_id: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{dummyBarang.filter(b => b.status === "aktif").map(b => <SelectItem key={b.id} value={b.id}>{b.nama_barang} - {b.kode_barang}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nilai Pinjaman (Rp) *</Label>
                <Input type="number" placeholder="0" value={form.nilai_pinjaman} onChange={e => setForm({...form, nilai_pinjaman: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Ujrah/Bulan (Rp)</Label>
                <Input type="number" placeholder={ujrahEstimasi.toString()} value={form.ujrah_per_bulan} onChange={e => setForm({...form, ujrah_per_bulan: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Gadai</Label>
                <Input type="date" value={form.tanggal_gadai} onChange={e => setForm({...form, tanggal_gadai: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Durasi (Bulan)</Label>
                <Select value={form.durasi_bulan} onValueChange={v => setForm({...form, durasi_bulan: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Bulan</SelectItem>
                    <SelectItem value="2">2 Bulan</SelectItem>
                    <SelectItem value="3">3 Bulan</SelectItem>
                    <SelectItem value="4">4 Bulan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Cabang</Label>
                <Select value={form.cabang_id} onValueChange={v => setForm({...form, cabang_id: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{dummyCabang.map(c => <SelectItem key={c.id} value={c.id}>{c.nama_cabang}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.nilai_pinjaman && (
                <div className="col-span-2 p-3 rounded-lg bg-accent/50 border border-accent">
                  <div className="flex items-center gap-2 text-sm">
                    <Calculator className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Estimasi ujrah 2%/bulan:</span>
                    <span className="font-semibold text-primary">{formatCurrency(ujrahEstimasi)}/bulan</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button className="gradient-primary shadow-emerald gap-2" onClick={handleSave}>
                <FileText className="w-4 h-4" /> Buat Akad
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Aktif", value: stats.aktif, color: "bg-primary/10 text-primary border-primary/20" },
          { label: "Jatuh Tempo", value: stats.jatuhTempo, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
          { label: "Macet", value: stats.macet, color: "bg-destructive/10 text-destructive border-destructive/20" },
          { label: "Lunas", value: stats.lunas, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
        ].map((s) => (
          <button key={s.label} onClick={() => { setFilterStatus(s.label === "Aktif" ? "aktif" : s.label === "Macet" ? "macet" : s.label === "Lunas" ? "lunas" : "all"); setPage(1); }}
            className={cn("p-3 rounded-xl border text-left transition-smooth hover:scale-[1.02]", s.color)}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-80">{s.label}</p>
          </button>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
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
                <SelectItem value="lelang">Lelang</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">No. Transaksi</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Nasabah</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Barang</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Pinjaman</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Ujrah/Bln</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Jatuh Tempo</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    <HandCoins className="w-8 h-8 mx-auto mb-2 opacity-30" />Tidak ada transaksi
                  </td></tr>
                ) : paginated.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-smooth">
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-primary">{t.nomor_transaksi}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.nasabah_nama}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{t.cabang_nama}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground truncate max-w-[140px] block">{t.barang_nama}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold">{formatCurrency(t.nilai_pinjaman)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{formatCurrency(t.ujrah_per_bulan)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">{formatDate(t.tanggal_jatuh_tempo)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusTransaksiColor(t.status))}>
                        {getLabelStatus(t.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => { setSelected(t); setViewOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {t.status === "aktif" && (
                          <>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-blue-600" onClick={() => handlePerpanjang(t)}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-emerald-600" onClick={() => handleLunas(t)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Menampilkan {(page-1)*perPage+1}–{Math.min(page*perPage, filtered.length)} dari {filtered.length}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="w-8 h-8" disabled={page===1} onClick={() => setPage(p=>p-1)}><ChevronLeft className="w-4 h-4" /></Button>
                {Array.from({length:totalPages},(_,i)=>(
                  <Button key={i} variant={page===i+1?"default":"outline"} size="icon" className={cn("w-8 h-8 text-xs",page===i+1&&"gradient-primary")} onClick={()=>setPage(i+1)}>{i+1}</Button>
                ))}
                <Button variant="outline" size="icon" className="w-8 h-8" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Detail */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detail Transaksi</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl gradient-primary text-primary-foreground">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs opacity-80 font-medium uppercase">Nomor Transaksi</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium bg-white/20")}>
                    {getLabelStatus(selected.status)}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{selected.nomor_transaksi}</h3>
                <p className="text-sm opacity-80 mt-1">{selected.tanggal_gadai} · {selected.cabang_nama}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Nasabah</p><p className="font-semibold">{selected.nasabah_nama}</p></div>
                <div><p className="text-xs text-muted-foreground">Barang</p><p className="font-semibold">{selected.barang_nama}</p></div>
                <div><p className="text-xs text-muted-foreground">Nilai Pinjaman</p><p className="font-bold text-primary text-lg">{formatCurrency(selected.nilai_pinjaman)}</p></div>
                <div><p className="text-xs text-muted-foreground">Ujrah/Bulan</p><p className="font-bold text-gold text-lg">{formatCurrency(selected.ujrah_per_bulan)}</p></div>
                <div><p className="text-xs text-muted-foreground">Tanggal Gadai</p><p className="font-medium">{formatDate(selected.tanggal_gadai)}</p></div>
                <div><p className="text-xs text-muted-foreground">Jatuh Tempo</p><p className="font-medium">{formatDate(selected.tanggal_jatuh_tempo)}</p></div>
                {selected.tanggal_pelunasan && (
                  <div><p className="text-xs text-muted-foreground">Dilunasi</p><p className="font-medium text-emerald-600">{formatDate(selected.tanggal_pelunasan)}</p></div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="gap-2 flex-1">
                  <Printer className="w-4 h-4" /> Cetak Akad
                </Button>
                <Button variant="outline" size="sm" className="gap-2 flex-1">
                  <FileText className="w-4 h-4" /> Bukti PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
