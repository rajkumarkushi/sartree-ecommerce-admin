import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface EditProductProps {
  product: any | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (updatedProduct: any) => void;
}

export function EditProduct({
  product,
  open,
  onClose,
  onUpdate,
}: EditProductProps) {
  // ✅ Prevent crash when product is null
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: 0,
    description: "",
  });

  // ✅ When modal opens with valid product, prefill form
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "",
        price: product.price?.replace("₹", "").replace("$", "") || "",
        stock: product.stock || 0,
        description: product.description || "",
      });
    }
  }, [product]);

  // ✅ Handle save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return; // extra safety

    const updatedProduct = {
      ...product,
      ...formData,
      price:
        formData.price.startsWith("₹") || formData.price.startsWith("$")
          ? formData.price
          : `₹${formData.price}`,
      stock: parseInt(String(formData.stock)),
      status:
        parseInt(String(formData.stock)) > 0 ? "Active" : "Out of Stock",
    };

    onUpdate(updatedProduct);
    onClose();
  };

  // ✅ If no product selected yet, render nothing
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="text"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity *</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: Number(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
