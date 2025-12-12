// src/Context/Context.jsx
import React, { createContext, useState, useEffect } from "react";
import api from "../axios.jsx";
import { toast } from "react-toastify";

export const AppContext = createContext();

const ContextProvider = ({ children }) => {
  /* ------------ AUTH ------------ */
  const [user, setUser] = useState(localStorage.getItem("username") || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("isAdmin") === "true"
  );

  /* ------------ PRODUCTS ------------ */
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  /* ------------ CART ------------ */
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  /* ------------ SYNC JWT TO AXIOS ------------ */
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  /* ------------ PERSIST CART ------------ */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /* ------------ LOAD PRODUCTS ------------ */
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await api.get("/api/product");
      // Ensure we always set an array (handle error responses)
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]); // Reset to empty array on error
      toast.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ------------ LOGIN / LOGOUT ------------ */
  const login = (jwt, username, adminFlag = false) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("username", username);
    localStorage.setItem("isAdmin", adminFlag ? "true" : "false");

    setToken(jwt);
    setUser(username);
    setIsAdmin(!!adminFlag);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("cart");

    setToken(null);
    setUser(null);
    setIsAdmin(false);
    setCart([]);
  };

  /* ------------ CART HELPERS ------------ */
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  /* ------------ PLACE ORDER (JWT, /api/orders) ------------ */
  const placeOrder = async (customerName, email) => {
    try {
      if (!token) {
        toast.error("Please log in to place an order.");
        return;
      }

      if (!cart.length) {
        toast.info("Your cart is empty.");
        return;
      }

      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const res = await api.post("/api/orders", {
        customerName,
        email,
        items,
      });

      clearCart();
      toast.success("Order placed successfully!");
      return res.data;
    } catch (error) {
      console.error("Order failed:", error);
      toast.error("Failed to place order. Please try again.");
      throw error;
    }
  };

  const value = {
    // auth
    user,
    token,
    isAdmin,
    isAuthenticated: !!token,
    login,
    logout,

    // products
    products,
    productsLoading,
    refreshProducts: fetchProducts,

    // cart
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    cartTotal,

    // orders
    placeOrder,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export default ContextProvider;
