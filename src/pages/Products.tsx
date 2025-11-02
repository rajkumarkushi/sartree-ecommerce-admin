import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Edit, Trash2, Image } from "lucide-react";
import { toast } from "sonner";
import { NewProduct } from "@/components/NewProduct";
import { EditProduct } from "@/components/EditProduct";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("No token found. Please log in again.");
        return;
      }

      const response = await fetch("https://api.sartree.com/api/v1/product", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log("✅ Products API response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch products.");
      }

      // Some APIs return {data: [...]}
      const list = Array.isArray(result.data) ? result.data : [];
      setProducts(list);
    } catch (err: any) {
      console.error("❌ Products fetch error:", err);
      toast.error(err.message || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductCreate = async (newProduct: any) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("No token found. Please log in again.");
      return;
    }

    const response = await fetch("https://api.sartree.com/api/v1/product", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newProduct.name,
        category_id: newProduct.category_id || 1, // default or selected category
        price: newProduct.price.replace("₹", ""),
        stock: newProduct.stock,
        description: newProduct.description || "",
        status: "active",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to add product.");
    }

    // ✅ Append new product to UI
    setProducts((prev) => [result.data || newProduct, ...prev]);
    toast.success(`✅ ${newProduct.name} added successfully!`);

  } catch (err: any) {
    console.error("❌ Add Product Error:", err);
    toast.error(err.message || "Failed to add product.");
  }
};

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setEditOpen(true);
  };

  const handleUpdateProduct = (updatedProduct: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    toast.success(`✏️ ${updatedProduct.name} updated successfully!`);
  };

  const handleDeleteProduct = (id: number) => {
    const productToDelete = products.find((p) => p.id === id);
    if (!productToDelete) return;

    if (
      window.confirm(`Are you sure you want to delete ${productToDelete.title || productToDelete.name}?`)
    ) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(`🗑️ ${productToDelete.title || productToDelete.name} deleted successfully!`);
    }
  };

  const filteredProducts = products.filter((product) => {
    const name = product.name || product.title || "";
    const sku = product.sku || product.product_code || "";
    const categoryTitle =
      typeof product.category === "object"
        ? product.category?.title || ""
        : product.category || "";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      categoryTitle.toLowerCase() === categoryFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      (product.status &&
        product.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "low stock":
        return "bg-yellow-100 text-yellow-800";
      case "out of stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products & Inventory</h1>
          <p className="text-gray-600 mt-2">
            Manage your product catalog and inventory levels
          </p>
        </div>
        <NewProduct onProductCreate={handleProductCreate} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {products.length}
            </div>
            <p className="text-sm text-gray-600">Total Products</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {products.filter((p) => p.status?.toLowerCase() === "active").length}
            </div>
            <p className="text-sm text-gray-600">Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {products.filter((p) => p.status?.toLowerCase() === "low stock").length}
            </div>
            <p className="text-sm text-gray-600">Low Stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {products.filter((p) => p.status?.toLowerCase() === "out of stock").length}
            </div>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Inventory</CardTitle>
            <div className="flex gap-4 items-center">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="low stock">Low Stock</SelectItem>
                  <SelectItem value="out of stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500">No products found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const category =
                      typeof product.category === "object"
                        ? product.category?.title || "—"
                        : product.category || "—";

                    const price =
                      product.price ||
                      product.selling_price ||
                      "0.00";

                    const status =
                      typeof product.status === "object"
                        ? product.status?.title || "Active"
                        : product.status || "Active";

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4 text-gray-900 font-medium">
                          {product.title || product.name || "Unnamed"}
                        </td>
                        <td className="py-4 px-4 text-gray-600">{category}</td>
                        <td className="py-4 px-4 text-gray-900 font-medium">
                          ₹{price}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-4 px-4 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditProduct
        product={selectedProduct}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdate={handleUpdateProduct}
      />
    </div>
  );
};

export default Products;
