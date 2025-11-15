import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./DOCSS/Radio.css";

function log10(x) {
  return Math.log(x) / Math.LN10;
}

const TOOL_LABELS = {
  fspl: "FSPL: pérdidas en espacio libre",
  fresnel: "Zona de Fresnel",
  fm: "Parámetros FM",
  am: "Parámetros AM"
};

export default function Radio() {
  const [activeTool, setActiveTool] = useState("fspl");

  const [fsplDistanceKm, setFsplDistanceKm] = useState(10);
  const [fsplFreqMHz, setFsplFreqMHz] = useState(2400);

  const fsplResult = useMemo(() => {
    const d = Number(fsplDistanceKm);
    const f = Number(fsplFreqMHz);
    if (!d || !f || d <= 0 || f <= 0) return null;
    const loss = 32.44 + 20 * log10(d) + 20 * log10(f);
    return loss;
  }, [fsplDistanceKm, fsplFreqMHz]);

  const [fresnelTotalKm, setFresnelTotalKm] = useState(10);
  const [fresnelD1Km, setFresnelD1Km] = useState(5);
  const [fresnelFreqGHz, setFresnelFreqGHz] = useState(2.4);

  const fresnelResult = useMemo(() => {
    const dTotal = Number(fresnelTotalKm);
    const d1 = Number(fresnelD1Km);
    const fGHz = Number(fresnelFreqGHz);
    if (!dTotal || !d1 || !fGHz || dTotal <= 0 || d1 <= 0 || fGHz <= 0) return null;
    if (d1 > dTotal) return null;
    const d2 = dTotal - d1;
    const r = 17.32 * Math.sqrt((d1 * d2) / (fGHz * dTotal));
    const clearance = 0.6 * r;
    return { r, clearance, d2 };
  }, [fresnelTotalKm, fresnelD1Km, fresnelFreqGHz]);

  const [fmFreqMHz, setFmFreqMHz] = useState(100);
  const [fmPowerW, setFmPowerW] = useState(500);
  const [fmGainTx, setFmGainTx] = useState(6);
  const [fmCableLoss, setFmCableLoss] = useState(2);

  const fmResult = useMemo(() => {
    const f = Number(fmFreqMHz);
    const pW = Number(fmPowerW);
    const gTx = Number(fmGainTx);
    const lCable = Number(fmCableLoss);
    if (!f || !pW || f <= 0 || pW <= 0) return null;
    const lambda = 300 / f;
    const pDbw = 10 * log10(pW);
    const pDbm = pDbw + 30;
    const erpDbw = pDbw + gTx - lCable;
    const erpDbm = erpDbw + 30;
    return { lambda, pDbw, pDbm, erpDbw, erpDbm };
  }, [fmFreqMHz, fmPowerW, fmGainTx, fmCableLoss]);

  const [amFreqKHz, setAmFreqKHz] = useState(1000);
  const [amPowerW, setAmPowerW] = useState(1000);

  const amResult = useMemo(() => {
    const fK = Number(amFreqKHz);
    const pW = Number(amPowerW);
    if (!fK || !pW || fK <= 0 || pW <= 0) return null;
    const fMHz = fK / 1000;
    const lambda = 300 / fMHz;
    const pDbw = 10 * log10(pW);
    const pDbm = pDbw + 30;
    return { lambda, pDbw, pDbm };
  }, [amFreqKHz, amPowerW]);

  const rootClass = `radio-root radio-root--${activeTool}`;

  return (
    <main className={rootClass}>
      <div className="radio-bg" aria-hidden />

      <header className="radio-hero">
        <div className="radio-hero-surface">
          <div className="radio-hero-main">
            <div className="radio-hero-text">
              <p className="radio-chip">Módulo de radioenlaces</p>
              <h1 className="radio-title">
                FM/AM, FSPL y <span>zona de Fresnel</span>
              </h1>
              <p className="radio-subtitle">
                Diseña enlaces en radiofrecuencia en una sola vista: pérdidas en
                espacio libre, despeje de la primera zona de Fresnel y parámetros
                esenciales para transmisores FM y AM.
              </p>
              <div className="radio-hero-tags">
                <span>Enlaces punto a punto</span>
                <span>Balance de potencia</span>
                <span>Planificación de cobertura</span>
              </div>
            </div>
            <div className="radio-hero-visual">
              <img
                src="/fresnel.svg"
                alt="Diagrama de radioenlace con antenas y zona de Fresnel"
              />
            </div>
          </div>

          <div className="radio-hero-footer">
            <div className="radio-hero-stats">
              <div className="radio-stat">
                <span className="radio-stat-label">Herramientas</span>
                <span className="radio-stat-value">4</span>
                <span className="radio-stat-foot">
                  FSPL, Fresnel, FM y AM integradas en un solo módulo.
                </span>
              </div>
              <div className="radio-stat">
                <span className="radio-stat-label">Herramienta activa</span>
                <span className="radio-stat-value">
                  {TOOL_LABELS[activeTool]}
                </span>
                <span className="radio-stat-foot">
                  Cambia de pestaña para explorar otros escenarios de enlace.
                </span>
              </div>
            </div>

            <nav
              className="radio-tabs"
              role="tablist"
              aria-label="Herramientas de radio"
            >
              <button
                className={`radio-tab ${activeTool === "fspl" ? "is-active" : ""}`}
                onClick={() => setActiveTool("fspl")}
                role="tab"
                aria-selected={activeTool === "fspl"}
              >
                FSPL
                <span className="radio-tab-sub">Free Space Path Loss</span>
              </button>
              <button
                className={`radio-tab ${
                  activeTool === "fresnel" ? "is-active" : ""
                }`}
                onClick={() => setActiveTool("fresnel")}
                role="tab"
                aria-selected={activeTool === "fresnel"}
              >
                Zona de Fresnel
                <span className="radio-tab-sub">1.ª zona y despeje</span>
              </button>
              <button
                className={`radio-tab ${activeTool === "fm" ? "is-active" : ""}`}
                onClick={() => setActiveTool("fm")}
                role="tab"
                aria-selected={activeTool === "fm"}
              >
                FM
                <span className="radio-tab-sub">ERP y λ</span>
              </button>
              <button
                className={`radio-tab ${activeTool === "am" ? "is-active" : ""}`}
                onClick={() => setActiveTool("am")}
                role="tab"
                aria-selected={activeTool === "am"}
              >
                AM
                <span className="radio-tab-sub">Potencia y λ</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <section className="radio-shell">
        <div className="radio-main">
          {activeTool === "fspl" && (
            <section className="radio-panel">
              <header className="radio-panel-header">
                <div>
                  <p className="radio-panel-kicker">FSPL · Enlace en espacio libre</p>
                  <h2>¿Cuánta señal se pierde solo por propagación?</h2>
                  <p>
                    Calcula la atenuación teórica de tu enlace asumiendo línea de
                    vista perfecta. Es la base para el balance de potencia.
                  </p>
                </div>
                <div className="radio-panel-pill">
                  <span>Escenario típico</span>
                  <strong>Enlaces microondas / Wi-Fi outdoor</strong>
                </div>
              </header>

              <div className="radio-panel-body">
                <div className="radio-grid">
                  <label className="radio-field">
                    <span>Distancia del enlace</span>
                    <div className="radio-input">
                      <input
                        type="number"
                        value={fsplDistanceKm}
                        onChange={(e) => setFsplDistanceKm(e.target.value)}
                        min="0"
                        step="0.1"
                      />
                      <span className="radio-input-unit">km</span>
                    </div>
                  </label>

                  <label className="radio-field">
                    <span>Frecuencia</span>
                    <div className="radio-input">
                      <input
                        type="number"
                        value={fsplFreqMHz}
                        onChange={(e) => setFsplFreqMHz(e.target.value)}
                        min="1"
                        step="1"
                      />
                      <span className="radio-input-unit">MHz</span>
                    </div>
                  </label>
                </div>

                <div className="radio-output">
                  <div className="radio-output-main">
                    <span className="radio-output-label">
                      Pérdidas en espacio libre
                    </span>
                    <span className="radio-output-value">
                      {fsplResult !== null ? fsplResult.toFixed(2) : "—"}
                      {fsplResult !== null && (
                        <span className="radio-output-unit"> dB</span>
                      )}
                    </span>
                  </div>
                  <p className="radio-output-note">
                    FSPL(dB) = 32.44 + 20·log₁₀(d [km]) + 20·log₁₀(f [MHz])
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeTool === "fresnel" && (
            <section className="radio-panel">
              <header className="radio-panel-header">
                <div>
                  <p className="radio-panel-kicker">Zona de Fresnel · Despeje</p>
                  <h2>Comprueba el despeje de la primera zona de Fresnel</h2>
                  <p>
                    Evalúa el radio máximo de la 1.ª zona de Fresnel y el despeje
                    recomendado del 60&nbsp;% para evitar pérdidas adicionales por
                    difracción.
                  </p>
                </div>
                <div className="radio-panel-pill">
                  <span>Regla práctica</span>
                  <strong>Despejar al menos el 60&nbsp;% de F₁</strong>
                </div>
              </header>

              <div className="radio-panel-body">
                <div className="radio-grid">
                  <label className="radio-field">
                    <span>Distancia total del enlace</span>
                    <div className="radio-input">
                      <input
                        type="number"
                        value={fresnelTotalKm}
                        onChange={(e) => setFresnelTotalKm(e.target.value)}
                        min="0"
                        step="0.1"
                      />
                      <span className="radio-input-unit">km</span>
                    </div>
                  </label>

                  <label className="radio-field">
                    <span>Distancia Tx → punto de análisis</span>
                    <div className="radio-input">
                      <input
                        type="number"
                        value={fresnelD1Km}
                        onChange={(e) => setFresnelD1Km(e.target.value)}
                        min="0"
                        step="0.1"
                      />
                      <span className="radio-input-unit">km</span>
                    </div>
                  </label>

                  <label className="radio-field">
                    <span>Frecuencia</span>
                    <div className="radio-input">
                      <input
                        type="number"
                        value={fresnelFreqGHz}
                        onChange={(e) => setFresnelFreqGHz(e.target.value)}
                        min="0.1"
                        step="0.1"
                      />
                      <span className="radio-input-unit">GHz</span>
                    </div>
                  </label>
                </div>

                <div className="radio-output-grid">
                  <div className="radio-output">
                    <div className="radio-output-main">
                      <span className="radio-output-label">
                        Radio F₁ en el punto
                      </span>
                      <span className="radio-output-value">
                        {fresnelResult ? fresnelResult.r.toFixed(2) : "—"}
                        {fresnelResult && (
                          <span className="radio-output-unit"> m</span>
                        )}
                      </span>
                    </div>
                    <p className="radio-output-note">
                      F₁(m) ≈ 17.32·√(d₁·d₂ / (f[GHz]·dₜ))
                    </p>
                  </div>

                  <div className="radio-output">
                    <div className="radio-output-main">
                      <span className="radio-output-label">
                        Despeje mínimo sugerido (60&nbsp;%)
                      </span>
                      <span className="radio-output-value">
                        {fresnelResult ? fresnelResult.clearance.toFixed(2) : "—"}
                        {fresnelResult && (
                          <span className="radio-output-unit"> m</span>
                        )}
                      </span>
                    </div>
                    <p className="radio-output-note">
                      Obstáculos por debajo de este valor afectan poco al enlace.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTool === "fm" && (
            <section className="radio-panel">
              <header className="radio-panel-header">
                <div>
                  <p className="radio-panel-kicker">FM · Radiodifusión</p>
                  <h2>Longitud de onda y ERP de un transmisor FM</h2>
                  <p>
                    Calcula longitud de onda y potencia radiada efectiva para una
                    estación FM. Útil para dimensionar cobertura y comparar
                    escenarios.
                  </p>
                </div>
                <div className="radio-panel-pill">
                  <span>Banda comercial</span>
                  <strong>88–108 MHz</strong>
                </div>
              </header>

              <div className="radio-panel-body">
                <div className="radio-grid">
                  <label className="radio-field">
                    <span>Frecuencia portadora</span>
                    <div className="radio-input">
                      <input
                        type="number"
                        value={fmFreqMHz}
                        onChange={(e) => setFmFreqMHz(e.target.value)}
                        min="1"
                        step="0.1"
                      />
                      <span className="radio-input-unit">MHz</span>
                    </div>
                  </label>

                  <label className="radio-field">
                    <span>Potencia de transmisión</span>
                    <div className="radio-input">
                      <input
                        type="number"
                        value={fmPowerW}
                        onChange={(e) => setFmPowerW(e.target.value)}
                        min="0.1"
                        step="0.1"
                      />
                      <span className="radio-input-unit">W</span>
                    </div>
                  </label>

                  <label className="radio-field">
                    <span>Ganancia antena Tx</span>
                    <div className="radio-input">
                      <input
                        type="number"
                        value={fmGainTx}
                        onChange={(e) => setFmGainTx(e.target.value)}
                        step="0.1"
                      />
                      <span className="radio-input-unit">dBi</span>
                    </div>
                  </label>

                  <label className="radio-field">
                    <span>Pérdidas en feeder/cables</span>
                    <div className="radio-input">
                      <input
                        type="number"
                        value={fmCableLoss}
                        onChange={(e) => setFmCableLoss(e.target.value)}
                        step="0.1"
                      />
                      <span className="radio-input-unit">dB</span>
                    </div>
                  </label>
                </div>

                <div className="radio-output-grid">
                  <div className="radio-output">
                    <div className="radio-output-main">
                      <span className="radio-output-label">Longitud de onda</span>
                      <span className="radio-output-value">
                        {fmResult ? fmResult.lambda.toFixed(2) : "—"}
                        {fmResult && (
                          <span className="radio-output-unit"> m</span>
                        )}
                      </span>
                    </div>
                    <p className="radio-output-note">
                      λ = 300 / f[MHz]
                    </p>
                  </div>

                  <div className="radio-output">
                    <div className="radio-output-main">
                      <span className="radio-output-label">Potencia Tx</span>
                      <span className="radio-output-value">
                        {fmResult ? fmResult.pDbw.toFixed(2) : "—"}
                        {fmResult && (
                          <span className="radio-output-unit">
                            {" "}
                            dBW · {fmResult.pDbm.toFixed(2)} dBm
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="radio-output-note">
                      P(dBW) = 10·log₁₀(P[W])
                    </p>
                  </div>

                  <div className="radio-output">
                    <div className="radio-output-main">
                      <span className="radio-output-label">ERP</span>
                      <span className="radio-output-value">
                        {fmResult ? fmResult.erpDbw.toFixed(2) : "—"}
                        {fmResult && (
                          <span className="radio-output-unit">
                            {" "}
                            dBW · {fmResult.erpDbm.toFixed(2)} dBm
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="radio-output-note">
                      ERP(dBW) = Pₜ(dBW) + Gₜ(dBi) − Lcables(dB)
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTool === "am" && (
            <section className="radio-panel">
              <header className="radio-panel-header">
                <div>
                  <p className="radio-panel-kicker">AM · Onda media</p>
                  <h2>Potencia y longitud de onda en AM</h2>
                  <p>
                    Calcula la longitud de onda y la potencia en dB de un
                    transmisor AM típico en banda de onda media.
                  </p>
                </div>
                <div className="radio-panel-pill">
                  <span>Banda típica</span>
                  <strong>530–1700 kHz</strong>
                </div>
              </header>

              <div className="radio-panel-body">
                <div className="radio-grid">
                  <label className="radio-field">
                    <span>Frecuencia portadora</span>
                    <div className="radio-input">
                      <input
                        type="number"
                        value={amFreqKHz}
                        onChange={(e) => setAmFreqKHz(e.target.value)}
                        min="1"
                        step="1"
                      />
                      <span className="radio-input-unit">kHz</span>
                    </div>
                  </label>

                  <label className="radio-field">
                    <span>Potencia de transmisión</span>
                    <div className="radio-input">
                      <input
                        type="number"
                        value={amPowerW}
                        onChange={(e) => setAmPowerW(e.target.value)}
                        min="0.1"
                        step="0.1"
                      />
                      <span className="radio-input-unit">W</span>
                    </div>
                  </label>
                </div>

                <div className="radio-output-grid">
                  <div className="radio-output">
                    <div className="radio-output-main">
                      <span className="radio-output-label">Longitud de onda</span>
                      <span className="radio-output-value">
                        {amResult ? amResult.lambda.toFixed(1) : "—"}
                        {amResult && (
                          <span className="radio-output-unit"> m</span>
                        )}
                      </span>
                    </div>
                    <p className="radio-output-note">
                      λ = 300 / f[MHz]
                    </p>
                  </div>

                  <div className="radio-output">
                    <div className="radio-output-main">
                      <span className="radio-output-label">Potencia</span>
                      <span className="radio-output-value">
                        {amResult ? amResult.pDbw.toFixed(2) : "—"}
                        {amResult && (
                          <span className="radio-output-unit">
                            {" "}
                            dBW · {amResult.pDbm.toFixed(2)} dBm
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="radio-output-note">
                      P(dBW) = 10·log₁₀(P[W])
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="radio-aside">
          <section className="radio-aside-card">
            <h3>Guía rápida de uso</h3>
            <ul>
              <li>
                Empieza con <strong>FSPL</strong> para saber la atenuación pura
                del espacio libre.
              </li>
              <li>
                Revisa la <strong>zona de Fresnel</strong> en los puntos
                críticos del terreno.
              </li>
              <li>
                Usa <strong>FM</strong> o <strong>AM</strong> para convertir
                potencias a dB y cerrar el balance de enlace.
              </li>
            </ul>
          </section>

          <section className="radio-aside-card">
            <h3>Convenciones rápidas</h3>
            <dl className="radio-defs">
              <div>
                <dt>d, d₁, d₂</dt>
                <dd>Distancias en km.</dd>
              </div>
              <div>
                <dt>f</dt>
                <dd>Frecuencia: MHz, GHz o kHz según el contexto.</dd>
              </div>
              <div>
                <dt>FSPL</dt>
                <dd>Pérdidas en espacio libre en dB.</dd>
              </div>
              <div>
                <dt>ERP</dt>
                <dd>Potencia radiada efectiva del sistema.</dd>
              </div>
            </dl>
          </section>

          <section className="radio-aside-card radio-aside-highlight">
            <h3>Estado del módulo</h3>
            <p className="radio-aside-label">Herramienta seleccionada</p>
            <p className="radio-aside-value">{TOOL_LABELS[activeTool]}</p>
            <p className="radio-aside-foot">
              Cambia parámetros y observa cómo se mueven las potencias en dB.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
