

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const DashboardLayout = () => {
  const { user } = useAuth();

  const getDisplayName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.name) {
      return user.name.replace(/\s*\(.*?\)\s*/, "").trim();
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const displayName = getDisplayName();
  const avatarChar = displayName.charAt(0).toUpperCase();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b px-2">
            <SidebarTrigger />
            {user && (
              <div className="flex items-center gap-2 pr-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {avatarChar}
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {displayName}
                </span>
              </div>
            )}
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
};

export default DashboardLayout;