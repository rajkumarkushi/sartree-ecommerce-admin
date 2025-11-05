import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, Package, DollarSign } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    products: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!token) {
      toast.error("No token found. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Fetch all customers
      const customersRes = await fetch("https://api.sartree.com/api/v1/admin/all-customers", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      // Fetch all orders
      const ordersRes = await fetch("https://api.sartree.com/api/v1/admin/orders", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      // Fetch all products (optional)
      const productsRes = await fetch("https://api.sartree.com/api/v1/admin/all-products", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      }).catch(() => null);

      const customersData = await customersRes.json();
      const ordersData = await ordersRes.json();
      const productsData = productsRes ? await productsRes.json() : [];

      const customers = Array.isArray(customersData)
        ? customersData.length
        : customersData?.data?.length || 0;

      const ordersArray = Array.isArray(ordersData)
  ? ordersData
  : ordersData?.data || [];
const totalOrders = ordersData?.pagination?.total || ordersArray.length;

      const products = Array.isArray(productsData)
        ? productsData.length
        : productsData?.data?.length || 0;

      // Calculate revenue from order totals
      const totalRevenue = ordersArray.reduce((sum, order: any) => {
        const total = parseFloat(order.total_amount || order.total || 0);
        return sum + (isNaN(total) ? 0 : total);
      }, 0);

      // Sort and pick top 5 recent orders
      const recent = ordersArray
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5);

    setStats({
  customers,
  orders: totalOrders, // ✅ show total orders from backend pagination
  products,
  revenue: totalRevenue,
});
      setRecentOrders(recent);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data.");
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Customers",
      value: stats.customers.toLocaleString(),
      icon: Users,
    },
    {
      title: "Total Orders",
      value: stats.orders.toLocaleString(),
      icon: ShoppingCart,
    },
    {
      title: "Products",
      value: stats.products.toLocaleString(),
      icon: Package,
    },
    {
      title: "Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's your store summary.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading dashboard data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <Card
                key={stat.title}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <p className="text-gray-500">No recent orders found.</p>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            #{order.order_id || order.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.customer_name || order.user?.name || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ₹{order.total_amount || order.total || 0}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Products Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Product analytics coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
