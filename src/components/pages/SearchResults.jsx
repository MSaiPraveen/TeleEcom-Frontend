// src/components/pages/SearchResults.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../../Context/Context';
import { Card, Button, Badge, Spinner } from '../ui';
import api from '../../axios.jsx';
import unplugged from '../../assets/unplugged.png';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(AppContext);

  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (location.state && location.state.searchData) {
      setSearchData(location.state.searchData);
      setSearchQuery(location.state.query || '');
      setLoading(false);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

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
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Searching...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link to="/" className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400">
              Home
            </Link>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-900 dark:text-white font-medium">Search Results</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Search Results
              </h1>
              {searchQuery && (
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Showing results for "<span className="font-medium text-slate-900 dark:text-white">{searchQuery}</span>"
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="lg">
                {searchData.length} {searchData.length === 1 ? 'product' : 'products'} found
              </Badge>
            </div>
          </div>
        </div>

        {searchData.length === 0 ? (
          /* No Results */
          <Card className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
              No products found
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              We couldn't find any products matching your search. Try different keywords or browse our categories.
            </p>
            <Link to="/">
              <Button variant="primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Button>
            </Link>
          </Card>
        ) : (
          /* Results Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchData.map((product) => (
              <SearchResultCard
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

// Search Result Card Component
const SearchResultCard = ({ product, onAddToCart, convertImage }) => {
  const { id, name, brand, price, category, productAvailable, imageData, imageName, stockQuantity, description } = product;
  const isOutOfStock = !productAvailable || stockQuantity === 0;
  const [imageUrl, setImageUrl] = useState(null);

  // Fetch image separately if not included in product data
  useEffect(() => {
    if (imageData) {
      setImageUrl(convertImage(imageData));
    } else if (imageName) {
      const fetchImage = async () => {
        try {
          const res = await api.get(`/product/${id}/image`, {
            responseType: 'blob',
          });
          setImageUrl(URL.createObjectURL(res.data));
        } catch (error) {
          console.error('Error fetching image for product', id, error);
          setImageUrl(unplugged);
        }
      };
      fetchImage();
    } else {
      setImageUrl(unplugged);
    }
  }, [id, imageData, imageName, convertImage]);

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
            src={imageUrl || unplugged}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = unplugged; }}
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
            <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-2">
              ~ {brand}
            </p>
            {description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              ${price.toLocaleString('en-US')}
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

export default SearchResults;
