// Access control — maps role to allowed route paths
// Owner/super_admin = full access. admin_cabang = no cabang/settings. kasir = operational only.

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/dashboard":  ["owner","super_admin","admin_cabang","kasir"],
  "/nasabah":    ["owner","super_admin","admin_cabang","kasir"],
  "/barang":     ["owner","super_admin","admin_cabang","kasir"],
  "/transaksi":  ["owner","super_admin","admin_cabang","kasir"],
  "/pembayaran": ["owner","super_admin","admin_cabang","kasir"],
  "/laporan":    ["owner","super_admin","admin_cabang"],
  "/arus-kas":   ["owner","super_admin"],
  "/cabang":     ["owner","super_admin"],
  "/pengaturan": ["owner","super_admin"],
  "/profile":    ["owner","super_admin","admin_cabang","kasir"],
};

export function canAccess(role: string | undefined | null, path: string): boolean {
  if (!role) return false;
  const allowed = ROUTE_PERMISSIONS[path];
  if (!allowed) return true; // unknown paths allowed
  return allowed.includes(role);
}

export interface Jabatan {
  id: string;
  nama: string;        // display name e.g. "Kasir", "Manajer"
  base_role: string;   // maps to system role
  akses: string[];     // allowed route keys
}

export const DEFAULT_JABATAN: Jabatan[] = [
  {
    id: "j1", nama: "Pemilik / Owner", base_role: "owner",
    akses: ["/dashboard","/nasabah","/barang","/transaksi","/pembayaran","/laporan","/arus-kas","/cabang","/pengaturan"],
  },
  {
    id: "j2", nama: "Super Admin", base_role: "super_admin",
    akses: ["/dashboard","/nasabah","/barang","/transaksi","/pembayaran","/laporan","/arus-kas","/cabang","/pengaturan"],
  },
  {
    id: "j3", nama: "Kepala Cabang", base_role: "admin_cabang",
    akses: ["/dashboard","/nasabah","/barang","/transaksi","/pembayaran","/laporan"],
  },
  {
    id: "j4", nama: "Kasir", base_role: "kasir",
    akses: ["/dashboard","/nasabah","/barang","/transaksi","/pembayaran"],
  },
];

export const ALL_ROUTES = [
  { path: "/dashboard",  label: "Dashboard" },
  { path: "/nasabah",    label: "Data Nasabah" },
  { path: "/barang",     label: "Barang Jaminan" },
  { path: "/transaksi",  label: "Transaksi Gadai" },
  { path: "/pembayaran", label: "Pembayaran" },
  { path: "/laporan",    label: "Laporan Keuangan" },
  { path: "/arus-kas",   label: "Arus Kas" },
  { path: "/cabang",     label: "Data Cabang" },
  { path: "/pengaturan", label: "Pengaturan Sistem" },
];

export function getJabatanList(): Jabatan[] {
  try {
    const saved = localStorage.getItem("shiela-jabatan");
    return saved ? JSON.parse(saved) : DEFAULT_JABATAN;
  } catch { return DEFAULT_JABATAN; }
}

export function saveJabatanList(list: Jabatan[]) {
  localStorage.setItem("shiela-jabatan", JSON.stringify(list));
}
