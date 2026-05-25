import { useState } from "react";
import {
  dummyPembayaran, Pembayaran, dummyTransaksi,
  formatCurrency, formatDate, getLabelStatus,
} from "@/lib/dummy-data";
import { useCabang } from "@/hooks/use-cabang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CreditCard, Plus, Search, Printer, Eye,
  ChevronLeft, ChevronRight, Banknote, Smartphone, Building, QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const metodeIcons: Record<string, React.ReactNode> = {
  tunai: <Banknote className="w-3.5 h-3.5" />,
  transfer: <Building className="w-3.5 h-3.5" />,
  qris: <QrCode className="w-3.5 h-3.5" />,
  ewallet: <Smartphone className="w-3.5 h-3.5" />,
};

const jenisColors: Record<string, string> = {
  ujrah: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  cicilan: "bg-gold/10 text-gold-foreground border-gold/20",
  pelunasan: "bg-primary/10 text-primary border-primary/20",
};

export default function PembayaranPage() {
  const { toast } = useToast();
  const { selectedCabang } = useCabang();
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>(dummyPembayaran);
  const [form, setForm] = useState({
    transaksi_id: "trx-001", jenis_pembayaran: "ujrah",
    jumlah: "", metode: "tunai", keterangan: "",
  });

  const perPage = 8;
  const filtered = pembayaranList.filter((p) => {
    const matchSearch = p.nomor_pembayaran.toLowerCase().includes(search.toLowerCase()) ||
      (p.nomor_transaksi || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.nasabah_nama || "").toLowerCase().includes(search.toLowerCase());
    const matchJenis = filterJenis === "all" || p.jenis_pembayaran === filterJenis;
    const matchCabang = !selectedCabang || (() => {
      const trx = dummyTransaksi.find(t => t.id === p.transaksi_id);
      return trx?.cabang_id === selectedCabang.id;
    })();
    return matchSearch && matchJenis && matchCabang;
  });
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const totalPendapatan = pembayaranList.reduce((sum, p) => sum + p.jumlah, 0);

  const handleSave = () => {
    if (!form.jumlah || !form.transaksi_id) {
      toast({ title: "Error", description: "Isi semua field.", variant: "destructive" });
      return;
    }
    const trx = dummyTransaksi.find(t => t.id === form.transaksi_id);
    const newPay: Pembayaran = {
      id: `pay-${Date.now()}`,
      nomor_pembayaran: `PAY-2026-${String(pembayaranList.length + 1).padStart(3, "0")}`,
      transaksi_id: form.transaksi_id,
      nomor_transaksi: trx?.nomor_transaksi,
      nasabah_nama: trx?.nasabah_nama,
      jenis_pembayaran: form.jenis_pembayaran as Pembayaran["jenis_pembayaran"],
      jumlah: parseFloat(form.jumlah),
      metode: form.metode as Pembayaran["metode"],
      tanggal_bayar: new Date().toISOString().split("T")[0],
      keterangan: form.keterangan,
    };
    setPembayaranList([...pembayaranList, newPay]);
    setOpen(false);
    toast({ title: "Berhasil", description: `Pembayaran ${newPay.nomor_pembayaran} dicatat.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pembayaran</h1>
          <p className="text-muted-foreground text-sm">Total pendapatan: <span className="text-primary font-semibold">{formatCurrency(totalPendapatan)}</span></p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary shadow-emerald">
              <Plus className="w-4 h-4" /> Catat Pembayaran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Catat Pembayaran</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Transaksi *</Label>
                <Select value={form.transaksi_id} onValueChange={v => setForm({...form, transaksi_id: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dummyTransaksi.filter(t => t.status !== "lunas").map(t =>
                      <SelectItem key={t.id} value={t.id}>{t.nomor_transaksi} - {t.nasabah_nama}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Jenis Pembayaran</Label>
                  <Select value={form.jenis_pembayaran} onValueChange={v => setForm({...form, jenis_pembayaran: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ujrah">Ujrah</SelectItem>
                      <SelectItem value="cicilan">Cicilan</SelectItem>
                      <SelectItem value="pelunasan">Pelunasan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Metode Bayar</Label>
                  <Select value={form.metode} onValueChange={v => setForm({...form, metode: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tunai">Tunai</SelectItem>
                      <SelectItem value="transfer">Transfer Bank</SelectItem>
                      <SelectItem value="qris">QRIS</SelectItem>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Jumlah (Rp) *</Label>
                <Input type="number" placeholder="0" value={form.jumlah} onChange={e => setForm({...form, jumlah: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Keterangan</Label>
                <Input placeholder="Keterangan pembayaran" value={form.keterangan} onChange={e => setForm({...form, keterangan: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button className="gradient-primary shadow-emerald" onClick={handleSave}>Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Ujrah", value: formatCurrency(pembayaranList.filter(p=>p.jenis_pembayaran==="ujrah").reduce((s,p)=>s+p.jumlah,0)), color: "text-blue-600" },
          { label: "Total Cicilan", value: formatCurrency(pembayaranList.filter(p=>p.jenis_pembayaran==="cicilan").reduce((s,p)=>s+p.jumlah,0)), color: "text-gold" },
          { label: "Total Pelunasan", value: formatCurrency(pembayaranList.filter(p=>p.jenis_pembayaran==="pelunasan").reduce((s,p)=>s+p.jumlah,0)), color: "text-primary" },
          { label: "Jumlah Transaksi", value: pembayaranList.length, color: "text-foreground" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl bg-card border border-border shadow-sm">
            <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari nomor pembayaran, nasabah..." className="pl-9 h-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={filterJenis} onValueChange={v => { setFilterJenis(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="ujrah">Ujrah</SelectItem>
                <SelectItem value="cicilan">Cicilan</SelectItem>
                <SelectItem value="pelunasan">Pelunasan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["No. Pembayaran", "Transaksi", "Nasabah", "Jenis", "Jumlah", "Metode", "Tanggal", "Aksi"].map(h => (
                    <th key={h} className={cn(
                      "text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3",
                      h === "Jumlah" && "text-right",
                      h === "Aksi" && "text-center",
                      ["Nasabah"].includes(h) && "hidden sm:table-cell",
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />Tidak ada pembayaran
                  </td></tr>
                ) : paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-smooth">
                    <td className="px-4 py-3.5"><span className="text-sm font-medium text-primary">{p.nomor_pembayaran}</span></td>
                    <td className="px-4 py-3.5"><span className="text-xs text-muted-foreground">{p.nomor_transaksi}</span></td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><span className="text-sm">{p.nasabah_nama}</span></td>
                    <td className="px-4 py-3.5">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", jenisColors[p.jenis_pembayaran])}>
                        {getLabelStatus(p.jenis_pembayaran)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right"><span className="text-sm font-semibold">{formatCurrency(p.jumlah)}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {metodeIcons[p.metode]}
                        {getLabelStatus(p.metode)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-xs text-muted-foreground">{formatDate(p.tanggal_bayar)}</span></td>
                    <td className="px-4 py-3.5 text-center">
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">{(page-1)*perPage+1}–{Math.min(page*perPage, filtered.length)} dari {filtered.length}</p>
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
    </div>
  );
}
