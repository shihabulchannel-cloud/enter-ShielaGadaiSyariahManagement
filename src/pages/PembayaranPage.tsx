import { useState } from "react";
import { useCabang } from "@/hooks/use-cabang";
import { useAuth } from "@/hooks/use-auth";
import { useSupabasePembayaran, PembayaranRow } from "@/hooks/use-supabase-pembayaran";
import { useSupabaseTransaksi } from "@/hooks/use-supabase-transaksi";
import { formatCurrency, formatDate, getLabelStatus } from "@/lib/dummy-data";
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
  CreditCard, Plus, Search, Printer, ChevronLeft, ChevronRight,
  Banknote, Smartphone, Building, QrCode, Trash2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const metodeIcons: Record<string, React.ReactNode> = {
  tunai:    <Banknote className="w-3.5 h-3.5" />,
  transfer: <Building className="w-3.5 h-3.5" />,
  qris:     <QrCode className="w-3.5 h-3.5" />,
  ewallet:  <Smartphone className="w-3.5 h-3.5" />,
};

const jenisColors: Record<string, string> = {
  ujrah:     "bg-blue-500/10 text-blue-600 border-blue-500/20",
  cicilan:   "bg-gold/10 text-gold-foreground border-gold/20",
  pelunasan: "bg-primary/10 text-primary border-primary/20",
};

const metodeLabel: Record<string, string> = { tunai: "Tunai", transfer: "Transfer Bank", qris: "QRIS", ewallet: "E-Wallet" };

