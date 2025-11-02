import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreHorizontal, X, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("No token found. Please log in again.");

      const response = await fetch("https://api.sartree.com/api/v1/admin/all-customers", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`Failed to fetch customers (${response.status})`);
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : data?.data || []);
    } catch (err: any) {
      setError(err.message || "Error fetching customers");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ ADD CUSTOMER
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError("");

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("No token found. Please log in again.");
      toast.error("No token found. Please log in again.");
      setAdding(false);
      return;
    }

    const cleanPhone = /^\d{8,15}$/.test(formData.phone) ? formData.phone : "";

    const payload = {
      username: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      mobile: cleanPhone,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    };

    try {
      const response = await fetch("https://api.sartree.com/api/v1/admin/customer-register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to add customer");

      toast.success("✅ Customer added successfully!");
      setShowAddModal(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
      });
      setTimeout(fetchCustomers, 1000);
    } catch (err: any) {
      setError(err.message || "Error adding customer");
      toast.error(`❌ ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  // ✅ EDIT CUSTOMER
  const openEditModal = (customer: any) => {
    setSelectedCustomer(customer);
    setFormData({
      first_name: customer.firstname || "",
      last_name: customer.lastname || "",
      email: customer.email || "",
      phone: customer.mobile || "",
      password: "",
      password_confirmation: "",
    });
    setShowEditModal(true);
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setUpdating(true);
    const token = localStorage.getItem("adminToken");
    if (!token) return toast.error("No token found. Please log in again.");

    const cleanPhone = /^\d{8,15}$/.test(formData.phone) ? formData.phone : "";

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      mobile: cleanPhone,
    };

    try {
      const response = await fetch(
        `https://api.sartree.com/api/v1/admin/users/update/${selectedCustomer.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to update customer");

      toast.success("✅ Customer updated successfully!");
      setShowEditModal(false);
      setTimeout(fetchCustomers, 1000);
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // ✅ DELETE CUSTOMER
  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    const token = localStorage.getItem("adminToken");
    if (!token) return toast.error("No token found. Please log in again.");

    try {
      const response = await fetch(
        `https://api.sartree.com/api/v1/admin/users/destroy/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to delete customer");

      toast.success("🗑️ Customer deleted successfully!");
      fetchCustomers();
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage your customer database</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer List</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading customers...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredCustomers.length === 0 ? (
            <p className="text-gray-500">No customers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {c.firstname} {c.lastname}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{c.email}</td>
                      <td className="py-4 px-4">
                        <Badge variant={c.is_active ? "default" : "secondary"}>
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-4 px-4 flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(c)}>
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomer(c.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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

      {/* ADD MODAL */}
      {showAddModal && (
        <Modal
          title="Add New Customer"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCustomer}
          loading={adding}
          formData={formData}
          onChange={handleInputChange}
          setError={setError}
          error={error}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <Modal
          title="Edit Customer"
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditCustomer}
          loading={updating}
          formData={formData}
          onChange={handleInputChange}
          setError={setError}
          error={error}
        />
      )}
    </div>
  );
};

// ✅ Reusable Modal Component
const Modal = ({
  title,
  onClose,
  onSubmit,
  loading,
  formData,
  onChange,
  error,
}: any) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>

      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={onChange}
          required
        />
        <Input
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={onChange}
        />
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={onChange}
          required
        />
        <Input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={onChange}
        />
        {title.includes("Add") && (
          <>
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={onChange}
              required
            />
            <Input
              name="password_confirmation"
              type="password"
              placeholder="Confirm Password"
              value={formData.password_confirmation}
              onChange={onChange}
              required
            />
          </>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  </div>
);

export default Customers;
