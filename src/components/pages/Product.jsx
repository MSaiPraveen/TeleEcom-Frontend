// src/components/pages/Product.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../axios.jsx';
import { AppContext } from '../../Context/Context';
import { Card, Button, Badge, Spinner, Modal } from '../ui';
import unplugged from '../../assets/unplugged.png';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, isAdmin, products } = useContext(AppContext);

  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/product/${id}`);
        setProduct(res.data);

        if (res.data.imageName) {
          await fetchImage();
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    const fetchImage = async () => {
      try {
        const res = await api.get(`/product/${id}/image`, {
          responseType: 'blob',
        });
        setImageUrl(URL.createObjectURL(res.data));
      } catch (error) {
        console.error('Error fetching image:', error);
        setImageUrl(unplugged);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const deleteProduct = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/product/${id}`);
      removeFromCart(Number(id));
      toast.success('Product deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
  };

  const isOutOfStock = !product?.productAvailable || product?.stockQuantity === 0;

  // Get related products
  const relatedProducts = (products || [])
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/" className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400">
            Home
          </Link>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-500">{product.category}</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900 dark:text-white font-medium truncate">{product.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Product Image */}
          <div className="mb-8 lg:mb-0">
            <Card padding={false} className="overflow-hidden sticky top-24">
              <div className="aspect-square bg-white dark:bg-slate-800 relative">
                <img
                  src={imageUrl || unplugged}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => { e.target.src = unplugged; }}
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge variant="primary">{product.category}</Badge>
                </div>
                
                {/* Stock Status */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                    <Badge variant="danger" size="lg">Out of Stock</Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Product Details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {product.name}
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 italic">
                  ~ {product.brand}
                </p>
              </div>
              
              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/product/update/${id}`)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">
                ${product.price.toLocaleString('en-US')}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-2">incl. taxes</span>
            </div>

            {/* Stock Info */}
            <div className="flex items-center gap-4 mb-6">
              {product.stockQuantity > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">In Stock</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {product.stockQuantity} units available
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-red-600 dark:text-red-400 font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector & Add to Cart */}
            {!isOutOfStock && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-16 text-center font-semibold text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                    className="w-12 h-12 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart - ${(product.price * quantity).toLocaleString('en-US')}
                </Button>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Free Shipping</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">On orders $99+</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Warranty</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">1 Year Covered</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Easy Returns</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">30 Day Return</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Fast Delivery</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">2-3 Days</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
              <nav className="flex gap-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'description'
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Details
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {activeTab === 'description' ? (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              ) : (
                <dl className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Brand</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">{product.brand}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Category</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">{product.category}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Listed Date</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {product.releaseDate
                        ? new Date(product.releaseDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Availability</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {product.productAvailable ? 'Available' : 'Not Available'}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`}>
                  <Card hover padding={false} className="overflow-hidden h-full">
                    <div className="aspect-square bg-slate-100 dark:bg-slate-700">
                      <img
                        src={p.imageData ? `data:image/jpeg;base64,${p.imageData}` : unplugged}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">
                        {p.name}
                      </h3>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        ${p.price.toLocaleString('en-US')}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Are you sure?
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            This will permanently delete "{product.name}". This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={deleteProduct}
              loading={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Product;
