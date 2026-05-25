export type Role = "super_admin" | "admin_cabang" | "kasir" | "owner";
export type StatusBarang = "aktif" | "ditebus" | "jatuh_tempo" | "dilelang";
export type StatusTransaksi = "aktif" | "diperpanjang" | "lunas" | "macet" | "lelang";
export type KategoriBarang = "emas" | "elektronik" | "kendaraan" | "sertifikat" | "lainnya";

export interface Cabang {
  id: string;
  kode_cabang: string;
  nama_cabang: string;
  alamat: string;
  telepon: string;
  email: string;
  kepala_cabang: string;
  status: "aktif" | "nonaktif";
  total_transaksi?: number;
  total_pinjaman?: number;
}

export interface Nasabah {
  id: string;
  kode_nasabah: string;
  nama_lengkap: string;
  nik: string;
  alamat: string;
  nomor_hp: string;
  pekerjaan: string;
  tanggal_lahir: string;
  cabang_id: string;
  is_active: boolean;
  created_at: string;
}

export interface BarangJaminan {
  id: string;
  kode_barang: string;
  nama_barang: string;
  kategori: KategoriBarang;
  merek: string;
  kondisi: "sangat_baik" | "baik" | "cukup" | "kurang";
  berat?: number;
  estimasi_nilai: number;
  lokasi_penyimpanan: string;
  status: StatusBarang;
  nasabah_id: string;
  nasabah_nama?: string;
  cabang_id: string;
  created_at: string;
}

export interface TransaksiGadai {
  id: string;
  nomor_transaksi: string;
  nasabah_id: string;
  nasabah_nama?: string;
  barang_id: string;
  barang_nama?: string;
  cabang_id: string;
  cabang_nama?: string;
  nilai_pinjaman: number;
  ujrah_per_bulan: number;
  tanggal_gadai: string;
  tanggal_jatuh_tempo: string;
  tanggal_pelunasan?: string;
  status: StatusTransaksi;
  created_at: string;
}

export interface Pembayaran {
  id: string;
  nomor_pembayaran: string;
  transaksi_id: string;
  nomor_transaksi?: string;
  nasabah_nama?: string;
  jenis_pembayaran: "ujrah" | "cicilan" | "pelunasan";
  jumlah: number;
  metode: "tunai" | "transfer" | "qris" | "ewallet";
  tanggal_bayar: string;
  keterangan?: string;
}

export const dummyCabang: Cabang[] = [
  {
    id: "cbg-001",
    kode_cabang: "CBG-001",
    nama_cabang: "Cabang Pusat Jakarta",
    alamat: "Jl. Sudirman No. 1, Jakarta Pusat",
    telepon: "021-12345678",
    email: "jakarta.pusat@shielagadai.com",
    kepala_cabang: "Budi Santoso",
    status: "aktif",
    total_transaksi: 145,
    total_pinjaman: 450000000,
  },
  {
    id: "cbg-002",
    kode_cabang: "CBG-002",
    nama_cabang: "Cabang Bandung",
    alamat: "Jl. Asia Afrika No. 55, Bandung",
    telepon: "022-87654321",
    email: "bandung@shielagadai.com",
    kepala_cabang: "Siti Rahayu",
    status: "aktif",
    total_transaksi: 98,
    total_pinjaman: 285000000,
  },
  {
    id: "cbg-003",
    kode_cabang: "CBG-003",
    nama_cabang: "Cabang Surabaya",
    alamat: "Jl. Pemuda No. 12, Surabaya",
    telepon: "031-98765432",
    email: "surabaya@shielagadai.com",
    kepala_cabang: "Ahmad Fauzi",
    status: "aktif",
    total_transaksi: 112,
    total_pinjaman: 320000000,
  },
  {
    id: "cbg-004",
    kode_cabang: "CBG-004",
    nama_cabang: "Cabang Yogyakarta",
    alamat: "Jl. Malioboro No. 8, Yogyakarta",
    telepon: "0274-567890",
    email: "yogyakarta@shielagadai.com",
    kepala_cabang: "Dewi Lestari",
    status: "aktif",
    total_transaksi: 67,
    total_pinjaman: 175000000,
  },
];

