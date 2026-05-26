import { useState } from "react";
import { useCabang } from "@/hooks/use-cabang";
import { useAuth } from "@/hooks/use-auth";
import { useSupabaseNasabah } from "@/hooks/use-supabase-nasabah";
import { useSupabaseCabang } from "@/hooks/use-supabase-cabang";
import { formatDate } from "@/lib/dummy-data";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Plus, Search, Edit, Eye, Phone, MapPin, Briefcase,
  ChevronLeft, ChevronRight, Loader2, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function NasabahPage() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { selectedCabang } = useCabang();
  const { data: cabangList } = useSupabaseCabang();
  const { data: nasabahList, loading, insert, update, remove } = useSupabaseNasabah(selectedCabang?.id ?? null);

  const isOwner = profile?.role === "owner" || profile?.role === "super_admin";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nama_lengkap: "", nik: "", alamat: "", nomor_hp: "", pekerjaan: "", tanggal_lahir: "", cabang_id: "" });
  const [selected, setSelected] = useState<typeof nasabahList[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openEdit = (n: typeof nasabahList[0]) => {
    setEditId(n.id);
    setEditForm({ nama_lengkap: n.nama_lengkap, nik: n.nik, alamat: n.alamat || "", nomor_hp: n.nomor_hp || "", pekerjaan: n.pekerjaan || "", tanggal_lahir: n.tanggal_lahir || "", cabang_id: n.cabang_id || "" });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editForm.nama_lengkap || !editForm.nik) { toast({ title: "Error", description: "Nama dan NIK wajib diisi.", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await update(editId!, { nama_lengkap: editForm.nama_lengkap, nik: editForm.nik, alamat: editForm.alamat || null, nomor_hp: editForm.nomor_hp || null, pekerjaan: editForm.pekerjaan || null, tanggal_lahir: editForm.tanggal_lahir || null, cabang_id: editForm.cabang_id || null });
      setEditOpen(false);
      toast({ title: "Berhasil", description: "Data nasabah diperbarui." });
    } catch (e: unknown) { toast({ title: "Error", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const defaultCabang = cabangList[0]?.id ?? "";
  const [form, setForm] = useState({
    nama_lengkap: "", nik: "", alamat: "", nomor_hp: "",
    pekerjaan: "", tanggal_lahir: "", cabang_id: "",
  });

  const perPage = 8;
  const filtered = nasabahList.filter((n) => {
    const q = search.toLowerCase();
    return n.nama_lengkap.toLowerCase().includes(q) ||
      n.nik.includes(search) ||
      (n.nomor_hp || "").includes(search);
  });
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSave = async () => {
    if (!form.nama_lengkap || !form.nik) {
      toast({ title: "Error", description: "Nama dan NIK wajib diisi.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const kode = `NSB-${String(nasabahList.length + 1).padStart(3, "0")}`;
      await insert({
        kode_nasabah: kode,
        nama_lengkap: form.nama_lengkap,
        nik: form.nik,
        alamat: form.alamat || null,
        nomor_hp: form.nomor_hp || null,
        pekerjaan: form.pekerjaan || null,
        tanggal_lahir: form.tanggal_lahir || null,
        cabang_id: form.cabang_id || selectedCabang?.id || defaultCabang || null,
        is_active: true,
      });
      setOpen(false);
      setForm({ nama_lengkap: "", nik: "", alamat: "", nomor_hp: "", pekerjaan: "", tanggal_lahir: "", cabang_id: "" });
      toast({ title: "Berhasil", description: "Nasabah berhasil ditambahkan." });
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
          <h1 className="text-2xl font-bold text-foreground">Data Nasabah</h1>
          <p className="text-muted-foreground text-sm">{nasabahList.length} nasabah terdaftar</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary shadow-emerald">
              <Plus className="w-4 h-4" /> Tambah Nasabah
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Tambah Nasabah Baru</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="col-span-2 space-y-1.5">
                <Label>Nama Lengkap *</Label>
                <Input placeholder="Nama lengkap nasabah" value={form.nama_lengkap} onChange={e => setForm({...form, nama_lengkap: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>NIK *</Label>
                <Input placeholder="16 digit NIK" maxLength={16} value={form.nik} onChange={e => setForm({...form, nik: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Nomor HP</Label>
                <Input placeholder="08xxxxxxxxxx" value={form.nomor_hp} onChange={e => setForm({...form, nomor_hp: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Alamat</Label>
                <Textarea placeholder="Alamat lengkap" rows={2} value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Pekerjaan</Label>
                <Input placeholder="Pekerjaan" value={form.pekerjaan} onChange={e => setForm({...form, pekerjaan: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Lahir</Label>
                <Input type="date" value={form.tanggal_lahir} onChange={e => setForm({...form, tanggal_lahir: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Cabang</Label>
                <Select value={form.cabang_id || defaultCabang} onValueChange={v => setForm({...form, cabang_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih cabang" /></SelectTrigger>
                  <SelectContent>
                    {cabangList.map(c => <SelectItem key={c.id} value={c.id}>{c.nama_cabang}</SelectItem>)}
                  </SelectContent>
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari nama, NIK, atau nomor HP..." className="pl-9 h-9" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
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
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Nasabah</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">NIK</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Kontak</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Pekerjaan</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      {search ? "Tidak ada nasabah ditemukan" : "Belum ada nasabah. Klik 'Tambah Nasabah' untuk memulai."}
                    </td></tr>
                  ) : paginated.map((n) => (
                    <tr key={n.id} className="hover:bg-muted/30 transition-smooth">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                            {n.nama_lengkap.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{n.nama_lengkap}</p>
                            <p className="text-xs text-muted-foreground">{n.kode_nasabah}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground font-mono">{n.nik}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />{n.nomor_hp || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />{n.pekerjaan || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge className={cn(n.is_active ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground")}>
                          {n.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => { setSelected(n); setViewOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(n)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {isOwner && (
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(n.id)}>
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
              <p className="text-xs text-muted-foreground">
                {(page-1)*perPage+1}–{Math.min(page*perPage, filtered.length)} dari {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="w-8 h-8" disabled={page===1} onClick={() => setPage(p=>p-1)}><ChevronLeft className="w-4 h-4" /></Button>
                {Array.from({length:Math.min(totalPages,5)},(_,i)=>(
                  <Button key={i} variant={page===i+1?"default":"outline"} size="icon" className={cn("w-8 h-8 text-xs",page===i+1&&"gradient-primary")} onClick={()=>setPage(i+1)}>{i+1}</Button>
                ))}
                <Button variant="outline" size="icon" className="w-8 h-8" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detail Nasabah</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {selected.nama_lengkap.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selected.nama_lengkap}</h3>
                  <p className="text-sm text-muted-foreground">{selected.kode_nasabah}</p>
                  <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 text-xs">
                    {selected.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">NIK</p><p className="font-medium font-mono">{selected.nik}</p></div>
                <div><p className="text-muted-foreground text-xs">Nomor HP</p><p className="font-medium">{selected.nomor_hp || "-"}</p></div>
                <div><p className="text-muted-foreground text-xs">Pekerjaan</p><p className="font-medium">{selected.pekerjaan || "-"}</p></div>
                <div><p className="text-muted-foreground text-xs">Tgl Lahir</p><p className="font-medium">{selected.tanggal_lahir ? formatDate(selected.tanggal_lahir) : "-"}</p></div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Alamat</p>
                  <div className="flex items-start gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="font-medium">{selected.alamat || "-"}</p>
                  </div>
                </div>
                <div><p className="text-muted-foreground text-xs">Terdaftar</p>
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
          <DialogHeader><DialogTitle>Edit Nasabah</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 space-y-1.5"><Label>Nama Lengkap *</Label><Input value={editForm.nama_lengkap} onChange={e => setEditForm({...editForm, nama_lengkap: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>NIK *</Label><Input maxLength={16} value={editForm.nik} onChange={e => setEditForm({...editForm, nik: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Nomor HP</Label><Input value={editForm.nomor_hp} onChange={e => setEditForm({...editForm, nomor_hp: e.target.value})} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Alamat</Label><Textarea rows={2} value={editForm.alamat} onChange={e => setEditForm({...editForm, alamat: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Pekerjaan</Label><Input value={editForm.pekerjaan} onChange={e => setEditForm({...editForm, pekerjaan: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Tanggal Lahir</Label><Input type="date" value={editForm.tanggal_lahir} onChange={e => setEditForm({...editForm, tanggal_lahir: e.target.value})} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Cabang</Label>
              <Select value={editForm.cabang_id || cabangList[0]?.id || ""} onValueChange={v => setEditForm({...editForm, cabang_id: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih cabang" /></SelectTrigger>
                <SelectContent>{cabangList.map(c => <SelectItem key={c.id} value={c.id}>{c.nama_cabang}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button className="gradient-primary shadow-emerald gap-2" onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Perbarui
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus nasabah ini?</AlertDialogTitle>
            <AlertDialogDescription>Data nasabah akan dihapus permanen dari database dan tidak dapat dikembalikan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => {
              try { await remove(deleteId!); toast({ title: "Nasabah dihapus" }); } catch(e: unknown) { toast({ title: "Gagal", description: (e as Error).message, variant: "destructive" }); }
              setDeleteId(null);
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
