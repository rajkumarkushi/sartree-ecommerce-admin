// src/components/NewProduct.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface NewProductProps {
  onProductCreate: (product: any) => void;
}

export function NewProduct({ onProductCreate }: NewProductProps) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    main_category_id: "6",
    child_category_id: "7",
    price: "",
    tax_amount: "200",
    tax_percentage: "18",
    description: "",
    quantity: "100",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("No token found. Please log in again.");
        return;
      }

      const body = {
        main_category_id: Number(formData.main_category_id),
        child_category_id: Number(formData.child_category_id),
        title: formData.title,
        price: Number(formData.price),
        tax_amount: Number(formData.tax_amount),
        tax_percentage: Number(formData.tax_percentage),
        discount: null,
        discount_amount: null,
        description: formData.description,
        status: 1,
        availability: Number(formData.quantity),
        quantity: Number(formData.quantity),
        image:
          imageUrl ||
          "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTk3bLKjYcnH1",
      };

      const response = await fetch(
        "https://api.sartree.com/api/v1/admin/product/new-product",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();
      console.log("✅ Product Added Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to add product.");
      }

      toast.success("✅ Product added successfully!");
      onProductCreate(result.data || body);
      setFormData({
        title: "",
        main_category_id: "6",
        child_category_id: "7",
        price: "",
        tax_amount: "200",
        tax_percentage: "18",
        description: "",
        quantity: "100",
      });
      setImageUrl("");
      setOpen(false);
    } catch (err: any) {
      console.error("❌ Add Product Error:", err);
      toast.error(err.message || "Failed to add product.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter product title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Main Category *</Label>
              <Select
                value={formData.main_category_id}
                onValueChange={(v) => setFormData({ ...formData, main_category_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Groceries</SelectItem>
                  <SelectItem value="7">Rice & Grains</SelectItem>
                  <SelectItem value="8">Electronics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sub Category *</Label>
              <Select
                value={formData.child_category_id}
                onValueChange={(v) => setFormData({ ...formData, child_category_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Rice Bags</SelectItem>
                  <SelectItem value="8">Kitchen Essentials</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="1450"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Stock Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="100"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product details..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label htmlFor="image" className="cursor-pointer flex items-center gap-2 text-blue-600">
              <Upload className="h-4 w-4" /> Upload Image
            </label>
            {imageUrl && (
              <div className="relative mt-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Add Product</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
