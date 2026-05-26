import { Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NasabahPage from "./pages/NasabahPage";
import BarangPage from "./pages/BarangPage";
import TransaksiPage from "./pages/TransaksiPage";
import PembayaranPage from "./pages/PembayaranPage";
import ArusKasPage from "./pages/ArusKasPage";
import LaporanPage from "./pages/LaporanPage";
import CabangPage from "./pages/CabangPage";
import PengaturanPage from "./pages/PengaturanPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "nasabah", element: <NasabahPage /> },
      { path: "barang", element: <BarangPage /> },
      { path: "transaksi", element: <TransaksiPage /> },
      { path: "pembayaran", element: <PembayaranPage /> },
      { path: "laporan", element: <LaporanPage /> },
      { path: "arus-kas", element: <ArusKasPage /> },
      { path: "cabang", element: <CabangPage /> },
      { path: "pengaturan", element: <PengaturanPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