function generateReceiptHtml(p: PembayaranRow): string {
  const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const nasabah = (p.transaksi?.nasabah as { nama_lengkap: string } | null)?.nama_lengkap || "-";
  const noTrx   = p.transaksi?.nomor_transaksi || "-";
  const jenis   = { ujrah: "Ujrah", cicilan: "Cicilan", pelunasan: "Pelunasan" }[p.jenis_pembayaran] || p.jenis_pembayaran;
  const metode  = metodeLabel[p.metode] || p.metode;

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
<title>Bukti Pembayaran - ${p.nomor_pembayaran}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;font-size:12px;background:#fff;color:#111;padding:24px}
.receipt{max-width:320px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden}
.header{background:#1a6a42;color:#fff;padding:16px;text-align:center}
.header img{width:36px;height:36px;object-fit:contain;margin-bottom:6px;display:block;margin-left:auto;margin-right:auto}
.header h1{font-size:14px;letter-spacing:0.5px;margin-bottom:2px}
.header p{font-size:10px;opacity:0.85}
.body{padding:16px}
.nomor{background:#f5f5f5;border-radius:6px;padding:10px;text-align:center;margin-bottom:14px}
.nomor p{font-size:10px;color:#666;margin-bottom:4px}
.nomor h2{font-size:16px;font-weight:bold;color:#1a6a42;letter-spacing:1px}
.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:11px}
.row:last-child{border:none}
.row .label{color:#666}
.row .value{font-weight:600;text-align:right;max-width:60%}
.amount{margin:14px 0;background:#e8f5ee;border-radius:8px;padding:12px;text-align:center}
.amount p{font-size:10px;color:#555;margin-bottom:4px}
.amount h3{font-size:22px;font-weight:bold;color:#1a6a42}
.footer{background:#f9f9f9;padding:12px;text-align:center;font-size:10px;color:#999;border-top:1px solid #eee}
.sign{margin-top:16px;display:flex;justify-content:flex-end;padding-top:8px;border-top:1px solid #eee}
.sign-box{text-align:center;font-size:10px;color:#666}
.sign-line{border-top:1px solid #333;margin-top:40px;padding-top:4px;width:120px}
@media print{body{padding:0}.receipt{border:none;border-radius:0;max-width:100%}}
</style></head><body>
<div class="receipt">
  <div class="header">
    <img src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059471/b1dd8944-57af-49.png" crossorigin="anonymous"/>
    <h1>SHIELA GADAI SYARIAH</h1>
    <p>Bukti Pembayaran Resmi</p>
  </div>
  <div class="body">
    <div class="nomor">
      <p>Nomor Pembayaran</p>
      <h2>${p.nomor_pembayaran}</h2>
    </div>
    <div class="row"><span class="label">Nasabah</span><span class="value">${nasabah}</span></div>
    <div class="row"><span class="label">No. Transaksi</span><span class="value">${noTrx}</span></div>
    <div class="row"><span class="label">Jenis Pembayaran</span><span class="value">${jenis}</span></div>
    <div class="row"><span class="label">Metode</span><span class="value">${metode}</span></div>
    <div class="row"><span class="label">Tanggal</span><span class="value">${p.tanggal_bayar ? new Date(p.tanggal_bayar).toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"}) : today}</span></div>
    ${p.keterangan ? `<div class="row"><span class="label">Keterangan</span><span class="value">${p.keterangan}</span></div>` : ""}
    <div class="amount">
      <p>Jumlah Dibayarkan</p>
      <h3>Rp ${p.jumlah.toLocaleString("id-ID")}</h3>
    </div>
    <div class="sign">
      <div class="sign-box">
        <p>Petugas,</p>
        <div class="sign-line">( _______________ )</div>
      </div>
    </div>
  </div>
  <div class="footer">Dicetak pada ${today} · Shiela Gadai Syariah · Bebas Riba</div>
</div>
</body></html>`;
}

function printReceipt(p: PembayaranRow) {
  const win = window.open("", "_blank", "width=400,height=620");
  if (win) { win.document.write(generateReceiptHtml(p)); win.document.close(); setTimeout(() => { win.focus(); win.print(); }, 500); }
}

export default function PembayaranPage() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { selectedCabang } = useCabang();
  const { data: transaksiList } = useSupabaseTransaksi(null);
  const { data: pembayaranList, loading, insert, remove } = useSupabasePembayaran(selectedCabang?.id ?? null);

  const isOwner = profile?.role === "owner" || profile?.role === "super_admin";

  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    transaksi_id: "", jenis_pembayaran: "ujrah",
    jumlah: "", metode: "tunai", keterangan: "",
  });

  const perPage = 8;
  const filtered = pembayaranList.filter((p) => {
    const noTrx  = p.transaksi?.nomor_transaksi || "";
    const nama   = (p.transaksi?.nasabah as { nama_lengkap: string } | null)?.nama_lengkap || "";
    const matchSearch = p.nomor_pembayaran.toLowerCase().includes(search.toLowerCase()) ||
      noTrx.toLowerCase().includes(search.toLowerCase()) ||
      nama.toLowerCase().includes(search.toLowerCase());
    const matchJenis = filterJenis === "all" || p.jenis_pembayaran === filterJenis;
    return matchSearch && matchJenis;
  });
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSave = async () => {
    if (!form.jumlah || !form.transaksi_id) {
      toast({ title: "Error", description: "Pilih transaksi dan isi jumlah.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const nomor = `PAY-${new Date().getFullYear()}-${String(pembayaranList.length + 1).padStart(3, "0")}`;
      await insert({
        nomor_pembayaran: nomor,
        transaksi_id: form.transaksi_id,
        jenis_pembayaran: form.jenis_pembayaran,
        jumlah: parseFloat(form.jumlah),
        metode: form.metode,
        tanggal_bayar: new Date().toISOString().split("T")[0],
        keterangan: form.keterangan || undefined,
      });
      setOpen(false);
      setForm({ transaksi_id: "", jenis_pembayaran: "ujrah", jumlah: "", metode: "tunai", keterangan: "" });
      toast({ title: "Berhasil", description: `Pembayaran ${nomor} dicatat.` });
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const totalPendapatan = pembayaranList.reduce((sum, p) => sum + p.jumlah, 0);

  const getNasabahNama = (p: PembayaranRow) =>
    (p.transaksi?.nasabah as { nama_lengkap: string } | null)?.nama_lengkap || "-";
  const getNoTrx = (p: PembayaranRow) => p.transaksi?.nomor_transaksi || "-";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pembayaran</h1>
          <p className="text-muted-foreground text-sm">Total pendapatan: <span className="text-primary font-semibold">{formatCurrency(totalPendapatan)}</span></p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary shadow-emerald"><Plus className="w-4 h-4" /> Catat Pembayaran</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Catat Pembayaran</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Transaksi *</Label>
                <Select value={form.transaksi_id} onValueChange={v => setForm({...form, transaksi_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih transaksi" /></SelectTrigger>
                  <SelectContent>
                    {transaksiList.filter(t => t.status !== "lunas").map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nomor_transaksi} — {(t.nasabah as { nama_lengkap: string } | null)?.nama_lengkap || ""}
                      </SelectItem>
                    ))}
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
              <Button className="gradient-primary shadow-emerald gap-2" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Ujrah",     value: formatCurrency(pembayaranList.filter(p=>p.jenis_pembayaran==="ujrah").reduce((s,p)=>s+p.jumlah,0)),     color: "text-blue-600" },
          { label: "Total Cicilan",   value: formatCurrency(pembayaranList.filter(p=>p.jenis_pembayaran==="cicilan").reduce((s,p)=>s+p.jumlah,0)),   color: "text-gold" },
          { label: "Total Pelunasan", value: formatCurrency(pembayaranList.filter(p=>p.jenis_pembayaran==="pelunasan").reduce((s,p)=>s+p.jumlah,0)), color: "text-primary" },
          { label: "Jumlah Transaksi",value: pembayaranList.length, color: "text-foreground" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl bg-card border border-border shadow-sm">
            <p className={cn("text-lg font-bold truncate", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
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
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">No. Bayar</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Nasabah</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Jenis</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Jumlah</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Metode</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Tanggal</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      {search ? "Tidak ada pembayaran ditemukan" : "Belum ada pembayaran dicatat."}
                    </td></tr>
                  ) : paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-smooth">
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-primary">{p.nomor_pembayaran}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{getNasabahNama(p)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div>
                          <p className="text-sm">{getNasabahNama(p)}</p>
                          <p className="text-xs text-muted-foreground">{getNoTrx(p)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", jenisColors[p.jenis_pembayaran])}>
                          {getLabelStatus(p.jenis_pembayaran)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-semibold">{formatCurrency(p.jumlah)}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {metodeIcons[p.metode]}{metodeLabel[p.metode] || p.metode}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">{formatDate(p.tanggal_bayar)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => printReceipt(p)}>
                            <Printer className="w-4 h-4" />
                          </Button>
                          {isOwner && (
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(p.id)}>
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

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pembayaran ini?</AlertDialogTitle>
            <AlertDialogDescription>Data pembayaran akan dihapus permanen dari database.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => {
              try { await remove(deleteId!); toast({ title: "Pembayaran dihapus" }); } catch(e: unknown) { toast({ title: "Gagal", description: (e as Error).message, variant: "destructive" }); }
              setDeleteId(null);
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
