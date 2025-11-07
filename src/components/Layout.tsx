import "../styles/layout.css";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
  onSignOut: () => void;
}

const Layout = ({ children, onSignOut }: LayoutProps) => {
  return (
    <div className="layout">
      {/* Sidebar */}
      <AppSidebar onSignOut={onSignOut} />

      {/* Main content area */}
      <div className="layout-main">
        <header className="layout-header">
          <h1 className="header-title">Admin Panel</h1>
        </header>

        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
