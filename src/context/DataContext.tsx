// import React, { createContext, useContext, useEffect, useState } from "react";

// type DataContextType = {
//   data: any;
//   setData: (data: any) => void;
//   activeSource: string;
//   setActiveSource: (source: string) => void;
//   isLoading: boolean;
//   fetchError: string | null;
// };

// const DataContext = createContext<DataContextType | null>(null);


// export const DataProvider = ({ children }: { children: React.ReactNode }) => {
//   const [data, setData] = useState<any>(null);
//   const [activeSource, setActiveSource] = useState<string>("onelake");
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [fetchError, setFetchError] = useState<string | null>(null);

//   // Fetch OneLake data immediately on app start — NOT on dashboard visit
//   // const API_BASE = "http://65.0.54.48:8000";
//   useEffect(() => {
//     const fetchDefaultData = async () => {
//       setIsLoading(true);
//       setFetchError(null);
//       try {
//         const res = await fetch(
//           "http://65.0.54.48:8000/dashboard/data/onelake?buyer_table=buyers&seller_table=sellers"
//         );
//         if (!res.ok) {
//           const err = await res.json().catch(() => ({}));
//           throw new Error(err.detail || `Server returned ${res.status}`);
//         }
//         const result = await res.json();
//         setData(result);
//       } catch (err: any) {
//         console.error("Error fetching OneLake data:", err);
//         setFetchError(err.message || "Failed to connect to backend");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDefaultData();
//   }, []);

//   return (
//     <DataContext.Provider
//       value={{ data, setData, activeSource, setActiveSource, isLoading, fetchError }}
//     >
//       {children}
//     </DataContext.Provider>
//   );
// };

// // custom hook
// export const useData = () => {
//   const context = useContext(DataContext);
//   if (!context) throw new Error("useData must be used within DataProvider");
//   return context;
// };


import React, { createContext, useContext, useEffect, useState, useRef } from "react";

type DataContextType = {
  data: any;
  setData: (data: any) => void;
  activeSource: string;
  setActiveSource: (source: string) => void;
  activeCredentials: any;
  setActiveCredentials: (c: any) => void;
  isLoading: boolean;
  fetchError: string | null;
};

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [dataState, setDataState] = useState<any>(null);
  const [activeSource, setActiveSource] = useState<string>("onelake");
  const [activeCredentials, setActiveCredentials] = useState<any>({
    data_source: "onelake",
    credentials: {
      tenant_id: "0eadb77e-42dc-47f8-bbe3-ec2395e0712c",
      client_id: "e2eaa87b-ee2a-4680-9982-870896175cfc",
      client_secret: "",  // ← fetched from secrets manager, left empty here
      workspace_name: "demand_forecasting",
      lakehouse_name: "uploaded_files.lakehouse",
      datasets: {
        buyers: { path: "Files/uploads/buyer/" },
        sellers: { path: "Files/uploads/seller/" },
      },
    },
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const userConnectedRef = useRef(false);

  // Wrapped setData — marks user as manually connected
  const setData = (newData: any) => {
    userConnectedRef.current = true;
    setDataState(newData);
  };

  useEffect(() => {
    const fetchDefaultData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(
          "https://d2m11qgy1b40kt.cloudfront.net/dashboard/data/onelake?buyer_table=buyers&seller_table=sellers"
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Server returned ${res.status}`);
        }
        const result = await res.json();
        if (!userConnectedRef.current) {
          setDataState(result);
        }
      } catch (err: any) {
        console.error("Error fetching OneLake data:", err);
        if (!userConnectedRef.current) {
          setFetchError(err.message || "Failed to connect to backend");
        }
      } finally {
        if (!userConnectedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchDefaultData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        data: dataState,
        setData,
        activeSource,
        setActiveSource,
        activeCredentials,
        setActiveCredentials,
        isLoading,
        fetchError,
      }}
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