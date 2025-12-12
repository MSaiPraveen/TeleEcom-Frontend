import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../axios.jsx";
import { AppContext } from "../Context/Context";

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, isAdmin } = useContext(AppContext);

  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      // No id in URL → redirect home
      navigate("/");
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
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    const fetchImage = async () => {
      try {
        const res = await api.get(`/product/${id}/image`, {
          responseType: "blob",
        });
        setImageUrl(URL.createObjectURL(res.data));
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const deleteProduct = async () => {
    try {
      await api.delete(`/product/${id}`);
      removeFromCart(Number(id)); // ensure same type as cart item ids
      toast.success("Product deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success("Product added to cart");
  };

  if (loading || !product) {
    return (
      <div className="container mt-5 pt-5">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <div className="row">
        {/* Product Image */}
        <div className="col-md-6 mb-4">
          <div className="card border-0">
            <img
              src={imageUrl}
              alt={product.name}
              className="card-img-top img-fluid"
              style={{ maxHeight: "500px", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="badge bg-secondary">{product.category}</span>
            <small className="text-muted">
              Listed:{" "}
              {product.releaseDate
                ? new Date(product.releaseDate).toLocaleDateString()
                : "N/A"}
            </small>
          </div>

          <h2 className="text-capitalize mb-1">{product.name}</h2>
          <p className="text-muted fst-italic mb-4">~ {product.brand}</p>

          <div className="mb-4">
            <h5 className="mb-2">Product Description:</h5>
            <p>{product.description}</p>
          </div>

          <h3 className="fw-bold mb-3">$ {product.price}</h3>

          <div className="d-grid gap-2 mb-3">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={!product.productAvailable || product.stockQuantity === 0}
            >
              {product.stockQuantity !== 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          <p className="mb-4">
            <span className="me-2">Stock Available:</span>
            <span className="fw-bold text-success">
              {product.stockQuantity}
            </span>
          </p>

          {/* Only show update/delete for admin */}
          {isAdmin && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={handleEditClick}
              >
                <i className="bi bi-pencil me-1"></i>
                Update
              </button>

              <button
                className="btn btn-outline-danger"
                type="button"
                onClick={deleteProduct}
              >
                <i className="bi bi-trash me-1"></i>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
