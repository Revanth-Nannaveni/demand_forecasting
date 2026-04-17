import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-12 flex items-center border-b px-2">
          <SidebarTrigger />
        </header>
        <div className="flex-1 flex">
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  </SidebarProvider>
);

export default DashboardLayout;
