
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
  onSignOut: () => void;
}

const Layout = ({ children, onSignOut }: LayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar onSignOut={onSignOut} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
