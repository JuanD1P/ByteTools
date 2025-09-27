import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import heroImg from "/Home.png";
import "./DOCSS/Home.css";

export default function Home(){
  useEffect(() => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-role");
    window.dispatchEvent(new Event("auth-changed"));
  }, []);

  return (
    <div className="cdhx">
      <div className="cdhx-blob cdhx-blob-a" />
      <div className="cdhx-blob cdhx-blob-b" />
      <section className="cdhx-hero cdhx-wrap">
        <div>
          <span className="cdhx-pill">Comunicación de Datos</span>
          <h1 className="cdhx-title">
            Aprende comunicación de datos <b>con módulos prácticos</b>
          </h1>
          <p className="cdhx-sub">
            Domina cada tema a tu ritmo: calculadoras, visualizaciones y guías paso a paso para llevar la teoría a la práctica.
          </p>
          <div className="cdhx-cta">
            <Link to="/Inicio" className="cdhx-btn cdhx-btn-main">Ver módulos</Link>
            <Link to="/Inicio" className="cdhx-btn cdhx-btn-ghost">Ver progreso</Link>
          </div>
          <ul className="cdhx-bullets">
            <li>⚡ Velocidades de transmisión</li>
            <li>📶 Dimensionamiento Wi-Fi</li>
            <li>🧩 Más temas en camino</li>
          </ul>
        </div>
        <div className="cdhx-visual">
          <div className="cdhx-visual-glow" />
          <img src={heroImg} alt="Robot asistente" className="cdhx-robot" />
        </div>
      </section>
      <div className="cdhx-bottom-cover" aria-hidden />
    </div>
  );
}
