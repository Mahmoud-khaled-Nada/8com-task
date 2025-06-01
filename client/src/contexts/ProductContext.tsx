import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { categoryAPI, productAPI } from "@/lib/api";
import { Category, Product } from "@/utils/types";

interface ProductContextType {
  products: Product[];
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  fetchProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProducts = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 8,
        search: searchTerm,
        category: selectedCategory !== "All" ? selectedCategory : "",
      };

      const res = await productAPI.getAllProducts(params);
      setProducts(res.data);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAllCategories();
      setCategories(["All", ...data.map((category: Category) => category.name)]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const addProduct = async (product: Partial<Product>) => {
    product.imageUrl = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400";
    const newProduct = await productAPI.create(product);
    if (newProduct.success) {
      const product = newProduct.data;

      setProducts((prev) => {
        const index = prev.findIndex((p) => p._id === product._id);
        if (index === -1) return prev;

        const updated = prev[index];
        const rest = prev.filter((_, i) => i !== index);
        return [updated, ...rest];
      });
      toast({
        title: "Product Added",
        description: `${product.name} has been added to the catalog.`,
      });
    } else {
      toast({
        title: "Add Failed",
        description: newProduct.message || "Failed to add product.",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const productUpdate = await productAPI.update(id, updates);
    if (productUpdate.success) {
      const newProduct = productUpdate.data;

      setProducts((prev) => prev.map((p) => (p._id === id ? newProduct : p)));
      toast({
        title: "Product Updated",
        description: "Product has been successfully updated.",
      });
    } else {
      toast({
        title: "Update Failed",
        description: productUpdate.message || "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    const productDelete = await productAPI.delete(id);

    if (productDelete.success) {
      const product = products.find((p) => p._id === id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast({
        title: "Product Deleted",
        description: `${product?.name} has been removed from the catalog.`,
        variant: "destructive",
      });
    }

    console.log();
  };

  const updateStock = (id: string, newStock: number) => {
    setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, stock: newStock } : p)));
    const product = products.find((p) => p._id === id);
    if (newStock <= 5 && product) {
      toast({
        title: "Low Stock Alert",
        description: `${product.name} is running low (${newStock} remaining)`,
        variant: "destructive",
      });
    }
  };


  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        categories,
        totalPages,
        currentPage,
        setCurrentPage,
        fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
