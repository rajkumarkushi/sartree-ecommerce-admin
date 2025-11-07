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
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔹 Fetch All Orders
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
      let lastPage = 1;

      const firstRes = await fetch(`https://api.sartree.com/api/v1/admin/orders?page=1`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const firstData = await firstRes.json();
      if (!firstRes.ok) throw new Error(firstData.message || "Failed to fetch orders");

      allOrders = [...firstData.data];
      lastPage = firstData?.pagination?.last_page || 1;

      for (let page = 2; page <= lastPage; page++) {
        const res = await fetch(`https://api.sartree.com/api/v1/admin/orders?page=${page}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        const result = await res.json();
        if (res.ok && Array.isArray(result.data)) {
          allOrders = [...allOrders, ...result.data];
        }
      }

      setOrders(allOrders);
    } catch (err: any) {
      console.error("❌ Orders Fetch Error:", err);
      setError(err.message || "Error fetching orders");
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch Single Order Details
  const fetchOrderDetails = async (orderId: number) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("No token found. Please log in again.");
        return;
      }

      const response = await fetch(
        `https://api.sartree.com/api/v1/admin/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("🟢 Single Order Details:", data);

      if (!response.ok) throw new Error(data.message || "Failed to fetch order details");

      setSelectedOrder(data.data || data);
      setNewStatus(data.data?.status || data.status || "");
      setIsModalOpen(true);
    } catch (err: any) {
      console.error("❌ Order Details Error:", err);
      toast.error(err.message || "Error loading order details");
    } finally {
      setLoadingDetails(false);
    }
  };

  // 🔹 Update Order Status
  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Token missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `https://api.sartree.com/api/v1/admin/order/${selectedOrder.id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order_status: newStatus }),
        }
      );

      const data = await response.json();
      console.log("🟢 Update Response:", data);

      if (!response.ok) throw new Error(data.message || "Failed to update status");

      // Update locally
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id ? { ...order, status: newStatus } : order
        )
      );

      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus } : prev
      );

      toast.success("✅ Order status updated successfully!");
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("❌ Update Error:", err);
      toast.error(err.message || "Error updating status");
    } finally {
      setUpdating(false);
    }
  };

  // 🔹 Helpers
  const formatCurrency = (amount: string | number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(amount || 0));

  const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-";

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

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.user?.first_name || ""} ${order.user?.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
    );
  });

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
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" onClick={() => toast.info("📦 Export feature coming soon!")}>
            <Download className="h-4 w-4 mr-2" /> Export
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
                    <th className="py-3 px-4 text-left">Order ID</th>
                    <th className="py-3 px-4 text-left">Customer</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Items</th>
                    <th className="py-3 px-4 text-left">Total</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-blue-600">#{order.id}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {order.user ? `${order.user.first_name} ${order.user.last_name}` : "Unknown"} <br />
                        <span className="text-sm text-gray-500">{order.user?.email}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(order.created_at)}</td>
                      <td className="py-3 px-4">{order.items?.length || 0}</td>
                      <td className="py-3 px-4">{formatCurrency(order.total)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" onClick={() => fetchOrderDetails(order.id)}>
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
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Order Details</span>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <p className="text-gray-500 text-center py-4">Loading order details...</p>
          ) : selectedOrder ? (
            <div className="space-y-4 mt-2">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Customer Information</h3>
                <p className="text-gray-700">{selectedOrder.user?.first_name} {selectedOrder.user?.last_name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.user?.email} • {selectedOrder.user?.mobile}</p>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Shipping Address</h3>
                <p className="text-gray-700 mt-1">
                  {selectedOrder.address?.line1 || "-"} <br />
                  {selectedOrder.address?.city}, {selectedOrder.address?.state}{" "}
                  {selectedOrder.address?.pincode}
                </p>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Order Summary</h3>
                <p className="text-gray-700 mt-1">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status || "N/A"}
                  </span>
                </p>
                <p className="text-gray-700">Total: {formatCurrency(selectedOrder.total)}</p>
                <p className="text-gray-700">Date: {formatDate(selectedOrder.created_at)}</p>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Items</h3>
                {selectedOrder.items?.length > 0 ? (
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 text-left">Product ID</th>
                        <th className="px-2 py-1 text-left">Qty</th>
                        <th className="px-2 py-1 text-left">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <tr key={idx} className="border-t">
                          <td className="px-2 py-1">{item.product_id}</td>
                          <td className="px-2 py-1">{item.quantity}</td>
                          <td className="px-2 py-1">₹{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No items found.</p>
                )}
              </div>

              {/* Update Status */}
              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Update Status</h3>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <Button
                  onClick={updateOrderStatus}
                  disabled={updating}
                  className="mt-3 w-full"
                >
                  {updating ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No details found.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
