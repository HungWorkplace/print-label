import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintTemplate } from "./components/PrintTemplate";
import { Settings } from "./components/Settings";
import { Trash2, Plus, Printer } from "lucide-react";
import type { Product } from "./types";

interface WindowNameData {
  products?: Array<{
    ProductNameNoUnit?: string;
    Unit?: string;
    Price?: number;
  }>;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    price: "",
  });
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [labelHeight, setLabelHeight] = useState(40); // mm
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Kiểm tra window.name khi component mount
  useEffect(() => {
    try {
      const windowName = window.name;
      if (windowName && windowName.trim()) {
        const data: WindowNameData = JSON.parse(windowName);
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          const mappedProducts: Product[] = data.products
            .filter((item) => item.ProductNameNoUnit && item.Unit && item.Price !== undefined)
            .map((item, index) => ({
              id: `imported-${Date.now()}-${index}`,
              name: item.ProductNameNoUnit || "",
              unit: item.Unit || "",
              price: String(item.Price || 0),
            }));
          
          if (mappedProducts.length > 0) {
            setProducts(mappedProducts);
          }
        }
      }
    } catch (error) {
      console.error("Failed to parse window.name:", error);
    }
  }, []);

  const formatCurrencyInput = (value: string): string => {
    // Loại bỏ tất cả ký tự không phải số
    const numbers = value.replace(/[^\d]/g, "");
    if (!numbers) return "";
    
    // Format với dấu chấm ngăn cách hàng nghìn
    return new Intl.NumberFormat("vi-VN").format(parseInt(numbers));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setFormData({ ...formData, price: formatted });
  };

  const handleAddProduct = () => {
    if (formData.name.trim() && formData.unit.trim() && formData.price.trim()) {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        unit: formData.unit.trim(),
        price: formData.price.replace(/\./g, ""), // Lưu số không có dấu chấm
      };
      setProducts([...products, newProduct]);
      setFormData({ name: "", unit: "", price: "" });
      // Focus lại vào ô tên sản phẩm
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: "name" | "price") => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "name" && formData.name.trim()) {
        // Nếu đang ở ô tên, chuyển focus hoặc thêm luôn nếu đã đủ thông tin
        if (formData.unit.trim() && formData.price.trim()) {
          handleAddProduct();
        } else if (formData.unit.trim()) {
          // Chưa có giá, focus vào ô giá
          document.querySelector<HTMLInputElement>('input[placeholder="0"]')?.focus();
        }
      } else if (field === "price") {
        // Nếu đang ở ô giá, thêm sản phẩm
        handleAddProduct();
      }
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handlePrint = () => {
    if (products.length === 0) return;
    setShowPrintPreview(true);
    setTimeout(() => {
      const printWindow = document.getElementById("print-iframe") as HTMLIFrameElement;
      if (printWindow?.contentWindow) {
        printWindow.contentWindow.focus();
        printWindow.contentWindow.print();
      }
    }, 300);
  };

  const formatPrice = (price: string) => {
    // Price đã được lưu không có dấu chấm, chỉ cần parse và format
    const num = parseFloat(price.replace(/\./g, ""));
    if (isNaN(num)) return price;
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 relative">
          <div className="absolute top-0 right-0">
            <Settings onHeightChange={setLabelHeight} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            In Tem Báo Giá
          </h1>
          <p className="text-muted-foreground">Nhập thông tin sản phẩm và in tem báo giá</p>
        </div>

        {/* Form nhập liệu */}
        <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <CardTitle className="text-2xl">Thêm sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Tên sản phẩm
                </label>
                <Input
                  ref={nameInputRef}
                  placeholder="Nhập tên sản phẩm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, "name")}
                  className="rounded-2xl h-12 text-base border-2 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Đơn vị
                </label>
                <Input
                  placeholder="kg, lít, cái..."
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (formData.name.trim() && formData.unit.trim() && formData.price.trim()) {
                        handleAddProduct();
                      } else {
                        document.querySelector<HTMLInputElement>('input[placeholder="0"]')?.focus();
                      }
                    }
                  }}
                  className="rounded-2xl h-12 text-base border-2 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Giá tiền
                </label>
                <Input
                  placeholder="0"
                  type="text"
                  value={formData.price}
                  onChange={handlePriceChange}
                  onKeyDown={(e) => handleKeyDown(e, "price")}
                  className="rounded-2xl h-12 text-base border-2 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <Button
              onClick={handleAddProduct}
              className="mt-6 w-full md:w-auto rounded-2xl h-12 px-8 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Plus className="mr-2 size-5" />
              Thêm vào danh sách
            </Button>
          </CardContent>
        </Card>

        {/* Danh sách sản phẩm */}
        {products.length > 0 && (
          <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0 rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  Danh sách sản phẩm ({products.length})
                </CardTitle>
                <Button
                  onClick={handlePrint}
                  className="rounded-2xl h-11 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <Printer className="mr-2 size-5" />
                  In tem
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl border border-blue-100/50 hover:shadow-md transition-all group"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Tên sản phẩm</span>
                        <p className="font-semibold text-base">{product.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Đơn vị</span>
                        <p className="font-semibold text-base">{product.unit}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Giá tiền</span>
                        <p className="font-semibold text-base text-green-600">
                          {formatPrice(product.price)} đ
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="ml-4 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Print Preview */}
        {showPrintPreview && products.length > 0 && (
          <div className="hidden">
            <PrintTemplate products={products} labelHeight={labelHeight} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
