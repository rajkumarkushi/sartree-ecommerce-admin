import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShoppingBag } from "lucide-react";

interface SignInProps {
  onSignIn: (token: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clean = (s: string) => s.replace(/[\u200B\uFEFF]/g, "").trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", clean(email));
      formData.append("username", clean(email));
      formData.append("password", clean(password));
      formData.append("client_id", "2");
      formData.append("client_secret", "33xyn7BixPNgYai3dna9tBQKnHLz2piER7gBF5Dd");
      formData.append("grant_type", "password");

      const response = await fetch("https://api.sartree.com/api/v1/admin/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data?.tokenDetails?.access_token) {
        throw new Error(data?.message || "Invalid credentials");
      }

      // ✅ Extract role and token
      const token = data.tokenDetails.access_token;
      const user = data.userDetails;

      // ✅ Condition: Allow only superadmin / sys_admin = 1
      const isSuperAdmin =
        user?.sys_admin === 1 ||
        user?.role?.includes("superadmin") ||
        user?.role === "superadmin";

      if (!isSuperAdmin) {
        setError("Access denied: Only Super Admin can log in.");
        return;
      }

      // ✅ Save user info locally
      localStorage.setItem("adminUser", JSON.stringify(user));

      // ✅ Trigger parent App's sign-in handler → sets token + navigates to dashboard
      onSignIn(token);
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      setError(err.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Super Admin Sign In
          </CardTitle>
          <p className="text-gray-600">Access your ecommerce admin dashboard</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="info@info.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
