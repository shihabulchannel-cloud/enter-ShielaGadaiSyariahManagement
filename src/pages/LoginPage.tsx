import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";

export default function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email dan password wajib diisi."); return; }
    setLoading(true);
    setError("");
    const { error } = await signIn(email, password);
    if (error) setError("Email atau password salah. Silakan coba lagi.");
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !nama) { setError("Semua field wajib diisi."); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter."); return; }
    setLoading(true);
    setError("");
    const { error } = await signUp(email, password, nama);
    if (error) setError(error.message || "Terjadi kesalahan. Silakan coba lagi.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-light/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gold/10 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
              <img
                src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059471/b1dd8944-57af-49.png"
                alt="Shiela Gadai Syariah"
                crossOrigin="anonymous"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Shiela Gadai</h1>
              <p className="text-white/60 text-sm">Syariah</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-white text-3xl font-bold leading-tight">
              Sistem Manajemen<br />
              Pegadaian Syariah
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Platform modern untuk mengelola transaksi gadai syariah, 
              nasabah, barang jaminan, dan laporan keuangan secara terintegrasi.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Cabang Aktif", value: "4" },
            { label: "Total Nasabah", value: "1.2K+" },
            { label: "Transaksi/Bulan", value: "450+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
              <p className="text-white font-bold text-xl">{stat.value}</p>
              <p className="text-white/60 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-smooth"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-md space-y-6">
          {/* Logo (mobile) */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
              <img
                src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100059471/b1dd8944-57af-49.png"
                alt="Shiela Gadai Syariah"
                crossOrigin="anonymous"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Shiela Gadai Syariah</h1>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Selamat Datang</h2>
            <p className="text-muted-foreground text-sm mt-1">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" onValueChange={() => setError("")}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Masuk</TabsTrigger>
              <TabsTrigger value="register">Daftar</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@shielagadai.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(v) => setRememberMe(!!v)}
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Ingat saya
                    </Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Lupa password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 gradient-primary shadow-emerald font-semibold"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Masuk"}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Nama Lengkap</Label>
                  <Input
                    placeholder="Masukkan nama lengkap"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input
                    type="email"
                    placeholder="email@shielagadai.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 gradient-primary shadow-emerald font-semibold"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Daftar Akun"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground">
            Dengan masuk, Anda menyetujui{" "}
            <span className="text-primary cursor-pointer hover:underline">Syarat & Ketentuan</span>
            {" "}serta{" "}
            <span className="text-primary cursor-pointer hover:underline">Kebijakan Privasi</span>
          </p>
        </div>
      </div>
    </div>
  );
}
