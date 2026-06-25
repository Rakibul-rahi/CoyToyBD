import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "coytoybd_cart";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const normalizeCartItem = (product) => {
    return {
      ...product,
      id: product.id,
      uid: product.uid || product.productId || product.sku || product.id,
      name: product.name || "Unnamed Product",
      price: Number(product.price || 0),
      quantity: Number(product.quantity || 0),
      quantityInCart: Number(product.quantityInCart || 1),
      category: product.category || "N/A",
      imageUrl: product.imageUrl || product.image || "",
    };
  };

  const addToCart = (product) => {
    const newItem = normalizeCartItem(product);
    const availableStock = Number(newItem.quantity || 0);

    if (availableStock <= 0) {
      alert("This product is out of stock");
      return;
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === newItem.id);

      if (existing) {
        if (Number(existing.quantityInCart || 0) >= availableStock) {
          alert("You cannot add more than available stock");
          return prevItems;
        }

        return prevItems.map((item) =>
          item.id === newItem.id
            ? {
                ...item,
                quantityInCart: Number(item.quantityInCart || 0) + 1,
              }
            : item
        );
      }

      return [...prevItems, { ...newItem, quantityInCart: 1 }];
    });
  };

  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        const availableStock = Number(item.quantity || 0);
        const currentQuantity = Number(item.quantityInCart || 0);

        if (currentQuantity >= availableStock) {
          alert("You cannot add more than available stock");
          return item;
        }

        return {
          ...item,
          quantityInCart: currentQuantity + 1,
        };
      })
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id !== id) return item;

          return {
            ...item,
            quantityInCart: Number(item.quantityInCart || 0) - 1,
          };
        })
        .filter((item) => Number(item.quantityInCart || 0) > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => {
    return total + Number(item.quantityInCart || 0);
  }, 0);

  const cartTotal = cartItems.reduce((total, item) => {
    return total + Number(item.price || 0) * Number(item.quantityInCart || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};