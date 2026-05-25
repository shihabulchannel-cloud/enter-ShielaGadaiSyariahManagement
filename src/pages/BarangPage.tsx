import { useState } from "react";
import {
  dummyBarang, BarangJaminan, dummyNasabah, dummyCabang,
  formatCurrency, formatDate, getStatusBarangColor, getLabelStatus
} from "@/lib/dummy-data";
import { useCabang } from "@/hooks/use-cabang";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus, Search, Eye, Edit, QrCode, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const kategoriIcons: Record<string, string> = {
  emas: "Emas", elektronik: "Elektronik", kendaraan: "Kendaraan",
  sertifikat: "Sertifikat", lainnya: "Lainnya",
};

export default function BarangPage() {
  const { toast } = useToast();
  const { selectedCabang } = useCabang();
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<BarangJaminan | null>(null);
  const [barangList, setBarangList] = useLocalStorage<BarangJaminan[]>("shiela-barang", dummyBarang);

  const [form, setForm] = useState({
    nama_barang: "", kategori: "emas", merek: "", kondisi: "baik",
    berat: "", estimasi_nilai: "", lokasi_penyimpanan: "", nasabah_id: "nsb-001", cabang_id: "cbg-001",
  });

  const perPage = 8;
  const filtered = barangList.filter((b) => {
    const matchSearch = b.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
      b.kode_barang.toLowerCase().includes(search.toLowerCase()) ||
      (b.nasabah_nama || "").toLowerCase().includes(search.toLowerCase());
    const matchKategori = filterKategori === "all" || b.kategori === filterKategori;
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchCabang = !selectedCabang || b.cabang_id === selectedCabang.id;
    return matchSearch && matchKategori && matchStatus && matchCabang;
  });
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSave = () => {
    if (!form.nama_barang || !form.estimasi_nilai) {
      toast({ title: "Error", description: "Nama barang dan estimasi nilai wajib diisi.", variant: "destructive" });
      return;
    }
    const nasabah = dummyNasabah.find(n => n.id === form.nasabah_id);
    const newBarang: BarangJaminan = {
      id: `brg-${Date.now()}`,
      kode_barang: `BRG-2026-${String(barangList.length + 1).padStart(3, "0")}`,
      nama_barang: form.nama_barang,
      kategori: form.kategori as BarangJaminan["kategori"],
      merek: form.merek,
      kondisi: form.kondisi as BarangJaminan["kondisi"],
      berat: form.berat ? parseFloat(form.berat) : undefined,
      estimasi_nilai: parseFloat(form.estimasi_nilai),
      lokasi_penyimpanan: form.lokasi_penyimpanan,
      status: "aktif",
      nasabah_id: form.nasabah_id,
      nasabah_nama: nasabah?.nama_lengkap,
      cabang_id: form.cabang_id,
      created_at: new Date().toISOString().split("T")[0],
    };
    setBarangList([...barangList, newBarang]);
    setOpen(false);
    toast({ title: "Berhasil", description: "Barang jaminan berhasil ditambahkan." });
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
            <DialogHeader>
              <DialogTitle>Input Barang Jaminan</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="col-span-2 space-y-1.5">
                <Label>Nama Barang *</Label>
                <Input placeholder="Nama barang" value={form.nama_barang} onChange={e => setForm({...form, nama_barang: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select value={form.kategori} onValueChange={v => setForm({...form, kategori: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(kategoriIcons).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dummyNasabah.map(n => <SelectItem key={n.id} value={n.id}>{n.nama_lengkap}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Cabang</Label>
                <Select value={form.cabang_id} onValueChange={v => setForm({...form, cabang_id: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dummyCabang.map(c => <SelectItem key={c.id} value={c.id}>{c.nama_cabang}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button className="gradient-primary shadow-emerald" onClick={handleSave}>Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari barang, kode, nasabah..." className="pl-9 h-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={filterKategori} onValueChange={v => { setFilterKategori(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {Object.entries(kategoriIcons).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="ditebus">Ditebus</SelectItem>
                <SelectItem value="jatuh_tempo">Jatuh Tempo</SelectItem>
                <SelectItem value="dilelang">Dilelang</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Kode", "Barang", "Kategori", "Kondisi", "Estimasi Nilai", "Lokasi", "Status", "Aksi"].map(h => (
                    <th key={h} className={cn(
                      "text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3",
                      ["Kondisi", "Lokasi"].includes(h) && "hidden lg:table-cell",
                      ["Estimasi Nilai"].includes(h) && "text-right",
                      ["Status", "Aksi"].includes(h) && "text-center",
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Tidak ada barang ditemukan
                    </td>
                  </tr>
                ) : paginated.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-smooth">
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-primary font-medium">{b.kode_barang}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-foreground">{b.nama_barang}</p>
                        <p className="text-xs text-muted-foreground">{b.nasabah_nama}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-medium">
                        <Tag className="w-3 h-3" />
                        {getLabelStatus(b.kategori)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{getLabelStatus(b.kondisi)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-foreground">{formatCurrency(b.estimasi_nilai)}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{b.lokasi_penyimpanan}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusBarangColor(b.status))}>
                        {getLabelStatus(b.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => { setSelected(b); setViewOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
                          <QrCode className="w-4 h-4" />
                        </Button>
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

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detail Barang Jaminan</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-primary font-medium">{selected.kode_barang}</span>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusBarangColor(selected.status))}>{getLabelStatus(selected.status)}</span>
                </div>
                <h3 className="font-semibold text-foreground text-lg">{selected.nama_barang}</h3>
                <p className="text-sm text-muted-foreground">{selected.merek} · {getLabelStatus(selected.kategori)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Nasabah</p><p className="font-medium">{selected.nasabah_nama}</p></div>
                <div><p className="text-xs text-muted-foreground">Kondisi</p><p className="font-medium">{getLabelStatus(selected.kondisi)}</p></div>
                {selected.berat && <div><p className="text-xs text-muted-foreground">Berat</p><p className="font-medium">{selected.berat} gram</p></div>}
                <div><p className="text-xs text-muted-foreground">Lokasi</p><p className="font-medium">{selected.lokasi_penyimpanan}</p></div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Estimasi Nilai</p>
                  <p className="font-bold text-xl text-primary">{formatCurrency(selected.estimasi_nilai)}</p>
                </div>
                <div><p className="text-xs text-muted-foreground">Terdaftar</p><p className="font-medium">{formatDate(selected.created_at)}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
