// App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";

// Components & Pages
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

const queryClient = new QueryClient();

function AppRoutes() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("adminToken"));
  const navigate = useNavigate();

  // ✅ Handle Login Success
  const handleSignIn = (receivedToken: string) => {
    localStorage.setItem("adminToken", receivedToken);
    setToken(receivedToken);
    navigate("/dashboard", { replace: true });
  };

  // ✅ Handle Logout
  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken(null);
    navigate("/login", { replace: true });
  };

  const isAuthenticated = Boolean(token);

  // (Optional) Validate token on mount
  useEffect(() => {
    // Example: API validation could go here
  }, []);

  return (
    <SidebarProvider>
      <Routes>
        {/* 🔓 Public Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignIn onSignIn={handleSignIn} />
            )
          }
        />

        {/* 🔐 Protected Routes */}
        {isAuthenticated ? (
          <Route
            path="/*"
            element={
              <Layout onSignOut={handleSignOut}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/tickets" element={<Tickets />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
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
