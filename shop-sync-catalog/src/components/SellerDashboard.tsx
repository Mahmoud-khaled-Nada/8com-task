import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import ProductForm from "./ProductForm";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

const PRODUCTS_PER_PAGE = 5;

const SellerDashboard = () => {
  const { products, deleteProduct, currentPage, setCurrentPage, totalPages } = useProducts();

  const { user } = useAuth();

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const lowStockProducts = products?.filter((p) => p.stockQuantity <= 5 && p.stockQuantity > 0);
  const outOfStockProducts = products?.filter((p) => p.stockQuantity === 0);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <Button onClick={() => setShowProductForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="space-y-4">
          {outOfStockProducts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Out of Stock Alert</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {outOfStockProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockProducts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Low Stock Alert</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        {product.stockQuantity} remaining
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Product List */}
      <Card>
        <CardHeader>
          <CardTitle>My Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600">{product.category}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="font-semibold text-emerald-600">
                      ${product.onSale ? product.salePrice : product.price}
                    </span>
                    {product.onSale && (
                      <span className="text-sm text-gray-400 line-through">${product.price}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge
                    variant="outline"
                    className={
                      product.stockQuantity === 0
                        ? "text-red-600 border-red-200"
                        : product.stockQuantity <= 5
                        ? "text-orange-600 border-orange-200"
                        : "text-green-600 border-green-200"
                    }
                  >
                    Stock: {product.stockQuantity}
                  </Badge>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <ProductForm isOpen={showProductForm} onClose={handleCloseForm} editingProduct={editingProduct} />
    </div>
  );
};

export default SellerDashboard;
