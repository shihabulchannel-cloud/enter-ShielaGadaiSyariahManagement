import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PembayaranRow {
  id: string;
  nomor_pembayaran: string;
  transaksi_id: string;
  jenis_pembayaran: string;
  jumlah: number;
  metode: string;
  tanggal_bayar: string;
  keterangan: string | null;
  created_at: string | null;
  // joined fields
  transaksi?: {
    nomor_transaksi: string;
    nasabah?: { nama_lengkap: string } | null;
    cabang_id?: string | null;
  } | null;
}

export function useSupabasePembayaran(cabangId?: string | null) {
  const [data, setData] = useState<PembayaranRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from("pembayaran")
      .select("*, transaksi:transaksi_id(nomor_transaksi, cabang_id, nasabah:nasabah_id(nama_lengkap))")
      .order("created_at", { ascending: false });
    let filtered = (rows as PembayaranRow[]) || [];
    if (cabangId) {
      filtered = filtered.filter(p => (p.transaksi as { cabang_id?: string | null } | null)?.cabang_id === cabangId);
    }
    setData(filtered);
    setLoading(false);
  }, [cabangId]);

  useEffect(() => { fetch(); }, [fetch]);

  const insert = async (item: {
    nomor_pembayaran: string;
    transaksi_id: string;
    jenis_pembayaran: string;
    jumlah: number;
    metode: string;
    tanggal_bayar: string;
    keterangan?: string;
  }) => {
    const { data: row, error } = await supabase.from("pembayaran").insert(item).select().single();
    if (error) throw error;
    await fetch();
    return row;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("pembayaran").delete().eq("id", id);
    if (error) throw error;
    setData(prev => prev.filter(p => p.id !== id));
  };

  return { data, loading, refetch: fetch, insert, remove };
}
