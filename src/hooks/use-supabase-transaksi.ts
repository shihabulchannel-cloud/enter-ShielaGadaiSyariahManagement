import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TransaksiRow {
  id: string;
  nomor_transaksi: string;
  nasabah_id: string;
  barang_id: string;
  cabang_id: string | null;
  nilai_pinjaman: number;
  ujrah_per_bulan: number;
  ujrah_per_hari: number;
  tanggal_gadai: string;
  tanggal_jatuh_tempo: string;
  tanggal_pelunasan: string | null;
  status: string;
  keterangan: string | null;
  created_at: string | null;
  // Joined fields (from select with *)
  nasabah?: { nama_lengkap: string } | null;
  barang?: { nama_barang: string } | null;
  cabang?: { nama_cabang: string } | null;
}

export function useSupabaseTransaksi(cabangId?: string | null) {
  const [data, setData] = useState<TransaksiRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("transaksi_gadai")
      .select("*, nasabah:nasabah_id(nama_lengkap), barang:barang_id(nama_barang), cabang:cabang_id(nama_cabang)")
      .order("created_at", { ascending: false });
    if (cabangId) query = query.eq("cabang_id", cabangId);
    const { data: rows } = await query;
    setData((rows as TransaksiRow[]) || []);
    setLoading(false);
  }, [cabangId]);

  useEffect(() => { fetch(); }, [fetch]);

  const insert = async (item: {
    nasabah_id: string; barang_id: string; cabang_id?: string | null;
    nilai_pinjaman: number; ujrah_per_bulan: number; ujrah_per_hari?: number;
    tanggal_gadai: string; tanggal_jatuh_tempo: string;
    nomor_transaksi: string; status?: string; keterangan?: string;
  }) => {
    const { data: row, error } = await supabase.from("transaksi_gadai").insert(item).select().single();
    if (error) throw error;
    await fetch();
    return row;
  };

  const updateStatus = async (id: string, status: string, extra?: { tanggal_pelunasan?: string }) => {
    const { error } = await supabase.from("transaksi_gadai").update({ status, ...extra }).eq("id", id);
    if (error) throw error;
    setData(prev => prev.map(p => p.id === id ? { ...p, status, ...extra } : p));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("transaksi_gadai").delete().eq("id", id);
    if (error) throw error;
    setData(prev => prev.filter(p => p.id !== id));
  };

  return { data, loading, refetch: fetch, insert, updateStatus, remove };
}
