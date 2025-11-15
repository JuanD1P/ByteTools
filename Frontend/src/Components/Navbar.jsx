import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../ImagenesP/ImagenesLogin/LogoPeque.png";
import "./DOCSS/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const readAuth = useCallback(
    () => ({
      isLogged: !!localStorage.getItem("auth-token"),
      role: localStorage.getItem("user-role") || null,
    }),
    []
  );

  const [{ isLogged, role }, setAuth] = useState(readAuth);

  useEffect(() => {
    const onChange = () => setAuth(readAuth());

    window.addEventListener("auth-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("auth-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [readAuth]);

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-role");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/userlogin");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="MiAgro Logo" className="navbar-logo" />
        {isLogged && (
          <h1 className="navbar-title">
            {role === "ADMIN" ? "Panel de Admin" : "Panel de Usuario"}
          </h1>
        )}
      </div>

      <div className="navbar-right">
        {!isLogged ? (
          <>
            <button
              onClick={() => navigate("/userlogin")}
              className="navbar-btn navbar-btnPrimary"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate("/registro")}
              className="navbar-btn navbar-btnSecondary"
            >
              Registrarse
            </button>
          </>
        ) : (
          <>
          {role === "USER" && (
              <button
                onClick={() => navigate("/Inicio")}
                className="navbar-btn navbar-btnHome"
              >
                Inicio
              </button>
              
            )}
            {role === "USER" && (
              <button
                onClick={() => navigate("/modulos/velocidades")}
                className="navbar-btn navbar-btnHome"
              >
                V. de transmision.
              </button>

              
              
            )}
            {role === "USER" && (
              <button
                onClick={() => navigate("/modulos/wifi")}
                className="navbar-btn navbar-btnHome"
              >
                Red Wifi
              </button>
              
            )}

            {role === "USER" && (
              <button
                onClick={() => navigate("/modulos/iot")}
                className="navbar-btn navbar-btnHome"
              >
                IoT
              </button>
              
            )}
            {role === "USER" && (
              <button
                onClick={() => navigate("/modulos/radio")}
                className="navbar-btn navbar-btnHome"
              >
                Radio
              </button>
              
            )}
            

            <button
              onClick={handleLogout}
              className="navbar-btn navbar-btnLogout"
            >
              Cerrar Sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
