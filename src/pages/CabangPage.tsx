import { useState } from "react";
import { dummyCabang, Cabang, formatCurrency } from "@/lib/dummy-data";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Building2, Plus, Search, Edit, Eye, Phone, Mail, MapPin, Users, HandCoins, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const emptyForm = { nama_cabang: "", kode_cabang: "", alamat: "", telepon: "", email: "", kepala_cabang: "" };

// Defined OUTSIDE component to prevent remount on every re-render
function CabangFormFields({ data, onChange }: { data: typeof emptyForm; onChange: (d: typeof emptyForm) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div className="col-span-2 space-y-1.5">
        <Label>Nama Cabang *</Label>
        <Input placeholder="Nama cabang" value={data.nama_cabang} onChange={e => onChange({ ...data, nama_cabang: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Kode Cabang *</Label>
        <Input placeholder="CBG-005" value={data.kode_cabang} onChange={e => onChange({ ...data, kode_cabang: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Telepon</Label>
        <Input placeholder="0xx-xxxxxxxx" value={data.telepon} onChange={e => onChange({ ...data, telepon: e.target.value })} />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label>Email</Label>
        <Input type="email" placeholder="cabang@shielagadai.com" value={data.email} onChange={e => onChange({ ...data, email: e.target.value })} />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label>Kepala Cabang</Label>
        <Input placeholder="Nama kepala cabang" value={data.kepala_cabang} onChange={e => onChange({ ...data, kepala_cabang: e.target.value })} />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label>Alamat</Label>
        <Input placeholder="Alamat lengkap cabang" value={data.alamat} onChange={e => onChange({ ...data, alamat: e.target.value })} />
      </div>
    </div>
  );
}

export default function CabangPage() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const canEditDana = profile?.role === "owner" || profile?.role === "super_admin";

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Cabang | null>(null);
  const [cabangList, setCabangList] = useState<Cabang[]>(dummyCabang);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editTotalDana, setEditTotalDana] = useState("");

  const filtered = cabangList.filter(
    c => c.nama_cabang.toLowerCase().includes(search.toLowerCase()) || c.kode_cabang.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.nama_cabang || !form.kode_cabang) {
      toast({ title: "Error", description: "Nama dan kode cabang wajib diisi.", variant: "destructive" });
      return;
    }
    const newCabang: Cabang = {
      id: `cbg-${Date.now()}`,
      status: "aktif",
      total_transaksi: 0,
      total_pinjaman: 0,
      ...form,
    };
    setCabangList([...cabangList, newCabang]);
    setOpen(false);
    setForm(emptyForm);
    toast({ title: "Berhasil", description: "Cabang berhasil ditambahkan." });
  };

  const openEdit = (cabang: Cabang) => {
    setSelected(cabang);
    setEditForm({
      nama_cabang: cabang.nama_cabang,
      kode_cabang: cabang.kode_cabang,
      alamat: cabang.alamat,
      telepon: cabang.telepon,
      email: cabang.email,
      kepala_cabang: cabang.kepala_cabang,
    });
    setEditTotalDana(String(cabang.total_pinjaman || 0));
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editForm.nama_cabang || !editForm.kode_cabang) {
      toast({ title: "Error", description: "Nama dan kode cabang wajib diisi.", variant: "destructive" });
      return;
    }
    const totalDana = canEditDana ? parseFloat(editTotalDana) || 0 : selected?.total_pinjaman || 0;
    setCabangList(cabangList.map(c =>
      c.id === selected?.id ? { ...c, ...editForm, total_pinjaman: totalDana } : c
    ));
    setEditOpen(false);
    setSelected(null);
    toast({ title: "Berhasil", description: "Data cabang berhasil diperbarui." });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const cabang = cabangList.find(c => c.id === deleteId);
    if (cabang?.kode_cabang === "CBG-001") {
      toast({ title: "Tidak dapat dihapus", description: "Cabang Pusat tidak dapat dihapus.", variant: "destructive" });
      setDeleteId(null);
      return;
    }
    setCabangList(cabangList.filter(c => c.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Berhasil", description: "Cabang berhasil dihapus." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Cabang</h1>
          <p className="text-muted-foreground text-sm">{cabangList.length} cabang terdaftar</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary shadow-emerald">
              <Plus className="w-4 h-4" /> Tambah Cabang
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Tambah Cabang Baru</DialogTitle></DialogHeader>
            <CabangFormFields data={form} onChange={setForm} />
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button className="gradient-primary shadow-emerald" onClick={handleSave}>Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari cabang..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Cabang Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((cabang) => (
          <Card key={cabang.id} className="shadow-sm hover:shadow transition-smooth overflow-hidden group">
            <div className="gradient-primary h-2" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-emerald">
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <Badge className={cn(
                  "text-xs",
                  cabang.status === "aktif" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"
                )}>
                  {cabang.status === "aktif" ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>

              <h3 className="font-semibold text-foreground text-base mb-1">{cabang.nama_cabang}</h3>
              <p className="text-xs font-mono text-muted-foreground mb-3">{cabang.kode_cabang}</p>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{cabang.alamat}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  {cabang.telepon}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{cabang.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                    <HandCoins className="w-3.5 h-3.5" />
                    Transaksi
                  </div>
                  <p className="font-bold text-foreground">{cabang.total_transaksi}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                    <Users className="w-3.5 h-3.5" />
                    Total Dana
                  </div>
                  <p className="font-bold text-primary text-sm">{formatCurrency(cabang.total_pinjaman || 0)}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1 gap-2 text-xs"
                  onClick={() => { setSelected(cabang); setViewOpen(true); }}>
                  <Eye className="w-3.5 h-3.5" /> Detail
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2 text-xs"
                  onClick={() => openEdit(cabang)}>
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteId(cabang.id)}
                  disabled={cabang.kode_cabang === "CBG-001"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Tidak ada cabang ditemukan</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Cabang — {selected?.nama_cabang}</DialogTitle></DialogHeader>
          <CabangFormFields data={editForm} onChange={setEditForm} />
          {canEditDana && (
            <div className="mt-2 space-y-1.5">
              <Label className="flex items-center gap-1.5">
                Total Dana (Rp)
                <span className="text-xs text-gold font-normal bg-gold/10 px-1.5 py-0.5 rounded border border-gold/20">
                  Owner Only
                </span>
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={editTotalDana}
                onChange={e => setEditTotalDana(e.target.value)}
              />
            </div>
          )}
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button className="gradient-primary shadow-emerald" onClick={handleEdit}>Perbarui</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detail Cabang</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-emerald">
                  <Building2 className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selected.nama_cabang}</h3>
                  <p className="text-sm font-mono text-muted-foreground">{selected.kode_cabang}</p>
                  <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 text-xs">Aktif</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div><p className="text-xs text-muted-foreground">Kepala Cabang</p><p className="font-medium">{selected.kepala_cabang}</p></div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div><p className="text-xs text-muted-foreground">Alamat</p><p className="font-medium">{selected.alamat}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{selected.telepon}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{selected.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div className="p-3 rounded-xl bg-primary/10">
                  <p className="text-2xl font-bold text-primary">{selected.total_transaksi}</p>
                  <p className="text-xs text-primary/70">Total Transaksi</p>
                </div>
                <div className="p-3 rounded-xl bg-gold/10">
                  <p className="text-base font-bold text-gold">{formatCurrency(selected.total_pinjaman || 0)}</p>
                  <p className="text-xs text-gold/70">Total Dana</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Cabang?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua data yang terkait dengan cabang ini akan ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
