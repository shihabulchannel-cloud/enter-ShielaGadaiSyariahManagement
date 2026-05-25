import { useState } from "react";
import { dummyNasabah, Nasabah, formatDate, dummyCabang } from "@/lib/dummy-data";
import { useCabang } from "@/hooks/use-cabang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Plus, Search, Edit, Eye, Phone, MapPin, Briefcase, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function NasabahPage() {
  const { toast } = useToast();
  const { selectedCabang } = useCabang();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Nasabah | null>(null);
  const [nasabahList, setNasabahList] = useState<Nasabah[]>(dummyNasabah);

  const [form, setForm] = useState({
    nama_lengkap: "", nik: "", alamat: "", nomor_hp: "",
    pekerjaan: "", tanggal_lahir: "", cabang_id: "cbg-001",
  });

  const perPage = 5;
  const filtered = nasabahList.filter((n) => {
    const matchSearch =
      n.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      n.nik.includes(search) ||
      n.nomor_hp.includes(search);
    const matchCabang = !selectedCabang || n.cabang_id === selectedCabang.id;
    return matchSearch && matchCabang;
  });
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSave = () => {
    if (!form.nama_lengkap || !form.nik) {
      toast({ title: "Error", description: "Nama dan NIK wajib diisi.", variant: "destructive" });
      return;
    }
    const newNasabah: Nasabah = {
      id: `nsb-${Date.now()}`,
      kode_nasabah: `NSB-${String(nasabahList.length + 1).padStart(3, "0")}`,
      ...form,
      is_active: true,
      created_at: new Date().toISOString().split("T")[0],
    };
    setNasabahList([...nasabahList, newNasabah]);
    setOpen(false);
    setForm({ nama_lengkap: "", nik: "", alamat: "", nomor_hp: "", pekerjaan: "", tanggal_lahir: "", cabang_id: "cbg-001" });
    toast({ title: "Berhasil", description: "Nasabah berhasil ditambahkan." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
            <DialogHeader>
              <DialogTitle>Tambah Nasabah Baru</DialogTitle>
            </DialogHeader>
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

      {/* Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NIK, atau nomor HP..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Cabang</SelectItem>
                {dummyCabang.map(c => <SelectItem key={c.id} value={c.id}>{c.nama_cabang}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Nasabah</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">NIK</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Kontak</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Pekerjaan</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Tidak ada nasabah ditemukan
                    </td>
                  </tr>
                ) : paginated.map((nasabah) => (
                  <tr key={nasabah.id} className="hover:bg-muted/30 transition-smooth">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                          {nasabah.nama_lengkap.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{nasabah.nama_lengkap}</p>
                          <p className="text-xs text-muted-foreground">{nasabah.kode_nasabah}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground font-mono">{nasabah.nik}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {nasabah.nomor_hp}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Briefcase className="w-3.5 h-3.5" />
                        {nasabah.pekerjaan}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={nasabah.is_active ? "default" : "secondary"}
                        className={cn(nasabah.is_active ? "bg-primary/10 text-primary border-primary/20" : "")}>
                        {nasabah.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost" size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-primary"
                          onClick={() => { setSelected(nasabah); setViewOpen(true); }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Menampilkan {(page-1)*perPage+1}–{Math.min(page*perPage, filtered.length)} dari {filtered.length} nasabah
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="w-8 h-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} variant={page === i+1 ? "default" : "outline"} size="icon" className={cn("w-8 h-8 text-xs", page === i+1 && "gradient-primary")} onClick={() => setPage(i+1)}>
                    {i+1}
                  </Button>
                ))}
                <Button variant="outline" size="icon" className="w-8 h-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Detail Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Nasabah</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {selected.nama_lengkap.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selected.nama_lengkap}</h3>
                  <p className="text-sm text-muted-foreground">{selected.kode_nasabah}</p>
                  <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 text-xs">Aktif</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">NIK</p><p className="font-medium font-mono">{selected.nik}</p></div>
                <div><p className="text-muted-foreground text-xs">Nomor HP</p><p className="font-medium">{selected.nomor_hp}</p></div>
                <div><p className="text-muted-foreground text-xs">Pekerjaan</p><p className="font-medium">{selected.pekerjaan}</p></div>
                <div><p className="text-muted-foreground text-xs">Tgl Lahir</p><p className="font-medium">{selected.tanggal_lahir ? formatDate(selected.tanggal_lahir) : "-"}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground text-xs">Alamat</p>
                  <div className="flex items-start gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="font-medium">{selected.alamat}</p>
                  </div>
                </div>
                <div><p className="text-muted-foreground text-xs">Terdaftar</p><p className="font-medium">{formatDate(selected.created_at)}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
