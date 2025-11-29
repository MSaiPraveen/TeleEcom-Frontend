import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../axios.jsx";
import { AppContext } from "../Context/Context.jsx";

const Navbar = ({ onSelectCategory }) => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNoProductsMessage, setShowNoProductsMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const navbarRef = useRef(null);
  const navigate = useNavigate();

  // 🔐 Auth / cart from context
  const { user, isAdmin, logout, cart } = useContext(AppContext);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Initial data fetch (optional)
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsNavCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await api.get("/api/product");
      console.log(response.data, "navbar initial data");
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  // Navbar toggle (mobile)
  const handleNavbarToggle = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const handleLinkClick = () => {
    setIsNavCollapsed(true);
  };

  // Search input change
  const handleInputChange = (value) => {
    setInput(value);
  };

  // Search submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (input.trim() === "") return;

    setShowNoProductsMessage(false);
    setIsLoading(true);
    setIsNavCollapsed(true);

    try {
      const response = await api.get("/api/product/search", {
        params: { keyword: input },
      });
      setSearchResults(response.data);

      if (response.data.length === 0) {
        setNoResults(true);
        setShowNoProductsMessage(true);
      } else {
        navigate(`/search-results`, { state: { searchData: response.data } });
      }

      console.log("Search results:", response.data);
    } catch (error) {
      console.error("Error searching:", error);
      setShowNoProductsMessage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);
    setIsNavCollapsed(true);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark-theme" ? "light-theme" : "dark-theme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const categories = [
    "Laptop",
    "Headphone",
    "Mobile",
    "Electronics",
    "Toys",
    "Fashion",
  ];

  return (
    <nav
      className="navbar navbar-expand-lg fixed-top bg-white shadow-sm"
      ref={navbarRef}
    >
      <div className="container-fluid">
        <a className="navbar-brand" href="https://telusko.com/">
          Telusko
        </a>

        <button
          className="navbar-toggler"
          type="button"
          onClick={handleNavbarToggle}
          aria-controls="navbarSupportedContent"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`${isNavCollapsed ? "collapse" : ""} navbar-collapse`}
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className="nav-link active"
                aria-current="page"
                to="/"
                onClick={handleLinkClick}
              >
                Home
              </Link>
            </li>

            {/* Category dropdown (if you want to use it) */}
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link"
                id="categoryDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                type="button"
              >
                Categories
              </button>
              <ul className="dropdown-menu" aria-labelledby="categoryDropdown">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </li>

            {/* Admin-only links */}
            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/add_product"
                    onClick={handleLinkClick}
                  >
                    Add Product
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/orders"
                    onClick={handleLinkClick}
                  >
                    Orders
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Theme toggle */}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={toggleTheme}
            >
              {theme === "dark-theme" ? "Light Mode" : "Dark Mode"}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="nav-link text-dark me-3 position-relative"
              onClick={handleLinkClick}
            >
              <i className="bi bi-cart me-1"></i>
              Cart
              {cartCount > 0 && (
                <span className="badge bg-danger ms-1">{cartCount}</span>
              )}
            </Link>

            {/* Search */}
            <form
              className="d-flex"
              role="search"
              onSubmit={handleSubmit}
              id="searchForm"
            >
              <input
                className="form-control me-2"
                type="search"
                placeholder="Type to search"
                aria-label="Search"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              {isLoading ? (
                <button
                  className="btn btn-outline-success"
                  type="button"
                  disabled
                >
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">Loading...</span>
                </button>
              ) : (
                <button className="btn btn-outline-success" type="submit">
                  Search
                </button>
              )}
            </form>

            {showNoProductsMessage && (
              <div
                className="alert alert-warning position-absolute mt-2"
                style={{ top: "100%", zIndex: 1000 }}
              >
                No products found matching your search.
              </div>
            )}

            {/* Auth section */}
            {user ? (
              <div className="d-flex align-items-center ms-3">
                <span className="me-2">Hi, {user}</span>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    logout();
                    handleLinkClick();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center ms-3">
                <Link
                  to="/login"
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={handleLinkClick}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                  onClick={handleLinkClick}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