export const dummyNasabah: Nasabah[] = [
  {
    id: "nsb-001",
    kode_nasabah: "NSB-001",
    nama_lengkap: "Budi Raharjo",
    nik: "3171234567890001",
    alamat: "Jl. Kebon Jeruk No. 15, Jakarta Barat",
    nomor_hp: "081234567890",
    pekerjaan: "Wiraswasta",
    tanggal_lahir: "1985-03-15",
    cabang_id: "cbg-001",
    is_active: true,
    created_at: "2026-01-10",
  },
  {
    id: "nsb-002",
    kode_nasabah: "NSB-002",
    nama_lengkap: "Siti Aminah",
    nik: "3171234567890002",
    alamat: "Jl. Fatmawati No. 22, Jakarta Selatan",
    nomor_hp: "082345678901",
    pekerjaan: "Ibu Rumah Tangga",
    tanggal_lahir: "1990-07-22",
    cabang_id: "cbg-001",
    is_active: true,
    created_at: "2026-01-15",
  },
  {
    id: "nsb-003",
    kode_nasabah: "NSB-003",
    nama_lengkap: "Agus Santoso",
    nik: "3201234567890003",
    alamat: "Jl. Braga No. 10, Bandung",
    nomor_hp: "083456789012",
    pekerjaan: "Pedagang",
    tanggal_lahir: "1978-11-05",
    cabang_id: "cbg-002",
    is_active: true,
    created_at: "2026-02-01",
  },
  {
    id: "nsb-004",
    kode_nasabah: "NSB-004",
    nama_lengkap: "Dewi Kurniawati",
    nik: "3578234567890004",
    alamat: "Jl. Darmo No. 45, Surabaya",
    nomor_hp: "084567890123",
    pekerjaan: "Karyawan Swasta",
    tanggal_lahir: "1992-05-18",
    cabang_id: "cbg-003",
    is_active: true,
    created_at: "2026-02-10",
  },
  {
    id: "nsb-005",
    kode_nasabah: "NSB-005",
    nama_lengkap: "Hendra Wijaya",
    nik: "3402234567890005",
    alamat: "Jl. Parangtritis No. 30, Yogyakarta",
    nomor_hp: "085678901234",
    pekerjaan: "Petani",
    tanggal_lahir: "1975-09-25",
    cabang_id: "cbg-004",
    is_active: true,
    created_at: "2026-03-01",
  },
  {
    id: "nsb-006",
    kode_nasabah: "NSB-006",
    nama_lengkap: "Rina Handayani",
    nik: "3171234567890006",
    alamat: "Jl. Cempaka Putih No. 8, Jakarta Pusat",
    nomor_hp: "086789012345",
    pekerjaan: "Guru",
    tanggal_lahir: "1988-12-30",
    cabang_id: "cbg-001",
    is_active: true,
    created_at: "2026-03-15",
  },
];

