// src/App.jsx
import React, { useState, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import UpdateProduct from "./components/UpdateProduct";
import Order from "./components/Order";
import SearchResults from "./components/SearchResults";
import Login from "./components/Login";
import Register from "./components/Register";

import { AppContext } from "./Context/Context";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <ToastContainer autoClose={2000} hideProgressBar />
      <Navbar onSelectCategory={handleCategorySelect} />

      <div className="min-vh-100 bg-light" style={{ paddingTop: "70px" }}>
        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={<Home selectedCategory={selectedCategory} />}
          />
          <Route path="/product" element={<Product />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search-results" element={<SearchResults />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin-only */}
          <Route
            path="/add_product"
            element={
              <RequireAdmin>
                <AddProduct />
              </RequireAdmin>
            }
          />
          <Route
            path="/product/update/:id"
            element={
              <RequireAdmin>
                <UpdateProduct />
              </RequireAdmin>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAdmin>
                <Order />
              </RequireAdmin>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

/** Guard for admin-only pages */
const RequireAdmin = ({ children }) => {
  const { isAdmin, isAuthenticated } = useContext(AppContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default App;
