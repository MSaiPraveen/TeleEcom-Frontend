import React, { useState, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Layout
import Navbar from './components/layout/Navbar';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OAuth2Success from "./components/auth/OAuth2Success.jsx";


// Pages
import {
  Home,
  Cart,
  Product,
  SearchResults,
  AddProduct,
  UpdateProduct,
  Order,
  MyOrders,
} from './components/pages';

// Context
import { AppContext } from './Context/Context';

// Styles
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleClearCategory = () => {
    setSelectedCategory('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="!rounded-xl !shadow-lg"
      />

      <Navbar onSelectCategory={handleCategorySelect} />

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<Home selectedCategory={selectedCategory} onClearCategory={handleClearCategory} />}
        />
        <Route path="/product" element={<Product />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search-results" element={<SearchResults />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/success" element={<OAuth2Success />} />


        {/* User routes (must be logged in) */}
        <Route
          path="/my-orders"
          element={
            <RequireAuth>
              <MyOrders />
            </RequireAuth>
          }
        />

        {/* Admin-only routes */}
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
  );
}

/* ---------- Route Guards ---------- */

const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useContext(AppContext);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

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