export const dummyBarang: BarangJaminan[] = [
  {
    id: "brg-001",
    kode_barang: "BRG-2026-001",
    nama_barang: "Cincin Emas 24 Karat",
    kategori: "emas",
    merek: "-",
    kondisi: "sangat_baik",
    berat: 8.5,
    estimasi_nilai: 8500000,
    lokasi_penyimpanan: "Lemari A-1",
    status: "aktif",
    nasabah_id: "nsb-001",
    nasabah_nama: "Budi Raharjo",
    cabang_id: "cbg-001",
    created_at: "2026-01-20",
  },
  {
    id: "brg-002",
    kode_barang: "BRG-2026-002",
    nama_barang: "iPhone 14 Pro Max",
    kategori: "elektronik",
    merek: "Apple",
    kondisi: "baik",
    estimasi_nilai: 12000000,
    lokasi_penyimpanan: "Lemari B-3",
    status: "aktif",
    nasabah_id: "nsb-002",
    nasabah_nama: "Siti Aminah",
    cabang_id: "cbg-001",
    created_at: "2026-02-01",
  },
  {
    id: "brg-003",
    kode_barang: "BRG-2026-003",
    nama_barang: "Honda Beat Tahun 2022",
    kategori: "kendaraan",
    merek: "Honda",
    kondisi: "baik",
    estimasi_nilai: 15000000,
    lokasi_penyimpanan: "Garasi C",
    status: "jatuh_tempo",
    nasabah_id: "nsb-003",
    nasabah_nama: "Agus Santoso",
    cabang_id: "cbg-002",
    created_at: "2026-01-15",
  },
  {
    id: "brg-004",
    kode_barang: "BRG-2026-004",
    nama_barang: "Kalung Emas 18 Karat",
    kategori: "emas",
    merek: "-",
    kondisi: "sangat_baik",
    berat: 15,
    estimasi_nilai: 12000000,
    lokasi_penyimpanan: "Lemari A-2",
    status: "aktif",
    nasabah_id: "nsb-004",
    nasabah_nama: "Dewi Kurniawati",
    cabang_id: "cbg-003",
    created_at: "2026-02-15",
  },
  {
    id: "brg-005",
    kode_barang: "BRG-2026-005",
    nama_barang: "Laptop Dell Inspiron",
    kategori: "elektronik",
    merek: "Dell",
    kondisi: "cukup",
    estimasi_nilai: 7000000,
    lokasi_penyimpanan: "Lemari B-1",
    status: "ditebus",
    nasabah_id: "nsb-005",
    nasabah_nama: "Hendra Wijaya",
    cabang_id: "cbg-004",
    created_at: "2026-01-25",
  },
  {
    id: "brg-006",
    kode_barang: "BRG-2026-006",
    nama_barang: "Sertifikat Tanah SHM",
    kategori: "sertifikat",
    merek: "-",
    kondisi: "sangat_baik",
    estimasi_nilai: 150000000,
    lokasi_penyimpanan: "Brankas D",
    status: "aktif",
    nasabah_id: "nsb-006",
    nasabah_nama: "Rina Handayani",
    cabang_id: "cbg-001",
    created_at: "2026-03-20",
  },
];

