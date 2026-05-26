import { useState } from "react";
import { useCabang } from "@/hooks/use-cabang";
import { useAuth } from "@/hooks/use-auth";
import { useSupabaseBarang } from "@/hooks/use-supabase-barang";
import { useSupabaseNasabah } from "@/hooks/use-supabase-nasabah";
import { useSupabaseCabang } from "@/hooks/use-supabase-cabang";
import { formatCurrency, formatDate, getStatusBarangColor, getLabelStatus } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Search, Eye, Edit, QrCode, ChevronLeft, ChevronRight, Tag, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const kategoriLabels: Record<string, string> = {
  emas: "Emas", elektronik: "Elektronik", kendaraan: "Kendaraan",
  sertifikat: "Sertifikat", lainnya: "Lainnya",
};

export default function BarangPage() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { selectedCabang } = useCabang();
  const { data: cabangList } = useSupabaseCabang();
  const { data: nasabahList } = useSupabaseNasabah(selectedCabang?.id ?? null);
  const { data: barangList, loading, insert, update, remove } = useSupabaseBarang(selectedCabang?.id ?? null);

  const isOwner = profile?.role === "owner" || profile?.role === "super_admin";

  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nama_barang: "", kategori: "emas", merek: "", kondisi: "baik", berat: "", estimasi_nilai: "", lokasi_penyimpanan: "", nasabah_id: "", cabang_id: "" });
  const [selected, setSelected] = useState<typeof barangList[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openEdit = (b: typeof barangList[0]) => {
    setEditId(b.id);
    setEditForm({ nama_barang: b.nama_barang, kategori: b.kategori, merek: b.merek || "", kondisi: b.kondisi || "baik", berat: b.berat ? String(b.berat) : "", estimasi_nilai: b.estimasi_nilai ? String(b.estimasi_nilai) : "", lokasi_penyimpanan: b.lokasi_penyimpanan || "", nasabah_id: b.nasabah_id || "", cabang_id: b.cabang_id || "" });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editForm.nama_barang || !editForm.estimasi_nilai) { toast({ title: "Error", description: "Nama dan estimasi nilai wajib diisi.", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await update(editId!, { nama_barang: editForm.nama_barang, kategori: editForm.kategori, merek: editForm.merek || null, kondisi: editForm.kondisi || null, berat: editForm.berat ? parseFloat(editForm.berat) : null, estimasi_nilai: parseFloat(editForm.estimasi_nilai), lokasi_penyimpanan: editForm.lokasi_penyimpanan || null, nasabah_id: editForm.nasabah_id || null, cabang_id: editForm.cabang_id || null });
      setEditOpen(false);
      toast({ title: "Berhasil", description: "Data barang diperbarui." });
    } catch (e: unknown) { toast({ title: "Error", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const defaultCabang = cabangList[0]?.id ?? "";
  const [form, setForm] = useState({
    nama_barang: "", kategori: "emas", merek: "", kondisi: "baik",
    berat: "", estimasi_nilai: "", lokasi_penyimpanan: "", nasabah_id: "", cabang_id: "",
  });

  const perPage = 8;
  const filtered = barangList.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = b.nama_barang.toLowerCase().includes(q) || b.kode_barang.toLowerCase().includes(q);
    const matchKat = filterKategori === "all" || b.kategori === filterKategori;
    const matchSt = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchKat && matchSt;
  });
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSave = async () => {
    if (!form.nama_barang || !form.estimasi_nilai) {
      toast({ title: "Error", description: "Nama barang dan estimasi nilai wajib diisi.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const kode = `BRG-${new Date().getFullYear()}-${String(barangList.length + 1).padStart(3, "0")}`;
      await insert({
        kode_barang: kode,
        nama_barang: form.nama_barang,
        kategori: form.kategori,
        merek: form.merek || null,
        kondisi: form.kondisi || null,
        berat: form.berat ? parseFloat(form.berat) : null,
        estimasi_nilai: parseFloat(form.estimasi_nilai),
        lokasi_penyimpanan: form.lokasi_penyimpanan || null,
        status: "aktif",
        nasabah_id: form.nasabah_id || null,
        cabang_id: form.cabang_id || selectedCabang?.id || defaultCabang || null,
      });
      setOpen(false);
      setForm({ nama_barang: "", kategori: "emas", merek: "", kondisi: "baik", berat: "", estimasi_nilai: "", lokasi_penyimpanan: "", nasabah_id: "", cabang_id: "" });
      toast({ title: "Berhasil", description: "Barang jaminan berhasil ditambahkan." });
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Barang Jaminan</h1>
          <p className="text-muted-foreground text-sm">{barangList.length} barang terdaftar</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary shadow-emerald">
              <Plus className="w-4 h-4" /> Tambah Barang
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Input Barang Jaminan</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="col-span-2 space-y-1.5">
                <Label>Nama Barang *</Label>
                <Input placeholder="Nama barang" value={form.nama_barang} onChange={e => setForm({...form, nama_barang: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select value={form.kategori} onValueChange={v => setForm({...form, kategori: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(kategoriLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Kondisi</Label>
                <Select value={form.kondisi} onValueChange={v => setForm({...form, kondisi: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sangat_baik">Sangat Baik</SelectItem>
                    <SelectItem value="baik">Baik</SelectItem>
                    <SelectItem value="cukup">Cukup</SelectItem>
                    <SelectItem value="kurang">Kurang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Merek</Label>
                <Input placeholder="Merek/brand" value={form.merek} onChange={e => setForm({...form, merek: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Berat (gram)</Label>
                <Input type="number" placeholder="0" value={form.berat} onChange={e => setForm({...form, berat: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Estimasi Nilai (Rp) *</Label>
                <Input type="number" placeholder="0" value={form.estimasi_nilai} onChange={e => setForm({...form, estimasi_nilai: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Lokasi Simpan</Label>
                <Input placeholder="Lemari A-1" value={form.lokasi_penyimpanan} onChange={e => setForm({...form, lokasi_penyimpanan: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Nasabah</Label>
                <Select value={form.nasabah_id} onValueChange={v => setForm({...form, nasabah_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih nasabah" /></SelectTrigger>
                  <SelectContent>
                    {nasabahList.map(n => <SelectItem key={n.id} value={n.id}>{n.nama_lengkap}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Cabang</Label>
                <Select value={form.cabang_id || defaultCabang} onValueChange={v => setForm({...form, cabang_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih cabang" /></SelectTrigger>
                  <SelectContent>{cabangList.map(c => <SelectItem key={c.id} value={c.id}>{c.nama_cabang}</SelectItem>)}</SelectContent>
                </Select>
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

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari barang, kode..." className="pl-9 h-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={filterKategori} onValueChange={v => { setFilterKategori(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {Object.entries(kategoriLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="w-32 h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="ditebus">Ditebus</SelectItem>
                <SelectItem value="jatuh_tempo">Jatuh Tempo</SelectItem>
                <SelectItem value="dilelang">Dilelang</SelectItem>
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
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Kode</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Barang</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Kategori</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Nilai</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      {search ? "Tidak ada barang ditemukan" : "Belum ada barang. Klik 'Tambah Barang' untuk memulai."}
                    </td></tr>
                  ) : paginated.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition-smooth">
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono text-primary font-medium">{b.kode_barang}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-foreground">{b.nama_barang}</p>
                          {b.merek && <p className="text-xs text-muted-foreground">{b.merek}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-medium">
                          <Tag className="w-3 h-3" />{kategoriLabels[b.kategori] || b.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        <span className="text-sm font-semibold">{formatCurrency(b.estimasi_nilai || 0)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusBarangColor(b.status as "aktif" | "ditebus" | "jatuh_tempo" | "dilelang"))}>
                          {getLabelStatus(b.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => { setSelected(b); setViewOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(b)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => toast({ title: "QR Code", description: `Kode: ${b.kode_barang}` })}>
                            <QrCode className="w-4 h-4" />
                          </Button>
                          {isOwner && (
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(b.id)}>
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
          <DialogHeader><DialogTitle>Detail Barang Jaminan</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-primary font-medium">{selected.kode_barang}</span>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusBarangColor(selected.status as "aktif" | "ditebus" | "jatuh_tempo" | "dilelang"))}>
                    {getLabelStatus(selected.status)}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-lg">{selected.nama_barang}</h3>
                <p className="text-sm text-muted-foreground">{selected.merek} · {kategoriLabels[selected.kategori] || selected.kategori}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Kondisi</p><p className="font-medium">{getLabelStatus(selected.kondisi || "")}</p></div>
                {selected.berat && <div><p className="text-xs text-muted-foreground">Berat</p><p className="font-medium">{selected.berat} gram</p></div>}
                <div><p className="text-xs text-muted-foreground">Lokasi</p><p className="font-medium">{selected.lokasi_penyimpanan || "-"}</p></div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Estimasi Nilai</p>
                  <p className="font-bold text-xl text-primary">{formatCurrency(selected.estimasi_nilai || 0)}</p>
                </div>
                <div><p className="text-xs text-muted-foreground">Terdaftar</p>
                  <p className="font-medium">{selected.created_at ? formatDate(selected.created_at) : "-"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Barang Jaminan</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 space-y-1.5"><Label>Nama Barang *</Label><Input value={editForm.nama_barang} onChange={e => setEditForm({...editForm, nama_barang: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Kategori</Label>
              <Select value={editForm.kategori} onValueChange={v => setEditForm({...editForm, kategori: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(kategoriLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Kondisi</Label>
              <Select value={editForm.kondisi} onValueChange={v => setEditForm({...editForm, kondisi: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="sangat_baik">Sangat Baik</SelectItem><SelectItem value="baik">Baik</SelectItem><SelectItem value="cukup">Cukup</SelectItem><SelectItem value="kurang">Kurang</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Merek</Label><Input value={editForm.merek} onChange={e => setEditForm({...editForm, merek: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Berat (gram)</Label><Input type="number" value={editForm.berat} onChange={e => setEditForm({...editForm, berat: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Estimasi Nilai (Rp) *</Label><Input type="number" value={editForm.estimasi_nilai} onChange={e => setEditForm({...editForm, estimasi_nilai: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Lokasi Simpan</Label><Input value={editForm.lokasi_penyimpanan} onChange={e => setEditForm({...editForm, lokasi_penyimpanan: e.target.value})} /></div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button className="gradient-primary shadow-emerald gap-2" onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Perbarui
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus barang jaminan ini?</AlertDialogTitle>
            <AlertDialogDescription>Data barang akan dihapus permanen dari database.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => {
              try { await remove(deleteId!); toast({ title: "Barang dihapus" }); } catch(e: unknown) { toast({ title: "Gagal", description: (e as Error).message, variant: "destructive" }); }
              setDeleteId(null);
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
