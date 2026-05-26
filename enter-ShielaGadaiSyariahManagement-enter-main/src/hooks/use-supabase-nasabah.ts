import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NasabahRow {
  id: string;
  kode_nasabah: string;
  nama_lengkap: string;
  nik: string;
  alamat: string | null;
  nomor_hp: string | null;
  pekerjaan: string | null;
  tanggal_lahir: string | null;
  cabang_id: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export function useSupabaseNasabah(cabangId?: string | null) {
  const [data, setData] = useState<NasabahRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("nasabah").select("*").order("created_at", { ascending: false });
    if (cabangId) query = query.eq("cabang_id", cabangId);
    const { data: rows } = await query;
    setData(rows || []);
    setLoading(false);
  }, [cabangId]);

  useEffect(() => { fetch(); }, [fetch]);

  const insert = async (item: Omit<NasabahRow, "id" | "created_at">) => {
    const { data: row, error } = await supabase.from("nasabah").insert(item).select().single();
    if (error) throw error;
    setData(prev => [row, ...prev]);
    return row;
  };

  const update = async (id: string, item: Partial<NasabahRow>) => {
    const { data: row, error } = await supabase.from("nasabah").update(item).eq("id", id).select().single();
    if (error) throw error;
    setData(prev => prev.map(p => p.id === id ? row : p));
    return row;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("nasabah").delete().eq("id", id);
    if (error) throw error;
    setData(prev => prev.filter(p => p.id !== id));
  };

  return { data, loading, refetch: fetch, insert, update, remove };
}
