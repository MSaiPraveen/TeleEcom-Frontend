import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../Context/Context"; // ⬅️ named import
import api from "../axios.jsx";
import unplugged from "../assets/unplugged.png";

const Home = ({ selectedCategory }) => {
  const { products, productsLoading, addToCart } = useContext(AppContext);
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);

  useEffect(() => {
    console.log(products, "products from home page");
  }, [products]);

  useEffect(() => {
    let toastTimer;
    if (showToast) {
      toastTimer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(toastTimer);
  }, [showToast]);

  // Convert base64 string to data URL (kept from your code)
  const convertBase64ToDataURL = (base64String, mimeType = "image/jpeg") => {
    if (!base64String) return unplugged;

    if (base64String.startsWith("data:")) {
      return base64String;
    }

    if (base64String.startsWith("http")) {
      return base64String;
    }

    return `data:${mimeType};base64,${base64String}`;
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product);
    setToastProduct(product);
    setShowToast(true);
  };

  const filteredProducts = selectedCategory
    ? (products || []).filter((product) => product.category === selectedCategory)
    : (products || []);

  if (productsLoading) {
    return (
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border" role="status"></div>
          <h5 className="mt-3">Loading products...</h5>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      <div
        className="position-fixed top-0 end-0 p-3"
        style={{ zIndex: 1050 }}
      >
        <div
          className={`toast ${showToast ? "show" : "hide"}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="toast-header bg-success text-white">
            <strong className="me-auto">Added to Cart</strong>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setShowToast(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="toast-body">
            {toastProduct && (
              <div className="d-flex align-items-center">
                <img
                  src={convertBase64ToDataURL(toastProduct.imageData)}
                  alt={toastProduct.name}
                  className="me-2 rounded"
                  width="40"
                  height="40"
                  onError={(e) => {
                    e.target.src = unplugged;
                  }}
                />
                <div>
                  <div className="fw-bold">{toastProduct.name}</div>
                  <small>Successfully added to your cart!</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mt-5 pt-5">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {!filteredProducts || filteredProducts.length === 0 ? (
            <div className="col-12 text-center my-5">
              <h4>No Products Available</h4>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
                convertBase64ToDataURL={convertBase64ToDataURL}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

// Separate ProductCard component with image fetching
const ProductCard = ({ product, onAddToCart, convertBase64ToDataURL }) => {
  const { id, brand, name, price, productAvailable, imageData, imageName, stockQuantity } = product;
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (imageData) {
      setImageUrl(convertBase64ToDataURL(imageData));
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
  }, [id, imageData, imageName, convertBase64ToDataURL]);

  return (
    <div className="col">
      <div className={`card h-100 shadow-sm ${!productAvailable ? "bg-light" : ""}`}>
        <Link to={`/product/${id}`} className="text-decoration-none text-dark">
          <img
            src={imageUrl || unplugged}
            alt={name}
            className="card-img-top p-2"
            style={{ height: "150px", objectFit: "cover" }}
            onError={(e) => { e.target.src = unplugged; }}
          />
          <div className="card-body d-flex flex-column">
            <h5 className="card-title">{name.toUpperCase()}</h5>
            <p className="card-text text-muted fst-italic">~ {brand}</p>
            <hr />
            <div className="mt-auto">
              <h5 className="mb-2 fw-bold">
                <i className="bi bi-currency-dollar"></i>
                {price}
              </h5>
              <button
                className="btn btn-primary w-100"
                onClick={(e) => onAddToCart(e, product)}
                disabled={!productAvailable || stockQuantity === 0}
              >
                {stockQuantity !== 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;
