import { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "../styles/sidebar.css";

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
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = location.pathname;

  // ✅ Close sidebar automatically when screen is resized back to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Close sidebar after navigation on small screens
  const handleNavClick = () => {
    if (window.innerWidth <= 1024) setIsOpen(false);
  };

  return (
    <>
      {/* ☰ Toggle button for mobile */}
      <button
        className="sidebar-toggle-btn"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={22} />
      </button>

      {/* Sidebar */}
      <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">ECommerce</h2>
          <button className="sidebar-close-btn" onClick={() => setIsOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {navigationItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className={`sidebar-link ${currentPath === item.url ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <item.icon size={18} />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Button className="logout-btn" onClick={onSignOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
}
