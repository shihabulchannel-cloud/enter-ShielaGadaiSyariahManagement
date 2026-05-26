# Plan: Shiela Gadai Syariah - Aplikasi Pegadaian Syariah

## Context
Membangun aplikasi web manajemen pegadaian syariah modern bernama "Shiela Gadai Syariah" dari awal. Frontend lengkap dengan data dummy + real authentication via Enter Cloud (Supabase). Stack: React + Vite + Tailwind + TypeScript.

---

## Design System
Tema emerald-gold fintech premium:
- **Primary**: Emerald `160 84% 39%` (hsl emerald-600)
- **Gold/Accent**: `45 93% 47%` (amber/gold)
- **Dark sidebar**: slate-900
- Support dark mode penuh
- Radius: 0.75rem
- Font: Inter

---

## Step 1 – Enable Enter Cloud (Supabase)
- Panggil `supabase_enable` untuk authentication nyata
- Setup tabel `users` dengan kolom: id, email, nama, role (super_admin/admin_cabang/kasir/owner), cabang_id, created_at
- Auth dengan email+password via Supabase Auth

---

## Step 2 – Design System & Global Layout

### `src/index.css`
Update semua CSS variables:
- primary → emerald green
- accent/gold → amber/gold 
- sidebar tokens → dark emerald
- Tambah gradient tokens, shadow tokens, animation tokens

### `tailwind.config.ts`
- Tambah warna gold, emerald, extended shadows, animations

---

## Step 3 – Folder Structure
```
src/
  components/
    layout/
      AppLayout.tsx       ← sidebar + navbar wrapper + auth guard
      Sidebar.tsx         ← navigasi lengkap dengan collapse
      Navbar.tsx          ← topbar: notifikasi, user, dark mode, cabang selector
    dashboard/
      StatsCard.tsx
      RevenueChart.tsx
      TransactionChart.tsx
      NotificationPanel.tsx
    nasabah/
      NasabahTable.tsx
      NasabahForm.tsx
    barang/
      BarangTable.tsx
      BarangForm.tsx
      BarangStatusBadge.tsx
    transaksi/
      TransaksiTable.tsx
      TransaksiForm.tsx
      AkadModal.tsx
    pembayaran/
      PembayaranTable.tsx
      PembayaranForm.tsx
    laporan/
      LaporanFilter.tsx
      LaporanTable.tsx
    cabang/
      CabangTable.tsx
      CabangForm.tsx
  pages/
    LoginPage.tsx
    DashboardPage.tsx
    NasabahPage.tsx
    BarangPage.tsx
    TransaksiPage.tsx
    PembayaranPage.tsx
    LaporanPage.tsx
    CabangPage.tsx
    PengaturanPage.tsx
    ProfilePage.tsx
  lib/
    dummy-data.ts         ← semua data dummy
    auth.ts               ← Supabase auth helper
    utils.ts
  hooks/
    use-auth.tsx          ← auth context + guard
    use-theme.tsx         ← dark mode toggle
```

---

## Step 4 – Halaman yang Dibangun

### 1. `LoginPage.tsx`
- Form login email+password
- Tombol login Google (UI only - diaktifkan setelah OAuth setup)
- Remember me checkbox
- Lupa password link
- Validasi input
- Loading state
- Real auth via Supabase

### 2. `DashboardPage.tsx`
- 6 StatsCard: total gadai aktif, total pinjaman, pemasukan ujrah, jatuh tempo, barang macet, transaksi hari ini
- Grafik pendapatan bulanan (recharts)
- Grafik transaksi harian (recharts)
- Tabel transaksi terbaru
- Panel notifikasi jatuh tempo
- Filter cabang + tanggal

### 3. `NasabahPage.tsx`
- Tabel nasabah dengan search + pagination
- Modal tambah/edit nasabah
- Upload foto KTP & foto diri
- Histori transaksi nasabah
- Field lengkap: nama, NIK, alamat, HP, pekerjaan, tgl lahir

