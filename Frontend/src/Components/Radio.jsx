import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./DOCSS/Radio.css";

function log10(x) {
  return Math.log(x) / Math.LN10;
}

export default function Radio() {
  const [activeTool, setActiveTool] = useState("fspl");

  const [fsplDistanceKm, setFsplDistanceKm] = useState(10);
  const [fsplFreqMHz, setFsplFreqMHz] = useState(2400);

  const fsplResult = useMemo(() => {
    const d = Number(fsplDistanceKm);
    const f = Number(fsplFreqMHz);
    if (!d || !f || d <= 0 || f <= 0) return null;
    const loss =
      32.44 + 20 * log10(d) + 20 * log10(f);
    return loss;
  }, [fsplDistanceKm, fsplFreqMHz]);

  const [fresnelTotalKm, setFresnelTotalKm] = useState(10);
  const [fresnelD1Km, setFresnelD1Km] = useState(5);
  const [fresnelFreqGHz, setFresnelFreqGHz] = useState(2.4);

  const fresnelResult = useMemo(() => {
    const dTotal = Number(fresnelTotalKm);
    const d1 = Number(fresnelD1Km);
    const fGHz = Number(fresnelFreqGHz);
    if (!dTotal || !d1 || !fGHz || dTotal <= 0 || d1 <= 0 || fGHz <= 0) {
      return null;
    }
    if (d1 > dTotal) return null;
    const d2 = dTotal - d1;
    const r = 17.32 * Math.sqrt((d1 * d2) / (fGHz * dTotal));
    return { r, d2 };
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
    const erpDbw = pDbw + gTx - lCable;
    const erpDbm = erpDbw + 30;

    return { lambda, pDbw, erpDbw, erpDbm };
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

  return (
    <main className="radio-root">
      <div className="radio-root-backdrop" aria-hidden />

      <header className="radio-header">
        <div className="radio-header-top">
          <div>
            <Link to="/inicio" className="radio-breadcrumb">
              ← Volver al panel
            </Link>
            <p className="radio-pill">Módulo de radioenlaces</p>
            <h1 className="radio-title">
              FM/AM, FSPL y zona de Fresnel
            </h1>
            <p className="radio-sub">
              Diseña enlaces básicos en radiofrecuencia: calcula pérdidas en
              espacio libre, revisa la primera zona de Fresnel y obtén parámetros
              clave para transmisores FM y AM.
            </p>
          </div>

          <div className="radio-summary">
            <div className="radio-summary-item">
              <span className="radio-summary-label">
                Rangos típicos
              </span>
              <span className="radio-summary-value">
                30 MHz – 3 GHz
              </span>
              <span className="radio-summary-help">
                UHF / microondas para enlaces punto a punto.
              </span>
            </div>
            <div className="radio-summary-item">
              <span className="radio-summary-label">
                Frecuencias FM
              </span>
              <span className="radio-summary-value">
                88 – 108 MHz
              </span>
              <span className="radio-summary-help">
                Radiodifusión en banda comercial.
              </span>
            </div>
            <div className="radio-summary-item">
              <span className="radio-summary-label">
                Frecuencias AM
              </span>
              <span className="radio-summary-value">
                530 – 1700 kHz
              </span>
              <span className="radio-summary-help">
                Onda media, propagación por superficie.
              </span>
            </div>
          </div>
        </div>

        <nav
          className="radio-tabs"
          role="tablist"
          aria-label="Herramientas de radio"
        >
          <button
            className={`radio-tab ${
              activeTool === "fspl" ? "is-active" : ""
            }`}
            onClick={() => setActiveTool("fspl")}
            role="tab"
            aria-selected={activeTool === "fspl"}
          >
            FSPL (Free Space Path Loss)
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
          </button>
          <button
            className={`radio-tab ${
              activeTool === "fm" ? "is-active" : ""
            }`}
            onClick={() => setActiveTool("fm")}
            role="tab"
            aria-selected={activeTool === "fm"}
          >
            Parámetros FM
          </button>
          <button
            className={`radio-tab ${
              activeTool === "am" ? "is-active" : ""
            }`}
            onClick={() => setActiveTool("am")}
            role="tab"
            aria-selected={activeTool === "am"}
          >
            Parámetros AM
          </button>
        </nav>
      </header>

      <section className="radio-layout">
        <div className="radio-main">
          {activeTool === "fspl" && (
            <section className="radio-card">
              <header className="radio-card-header">
                <h2>FSPL – pérdidas en espacio libre</h2>
                <p>
                  Calcula la atenuación teórica del enlace suponiendo línea de
                  vista perfecta y sin obstáculos.
                </p>
              </header>
              <div className="radio-card-body">
                <div className="radio-form-grid">
                  <label className="radio-field">
                    <span>Distancia del enlace</span>
                    <div className="radio-input-wrap">
                      <input
                        type="number"
                        value={fsplDistanceKm}
                        onChange={(e) =>
                          setFsplDistanceKm(e.target.value)
                        }
                        min="0"
                        step="0.1"
                      />
                      <span className="radio-input-suffix">km</span>
                    </div>
                  </label>
                  <label className="radio-field">
                    <span>Frecuencia</span>
                    <div className="radio-input-wrap">
                      <input
                        type="number"
                        value={fsplFreqMHz}
                        onChange={(e) =>
                          setFsplFreqMHz(e.target.value)
                        }
                        min="1"
                        step="1"
                      />
                      <span className="radio-input-suffix">MHz</span>
                    </div>
                  </label>
                </div>

                <div className="radio-results">
                  <div className="radio-result-main">
                    <span className="radio-result-label">
                      Pérdidas en espacio libre
                    </span>
                    <span className="radio-result-value">
                      {fsplResult !== null
                        ? `${fsplResult.toFixed(2)} dB`
                        : "—"}
                    </span>
                  </div>
                  <p className="radio-result-note">
                    Fórmula: FSPL(dB) = 32.44 + 20·log₁₀(d[km]) +
                    20·log₁₀(f[MHz])
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeTool === "fresnel" && (
            <section className="radio-card">
              <header className="radio-card-header">
                <h2>Primera zona de Fresnel</h2>
                <p>
                  Verifica el radio de la primera zona de Fresnel para
                  asegurar el despeje mínimo del 60&nbsp;% a lo largo del
                  enlace.
                </p>
              </header>
              <div className="radio-card-body">
                <div className="radio-form-grid">
                  <label className="radio-field">
                    <span>Distancia total del enlace</span>
                    <div className="radio-input-wrap">
                      <input
                        type="number"
                        value={fresnelTotalKm}
                        onChange={(e) =>
                          setFresnelTotalKm(e.target.value)
                        }
                        min="0"
                        step="0.1"
                      />
                      <span className="radio-input-suffix">km</span>
                    </div>
                  </label>
                  <label className="radio-field">
                    <span>Distancia Tx → punto de análisis</span>
                    <div className="radio-input-wrap">
                      <input
                        type="number"
                        value={fresnelD1Km}
                        onChange={(e) =>
                          setFresnelD1Km(e.target.value)
                        }
                        min="0"
                        step="0.1"
                      />
                      <span className="radio-input-suffix">km</span>
                    </div>
                  </label>
                  <label className="radio-field">
                    <span>Frecuencia</span>
                    <div className="radio-input-wrap">
                      <input
                        type="number"
                        value={fresnelFreqGHz}
                        onChange={(e) =>
                          setFresnelFreqGHz(e.target.value)
                        }
                        min="0.1"
                        step="0.1"
                      />
                      <span className="radio-input-suffix">GHz</span>
                    </div>
                  </label>
                </div>

                <div className="radio-results">
                  <div className="radio-result-main">
                    <span className="radio-result-label">
                      Radio de la 1.ª zona de Fresnel
                    </span>
                    <span className="radio-result-value">
                      {fresnelResult
                        ? `${fresnelResult.r.toFixed(2)} m`
                        : "—"}
                    </span>
                  </div>
                  <p className="radio-result-note">
                    Fórmula aproximada (n = 1): F₁(m) = 17.32·√(d₁·d₂ /
                    (f[GHz]·dₜ))
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeTool === "fm" && (
            <section className="radio-card">
              <header className="radio-card-header">
                <h2>Parámetros básicos de FM</h2>
                <p>
                  Calcula longitud de onda y potencia radiada efectiva
                  (ERP) de un transmisor FM.
                </p>
              </header>
              <div className="radio-card-body">
                <div className="radio-form-grid">
                  <label className="radio-field">
                    <span>Frecuencia portadora</span>
                    <div className="radio-input-wrap">
                      <input
                        type="number"
                        value={fmFreqMHz}
                        onChange={(e) =>
                          setFmFreqMHz(e.target.value)
                        }
                        min="1"
                        step="0.1"
                      />
                      <span className="radio-input-suffix">MHz</span>
                    </div>
                  </label>
                  <label className="radio-field">
                    <span>Potencia de transmisión</span>
                    <div className="radio-input-wrap">
                      <input
                        type="number"
                        value={fmPowerW}
                        onChange={(e) =>
                          setFmPowerW(e.target.value)
                        }
                        min="0.1"
                        step="0.1"
                      />
                      <span className="radio-input-suffix">W</span>
                    </div>
                  </label>
                  <label className="radio-field">
                    <span>Ganancia antena Tx</span>
                    <div className="radio-input-wrap">
                      <input
                        type="number"
                        value={fmGainTx}
                        onChange={(e) =>
                          setFmGainTx(e.target.value)
                        }
                        step="0.1"
                      />
                      <span className="radio-input-suffix">dBi</span>
                    </div>
                  </label>
                  <label className="radio-field">
                    <span>Pérdidas en feeder/cables</span>
                    <div className="radio-input-wrap">
                      <input
                        type="number"
                        value={fmCableLoss}
                        onChange={(e) =>
                          setFmCableLoss(e.target.value)
                        }
                        step="0.1"
                      />
                      <span className="radio-input-suffix">dB</span>
                    </div>
                  </label>
                </div>

                <div className="radio-results-grid">
                  <div className="radio-result-main">
                    <span className="radio-result-label">
                      Longitud de onda
                    </span>
                    <span className="radio-result-value">
                      {fmResult
                        ? `${fmResult.lambda.toFixed(2)} m`
                        : "—"}
                    </span>
                  </div>
                  <div className="radio-result-main">
                    <span className="radio-result-label">
                      Potencia Tx
                    </span>
                    <span className="radio-result-value">
                      {fmResult
                        ? `${fmResult.pDbw.toFixed(2)} dBW · ${
                            fmResult.pDbw + 30
                          .toFixed
                          ? ""
                          : ""
                          }`
                        : " "}
                    </span>
                  </div>
                  <div className="radio-result-main">
                    <span className="radio-result-label">
                      ERP
                    </span>
                    <span className="radio-result-value">
                      {fmResult
                        ? `${fmResult.erpDbw.toFixed(
                            2
                          )} dBW · ${fmResult.erpDbm.toFixed(
                            2
                          )} dBm`
                        : "—"}
                    </span>
                  </div>
                </div>
                <p className="radio-result-note">
                  ERP(dBW) = Pₜ(dBW) + Gₜ(dBi) − Lcables(dB)
                </p>
              </div>
            </section>
          )}

          {activeTool === "am" && (
            <section className="radio-card">
              <header className="radio-card-header">
                <h2>Parámetros básicos de AM</h2>
                <p>
                  Calcula longitud de onda y potencia en dB de un
                  transmisor en banda AM de onda media.
                </p>
              </header>
              <div className="radio-card-body">
                <div className="radio-form-grid">
                  <label className="radio-field">
                    <span>Frecuencia portadora</span>
                    <div className="radio-input-wrap">
                      <input
                        type="number"
                        value={amFreqKHz}
                        onChange={(e) =>
                          setAmFreqKHz(e.target.value)
                        }
                        min="1"
                        step="1"
                      />
                      <span className="radio-input-suffix">kHz</span>
                    </div>
                  </label>
                  <label className="radio-field">
                    <span>Potencia de transmisión</span>
                    <div className="radio-input-wrap">
                      <input
                        type="number"
                        value={amPowerW}
                        onChange={(e) =>
                          setAmPowerW(e.target.value)
                        }
                        min="0.1"
                        step="0.1"
                      />
                      <span className="radio-input-suffix">W</span>
                    </div>
                  </label>
                </div>

                <div className="radio-results-grid">
                  <div className="radio-result-main">
                    <span className="radio-result-label">
                      Longitud de onda
                    </span>
                    <span className="radio-result-value">
                      {amResult
                        ? `${amResult.lambda.toFixed(1)} m`
                        : "—"}
                    </span>
                  </div>
                  <div className="radio-result-main">
                    <span className="radio-result-label">
                      Potencia
                    </span>
                    <span className="radio-result-value">
                      {amResult
                        ? `${amResult.pDbw.toFixed(
                            2
                          )} dBW · ${amResult.pDbm.toFixed(
                            2
                          )} dBm`
                        : "—"}
                    </span>
                  </div>
                </div>
                <p className="radio-result-note">
                  P(dBW) = 10·log₁₀(P[W])
                </p>
              </div>
            </section>
          )}
        </div>

        <aside className="radio-side">
          <section className="radio-side-card">
            <h3>Guía rápida</h3>
            <ul>
              <li>
                Usa <strong>FSPL</strong> para estimar la atenuación total de
                un salto punto a punto.
              </li>
              <li>
                Revisa la <strong>zona de Fresnel</strong> para chequear que no
                haya obstáculos dentro del 60&nbsp;% de su radio.
              </li>
              <li>
                En <strong>FM</strong> y <strong>AM</strong> obtienes
                longitud de onda y potencias en dB para cerrar el balance.
              </li>
            </ul>
          </section>

          <section className="radio-side-card">
            <h3>Convenciones</h3>
            <dl className="radio-def-list">
              <div>
                <dt>d, d₁, d₂</dt>
                <dd>Distancias en km.</dd>
              </div>
              <div>
                <dt>f</dt>
                <dd>Frecuencia: MHz, GHz o kHz según el caso.</dd>
              </div>
              <div>
                <dt>FSPL</dt>
                <dd>Pérdidas en espacio libre en dB.</dd>
              </div>
              <div>
                <dt>ERP</dt>
                <dd>Potencia radiada efectiva.</dd>
              </div>
            </dl>
          </section>
        </aside>
      </section>
    </main>
  );
}
