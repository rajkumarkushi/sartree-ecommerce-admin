// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Tickets from "./pages/Tickets";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// small wrapper to provide navigation in the top-level component
function AppRoutes() {
  const [token, setToken] = useState<string | null>(() => {
    // initialise from localStorage
    return localStorage.getItem("adminToken");
  });

  const navigate = useNavigate();

  // call this after successful login in SignIn
  const handleSignIn = (receivedToken: string) => {
    localStorage.setItem("adminToken", receivedToken);
    setToken(receivedToken);
    // navigate to dashboard
    navigate("/dashboard", { replace: true });
  };

  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken(null);
    navigate("/login", { replace: true });
  };

  const isAuthenticated = Boolean(token);

  // optional: check token expiry / validate token on mount with an API call
  useEffect(() => {
    // if you want to validate token on load, do it here using react-query / fetch
  }, []);

  return (
    <SidebarProvider>
      <Layout onSignOut={handleSignOut}>
        <Routes>
          {/* public routes */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignIn onSignIn={handleSignIn} />} />
          {/* Protected routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/customers"
            element={isAuthenticated ? <Customers /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/orders"
            element={isAuthenticated ? <Orders /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/products"
            element={isAuthenticated ? <Products /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/tickets"
            element={isAuthenticated ? <Tickets /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/settings"
            element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </SidebarProvider>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