export const dummyTransaksi: TransaksiGadai[] = [
  {
    id: "trx-001",
    nomor_transaksi: "TRX-2026-001",
    nasabah_id: "nsb-001",
    nasabah_nama: "Budi Raharjo",
    barang_id: "brg-001",
    barang_nama: "Cincin Emas 24 Karat",
    cabang_id: "cbg-001",
    cabang_nama: "Cabang Pusat Jakarta",
    nilai_pinjaman: 6000000,
    ujrah_per_bulan: 120000,
    tanggal_gadai: "2026-01-20",
    tanggal_jatuh_tempo: "2026-08-20",
    status: "aktif",
    created_at: "2026-01-20",
  },
  {
    id: "trx-002",
    nomor_transaksi: "TRX-2026-002",
    nasabah_id: "nsb-002",
    nasabah_nama: "Siti Aminah",
    barang_id: "brg-002",
    barang_nama: "iPhone 14 Pro Max",
    cabang_id: "cbg-001",
    cabang_nama: "Cabang Pusat Jakarta",
    nilai_pinjaman: 9000000,
    ujrah_per_bulan: 180000,
    tanggal_gadai: "2026-02-01",
    tanggal_jatuh_tempo: "2026-09-01",
    status: "aktif",
    created_at: "2026-02-01",
  },
  {
    id: "trx-003",
    nomor_transaksi: "TRX-2026-003",
    nasabah_id: "nsb-003",
    nasabah_nama: "Agus Santoso",
    barang_id: "brg-003",
    barang_nama: "Honda Beat Tahun 2022",
    cabang_id: "cbg-002",
    cabang_nama: "Cabang Bandung",
    nilai_pinjaman: 10000000,
    ujrah_per_bulan: 200000,
    tanggal_gadai: "2026-01-15",
    tanggal_jatuh_tempo: "2026-04-15",
    status: "macet",
    created_at: "2026-01-15",
  },
  {
    id: "trx-004",
    nomor_transaksi: "TRX-2026-004",
    nasabah_id: "nsb-004",
    nasabah_nama: "Dewi Kurniawati",
    barang_id: "brg-004",
    barang_nama: "Kalung Emas 18 Karat",
    cabang_id: "cbg-003",
    cabang_nama: "Cabang Surabaya",
    nilai_pinjaman: 8000000,
    ujrah_per_bulan: 160000,
    tanggal_gadai: "2026-02-15",
    tanggal_jatuh_tempo: "2026-09-15",
    status: "diperpanjang",
    created_at: "2026-02-15",
  },
  {
    id: "trx-005",
    nomor_transaksi: "TRX-2026-005",
    nasabah_id: "nsb-005",
    nasabah_nama: "Hendra Wijaya",
    barang_id: "brg-005",
    barang_nama: "Laptop Dell Inspiron",
    cabang_id: "cbg-004",
    cabang_nama: "Cabang Yogyakarta",
    nilai_pinjaman: 5000000,
    ujrah_per_bulan: 100000,
    tanggal_gadai: "2026-01-25",
    tanggal_jatuh_tempo: "2026-04-25",
    tanggal_pelunasan: "2026-04-20",
    status: "lunas",
    created_at: "2026-01-25",
  },
  {
    id: "trx-006",
    nomor_transaksi: "TRX-2026-006",
    nasabah_id: "nsb-006",
    nasabah_nama: "Rina Handayani",
    barang_id: "brg-006",
    barang_nama: "Sertifikat Tanah SHM",
    cabang_id: "cbg-001",
    cabang_nama: "Cabang Pusat Jakarta",
    nilai_pinjaman: 100000000,
    ujrah_per_bulan: 1500000,
    tanggal_gadai: "2026-03-20",
    tanggal_jatuh_tempo: "2026-06-20",
    status: "aktif",
    created_at: "2026-03-20",
  },
];

export const dummyPembayaran: Pembayaran[] = [
  {
    id: "pay-001",
    nomor_pembayaran: "PAY-2026-001",
    transaksi_id: "trx-001",
    nomor_transaksi: "TRX-2026-001",
    nasabah_nama: "Budi Raharjo",
    jenis_pembayaran: "ujrah",
    jumlah: 120000,
    metode: "tunai",
    tanggal_bayar: "2026-02-20",
    keterangan: "Pembayaran ujrah bulan Februari",
  },
  {
    id: "pay-002",
    nomor_pembayaran: "PAY-2026-002",
    transaksi_id: "trx-002",
    nomor_transaksi: "TRX-2026-002",
    nasabah_nama: "Siti Aminah",
    jenis_pembayaran: "ujrah",
    jumlah: 180000,
    metode: "qris",
    tanggal_bayar: "2026-03-01",
    keterangan: "Pembayaran ujrah bulan Maret",
  },
  {
    id: "pay-003",
    nomor_pembayaran: "PAY-2026-003",
    transaksi_id: "trx-005",
    nomor_transaksi: "TRX-2026-005",
    nasabah_nama: "Hendra Wijaya",
    jenis_pembayaran: "pelunasan",
    jumlah: 5300000,
    metode: "transfer",
    tanggal_bayar: "2026-04-20",
    keterangan: "Pelunasan pokok + ujrah",
  },
  {
    id: "pay-004",
    nomor_pembayaran: "PAY-2026-004",
    transaksi_id: "trx-004",
    nomor_transaksi: "TRX-2026-004",
    nasabah_nama: "Dewi Kurniawati",
    jenis_pembayaran: "ujrah",
    jumlah: 160000,
    metode: "ewallet",
    tanggal_bayar: "2026-03-15",
    keterangan: "Pembayaran ujrah bulan Maret",
  },
  {
    id: "pay-005",
    nomor_pembayaran: "PAY-2026-005",
    transaksi_id: "trx-006",
    nomor_transaksi: "TRX-2026-006",
    nasabah_nama: "Rina Handayani",
    jenis_pembayaran: "ujrah",
    jumlah: 1500000,
    metode: "transfer",
    tanggal_bayar: "2026-04-20",
    keterangan: "Pembayaran ujrah bulan April",
  },
];

