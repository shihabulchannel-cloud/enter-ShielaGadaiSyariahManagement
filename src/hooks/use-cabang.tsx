import { createContext, useContext, useState, ReactNode } from "react";
import { Cabang } from "@/lib/dummy-data";

interface CabangContextType {
  selectedCabang: Cabang | null; // null = semua cabang
  setSelectedCabang: (cabang: Cabang | null) => void;
}

const CabangContext = createContext<CabangContextType>({
  selectedCabang: null,
  setSelectedCabang: () => {},
});

export function CabangProvider({ children }: { children: ReactNode }) {
  const [selectedCabang, setSelectedCabang] = useState<Cabang | null>(null);
  return (
    <CabangContext.Provider value={{ selectedCabang, setSelectedCabang }}>
      {children}
    </CabangContext.Provider>
  );
}

export function useCabang() {
  return useContext(CabangContext);
}
