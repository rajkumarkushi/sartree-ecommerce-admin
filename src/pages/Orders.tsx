import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
  setLoading(true);
  setError("");

  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("No token found. Please log in again.");
      toast.error("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    let allOrders: any[] = [];
    let currentPage = 1;
    let lastPage = 1;

    // Fetch first page to get pagination info
    const firstRes = await fetch(
      `https://api.sartree.com/api/v1/admin/orders?page=1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const firstData = await firstRes.json();
    console.log("✅ Page 1:", firstData);

    if (!firstRes.ok) throw new Error(firstData.message || "Failed to fetch orders");

    allOrders = [...firstData.data];
    lastPage = firstData?.pagination?.last_page || 1;

    // Fetch remaining pages if exist
    for (let page = 2; page <= lastPage; page++) {
      const res = await fetch(
        `https://api.sartree.com/api/v1/admin/orders?page=${page}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const result = await res.json();
      console.log(`✅ Page ${page}:`, result);

      if (res.ok && Array.isArray(result.data)) {
        allOrders = [...allOrders, ...result.data];
      }
    }

    console.log("✅ All Orders Combined:", allOrders);
    setOrders(allOrders);
  } catch (err: any) {
    console.error("❌ Orders Fetch Error:", err);
    setError(err.message || "Error fetching orders");
    toast.error(`❌ ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  // Format INR ₹ currency
  const formatCurrency = (amount: string | number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));

  // Format date/time for display
  const formatDate = (dateStr: string) =>
    dateStr
      ? new Date(dateStr).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "-";

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.user?.first_name || ""} ${order.user?.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const openOrderModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" onClick={() => toast.info("📦 Export feature coming soon!")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Management</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading orders...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-gray-500">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-blue-600">#{order.id}</td>
                      <td className="py-4 px-4 text-gray-900">
                        {order.user
                          ? `${order.user.first_name || ""} ${order.user.last_name || ""}`
                          : "Unknown"}
                        <br />
                        <span className="text-sm text-gray-500">
                          {order.user?.email || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{formatDate(order.created_at)}</td>
                      <td className="py-4 px-4 text-gray-900">{order.items?.length || 0}</td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status || order.payment_status
                          )}`}
                        >
                          {order.status || order.payment_status || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="sm" onClick={() => openOrderModal(order)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🧾 Order Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Order Details</span>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 mt-2">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  Customer Information
                </h3>
                <p className="text-gray-700 mt-1">
                  {selectedOrder.user?.first_name} {selectedOrder.user?.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.user?.email} • {selectedOrder.user?.mobile}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-800">Shipping Address</h3>
                <p className="text-gray-700 mt-1">
                  {selectedOrder.address?.line1 || "-"}
                  <br />
                  {selectedOrder.address?.city}, {selectedOrder.address?.state}{" "}
                  {selectedOrder.address?.pincode}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-800">Order Summary</h3>
                <p className="text-gray-700 mt-1">
                  Status:{" "}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    selectedOrder.status
                  )}`}>
                    {selectedOrder.status || "N/A"}
                  </span>
                </p>
                <p className="text-gray-700">
                  Total: {formatCurrency(selectedOrder.total)}
                </p>
                <p className="text-gray-700">
                  Date: {formatDate(selectedOrder.created_at)}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Items</h3>
                <ul className="space-y-2">
                  {selectedOrder.items?.length > 0 ? (
                    selectedOrder.items.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between border-b pb-1">
                        <span>Product #{item.product_id}</span>
                        <span>
                          Qty: {item.quantity} • ₹{item.price}
                        </span>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500">No items found.</p>
                  )}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
