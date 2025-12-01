// src/components/auth/OAuth2Success.jsx
import React, { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/Context.jsx";

const OAuth2Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AppContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const username = params.get("username");
    const isAdmin = params.get("isAdmin") === "true";

    if (token && username) {
      login(token, username, isAdmin);
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [location, login, navigate]);

  return (
    <div className="container mt-5 pt-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Completing login...</span>
      </div>
    </div>
  );
};

export default OAuth2Success;
