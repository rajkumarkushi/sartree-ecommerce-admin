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
    price: "",
    tax_amount: "0",
    tax_percentage: "18",
    discount: "0",
    discount_amount: "0",
    description: "",
    quantity: "100",
    weight: "1",
    weight_type: "kg",
  });

  // ✅ Submit Product
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
        title: formData.title,
        price: Number(formData.price),
        tax_amount: Number(formData.tax_amount),
        tax_percentage: Number(formData.tax_percentage),
        discount: Number(formData.discount) || 0,
        discount_amount: Number(formData.discount_amount) || 0,
        description: formData.description,
        status: 1,
        availability: Number(formData.quantity),
        quantity: Number(formData.quantity),
        image:
          imageUrl ||
          "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTk3bLKjYcnH1",
        weight: formData.weight,
        weight_type: formData.weight_type,
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

      // Reset Form
      setFormData({
        title: "",
        main_category_id: "6",
        price: "",
        tax_amount: "0",
        tax_percentage: "18",
        discount: "0",
        discount_amount: "0",
        description: "",
        quantity: "100",
        weight: "1",
        weight_type: "kg",
      });
      setImageUrl("");
      setOpen(false);
    } catch (err: any) {
      console.error("❌ Add Product Error:", err);
      toast.error(err.message || "Failed to add product.");
    }
  };

  // ✅ Handle Image Preview
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
          {/* Title */}
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

          {/* Price & Quantity */}
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

          {/* Tax & Discounts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_amount">Tax Amount *</Label>
              <Input
                id="tax_amount"
                type="number"
                value={formData.tax_amount}
                onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                placeholder="200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_percentage">Tax % *</Label>
              <Input
                id="tax_percentage"
                type="number"
                value={formData.tax_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, tax_percentage: e.target.value })
                }
                placeholder="18"
              />
            </div>
          </div>

          {/* Discount Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="e.g. 10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_amount">Discount Amount</Label>
              <Input
                id="discount_amount"
                type="number"
                value={formData.discount_amount}
                onChange={(e) =>
                  setFormData({ ...formData, discount_amount: e.target.value })
                }
                placeholder="e.g. 200"
              />
            </div>
          </div>

          {/* Weight Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight *</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="25"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Weight Type *</Label>
              <Select
                value={formData.weight_type}
                onValueChange={(v) => setFormData({ ...formData, weight_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="g">Gram (g)</SelectItem>
                  <SelectItem value="ltr">Litre (ltr)</SelectItem>
                  <SelectItem value="ml">Millilitre (ml)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Product details..."
              rows={3}
            />
          </div>

          {/* Image Upload */}
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

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Product
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
