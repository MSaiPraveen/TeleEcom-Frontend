import React, {
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../Context/Context.jsx";

const Navbar = ({ onSelectCategory }) => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [showNoProductsMessage, setShowNoProductsMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const navbarRef = useRef(null);

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || 'https://springteleecom.onrender.com';
  const USE_PROXY = (import.meta.env.VITE_USE_PROXY || 'false') === 'true';

  // 🔹 context
  const { cart, isAuthenticated, isAdmin, user, logout } =
    useContext(AppContext);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Close navbar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsNavCollapsed(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial data fetch (optional)
  const fetchInitialData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/product`);
      console.log(response.data, "navbar initial data");
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleNavbarToggle = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const handleLinkClick = () => {
    setIsNavCollapsed(true);
  };

  const handleInputChange = (value) => {
    setInput(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    setShowNoProductsMessage(false);
    setIsLoading(true);
    setIsNavCollapsed(true);

    try {
      const response = await axios.get(
        `${baseUrl}/product/search?keyword=${input}`
      );

      if (response.data.length === 0) {
        setShowNoProductsMessage(true);
      } else {
        navigate(`/search-results`, {
          state: { searchData: response.data },
        });
      }
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

  const handleLogout = () => {
    logout();
    setIsNavCollapsed(true);
    navigate("/login");
  };

  const goToLogin = () => {
    setIsNavCollapsed(true);
    navigate("/login");
  };

  const goToRegister = () => {
    setIsNavCollapsed(true);
    navigate("/register");
  };

  return (
    <nav
      className="navbar navbar-expand-lg fixed-top bg-white shadow-sm"
      ref={navbarRef}
    >
      <div className="container-fluid">
        <a
          className="navbar-brand fw-bold"
          href="/"
          onClick={handleLinkClick}
        >
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
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={`${isNavCollapsed ? "collapse" : ""} navbar-collapse`}
          id="navbarSupportedContent"
        >
          {/* LEFT: navigation links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a
                className="nav-link active"
                aria-current="page"
                href="/"
                onClick={handleLinkClick}
              >
                Home
              </a>
            </li>

            {/* Categories dropdown */}
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link"
                id="categoriesDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                type="button"
              >
                Categories
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="categoriesDropdown"
              >
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

            {/* My Orders (logged-in users) */}
            {isAuthenticated && (
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="/my-orders"
                  onClick={handleLinkClick}
                >
                  My Orders
                </a>
              </li>
            )}

            {/* Admin links */}
            {isAdmin && (
              <>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/add_product"
                    onClick={handleLinkClick}
                  >
                    Add Product
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/orders"
                    onClick={handleLinkClick}
                  >
                    Orders
                  </a>
                </li>
              </>
            )}
          </ul>

          {/* RIGHT: theme, cart, search, auth */}
          <div className="d-flex align-items-center gap-3">
            {/* Dark mode toggle */}
            <button
              className="btn btn-outline-secondary btn-sm"
              type="button"
              onClick={toggleTheme}
            >
              {theme === "dark-theme" ? "Light Mode" : "Dark Mode"}
            </button>

            {/* Cart link with badge */}
            <a
              href="/cart"
              className="nav-link text-dark position-relative"
              onClick={handleLinkClick}
            >
              <i className="bi bi-cart me-1" />
              Cart
              {cart && cart.length > 0 && (
                <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                  {cart.length}
                </span>
              )}
            </a>

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
                  />
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

            {/* Auth buttons / user info */}
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2 ms-2">
                <span className="text-muted small">
                  Hi, <strong>{user}</strong>
                </span>
                <button
                  className="btn btn-outline-danger btn-sm"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  type="button"
                  onClick={goToLogin}
                >
                  Login
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  type="button"
                  onClick={goToRegister}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
