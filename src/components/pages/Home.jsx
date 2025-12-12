// src/components/pages/Home.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../Context/Context';
import { Card, Badge, Button, Spinner } from '../ui';
import unplugged from '../../assets/unplugged.png';

const Home = ({ selectedCategory, onClearCategory }) => {
  const { products, productsLoading, addToCart } = useContext(AppContext);
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const convertBase64ToDataURL = (base64String, mimeType = 'image/jpeg') => {
    if (!base64String) return unplugged;
    if (base64String.startsWith('data:')) return base64String;
    if (base64String.startsWith('http')) return base64String;
    return `data:${mimeType};base64,${base64String}`;
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setToastProduct(product);
    setShowToast(true);
  };

  const filteredProducts = selectedCategory
    ? (products || []).filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase())
    : (products || []);

  if (productsLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900">
      {/* Toast Notification */}
      <div
        className={`fixed top-24 right-4 z-50 transition-all duration-300 ${
          showToast ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
        }`}
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 max-w-sm">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              Added to cart
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {toastProduct?.name}
            </p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 dark:from-primary-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {selectedCategory ? `${selectedCategory} Products` : 'Discover Amazing Products'}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {selectedCategory
                ? `Browse our collection of ${selectedCategory.toLowerCase()} products`
                : 'Shop the latest trends and find everything you need at unbeatable prices'}
            </p>
            {selectedCategory && onClearCategory && (
              <Button variant="secondary" className="mt-6" onClick={onClearCategory}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filter
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-slate-600 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredProducts.length}</span> products
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
            <select className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                convertImage={convertBase64ToDataURL}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart, convertImage }) => {
  const { id, name, brand, price, category, productAvailable, imageData, stockQuantity } = product;
  const isOutOfStock = !productAvailable || stockQuantity === 0;

  return (
    <Link to={`/product/${id}`}>
      <Card 
        hover 
        padding={false} 
        className="group overflow-hidden h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-square bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <img
            src={convertImage(imageData)}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = '/placeholder.png'; }}
          />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="primary" size="sm">{category}</Badge>
          </div>
          
          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <Badge variant="danger" size="lg">Out of Stock</Badge>
            </div>
          )}
          
          {/* Quick Add Button */}
          {!isOutOfStock && (
            <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="primary"
                className="w-full shadow-lg"
                onClick={(e) => onAddToCart(e, product)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </Button>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-1">
              {name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              ~ {brand}
            </p>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {stockQuantity > 0 && stockQuantity <= 5 && (
              <Badge variant="warning" size="sm">
                Only {stockQuantity} left
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Home;
