import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import "./DOCSS/Modulo2.css";

const fmt = (n, d = 2) =>
  Number.isFinite(n)
    ? new Intl.NumberFormat("es-CO", { maximumFractionDigits: d }).format(n)
    : "-";

const channelsByBand = (band, widthMHz) => {
  const w = Number(widthMHz);
  if (band === "2.4") return w === 20 ? 3 : 1;
  if (band === "5") {
    if (w === 20) return 12;
    if (w === 40) return 6;
    if (w === 80) return 3;
    if (w === 160) return 1;
  }
  if (band === "6") {
    if (w === 20) return 59;
    if (w === 40) return 29;
    if (w === 80) return 14;
    if (w === 160) return 7;
  }
  return 0;
};

function Group({ title, subtitle, cols = 3, children }) {
  return (
    <section className="wifi-group">
      <header className="wifi-group-header">
        <h2>{title}</h2>
        {subtitle ? <small className="bt-wifi-help">{subtitle}</small> : null}
      </header>
      <div
        className="wifi-group-grid"
        style={{
          gridTemplateColumns: `repeat(auto-fit,minmax(${Math.floor(
            1000 / cols
          )}px,1fr))`
        }}
      >
        {children}
      </div>
    </section>
  );
}

export default function DimensionamientoWifi() {
  const [totalUsers, setTotalUsers] = useState(150);
  const [concurrency, setConcurrency] = useState(30);
  const [targetPerUserMbps, setTargetPerUserMbps] = useState(4);

  const [use24, setUse24] = useState(false);
  const [use5, setUse5] = useState(true);
  const [use6, setUse6] = useState(false);

  const [w24, setW24] = useState(20);
  const [w5, setW5] = useState(80);
  const [w6, setW6] = useState(80);

  const [efficiencyPct, setEfficiencyPct] = useState(55);
  const [radiosPerAP, setRadiosPerAP] = useState(2);
  const [maxClientsPerAP, setMaxClientsPerAP] = useState(75);

  const [siteArea, setSiteArea] = useState(2500);
  const [env, setEnv] = useState("oficina-densa");

  const concurrentUsers = useMemo(
    () => Math.ceil(totalUsers * (concurrency / 100)),
    [totalUsers, concurrency]
  );
  const totalThroughputDemand = useMemo(
    () => concurrentUsers * targetPerUserMbps,
    [concurrentUsers, targetPerUserMbps]
  );

  const baseSpectralEff = 6;
  const eff = efficiencyPct / 100;

  const capBand = (active, width) =>
    active ? width * baseSpectralEff * eff : 0;

  const cap24 = capBand(use24, w24);
  const cap5 = capBand(use5, w5);
  const cap6 = capBand(use6, w6);

  const ch24 = use24 ? channelsByBand("2.4", w24) : 0;
  const ch5 = use5 ? channelsByBand("5", w5) : 0;
  const ch6n = use6 ? channelsByBand("6", w6) : 0;
  const totalChannels = ch24 + ch5 + ch6n;

  const bandCaps = [
    { k: "2.4 GHz", v: cap24 },
    { k: "5 GHz", v: cap5 },
    { k: "6 GHz", v: cap6 }
  ]
    .sort((a, b) => b.v - a.v)
    .slice(0, radiosPerAP);

  const capPerAP = bandCaps.reduce((acc, b) => acc + b.v, 0);

  const apsByCapacity =
    capPerAP > 0 ? Math.ceil(totalThroughputDemand / capPerAP) : 0;
  const apsByClients =
    maxClientsPerAP > 0 ? Math.ceil(concurrentUsers / maxClientsPerAP) : 0;

  const radiusByEnv = {
    "oficina-abierta": 22,
    "oficina-densa": 15,
    aula: 18,
    almacen: 28,
    auditorio: 25
  };
  const cellRadius = radiusByEnv[env] || 18;
  const cellArea = Math.PI * Math.pow(cellRadius, 2);
  const apsByCoverage = cellArea > 0 ? Math.ceil(siteArea / cellArea) : 0;

  const recommendedAPs = Math.max(
    apsByCapacity || 0,
    apsByClients || 0,
    apsByCoverage || 0,
    1
  );

  const chartData = [
    { name: "Demanda (UBH)", value: totalThroughputDemand },
    { name: "Cap/AP", value: capPerAP }
  ];

  return (
    <main className="wifi-root">
      <div className="wifi-bg" aria-hidden />

      <header className="wifi-hero">
        <div className="wifi-hero-surface">
          <div className="wifi-hero-main">
            <div className="wifi-hero-text">
              <span className="wifi-hero-chip">Módulo Wi-Fi</span>
              <h1 className="wifi-hero-title">
                Dimensionamiento de red <span>Wi-Fi</span>
              </h1>
              <p className="wifi-hero-subtitle">
                Calcula usuarios concurrentes, demanda en hora cargada y puntos
                de acceso recomendados combinando capacidad, número de clientes
                y cobertura por entorno.
              </p>
              <div className="wifi-hero-tags">
                <span>UBH</span>
                <span>Capacidad por AP</span>
                <span>Planificación de cobertura</span>
              </div>
            </div>
          </div>

          <div className="wifi-hero-footer">
            <div className="wifi-hero-stats">
              <div className="wifi-stat">
                <span className="wifi-stat-label">Usuarios concurrentes</span>
                <span className="wifi-stat-value">
                  {fmt(concurrentUsers, 0)}
                </span>
                <span className="wifi-stat-foot">
                  A partir de usuarios totales y porcentaje de concurrencia.
                </span>
              </div>
              <div className="wifi-stat">
                <span className="wifi-stat-label">APs recomendados</span>
                <span className="wifi-stat-value">
                  {fmt(recommendedAPs, 0)}
                </span>
                <span className="wifi-stat-foot">
                  Máximo entre capacidad, clientes y cobertura.
                </span>
              </div>
            </div>

            <div className="wifi-hero-summary">
              <div className="wifi-hero-summary-row">
                <span>Demanda total (UBH)</span>
                <strong>{fmt(totalThroughputDemand)} Mbps</strong>
              </div>
              <div className="wifi-hero-summary-row">
                <span>Capacidad estimada por AP</span>
                <strong>{fmt(capPerAP)} Mbps</strong>
              </div>
              <div className="wifi-hero-summary-row">
                <span>Canales disponibles</span>
                <strong>{fmt(totalChannels, 0)}</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="wifi-shell">
        <div className="wifi-main">
          <section className="wifi-panel">
            <header className="wifi-panel-header">
              <div>
                <p className="wifi-panel-kicker">Parámetros de diseño</p>
                <h2>Demanda, capacidad y cobertura del sitio</h2>
                <p>
                  Ajusta la cantidad de usuarios, concurrencia y objetivos de
                  bitraje. Activa las bandas disponibles y define el entorno
                  para obtener un número de APs realista.
                </p>
              </div>
            </header>

            <div className="wifi-panel-body">
              <Group
                title="Demanda"
                subtitle="Usuarios, concurrencia y objetivo por usuario"
                cols={3}
              >
                <div>
                  <label>Usuarios totales</label>
                  <input
                    className="bt-wifi-input"
                    type="number"
                    value={totalUsers}
                    onChange={(e) =>
                      setTotalUsers(Number(e.target.value) || 0)
                    }
                  />
                  <small className="bt-wifi-help">
                    Dispositivos del sitio
                  </small>
                </div>
                <div>
                  <label>Concurrencia (%)</label>
                  <input
                    className="bt-wifi-input"
                    type="number"
                    value={concurrency}
                    onChange={(e) =>
                      setConcurrency(Number(e.target.value) || 0)
                    }
                  />
                  <small className="bt-wifi-help">
                    Activos en hora cargada
                  </small>
                </div>
                <div>
                  <label>Objetivo por usuario (Mbps)</label>
                  <input
                    className="bt-wifi-input"
                    type="number"
                    value={targetPerUserMbps}
                    onChange={(e) =>
                      setTargetPerUserMbps(Number(e.target.value) || 0)
                    }
                  />
                  <small className="bt-wifi-help">Bitraje promedio</small>
                </div>
              </Group>

              <Group
                title="Capacidad global"
                subtitle="Eficiencia total y radios por AP"
                cols={2}
              >
                <div>
                  <label>Eficiencia global (%)</label>
                  <input
                    className="bt-wifi-input"
                    type="number"
                    value={efficiencyPct}
                    onChange={(e) =>
                      setEfficiencyPct(Number(e.target.value) || 0)
                    }
                  />
                  <small className="bt-wifi-help">
                    Calidad de enlace/overhead
                  </small>
                </div>
                <div>
                  <label>Radios por AP</label>
                  <select
                    className="bt-wifi-input"
                    value={radiosPerAP}
                    onChange={(e) =>
                      setRadiosPerAP(Number(e.target.value) || 1)
                    }
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                  <small className="bt-wifi-help">
                    Se priorizan las bandas con mayor capacidad
                  </small>
                </div>
              </Group>

              <Group
                title="Bandas y anchos de canal"
                subtitle="Activa bandas y define BW"
                cols={3}
              >
                <div>
                  <label>2.4 GHz</label>
                  <div className="wifi-dual-input">
                    <select
                      className="bt-wifi-input"
                      value={use24 ? "sí" : "no"}
                      onChange={(e) => setUse24(e.target.value === "sí")}
                    >
                      <option>no</option>
                      <option>sí</option>
                    </select>
                    <select
                      className="bt-wifi-input"
                      value={w24}
                      onChange={(e) => setW24(Number(e.target.value))}
                    >
                      <option value={20}>20 MHz</option>
                      <option value={40}>40 MHz</option>
                    </select>
                  </div>
                  <small className="bt-wifi-help">
                    {use24
                      ? `${channelsByBand("2.4", w24)} canales útiles aprox.`
                      : "Desactivado"}
                  </small>
                </div>

                <div>
                  <label>5 GHz</label>
                  <div className="wifi-dual-input">
                    <select
                      className="bt-wifi-input"
                      value={use5 ? "sí" : "no"}
                      onChange={(e) => setUse5(e.target.value === "sí")}
                    >
                      <option>no</option>
                      <option>sí</option>
                    </select>
                    <select
                      className="bt-wifi-input"
                      value={w5}
                      onChange={(e) => setW5(Number(e.target.value))}
                    >
                      <option value={20}>20 MHz</option>
                      <option value={40}>40 MHz</option>
                      <option value={80}>80 MHz</option>
                      <option value={160}>160 MHz</option>
                    </select>
                  </div>
                  <small className="bt-wifi-help">
                    {use5
                      ? `${channelsByBand("5", w5)} canales útiles aprox.`
                      : "Desactivado"}
                  </small>
                </div>

                <div>
                  <label>6 GHz</label>
                  <div className="wifi-dual-input">
                    <select
                      className="bt-wifi-input"
                      value={use6 ? "sí" : "no"}
                      onChange={(e) => setUse6(e.target.value === "sí")}
                    >
                      <option>no</option>
                      <option>sí</option>
                    </select>
                    <select
                      className="bt-wifi-input"
                      value={w6}
                      onChange={(e) => setW6(Number(e.target.value))}
                    >
                      <option value={20}>20 MHz</option>
                      <option value={40}>40 MHz</option>
                      <option value={80}>80 MHz</option>
                      <option value={160}>160 MHz</option>
                    </select>
                  </div>
                  <small className="bt-wifi-help">
                    {use6
                      ? `${channelsByBand("6", w6)} canales útiles aprox.`
                      : "Desactivado"}
                  </small>
                </div>
              </Group>

              <Group
                title="Clientes y cobertura"
                subtitle="Política de usuarios por AP y área a cubrir"
                cols={3}
              >
                <div>
                  <label>Máx. clientes por AP</label>
                  <input
                    className="bt-wifi-input"
                    type="number"
                    value={maxClientsPerAP}
                    onChange={(e) =>
                      setMaxClientsPerAP(Number(e.target.value) || 0)
                    }
                  />
                  <small className="bt-wifi-help">
                    Política/experiencia
                  </small>
                </div>
                <div>
                  <label>Área del sitio (m²)</label>
                  <input
                    className="bt-wifi-input"
                    type="number"
                    value={siteArea}
                    onChange={(e) =>
                      setSiteArea(Number(e.target.value) || 0)
                    }
                  />
                  <small className="bt-wifi-help">Superficie a cubrir</small>
                </div>
                <div>
                  <label>Entorno</label>
                  <select
                    className="bt-wifi-input"
                    value={env}
                    onChange={(e) => setEnv(e.target.value)}
                  >
                    <option value="oficina-abierta">Oficina abierta</option>
                    <option value="oficina-densa">Oficina densa</option>
                    <option value="aula">Aula</option>
                    <option value="almacen">Almacén</option>
                    <option value="auditorio">Auditorio</option>
                  </select>
                  <small className="bt-wifi-help">
                    Radio típico ~ {fmt(cellRadius, 0)} m
                  </small>
                </div>
              </Group>

              <div className="bt-wifi-kpis">
                <div className="bt-wifi-kpi">
                  <div className="bt-wifi-kpi__label">Usuarios concurrentes</div>
                  <div className="bt-wifi-kpi__value">
                    {fmt(concurrentUsers, 0)}
                  </div>
                </div>
                <div className="bt-wifi-kpi">
                  <div className="bt-wifi-kpi__label">Demanda total (UBH)</div>
                  <div className="bt-wifi-kpi__value">
                    {fmt(totalThroughputDemand)} Mbps
                  </div>
                </div>
                <div className="bt-wifi-kpi">
                  <div className="bt-wifi-kpi__label">Capacidad por AP</div>
                  <div className="bt-wifi-kpi__value">
                    {fmt(capPerAP)} Mbps
                  </div>
                </div>
                <div className="bt-wifi-kpi">
                  <div className="bt-wifi-kpi__label">APs por capacidad</div>
                  <div className="bt-wifi-kpi__value">
                    {fmt(apsByCapacity, 0)}
                  </div>
                </div>
                <div className="bt-wifi-kpi">
                  <div className="bt-wifi-kpi__label">APs por clientes</div>
                  <div className="bt-wifi-kpi__value">
                    {fmt(apsByClients, 0)}
                  </div>
                </div>
                <div className="bt-wifi-kpi">
                  <div className="bt-wifi-kpi__label">APs por cobertura</div>
                  <div className="bt-wifi-kpi__value">
                    {fmt(apsByCoverage, 0)}
                  </div>
                </div>
                <div className="bt-wifi-kpi">
                  <div className="bt-wifi-kpi__label">
                    Canales disponibles
                  </div>
                  <div className="bt-wifi-kpi__value">
                    {fmt(totalChannels, 0)}
                  </div>
                </div>
                <div className="bt-wifi-kpi bt-wifi-kpi--highlight">
                  <div className="bt-wifi-kpi__label">APs recomendados</div>
                  <div className="bt-wifi-kpi__value">
                    {fmt(recommendedAPs, 0)}
                  </div>
                </div>
              </div>

              <div className="bt-wifi-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 10, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#eef2f7"
                    />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(v) => `${fmt(v)} Mbps`}
                      cursor={{ fill: "rgba(46,90,167,.06)" }}
                    />
                    <Bar dataKey="value" fill="#2E5AA7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <table className="bt-wifi-table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Capacidad 2.4 GHz</td>
                    <td>{fmt(cap24)} Mbps</td>
                  </tr>
                  <tr>
                    <td>Capacidad 5 GHz</td>
                    <td>{fmt(cap5)} Mbps</td>
                  </tr>
                  <tr>
                    <td>Capacidad 6 GHz</td>
                    <td>{fmt(cap6)} Mbps</td>
                  </tr>
                  <tr>
                    <td>Radios por AP</td>
                    <td>{radiosPerAP}</td>
                  </tr>
                  <tr>
                    <td>Área celda aprox.</td>
                    <td>{fmt(cellArea, 0)} m²</td>
                  </tr>
                  <tr>
                    <td>Usuarios/AP (límite)</td>
                    <td>{maxClientsPerAP}</td>
                  </tr>
                </tbody>
              </table>

              <small className="bt-wifi-help wifi-footnote">
                Cap_banda ≈ BW(MHz) × 6 × Eficiencia(%). APs_capacidad = ⌈UBH /
                Cap_AP⌉. APs_clientes = ⌈Concurrencia / MáxClientes⌉.
                APs_cobertura = ⌈Área / (π·R²)⌉.
              </small>
            </div>
          </section>
        </div>

        <aside className="wifi-aside">
          <section className="wifi-aside-card">
            <h3>Qué resuelve este módulo</h3>
            <ul>
              <li>Traduce usuarios y bitraje objetivo en demanda (UBH).</li>
              <li>Combina bandas y BW para estimar capacidad por AP.</li>
              <li>
                Ajusta el número de APs por capacidad, clientes y cobertura.
              </li>
            </ul>
          </section>

          <section className="wifi-aside-card wifi-aside-highlight">
            <h3>Reglas rápidas</h3>
            <ul>
              <li>Evita más de 30–35 usuarios activos por radio.</li>
              <li>
                En entornos densos, prioriza más APs con BW moderado sobre
                pocos APs con BW muy alto.
              </li>
              <li>
                Revisa siempre interferencias reales y plano arquitectónico.
              </li>
            </ul>
          </section>

          <section className="wifi-aside-card">
            <h3>Convenciones</h3>
            <p className="wifi-aside-label">Siglas usadas</p>
            <p className="wifi-aside-foot">
              UBH: demanda en hora cargada. Cap/AP: capacidad estimada por
              punto de acceso. Los valores son orientativos para etapa de
              diseño.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
