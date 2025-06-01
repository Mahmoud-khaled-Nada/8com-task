import { ShoppingCart, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/utils/types";
import { format } from "path";
import { formatString } from "@/utils/helpers";

interface ProductCardProps {
  product: Product;
  onViewDetails: () => void;
}

const ProductCard = ({ product, onViewDetails }: ProductCardProps) => {
  const { addToCart } = useCart();

  const isLowStock = product.stockQuantity <= 5;
  const isOutOfStock = product.stockQuantity === 0;
  const displayPrice = product.onSale ? product.salePrice! : product.price;

  return (
    <Card className="group  transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <div className="aspect-square cursor-pointer bg-gray-100 overflow-hidden" onClick={onViewDetails}>
          <img
            src={product.imageUrl.toString()}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.onSale && <Badge className="bg-red-500 hover:bg-red-600">SALE</Badge>}
          {isLowStock && !isOutOfStock && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Low Stock</span>
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="bg-gray-500 text-white">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={`bg-white/90 ${
              isOutOfStock
                ? "text-red-600 border-red-200"
                : isLowStock
                ? "text-orange-600 border-orange-200"
                : "text-green-600 border-green-200"
            }`}
          >
            {product.stockQuantity} left
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{formatString(product.description, 40)}</p>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-emerald-600">${displayPrice}</span>
          {product.onSale && <span className="text-lg text-gray-400 line-through">${product.price}</span>}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="flex-1 flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>Details</span>
        </Button>

        <Button
          size="sm"
          onClick={() =>
            addToCart({
              productId: product._id,
              quantity: 1,
            })
          }
          disabled={isOutOfStock}
          className="flex-1 flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{isOutOfStock ? "Sold Out" : "Add to Cart"}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
