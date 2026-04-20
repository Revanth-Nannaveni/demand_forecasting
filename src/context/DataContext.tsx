import React, { createContext, useContext, useEffect, useState } from "react";

type DataContextType = {
  data: any;
  setData: (data: any) => void;
  activeSource: string;
  setActiveSource: (source: string) => void;
  isLoading: boolean;
  fetchError: string | null;
};

const DataContext = createContext<DataContextType | null>(null);


export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<any>(null);
  const [activeSource, setActiveSource] = useState<string>("onelake");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch OneLake data immediately on app start — NOT on dashboard visit
  // const API_BASE = "http://65.0.54.48:8000";
  useEffect(() => {
    const fetchDefaultData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(
          "http://65.0.54.48:8000/dashboard/data/onelake?buyer_table=buyers&seller_table=sellers"
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Server returned ${res.status}`);
        }
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        console.error("Error fetching OneLake data:", err);
        setFetchError(err.message || "Failed to connect to backend");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaultData();
  }, []);

  return (
    <DataContext.Provider
      value={{ data, setData, activeSource, setActiveSource, isLoading, fetchError }}
    >
      {children}
    </DataContext.Provider>
  );
};

// custom hook
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
