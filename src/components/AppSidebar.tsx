import { Database, LayoutDashboard, TrendingUp, ClipboardList, Sprout, LogOut, MessageSquare  } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { logout } from "@/hooks/useAuth"; // ✅ YOUR addition
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Data Sources", url: "/data-sources", icon: Database },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Forecasting", url: "/forecasting", icon: TrendingUp },
  { title: "PO Tracking", url: "/po-tracking", icon: ClipboardList },
  { title: "Chat", url: "/chat", icon: MessageSquare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // ✅ YOUR proper logout — clears session + redirects
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`p-4 flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold font-display text-foreground">FarmGate</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-secondary text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          className={`w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 ${collapsed ? "justify-center px-0" : ""}`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
