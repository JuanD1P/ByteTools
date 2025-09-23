import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./DOCSS/Inicio.css";

const ALL_MODULES = [
  {
    id: "velocidades",
    title: "Velocidades de transmisión",
    desc:
      "Convierte entre W ↔ dBW/dBm, calcula tiempos de transferencia y analiza tasas de bits.",
    img: "/material-de-oficina.png",
    path: "/modulos/velocidades",
    category: "Cálculo",
    accentFrom: "#6AA7FF",
    accentTo: "#2E5AA7",
    features: ["Conversores", "Tiempo de envío", "Tasa de bits"]
  },
  {
    id: "wifi",
    title: "Dimensionamiento Wi-Fi",
    desc:
      "Calcula usuarios por AP, ajusta bitrate y estima la cantidad de APs necesarios.",
    img: "/wifi-movil.png",
    path: "/modulos/wifi",
    category: "Redes",
    accentFrom: "#7EE3C2",
    accentTo: "#19A27C",
    features: ["UBH/Capacidad", "Bitrate efectivo", "Cantidad de APs"]
  }
];

export default function Inicio() {
  const [userName, setUserName] = useState("Usuario");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("Todos");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      let name = u.displayName || (u.email ? u.email.split("@")[0] : "Usuario");
      try {
        const snap = await getDoc(doc(db, "usuarios", u.uid));
        if (snap.exists() && snap.data()?.nombre) name = snap.data().nombre;
      } catch (e) {
        console.error("Error leyendo usuario:", e);
      }
      setUserName(name);
    });
    return () => unsub();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(["Todos"]);
    ALL_MODULES.forEach((m) => set.add(m.category));
    return Array.from(set);
  }, []);

  const visibleModules = useMemo(() => {
    const text = q.trim().toLowerCase();
    return ALL_MODULES.filter((m) => {
      const okCat = category === "Todos" || m.category === category;
      const okText =
        !text ||
        m.title.toLowerCase().includes(text) ||
        m.desc.toLowerCase().includes(text) ||
        (m.features || []).some((f) => f.toLowerCase().includes(text));
      return okCat && okText;
    });
  }, [q, category]);

  return (
    <main className="bt-hub-root" role="main">
      <div className="bt-hub-backdrop" aria-hidden />

      <header className="bt-hub-hero">
        <h1 className="bt-hub-hero-title">
          Hola, {userName} <span className="bt-hub-hand">👋</span>
        </h1>
        <p className="bt-hub-hero-sub">
          Explora los módulos de comunicación de datos y pon en práctica lo aprendido.
        </p>

        <div className="bt-hub-toolbar">
          <div className="bt-hub-search">
            <input
              type="text"
              className="bt-hub-input"
              placeholder="Buscar módulo (ej. Wi-Fi, conversores, APs...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar módulos"
            />
          </div>

          <div className="bt-hub-filters" role="radiogroup" aria-label="Filtrar por categoría">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`bt-hub-filter ${category === cat ? "is-active" : ""}`}
                onClick={() => setCategory(cat)}
                role="radio"
                aria-checked={category === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="bt-hub-grid" aria-live="polite">
        {visibleModules.map((m) => (
          <article
            key={m.id}
            className="bt-hub-card"
            style={{ ["--accent-from"]: m.accentFrom, ["--accent-to"]: m.accentTo }}
          >
            <div className="bt-hub-media">
              <img src={m.img} alt={m.title} className="bt-hub-img" loading="lazy" />
            </div>

            <div className="bt-hub-body">
              <span className="bt-hub-kicker">{m.category}</span>
              <h2 className="bt-hub-title">{m.title}</h2>
              <p className="bt-hub-desc">{m.desc}</p>

              {m.features?.length ? (
                <ul className="bt-hub-chips">
                  {m.features.map((f, i) => (
                    <li key={i} className="bt-hub-chip">
                      {f}
                    </li>
                  ))}
                </ul>
              ) : null}

              <Link to={m.path} className="bt-hub-cta" aria-label={`Usar ${m.title}`}>
                Usar este módulo <span className="bt-hub-cta-arrow" aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}

        {visibleModules.length === 0 && (
          <div className="bt-hub-empty">No hay módulos que coincidan con tu búsqueda.</div>
        )}
      </section>
    </main>
  );
}
