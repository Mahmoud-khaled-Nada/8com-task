import { Check } from "lucide-react";
import { Label } from "./ui/label";

export const SelectProductMenu = ({
  inputTerm,
  setInputTerm,
  data,
  setSelectedProductId,
  selectedProductId,
}) => {
  return (
    <div>
      <Label htmlFor="product" className="block mb-1 text-sm font-medium text-gray-700">
        Select Product
      </Label>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search product..."
        value={inputTerm}
        onChange={(e) => setInputTerm(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
      />

      {/* Result List */}
      <div className="mt-2 max-h-60 overflow-y-auto border rounded-md shadow-sm bg-white">
        {data.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No products found.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.map((product) => (
              <li
                key={product._id}
                onClick={() => setSelectedProductId(product._id)}
                className={`flex justify-between items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                  selectedProductId === product._id ? "bg-orange-100" : ""
                }`}
              >
                <span>
                  {product.name} – ${product.price}
                </span>
                {selectedProductId === product._id && <Check className="h-4 w-4 text-emerald-600" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
