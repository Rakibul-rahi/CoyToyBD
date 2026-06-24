import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("coytoybd_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("coytoybd_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    const availableStock = Number(product.quantity);

    const existing = cartItems.find((item) => item.id === product.id);

    if (existing) {
      if (existing.quantityInCart >= availableStock) {
        alert("You cannot add more than available stock");
        return;
      }

      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantityInCart: item.quantityInCart + 1 }
            : item
        )
      );
    } else {
      if (availableStock <= 0) {
        alert("This product is out of stock");
        return;
      }

      setCartItems([...cartItems, { ...product, quantityInCart: 1 }]);
    }
  };

  const increaseQuantity = (id) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id !== id) return item;

        if (item.quantityInCart >= Number(item.quantity)) {
          alert("You cannot add more than available stock");
          return item;
        }

        return { ...item, quantityInCart: item.quantityInCart + 1 };
      })
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems(
      cartItems
        .map((item) =>
          item.id === id
            ? { ...item, quantityInCart: item.quantityInCart - 1 }
            : item
        )
        .filter((item) => item.quantityInCart > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
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

export const useCart = () => useContext(CartContext);