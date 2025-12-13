import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../Context/Context";
import api from "../axios.jsx";
import unplugged from "../assets/unplugged.png";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(AppContext);

  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state && location.state.searchData) {
      setSearchData(location.state.searchData);
      setLoading(false);
    } else {
      // no search data → go home
      navigate("/");
    }
  }, [location, navigate]);

  const convertBase64ToDataURL = (base64String, mimeType = "image/jpeg") => {
    if (!base64String) return unplugged;

    if (base64String.startsWith("data:")) return base64String;
    if (base64String.startsWith("http")) return base64String;

    return `data:${mimeType};base64,${base64String}`;
  };

  // ProductCard component with image fetching
  const ProductCard = ({ product }) => {
    const [imageUrl, setImageUrl] = useState(unplugged);
    
    useEffect(() => {
      const fetchImage = async () => {
        if (product.imageData) {
          setImageUrl(convertBase64ToDataURL(product.imageData));
        } else {
          try {
            const response = await api.get(`/product/${product.id}/image`, {
              responseType: 'blob'
            });
            if (response.data && response.data.size > 0) {
              const url = URL.createObjectURL(response.data);
              setImageUrl(url);
            }
          } catch (error) {
            console.log("Could not load image for product:", product.id);
            setImageUrl(unplugged);
          }
        }
      };
      fetchImage();
      
      return () => {
        if (imageUrl && imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(imageUrl);
        }
      };
    }, [product.id, product.imageData]);
    
    return (
      <div className="col">
        <div className="card h-100 shadow-sm">
          <img
            src={imageUrl}
            className="card-img-top p-3"
            alt={product.name}
            style={{
              height: "200px",
              objectFit: "contain",
              cursor: "pointer",
            }}
            onClick={() => handleViewProduct(product.id)}
            onError={(e) => {
              e.target.src = unplugged;
            }}
          />
          <div className="card-body d-flex flex-column">
            <h5 className="card-title">{product.name}</h5>
            <p className="card-text text-muted mb-1">
              {product.brand}
            </p>
            <div className="mb-2">
              <span className="badge bg-secondary">
                {product.category}
              </span>
            </div>
            <p className="card-text small">
              {product.description && product.description.length > 100
                ? product.description.substring(0, 100) + "..."
                : product.description}
            </p>
            <h5 className="card-text text-primary mt-auto mb-3">
              $
              {Number(product.price).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </h5>
            <div className="d-flex justify-content-between mt-auto">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleViewProduct(product.id)}
              >
                View Details
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleAddToCart(product)}
                disabled={
                  !product.productAvailable ||
                  product.stockQuantity <= 0
                }
              >
                {product.productAvailable &&
                product.stockQuantity > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div
        className="container mt-5 pt-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <h2 className="mb-4">Search Results</h2>

      {searchData.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle-fill me-2"></i>
          No products found matching your search criteria.
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">
            {searchData.length} product(s) found
          </p>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {searchData.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;
