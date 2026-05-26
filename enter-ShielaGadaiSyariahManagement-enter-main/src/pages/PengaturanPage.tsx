import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Settings, Building2, Users, Shield, Bell, Database, Briefcase,
  Save, RefreshCw, Trash2, Plus, CheckCircle, Eye, EyeOff, Pencil, Lock,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useSupabaseCabang } from "@/hooks/use-supabase-cabang";
import {
  Jabatan, DEFAULT_JABATAN, ALL_ROUTES, getJabatanList, saveJabatanList
} from "@/lib/access-control";

type UserEntry = { id: string; name: string; email: string; jabatan_id: string; status: string };

const emptyUser = { name: "", email: "", password: "", jabatan_id: "j4", cabang: "" };

export default function PengaturanPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { data: cabangList } = useSupabaseCabang();

  const isOwner = profile?.role === "owner" || profile?.role === "super_admin";

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifJatuhTempo, setNotifJatuhTempo] = useState(true);
  const [notifMacet, setNotifMacet] = useState(true);
  const [ujrahRate, setUjrahRate] = useState("2");
  const [maxDurasi, setMaxDurasi] = useState("4");

  const [users, setUsers] = useLocalStorage<UserEntry[]>("shiela-users-v2", []);
  const [jabatanList, setJabatanListState] = useState<Jabatan[]>(getJabatanList());

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [userForm, setUserForm] = useState(emptyUser);
  const [showPw, setShowPw] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Jabatan management
  const [jabatanEditOpen, setJabatanEditOpen] = useState(false);
  const [jabatanAddOpen, setJabatanAddOpen] = useState(false);
  const [editingJabatan, setEditingJabatan] = useState<Jabatan | null>(null);
  const [newJabatan, setNewJabatan] = useState<Jabatan>({ id: "", nama: "", base_role: "kasir", akses: ["/dashboard","/nasabah","/barang","/transaksi","/pembayaran"] });
  const [deleteJabatanId, setDeleteJabatanId] = useState<string | null>(null);

  const saveJabatan = (list: Jabatan[]) => {
    setJabatanListState(list);
    saveJabatanList(list);
  };

  const handleSave = () => toast({ title: "Berhasil", description: "Pengaturan berhasil disimpan." });

  const handleAddUser = () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast({ title: "Error", description: "Nama, email, dan password wajib diisi.", variant: "destructive" });
      return;
    }
    if (userForm.password.length < 6) {
      toast({ title: "Error", description: "Password minimal 6 karakter.", variant: "destructive" });
      return;
    }
    const newUser: UserEntry = { id: `u${Date.now()}`, name: userForm.name, email: userForm.email, jabatan_id: userForm.jabatan_id, status: "aktif" };
    setUsers([...users, newUser]);
    setAddUserOpen(false);
    setUserForm(emptyUser);
    toast({ title: "Berhasil", description: `Pengguna ${userForm.name} berhasil ditambahkan.` });
  };

  const handleSaveJabatan = () => {
    if (!editingJabatan?.nama.trim()) { toast({ title: "Nama jabatan wajib diisi", variant: "destructive" }); return; }
    const updated = jabatanList.map(j => j.id === editingJabatan.id ? editingJabatan : j);
    saveJabatan(updated);
    setJabatanEditOpen(false);
    toast({ title: "Jabatan diperbarui" });
  };

  const handleAddJabatan = () => {
    if (!newJabatan.nama.trim()) { toast({ title: "Nama jabatan wajib diisi", variant: "destructive" }); return; }
    const toAdd = { ...newJabatan, id: `j${Date.now()}` };
    saveJabatan([...jabatanList, toAdd]);
    setJabatanAddOpen(false);
    setNewJabatan({ id: "", nama: "", base_role: "kasir", akses: ["/dashboard","/nasabah","/barang","/transaksi","/pembayaran"] });
    toast({ title: "Jabatan ditambahkan" });
  };

  const handleDeleteJabatan = () => {
    if (!deleteJabatanId) return;
    const isDefault = DEFAULT_JABATAN.some(j => j.id === deleteJabatanId);
    if (isDefault) { toast({ title: "Tidak bisa dihapus", description: "Jabatan default tidak bisa dihapus.", variant: "destructive" }); setDeleteJabatanId(null); return; }
    saveJabatan(jabatanList.filter(j => j.id !== deleteJabatanId));
    setDeleteJabatanId(null);
    toast({ title: "Jabatan dihapus" });
  };

  const getJabatanNama = (id: string) => jabatanList.find(j => j.id === id)?.nama || id;
  const toggleRoute = (j: Jabatan, path: string): Jabatan => ({
    ...j, akses: j.akses.includes(path) ? j.akses.filter(a => a !== path) : [...j.akses, path],
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan Sistem</h1>
        <p className="text-muted-foreground text-sm">Konfigurasi aplikasi Shiela Gadai Syariah</p>
      </div>

      <Tabs defaultValue="perusahaan">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="perusahaan" className="gap-1.5 text-xs sm:text-sm"><Building2 className="w-3.5 h-3.5" />Perusahaan</TabsTrigger>
          <TabsTrigger value="pengguna" className="gap-1.5 text-xs sm:text-sm"><Users className="w-3.5 h-3.5" />Pengguna</TabsTrigger>
          <TabsTrigger value="jabatan" className="gap-1.5 text-xs sm:text-sm"><Briefcase className="w-3.5 h-3.5" />Jabatan</TabsTrigger>
          <TabsTrigger value="keamanan" className="gap-1.5 text-xs sm:text-sm"><Shield className="w-3.5 h-3.5" />Keamanan</TabsTrigger>
          <TabsTrigger value="notifikasi" className="gap-1.5 text-xs sm:text-sm"><Bell className="w-3.5 h-3.5" />Notifikasi</TabsTrigger>
        </TabsList>

        {/* Perusahaan */}
        <TabsContent value="perusahaan" className="mt-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Profil Perusahaan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5"><Label>Nama Perusahaan</Label><Input defaultValue="Shiela Gadai Syariah" /></div>
                <div className="space-y-1.5"><Label>No. Telepon</Label><Input defaultValue="021-12345678" /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="info@shielagadai.com" /></div>
                <div className="sm:col-span-2 space-y-1.5"><Label>Alamat</Label><Input defaultValue="Jl. Sudirman No. 1, Jakarta Pusat" /></div>
                <div className="space-y-1.5"><Label>No. Izin Usaha</Label><Input defaultValue="SK-2026/PG-SYARIAH/001" /></div>
                <div className="space-y-1.5"><Label>NPWP</Label><Input defaultValue="12.345.678.9-012.345" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Konfigurasi Transaksi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Tarif Ujrah (%/bulan)</Label><Input type="number" value={ujrahRate} onChange={e => setUjrahRate(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Maksimum Durasi (bulan)</Label><Input type="number" value={maxDurasi} onChange={e => setMaxDurasi(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Minimal Pinjaman (Rp)</Label><Input type="number" defaultValue="500000" /></div>
                <div className="space-y-1.5"><Label>Maksimal Pinjaman (Rp)</Label><Input type="number" defaultValue="200000000" /></div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button className="gradient-primary shadow-emerald gap-2" onClick={handleSave}><Save className="w-4 h-4" /> Simpan</Button>
          </div>
        </TabsContent>

        {/* Pengguna */}
        <TabsContent value="pengguna" className="mt-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base">Manajemen Pengguna</CardTitle>
                  <CardDescription>Kelola akses dan hak pengguna</CardDescription>
                </div>
                <Button size="sm" className="gradient-primary shadow-emerald gap-2" onClick={() => setAddUserOpen(true)}>
                  <Plus className="w-4 h-4" /> Tambah User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Pengguna", "Jabatan", "Status", "Aksi"].map(h => (
                        <th key={h} className={`text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 ${h==="Aksi"?"text-center":""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />Belum ada pengguna ditambahkan
                      </td></tr>
                    ) : users.map(u => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-smooth">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">{u.name.charAt(0)}</div>
                            <div><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{getJabatanNama(u.jabatan_id)}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Aktif</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteUserId(u.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jabatan */}
        <TabsContent value="jabatan" className="mt-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base">Kelola Jabatan</CardTitle>
                  <CardDescription>Atur jabatan dan hak akses menu untuk setiap jabatan</CardDescription>
                </div>
                {isOwner && (
                  <Button size="sm" className="gradient-primary shadow-emerald gap-2" onClick={() => setJabatanAddOpen(true)}>
                    <Plus className="w-4 h-4" /> Tambah Jabatan
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Jabatan</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Hak Akses</th>
                      <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {jabatanList.map(j => {
                      const isDefault = DEFAULT_JABATAN.some(d => d.id === j.id);
                      return (
                        <tr key={j.id} className="hover:bg-muted/30 transition-smooth">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{j.nama}</p>
                                {isDefault && <p className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" />Jabatan sistem</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {j.akses.map(a => {
                                const route = ALL_ROUTES.find(r => r.path === a);
                                return route ? <span key={a} className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground border border-border">{route.label}</span> : null;
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {isOwner && (
                                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => { setEditingJabatan({ ...j }); setJabatanEditOpen(true); }}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              )}
                              {isOwner && !isDefault && (
                                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteJabatanId(j.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                              {!isOwner && <Lock className="w-4 h-4 text-muted-foreground/40" />}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keamanan */}
        <TabsContent value="keamanan" className="mt-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Pengaturan Keamanan</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Mode Gelap</p><p className="text-xs text-muted-foreground">Aktifkan tampilan gelap</p></div><Switch checked={theme === "dark"} onCheckedChange={toggleTheme} /></div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Verifikasi 2 Langkah</p><p className="text-xs text-muted-foreground">Keamanan tambahan saat login</p></div><Switch defaultChecked={false} /></div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Auto Logout</p><p className="text-xs text-muted-foreground">Keluar otomatis setelah tidak aktif</p></div>
                <Select defaultValue="30"><SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="15">15 menit</SelectItem><SelectItem value="30">30 menit</SelectItem><SelectItem value="60">1 jam</SelectItem><SelectItem value="0">Tidak pernah</SelectItem>
                </SelectContent></Select>
              </div>
              <Separator />
              <div><p className="text-sm font-medium mb-3 flex items-center gap-2"><Database className="w-4 h-4" />Backup Data</p>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => toast({ title: "Backup", description: "Backup database sedang diproses..." })}><RefreshCw className="w-4 h-4" /> Backup Sekarang</Button>
                  <Select defaultValue="daily"><SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger><SelectContent>
                    <SelectItem value="daily">Harian</SelectItem><SelectItem value="weekly">Mingguan</SelectItem><SelectItem value="monthly">Bulanan</SelectItem>
                  </SelectContent></Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifikasi */}
        <TabsContent value="notifikasi" className="mt-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Pengaturan Notifikasi</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: "Notifikasi Email", desc: "Terima pemberitahuan via email", val: notifEmail, set: setNotifEmail },
                { label: "Jatuh Tempo", desc: "Ingatkan H-7 sebelum jatuh tempo", val: notifJatuhTempo, set: setNotifJatuhTempo },
                { label: "Barang Macet", desc: "Alert saat transaksi macet", val: notifMacet, set: setNotifMacet },
              ].map(n => (
                <div key={n.label}><div className="flex items-center justify-between"><div><p className="text-sm font-medium">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div><Switch checked={n.val} onCheckedChange={n.set} /></div><Separator className="mt-5" /></div>
              ))}
              <div className="space-y-1.5"><Label>Nomor WhatsApp Notifikasi</Label><Input placeholder="628xxxxxxxxxx" defaultValue="628123456789" /></div>
              <div className="flex justify-end"><Button className="gradient-primary shadow-emerald gap-2" onClick={handleSave}><Save className="w-4 h-4" /> Simpan</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tambah User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Pengguna Baru</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label>Nama Lengkap *</Label><Input placeholder="Nama lengkap" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" placeholder="email@shielagadai.com" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Password *</Label>
              <div className="relative">
                <Input type={showPw?"text":"password"} placeholder="Min. 6 karakter" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Jabatan</Label>
              <Select value={userForm.jabatan_id} onValueChange={v => setUserForm({...userForm, jabatan_id: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{jabatanList.map(j => <SelectItem key={j.id} value={j.id}>{j.nama}</SelectItem>)}</SelectContent>
              </Select>
              {jabatanList.find(j=>j.id===userForm.jabatan_id) && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {jabatanList.find(j=>j.id===userForm.jabatan_id)?.akses.map(a => {
                    const r = ALL_ROUTES.find(ro => ro.path === a);
                    return r ? <span key={a} className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">{r.label}</span> : null;
                  })}
                </div>
              )}
            </div>
            <div className="space-y-1.5"><Label>Cabang</Label>
              <Select value={userForm.cabang} onValueChange={v => setUserForm({...userForm, cabang: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih cabang" /></SelectTrigger>
                <SelectContent>{cabangList.map(c => <SelectItem key={c.id} value={c.id}>{c.nama_cabang}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>Batal</Button>
            <Button className="gradient-primary shadow-emerald" onClick={handleAddUser}>Tambah</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Jabatan Dialog */}
      <Dialog open={jabatanEditOpen} onOpenChange={setJabatanEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Jabatan</DialogTitle></DialogHeader>
          {editingJabatan && (
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5"><Label>Nama Jabatan *</Label>
                <Input value={editingJabatan.nama} onChange={e => setEditingJabatan({...editingJabatan, nama: e.target.value})} placeholder="Contoh: Manajer Keuangan" />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-3 block">Hak Akses Menu</Label>
                <div className="space-y-2">
                  {ALL_ROUTES.map(route => (
                    <label key={route.path} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-foreground">{route.label}</p>
                        <p className="text-xs text-muted-foreground">{route.path}</p>
                      </div>
                      <Switch
                        checked={editingJabatan.akses.includes(route.path)}
                        onCheckedChange={() => setEditingJabatan(toggleRoute(editingJabatan, route.path))}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setJabatanEditOpen(false)}>Batal</Button>
                <Button className="gradient-primary shadow-emerald" onClick={handleSaveJabatan}>Simpan</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Jabatan Dialog */}
      <Dialog open={jabatanAddOpen} onOpenChange={setJabatanAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tambah Jabatan Baru</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label>Nama Jabatan *</Label>
              <Input value={newJabatan.nama} onChange={e => setNewJabatan({...newJabatan, nama: e.target.value})} placeholder="Contoh: Petugas Taksir" />
            </div>
            <div className="space-y-1.5"><Label>Berbasis Peran</Label>
              <Select value={newJabatan.base_role} onValueChange={v => setNewJabatan({...newJabatan, base_role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin_cabang">Admin Cabang</SelectItem>
                  <SelectItem value="kasir">Kasir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold mb-3 block">Hak Akses Menu</Label>
              <div className="space-y-2">
                {ALL_ROUTES.map(route => (
                  <label key={route.path} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-foreground">{route.label}</p>
                      <p className="text-xs text-muted-foreground">{route.path}</p>
                    </div>
                    <Switch
                      checked={newJabatan.akses.includes(route.path)}
                      onCheckedChange={() => setNewJabatan(toggleRoute(newJabatan, route.path))}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setJabatanAddOpen(false)}>Batal</Button>
              <Button className="gradient-primary shadow-emerald gap-2" onClick={handleAddJabatan}><Plus className="w-4 h-4" /> Tambah</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User */}
      <AlertDialog open={!!deleteUserId} onOpenChange={o => !o && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Hapus pengguna ini?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { setUsers(users.filter(u => u.id !== deleteUserId)); setDeleteUserId(null); toast({ title: "Pengguna dihapus" }); }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Jabatan */}
      <AlertDialog open={!!deleteJabatanId} onOpenChange={o => !o && setDeleteJabatanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Hapus jabatan ini?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteJabatan}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
