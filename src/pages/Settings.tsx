import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const Settings = () => {
  // ⚙️ State for store info
  const [storeInfo, setStoreInfo] = useState({
    name: "ECommerce Store",
    email: "admin@ecommerce.com",
    phone: "+1 (555) 123-4567",
    address: "123 Commerce St, City, State 12345",
  });

  // ⚙️ State for payment
  const [paymentSettings, setPaymentSettings] = useState({
    currency: "USD",
    taxRate: "8.5",
    paypal: true,
    stripe: true,
  });

  // ⚙️ State for notifications
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    lowStock: true,
    notificationEmail: "admin@ecommerce.com",
  });

  // ⚙️ Security section states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🧩 Token
  const token = localStorage.getItem("adminToken");

  // 🔹 Save Store Info (mock)
  const handleSaveStoreInfo = async () => {
    toast.success("✅ Store information saved successfully!");
  };

  // 🔹 Save Payment Settings (mock)
  const handleSavePayment = async () => {
    toast.success("✅ Payment settings saved successfully!");
  };

  // 🔹 Save Notification Settings (mock)
  const handleSaveNotifications = async () => {
    toast.success("✅ Notification settings saved successfully!");
  };

  // 🔹 Toggle Two-Factor Authentication
  const toggleTwoFactor = async (checked: boolean) => {
    setTwoFactorEnabled(checked);
    try {
      const res = await fetch(
        "https://api.sartree.com/api/v1/user/twofactor-toggle",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled: checked }),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update 2FA setting");

      toast.success(`Two-Factor ${checked ? "Enabled" : "Disabled"}`);
    } catch (err: any) {
      console.error("❌ Two-Factor error:", err);
      toast.error(err.message || "Failed to update 2FA");
    }
  };

  // 🔹 Handle password update API
  const handlePasswordChange = async () => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    toast.warning("Please fill all password fields");
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.error("New password and confirmation do not match");
    return;
  }

  try {
    const res = await fetch(
      "https://api.sartree.com/api/v1/user/change-password",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // ✅ Correct API field names
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Password update failed");
    }

    // ✅ Password changed successfully
    toast.success("✅ Password updated successfully! Please log in again.");

    // 🧹 Clear auth data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    // Small delay before redirect
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);

    // Reset fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (err: any) {
    console.error("❌ Password update error:", err);
    toast.error(err.message || "Error updating password");
  }
};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ⚙️ Left Side */}
        <div className="space-y-6">
          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeInfo.name}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeEmail">Store Email</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={storeInfo.email}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storePhone">Phone Number</Label>
                <Input
                  id="storePhone"
                  value={storeInfo.phone}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Address</Label>
                <Input
                  id="storeAddress"
                  value={storeInfo.address}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, address: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={handleSaveStoreInfo}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Save Store Information
              </Button>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Input
                  id="currency"
                  value={paymentSettings.currency}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      currency: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={paymentSettings.taxRate}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      taxRate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="paypal">Enable PayPal</Label>
                  <p className="text-sm text-gray-600">
                    Accept payments via PayPal
                  </p>
                </div>
                <Switch
                  id="paypal"
                  checked={paymentSettings.paypal}
                  onCheckedChange={(checked) =>
                    setPaymentSettings({ ...paymentSettings, paypal: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="stripe">Enable Stripe</Label>
                  <p className="text-sm text-gray-600">
                    Accept credit card payments
                  </p>
                </div>
                <Switch
                  id="stripe"
                  checked={paymentSettings.stripe}
                  onCheckedChange={(checked) =>
                    setPaymentSettings({ ...paymentSettings, stripe: checked })
                  }
                />
              </div>
              <Button
                onClick={handleSavePayment}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ⚙️ Right Side */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600">
                    Receive email alerts for new orders
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailNotifications: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive SMS alerts for urgent issues
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      smsNotifications: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lowStock">Low Stock Alerts</Label>
                  <p className="text-sm text-gray-600">
                    Get notified when inventory is low
                  </p>
                </div>
                <Switch
                  id="lowStock"
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      lowStock: checked,
                    })
                  }
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={notifications.notificationEmail}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      notificationEmail: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                onClick={handleSaveNotifications}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security
                  </p>
                </div>
                <Switch
                  id="twoFactor"
                  checked={twoFactorEnabled}
                  onCheckedChange={toggleTwoFactor}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
