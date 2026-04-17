import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Forecasting from "./pages/Forecasting";
import POTracking from "./pages/POTracking";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import DataSources from "./pages/DataSources";
import { DataProvider } from "./context/DataContext";
const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Login />} />
//           <Route element={<DashboardLayout />}>
//             <Route path="/data-sources" element={<DataSources />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/forecasting" element={<Forecasting />} />
//             <Route path="/po-tracking" element={<POTracking />} />
//           </Route>
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );


function App() {
  return (
    <DataProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route element={<DashboardLayout />}>
                <Route path="/data-sources" element={<DataSources />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/forecasting" element={<Forecasting />} />
                <Route path="/po-tracking" element={<POTracking />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </DataProvider>
  );
}

export default App;