export const chartDataPendapatan = [
  { bulan: "Jan", ujrah: 2800000, pinjaman: 45000000 },
  { bulan: "Feb", ujrah: 3200000, pinjaman: 52000000 },
  { bulan: "Mar", ujrah: 2900000, pinjaman: 48000000 },
  { bulan: "Apr", ujrah: 4100000, pinjaman: 65000000 },
  { bulan: "Mei", ujrah: 3800000, pinjaman: 58000000 },
  { bulan: "Jun", ujrah: 4500000, pinjaman: 72000000 },
  { bulan: "Jul", ujrah: 4200000, pinjaman: 68000000 },
  { bulan: "Agu", ujrah: 5000000, pinjaman: 80000000 },
  { bulan: "Sep", ujrah: 4700000, pinjaman: 75000000 },
  { bulan: "Okt", ujrah: 5200000, pinjaman: 84000000 },
  { bulan: "Nov", ujrah: 4900000, pinjaman: 78000000 },
  { bulan: "Des", ujrah: 5500000, pinjaman: 88000000 },
];

export const chartDataTransaksi = [
  { hari: "Sen", aktif: 8, lunas: 3, macet: 1 },
  { hari: "Sel", aktif: 12, lunas: 5, macet: 2 },
  { hari: "Rab", aktif: 10, lunas: 4, macet: 1 },
  { hari: "Kam", aktif: 15, lunas: 7, macet: 3 },
  { hari: "Jum", aktif: 11, lunas: 6, macet: 1 },
  { hari: "Sab", aktif: 14, lunas: 8, macet: 2 },
  { hari: "Min", aktif: 6, lunas: 2, macet: 0 },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
};

export const getStatusTransaksiColor = (status: StatusTransaksi) => {
  const map: Record<StatusTransaksi, string> = {
    aktif: "bg-primary/10 text-primary border-primary/20",
    diperpanjang: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    lunas: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    macet: "bg-destructive/10 text-destructive border-destructive/20",
    lelang: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

export const getStatusBarangColor = (status: StatusBarang) => {
  const map: Record<StatusBarang, string> = {
    aktif: "bg-primary/10 text-primary border-primary/20",
    ditebus: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    jatuh_tempo: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    dilelang: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

export const getLabelStatus = (status: string): string => {
  const map: Record<string, string> = {
    aktif: "Aktif",
    diperpanjang: "Diperpanjang",
    lunas: "Lunas",
    macet: "Macet",
    lelang: "Dilelang",
    ditebus: "Ditebus",
    jatuh_tempo: "Jatuh Tempo",
    dilelang: "Dilelang",
    emas: "Emas",
    elektronik: "Elektronik",
    kendaraan: "Kendaraan",
    sertifikat: "Sertifikat",
    lainnya: "Lainnya",
    sangat_baik: "Sangat Baik",
    baik: "Baik",
    cukup: "Cukup",
    kurang: "Kurang",
    tunai: "Tunai",
    transfer: "Transfer Bank",
    qris: "QRIS",
    ewallet: "E-Wallet",
    ujrah: "Ujrah",
    cicilan: "Cicilan",
    pelunasan: "Pelunasan",
    super_admin: "Super Admin",
    admin_cabang: "Admin Cabang",
    kasir: "Kasir",
    owner: "Owner",
  };
  return map[status] || status;
};
