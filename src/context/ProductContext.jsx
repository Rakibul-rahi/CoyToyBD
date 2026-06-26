// src/context/ProductContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { getProducts } from "../services/productService";

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const loadProducts = async (forceRefresh = false) => {
    if (productsLoaded && !forceRefresh) return;

    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setProducts(data);
      setProductsLoaded(true);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        productsLoaded,
        loadingProducts,
        loadProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts must be used inside ProductProvider");
  }

  return context;
}