### 4. `BarangPage.tsx`
- Tabel barang jaminan dengan filter kategori + status
- Modal input barang dengan multi-foto
- Kode barang otomatis
- QR code barang
- Kategori: emas, elektronik, kendaraan, sertifikat, lainnya
- Status badge: aktif, ditebus, jatuh tempo, dilelang

### 5. `TransaksiPage.tsx`
- Tabel transaksi gadai dengan filter + pagination
- Modal transaksi baru (akad rahn)
- Nomor transaksi otomatis
- Simulasi ujrah
- Perpanjangan gadai + pelunasan
- Status: aktif, diperpanjang, lunas, macet, lelang
- Cetak surat akad (print view)

### 6. `PembayaranPage.tsx`
- Tabel histori pembayaran
- Modal pembayaran: ujrah, cicilan, pelunasan
- Metode: tunai, transfer, QRIS, e-wallet
- Cetak bukti pembayaran

### 7. `LaporanPage.tsx`
- Tab: harian, bulanan, tahunan
- Laporan transaksi, pemasukan ujrah, barang aktif, jatuh tempo, macet
- Export PDF & Excel (simulasi)
- Print laporan

### 8. `CabangPage.tsx`
- Tabel data cabang
- Modal tambah/edit cabang
- Statistik per cabang
- Admin per cabang

### 9. `PengaturanPage.tsx`
- Tab: Profil Perusahaan, Pengguna, Keamanan, Notifikasi
- Dark mode toggle
- Pengaturan ujrah
- Backup database (simulasi)

### 10. `ProfilePage.tsx`
- Edit profil user
- Ganti password
- Activity log login
- Session info

---

## Step 5 – Auth Flow
- `use-auth.tsx` → Context dengan Supabase session
- AppLayout guard: redirect ke login jika belum auth
- Role-based menu visibility
- Logout dengan clear session

---

## Step 6 – Router
Update `src/router.tsx` dengan semua 10 routes + auth redirect

---

## Files to Create/Modify
| File | Action |
|------|--------|
| `src/index.css` | Modify – design tokens |
| `tailwind.config.ts` | Modify – extended tokens |
| `src/router.tsx` | Modify – all routes |
| `src/App.tsx` | Modify – add AuthProvider |
| `src/lib/dummy-data.ts` | Create |
| `src/lib/auth.ts` | Create |
| `src/hooks/use-auth.tsx` | Create |
| `src/hooks/use-theme.tsx` | Create |
| `src/components/layout/*` | Create (3 files) |
| `src/components/dashboard/*` | Create (4 files) |
| `src/components/nasabah/*` | Create (2 files) |
| `src/components/barang/*` | Create (3 files) |
| `src/components/transaksi/*` | Create (3 files) |
| `src/components/pembayaran/*` | Create (2 files) |
| `src/components/laporan/*` | Create (2 files) |
| `src/components/cabang/*` | Create (2 files) |
| `src/pages/LoginPage.tsx` | Create |
| `src/pages/DashboardPage.tsx` | Create |
| `src/pages/NasabahPage.tsx` | Create |
| `src/pages/BarangPage.tsx` | Create |
| `src/pages/TransaksiPage.tsx` | Create |
| `src/pages/PembayaranPage.tsx` | Create |
| `src/pages/LaporanPage.tsx` | Create |
| `src/pages/CabangPage.tsx` | Create |
| `src/pages/PengaturanPage.tsx` | Create |
| `src/pages/ProfilePage.tsx` | Create |

---

## Verification
1. Login page tampil di `/login`
2. Redirect ke dashboard setelah auth
3. Semua 10 halaman navigasi via sidebar
4. Dark mode toggle berfungsi
5. Modal tambah data berfungsi
6. Chart dashboard tampil data dummy
7. Tabel dengan search + pagination berfungsi
8. Responsive di mobile
