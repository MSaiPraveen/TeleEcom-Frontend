// src/components/pages/UpdateProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../axios.jsx';
import { Card, Button, Input, Spinner } from '../ui';

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({});
  const [image, setImage] = useState(null);
  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: '',
    description: '',
    brand: '',
    price: '',
    category: '',
    releaseDate: '',
    productAvailable: false,
    stockQuantity: '',
  });

  const [imageChanged, setImageChanged] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { value: 'Laptop', icon: '💻' },
    { value: 'Headphone', icon: '🎧' },
    { value: 'Mobile', icon: '📱' },
    { value: 'Electronics', icon: '🔌' },
    { value: 'Toys', icon: '🎮' },
    { value: 'Fashion', icon: '👕' },
  ];

  const convertUrlToFile = async (blobData, fileName) => {
    return new File([blobData], fileName, { type: blobData.type });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/product/${id}`);
        const prod = response.data;

        setProduct(prod);
        setUpdateProduct(prod);

        if (prod.imageName) {
          const responseImage = await api.get(`/product/${id}/image`, {
            responseType: 'blob',
          });
          const imageFile = await convertUrlToFile(responseImage.data, prod.imageName);
          setImage(imageFile);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        navigate('/');
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!updateProduct.name?.trim()) newErrors.name = 'Product name is required';
    if (!updateProduct.brand?.trim()) newErrors.brand = 'Brand is required';
    if (!updateProduct.description?.trim()) newErrors.description = 'Description is required';
    if (!updateProduct.price || parseFloat(updateProduct.price) <= 0) newErrors.price = 'Price must be greater than zero';
    if (!updateProduct.category) newErrors.category = 'Please select a category';
    if (updateProduct.stockQuantity === '' || parseInt(updateProduct.stockQuantity) < 0) newErrors.stockQuantity = 'Stock quantity cannot be negative';
    if (!updateProduct.releaseDate) newErrors.releaseDate = 'Release date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const normalizedProduct = {
        ...updateProduct,
        price: Number(updateProduct.price),
        stockQuantity: Number(updateProduct.stockQuantity),
      };

      const formData = new FormData();

      if (imageChanged && image) {
        formData.append('imageFile', image);
      }
      formData.append(
        'product',
        new Blob([JSON.stringify(normalizedProduct)], {
          type: 'application/json',
        })
      );

      await api.put(`/product/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Product updated successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateProduct((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImageChanged(true);
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: null }));
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
      setImageChanged(true);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link to="/" className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400">
              Home
            </Link>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to={`/product/${id}`} className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400">
              {product.name}
            </Link>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-900 dark:text-white font-medium">Edit</span>
          </nav>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Update Product</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Modify the product details below</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Basic Information</h2>
                
                <div className="space-y-4">
                  <Input
                    label="Product Name"
                    name="name"
                    placeholder="Enter product name"
                    value={updateProduct.name || ''}
                    onChange={handleChange}
                    error={errors.name}
                    required
                  />

                  <Input
                    label="Brand"
                    name="brand"
                    placeholder="Enter brand name"
                    value={updateProduct.brand || ''}
                    onChange={handleChange}
                    error={errors.brand}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      placeholder="Enter product description..."
                      value={updateProduct.description || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none ${
                        errors.description
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Pricing & Inventory */}
              <Card>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Pricing & Inventory</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Price ($)"
                    name="price"
                    type="number"
                    placeholder="0.00"
                    value={updateProduct.price || ''}
                    onChange={handleChange}
                    error={errors.price}
                    required
                    leftIcon={<span className="text-slate-500 font-medium">$</span>}
                  />

                  <Input
                    label="Stock Quantity"
                    name="stockQuantity"
                    type="number"
                    placeholder="0"
                    value={updateProduct.stockQuantity || ''}
                    onChange={handleChange}
                    error={errors.stockQuantity}
                    required
                  />

                  <Input
                    label="Release Date"
                    name="releaseDate"
                    type="date"
                    value={updateProduct.releaseDate ? updateProduct.releaseDate.slice(0, 10) : ''}
                    onChange={handleChange}
                    error={errors.releaseDate}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={updateProduct.category || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        errors.category
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.value}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Product Available</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Make this product available for purchase</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="productAvailable"
                      checked={updateProduct.productAvailable || false}
                      onChange={(e) =>
                        setUpdateProduct((prev) => ({
                          ...prev,
                          productAvailable: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </Card>
            </div>

            {/* Sidebar - Image Upload */}
            <div className="space-y-6">
              <Card>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Product Image</h2>
                
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:border-primary-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {image ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="w-full h-48 object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImageChanged(true);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {imageChanged && (
                        <span className="absolute bottom-2 left-2 text-xs bg-primary-500 text-white px-2 py-1 rounded-full">
                          New Image
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <span className="font-medium text-primary-600 dark:text-primary-400 cursor-pointer">
                          Click to upload
                        </span>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs text-slate-400">PNG, JPG, WebP up to 5MB</p>
                    </>
                  )}
                  
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Leave empty to keep current image
                </p>
              </Card>

              {/* Quick Category Select */}
              <Card>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Category</h2>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setUpdateProduct((prev) => ({ ...prev, category: cat.value }));
                        setErrors((prev) => ({ ...prev, category: null }));
                      }}
                      className={`p-3 rounded-xl text-center transition-all ${
                        updateProduct.category === cat.value
                          ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                          : 'bg-slate-100 dark:bg-slate-800 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                        {cat.value}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Product Info */}
              <Card className="bg-slate-100 dark:bg-slate-800/50 border-0">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Current Product</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">ID</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">#{product.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Created</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {product.releaseDate
                        ? new Date(product.releaseDate).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(`/product/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
            >
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
