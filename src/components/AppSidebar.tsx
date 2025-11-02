// src/components/AppSidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  MessageSquare,
  Settings as SettingsIcon,
  User,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Products", url: "/products", icon: Package },
  { title: "Tickets", url: "/tickets", icon: MessageSquare },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

interface AppSidebarProps {
  onSignOut: () => void;
}

export function AppSidebar({ onSignOut }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full ${
      isActive 
        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    } transition-colors duration-200`;

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          {!collapsed && (
            <h2 className="text-xl font-bold text-gray-800">ECommerce</h2>
          )}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={onSignOut}
            className={`w-full ${getNavCls({ isActive: false })}`}
          >
            <LogOut className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
