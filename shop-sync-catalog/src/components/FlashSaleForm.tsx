import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/contexts/ProductContext";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { SelectProductMenu } from "./select-product-menu";

interface FlashSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlashSaleForm = ({ isOpen, onClose }: FlashSaleFormProps) => {
  const { products, updateProduct, searchTerm, setSearchTerm, setCurrentPage } = useProducts();
  const [data, setData] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [salePrice, setSalePrice] = useState("");

  const [inputTerm, setInputTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(inputTerm, 500);

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
    setCurrentPage(1);

    const filtered = products.filter(
      (p) => !p.onSale && p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    setData(filtered);
  }, [debouncedSearchTerm, products, setSearchTerm, setCurrentPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProductId && salePrice) {
      updateProduct(selectedProductId, {
        onSale: true,
        salePrice: parseFloat(salePrice),
      });

      onClose();
      setSelectedProductId("");
      setSalePrice("");
    }
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  console.log(data);
  console.log(data.length);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Flash Sale</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectProductMenu
            inputTerm={inputTerm}
            setInputTerm={setInputTerm}
            data={data}
            setSelectedProductId={setSelectedProductId}
            selectedProductId={selectedProductId}
          />

          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Current Price: ${selectedProduct.price}</p>
              <p className="text-sm text-gray-600">
                Discount:{" "}
                {selectedProduct.price && salePrice
                  ? Math.round(
                      ((selectedProduct.price - parseFloat(salePrice)) / selectedProduct.price) * 100
                    )
                  : 0}
                %
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="salePrice">Sale Price ($)</Label>
            <Input
              id="salePrice"
              type="number"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              max={selectedProduct?.price}
              required
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={!selectedProductId || !salePrice}
            >
              Create Flash Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FlashSaleForm;
