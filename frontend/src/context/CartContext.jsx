import { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    const newTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    setTotal(newTotal);
  }, [cart]);

  const addToCart = (item, shopId) => {
    const existItem = cart.find((x) => x._id === item._id);

    // Check if item is from same shop. If not, clear cart
    if (cart.length > 0 && cart[0].shopId !== shopId) {
      if (!window.confirm("Adding items from a different shop will clear your current cart. Proceed?")) return;
      setCart([{ ...item, qty: 1, shopId }]);
      return;
    }

    if (existItem) {
      setCart(
        cart.map((x) =>
          x._id === existItem._id ? { ...x, qty: x.qty + 1 } : x
        )
      );
    } else {
      setCart([...cart, { ...item, qty: 1, shopId }]);
    }
  };

  const decreaseQty = (id) => {
    const item = cart.find((x) => x._id === id);
    if (item && item.qty > 1) {
      setCart(
        cart.map((x) =>
          x._id === id ? { ...x, qty: x.qty - 1 } : x
        )
      );
    } else {
      // Remove item if qty goes to 0
      setCart(cart.filter((x) => x._id !== id));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((x) => x._id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemQty = (itemId) => {
    const item = cart.find((x) => x._id === itemId);
    return item ? item.qty : 0;
  };

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, decreaseQty, removeFromCart, clearCart, total, getItemQty, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
