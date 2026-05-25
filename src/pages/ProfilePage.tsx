import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { User, Mail, Phone, Shield, Activity, Clock, Save, Key } from "lucide-react";
import { getLabelStatus } from "@/lib/dummy-data";
import { useToast } from "@/hooks/use-toast";

const activityLog = [
  { action: "Login berhasil", time: "Hari ini, 08:30", ip: "192.168.1.10", device: "Chrome Windows" },
  { action: "Update data nasabah", time: "Hari ini, 09:15", ip: "192.168.1.10", device: "Chrome Windows" },
  { action: "Tambah transaksi TRX-2024-007", time: "Hari ini, 10:00", ip: "192.168.1.10", device: "Chrome Windows" },
  { action: "Cetak laporan harian", time: "Kemarin, 16:45", ip: "192.168.1.10", device: "Firefox MacOS" },
  { action: "Login berhasil", time: "Kemarin, 08:00", ip: "192.168.1.15", device: "Safari iPhone" },
];

export default function ProfilePage() {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [nama, setNama] = useState(profile?.nama_lengkap || "");
  const [telepon, setTelepon] = useState(profile?.telepon || "");
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const handleSaveProfile = () => {
    toast({ title: "Berhasil", description: "Profil berhasil diperbarui." });
  };

  const handleChangePassword = () => {
    if (!oldPwd || !newPwd) { toast({ title: "Error", description: "Isi semua field password.", variant: "destructive" }); return; }
    if (newPwd !== confirmPwd) { toast({ title: "Error", description: "Konfirmasi password tidak cocok.", variant: "destructive" }); return; }
    if (newPwd.length < 6) { toast({ title: "Error", description: "Password minimal 6 karakter.", variant: "destructive" }); return; }
    toast({ title: "Berhasil", description: "Password berhasil diubah." });
    setOldPwd(""); setNewPwd(""); setConfirmPwd("");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>
        <p className="text-muted-foreground text-sm">Kelola informasi akun Anda</p>
      </div>

      {/* Profile Header */}
      <Card className="shadow-sm overflow-hidden">
        <div className="gradient-primary h-20" />
        <CardContent className="pt-0 pb-5 px-6">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center text-gold-foreground text-2xl font-bold shadow-gold border-4 border-background">
              {profile?.nama_lengkap?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-foreground">{profile?.nama_lengkap || "Admin"}</h2>
              <p className="text-muted-foreground text-sm">{profile?.email}</p>
            </div>
            <div className="ml-auto pb-1">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                {getLabelStatus(profile?.role || "kasir")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edit Profile */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" /> Edit Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama lengkap" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile?.email || ""} disabled className="bg-muted/50 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
            </div>
            <div className="space-y-1.5">
              <Label>Nomor Telepon</Label>
              <Input value={telepon} onChange={e => setTelepon(e.target.value)} placeholder="08xxxxxxxxxx" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input value={getLabelStatus(profile?.role || "kasir")} disabled className="bg-muted/50 cursor-not-allowed" />
            </div>
            <Button className="w-full gradient-primary shadow-emerald gap-2" onClick={handleSaveProfile}>
              <Save className="w-4 h-4" /> Simpan Profil
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="w-4 h-4" /> Ganti Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Password Lama</Label>
              <Input type="password" placeholder="Password saat ini" value={oldPwd} onChange={e => setOldPwd(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Password Baru</Label>
              <Input type="password" placeholder="Minimal 6 karakter" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Konfirmasi Password</Label>
              <Input type="password" placeholder="Ulangi password baru" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={handleChangePassword}>
              <Key className="w-4 h-4" /> Ubah Password
            </Button>
            <Separator />
            <Button variant="destructive" className="w-full" size="sm" onClick={signOut}>
              Keluar dari Akun
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" /> Riwayat Aktivitas
          </CardTitle>
          <CardDescription>5 aktivitas terakhir</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {activityLog.map((log, i) => (
              <div key={i} className="px-6 py-3.5 flex items-start justify-between hover:bg-muted/30 transition-smooth">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.device} · {log.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
