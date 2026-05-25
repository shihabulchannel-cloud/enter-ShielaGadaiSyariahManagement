import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings, Building2, Users, Shield, Bell, Database,
  Save, RefreshCw, Trash2, Plus, CheckCircle,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { getLabelStatus } from "@/lib/dummy-data";

const defaultUsers = [
  { id: "u1", name: "Budi Santoso", email: "budi@shielagadai.com", role: "admin_cabang", status: "aktif" },
  { id: "u2", name: "Siti Rahayu", email: "siti@shielagadai.com", role: "kasir", status: "aktif" },
  { id: "u3", name: "Ahmad Fauzi", email: "ahmad@shielagadai.com", role: "kasir", status: "aktif" },
];

export default function PengaturanPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifJatuhTempo, setNotifJatuhTempo] = useState(true);
  const [notifMacet, setNotifMacet] = useState(true);
  const [ujrahRate, setUjrahRate] = useState("2");
  const [maxDurasi, setMaxDurasi] = useState("4");

  const handleSave = () => {
    toast({ title: "Berhasil", description: "Pengaturan berhasil disimpan." });
  };

  const handleBackup = () => {
    toast({ title: "Backup", description: "Backup database sedang diproses..." });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan Sistem</h1>
        <p className="text-muted-foreground text-sm">Konfigurasi aplikasi Shiela Gadai Syariah</p>
      </div>

      <Tabs defaultValue="perusahaan">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="perusahaan" className="gap-2"><Building2 className="w-4 h-4" />Perusahaan</TabsTrigger>
          <TabsTrigger value="pengguna" className="gap-2"><Users className="w-4 h-4" />Pengguna</TabsTrigger>
          <TabsTrigger value="keamanan" className="gap-2"><Shield className="w-4 h-4" />Keamanan</TabsTrigger>
          <TabsTrigger value="notifikasi" className="gap-2"><Bell className="w-4 h-4" />Notifikasi</TabsTrigger>
        </TabsList>

        {/* Perusahaan */}
        <TabsContent value="perusahaan" className="mt-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profil Perusahaan</CardTitle>
              <CardDescription>Informasi umum usaha pegadaian</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Nama Perusahaan</Label>
                  <Input defaultValue="Shiela Gadai Syariah" />
                </div>
                <div className="space-y-1.5">
                  <Label>No. Telepon</Label>
                  <Input defaultValue="021-12345678" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input defaultValue="info@shielagadai.com" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Alamat</Label>
                  <Input defaultValue="Jl. Sudirman No. 1, Jakarta Pusat" />
                </div>
                <div className="space-y-1.5">
                  <Label>No. Izin Usaha</Label>
                  <Input defaultValue="SK-2024/PG-SYARIAH/001" />
                </div>
                <div className="space-y-1.5">
                  <Label>NPWP</Label>
                  <Input defaultValue="12.345.678.9-012.345" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Konfigurasi Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tarif Ujrah (%/bulan)</Label>
                  <Input type="number" value={ujrahRate} onChange={e => setUjrahRate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Maksimum Durasi (bulan)</Label>
                  <Input type="number" value={maxDurasi} onChange={e => setMaxDurasi(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Minimal Pinjaman (Rp)</Label>
                  <Input type="number" defaultValue="500000" />
                </div>
                <div className="space-y-1.5">
                  <Label>Maksimal Pinjaman (Rp)</Label>
                  <Input type="number" defaultValue="200000000" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="gradient-primary shadow-emerald gap-2" onClick={handleSave}>
              <Save className="w-4 h-4" /> Simpan Pengaturan
            </Button>
          </div>
        </TabsContent>

        {/* Pengguna */}
        <TabsContent value="pengguna" className="mt-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Manajemen Pengguna</CardTitle>
                  <CardDescription>Kelola akses dan hak pengguna</CardDescription>
                </div>
                <Button size="sm" className="gradient-primary shadow-emerald gap-2">
                  <Plus className="w-4 h-4" /> Tambah User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Pengguna", "Role", "Status", "Aksi"].map(h => (
                      <th key={h} className={`text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3 ${h==="Aksi"?"text-center":""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {defaultUsers.map(u => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-smooth">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                          {getLabelStatus(u.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />Aktif
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary"><RefreshCw className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keamanan */}
        <TabsContent value="keamanan" className="mt-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Pengaturan Keamanan</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Mode Gelap</p>
                  <p className="text-xs text-muted-foreground">Aktifkan tampilan gelap</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Verifikasi 2 Langkah</p>
                  <p className="text-xs text-muted-foreground">Keamanan tambahan saat login</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto Logout</p>
                  <p className="text-xs text-muted-foreground">Keluar otomatis setelah tidak aktif</p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-28 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 menit</SelectItem>
                    <SelectItem value="30">30 menit</SelectItem>
                    <SelectItem value="60">1 jam</SelectItem>
                    <SelectItem value="0">Tidak pernah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-3 flex items-center gap-2"><Database className="w-4 h-4" />Backup Data</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleBackup}>
                    <RefreshCw className="w-4 h-4" /> Backup Sekarang
                  </Button>
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-36 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Harian</SelectItem>
                      <SelectItem value="weekly">Mingguan</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div key={n.label}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch checked={n.val} onCheckedChange={n.set} />
                  </div>
                  <Separator className="mt-5" />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label>Nomor WhatsApp Notifikasi</Label>
                <Input placeholder="628xxxxxxxxxx" defaultValue="628123456789" />
              </div>
              <div className="flex justify-end">
                <Button className="gradient-primary shadow-emerald gap-2" onClick={handleSave}>
                  <Save className="w-4 h-4" /> Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
