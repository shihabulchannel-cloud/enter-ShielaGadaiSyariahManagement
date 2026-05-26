import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BarangRow {
  id: string;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  merek: string | null;
  kondisi: string | null;
  berat: number | null;
  estimasi_nilai: number | null;
  lokasi_penyimpanan: string | null;
  status: string;
  nasabah_id: string | null;
  cabang_id: string | null;
  created_at: string | null;
}

export function useSupabaseBarang(cabangId?: string | null) {
  const [data, setData] = useState<BarangRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("barang_jaminan").select("*").order("created_at", { ascending: false });
    if (cabangId) query = query.eq("cabang_id", cabangId);
    const { data: rows } = await query;
    setData(rows || []);
    setLoading(false);
  }, [cabangId]);

  useEffect(() => { fetch(); }, [fetch]);

  const insert = async (item: Omit<BarangRow, "id" | "created_at">) => {
    const { data: row, error } = await supabase.from("barang_jaminan").insert(item).select().single();
    if (error) throw error;
    setData(prev => [row, ...prev]);
    return row;
  };

  const update = async (id: string, item: Partial<BarangRow>) => {
    const { data: row, error } = await supabase.from("barang_jaminan").update(item).eq("id", id).select().single();
    if (error) throw error;
    setData(prev => prev.map(p => p.id === id ? row : p));
    return row;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("barang_jaminan").delete().eq("id", id);
    if (error) throw error;
    setData(prev => prev.filter(p => p.id !== id));
  };

  return { data, loading, refetch: fetch, insert, update, remove };
}
