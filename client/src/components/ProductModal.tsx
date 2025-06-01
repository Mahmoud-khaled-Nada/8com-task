
import { ShoppingCart, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/utils/types';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const { addToCart } = useCart();

  const isLowStock = product.stockQuantity <= 5;
  const isOutOfStock = product.stockQuantity === 0;
  const displayPrice = product.onSale ? product.salePrice! : product.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product.name}</span>
            {/* <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button> */}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.imageUrl.toString()}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-blue-100 text-blue-800">
                  {product.category}
                </Badge>
                {product.onSale && (
                  <Badge className="bg-red-500">
                    SALE
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl font-bold text-emerald-600">
                  ${displayPrice}
                </span>
                {product.onSale && (
                  <span className="text-xl text-gray-400 line-through">
                    ${product.price}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 mb-6">
                <Badge 
                  variant="outline" 
                  className={
                    isOutOfStock ? 'text-red-600 border-red-200' :
                    isLowStock ? 'text-orange-600 border-orange-200' : 
                    'text-green-600 border-green-200'
                  }
                >
                  {product.stockQuantity} in stock
                </Badge>
                {isLowStock && !isOutOfStock && (
                  <Badge variant="destructive">
                    Low Stock
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="border-t pt-6">
              <Button
                onClick={() => {
                  addToCart(product);
                  onClose();
                }}
                disabled={isOutOfStock}
                className="w-full flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
