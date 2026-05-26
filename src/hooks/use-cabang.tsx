import { createContext, useContext, useState, ReactNode } from "react";
import { CabangRow } from "@/hooks/use-supabase-cabang";

interface CabangContextType {
  selectedCabang: CabangRow | null; // null = semua cabang
  setSelectedCabang: (cabang: CabangRow | null) => void;
}

const CabangContext = createContext<CabangContextType>({
  selectedCabang: null,
  setSelectedCabang: () => {},
});

export function CabangProvider({ children }: { children: ReactNode }) {
  const [selectedCabang, setSelectedCabang] = useState<CabangRow | null>(null);
  return (
    <CabangContext.Provider value={{ selectedCabang, setSelectedCabang }}>
      {children}
    </CabangContext.Provider>
  );
}

export function useCabang() {
  return useContext(CabangContext);
}
