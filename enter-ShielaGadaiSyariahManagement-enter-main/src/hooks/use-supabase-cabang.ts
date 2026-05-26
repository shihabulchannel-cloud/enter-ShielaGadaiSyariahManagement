import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CabangRow {
  id: string;
  kode_cabang: string;
  nama_cabang: string;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  kepala_cabang: string | null;
  status: string;
}

export function useSupabaseCabang() {
  const [data, setData] = useState<CabangRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from("cabang")
      .select("*")
      .eq("status", "aktif")
      .order("kode_cabang");
    setData(rows || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const insert = async (item: Omit<CabangRow, "id">) => {
    const { data: row, error } = await supabase.from("cabang").insert(item).select().single();
    if (error) throw error;
    await fetch();
    return row;
  };

  const update = async (id: string, item: Partial<CabangRow>) => {
    const { data: row, error } = await supabase.from("cabang").update(item).eq("id", id).select().single();
    if (error) throw error;
    await fetch();
    return row;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("cabang").delete().eq("id", id);
    if (error) throw error;
    setData(prev => prev.filter(c => c.id !== id));
  };

  return { data, loading, refetch: fetch, insert, update, remove };
}
