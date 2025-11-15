import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Chart from "chart.js/auto";
import "./DOCSS/iot.css";

const LS_KEY = "esp32_base_url";

function normBaseUrl(v) {
  if (!v) return "";
  let s = v.trim();
  if (s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function getBaseUrl() {
  const saved = localStorage.getItem(LS_KEY);
  if (saved && saved.trim()) return saved;
  const def = "http://esp32.local";
  localStorage.setItem(LS_KEY, def);
  return def;
}

export default function IotPanel() {
  const [baseUrl, setBaseUrl] = useState(getBaseUrl());
  const [saving, setSaving] = useState(false);

  const [t, setT] = useState(null);
  const [h, setH] = useState(null);

  const [mOn, setMOn] = useState(null);
  const [mSpd, setMSpd] = useState(128);

  const [isDay, setIsDay] = useState(null);
  const [lampOn, setLampOn] = useState(null);
  const [lampMode, setLampMode] = useState("auto");

  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Temperatura (°C)",
            data: [],
            borderWidth: 2,
            fill: false,
            tension: 0.25
          },
          {
            label: "Humedad (%)",
            data: [],
            borderWidth: 2,
            fill: false,
            tension: 0.25
          }
        ]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { position: "top" } }
      }
    });
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const url = normBaseUrl(baseUrl);
    if (!url) return;
    const id = setInterval(async () => {
      try {
        const r = await fetch(`${url}/datos`, { cache: "no-store" });
        const j = await r.json();
        const now = new Date().toLocaleTimeString();
        const temp = Number(j.temperatura);
        const hum = Number(j.humedad);
        setT(temp);
        setH(hum);
        const chart = chartRef.current;
        if (chart) {
          chart.data.labels.push(now);
          chart.data.datasets[0].data.push(temp);
          chart.data.datasets[1].data.push(hum);
          if (chart.data.labels.length > 40) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
          }
          chart.update();
        }
      } catch (e) {}
    }, 2000);
    return () => clearInterval(id);
  }, [baseUrl]);

  async function lampUpdate(opts = {}) {
    const url = normBaseUrl(baseUrl);
    if (!url) return;
    const qs = new URLSearchParams();
    if (opts.mode) qs.set("mode", opts.mode);
    if (typeof opts.on === "boolean") qs.set("on", opts.on ? 1 : 0);
    const qsStr = qs.toString();
    const fullUrl = qsStr ? `${url}/lamp?${qsStr}` : `${url}/lamp`;
    try {
      const r = await fetch(fullUrl, { cache: "no-store" });
      const j = await r.json();
      setIsDay(Boolean(j.day));
      setLampOn(Boolean(j.on));
      if (typeof j.mode === "string") setLampMode(j.mode);
    } catch (e) {}
  }

  useEffect(() => {
    const url = normBaseUrl(baseUrl);
    if (!url) return;
    const id = setInterval(() => {
      lampUpdate();
    }, 1000);
    return () => clearInterval(id);
  }, [baseUrl]);

  useEffect(() => {
    const url = normBaseUrl(baseUrl);
    if (!url) return;
    const id = setInterval(async () => {
      try {
        const r = await fetch(`${url}/motor`, { cache: "no-store" });
        const j = await r.json();
        setMOn(Boolean(j.on));
        setMSpd(Number(j.spd));
      } catch (e) {}
    }, 1200);
    return () => clearInterval(id);
  }, [baseUrl]);

  function interpText() {
    if (t == null || h == null) return "Esperando lectura del DHT11...";
    let msg = "";
    if (t < 20) msg = "Temperatura baja";
    else if (t < 28) msg = "Temperatura ideal para interiores";
    else msg = "Temperatura alta, se recomienda ventilación";
    if (h < 40) msg += " · Humedad baja";
    else if (h <= 70) msg += " · Humedad adecuada";
    else msg += " · Humedad alta";
    return `T: ${t.toFixed(1)} °C · H: ${h.toFixed(1)} % — ${msg}`;
  }

  async function motorSet(on, spd = null) {
    const url = normBaseUrl(baseUrl);
    if (!url) return;
    const qs = new URLSearchParams();
    if (on !== null) qs.set("on", on ? 1 : 0);
    if (spd !== null) qs.set("spd", spd);
    try {
      const r = await fetch(`${url}/motor?${qs.toString()}`, {
        cache: "no-store"
      });
      const j = await r.json();
      setMOn(Boolean(j.on));
      setMSpd(Number(j.spd));
    } catch (e) {}
  }

  function onSubmit(e) {
    e.preventDefault();
    const n = normBaseUrl(baseUrl);
    setSaving(true);
    try {
      localStorage.setItem(LS_KEY, n);
      setBaseUrl(n);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="iot-root">
      <section className="iot-intro">
        <div className="iot-intro-top">
          <div className="iot-intro-text">
            <h1 className="iot-intro-title">
              ¿QUÉ ES EL <span>IoT?</span>
            </h1>
            <p className="iot-intro-par">
              El Internet de las Cosas conecta objetos físicos como sensores,
              electrodomésticos y vehículos a la red para que puedan enviar y
              recibir datos.
            </p>
            <p className="iot-intro-par">
              En una casa inteligente, estos dispositivos permiten automatizar
              tareas, mejorar la seguridad y ahorrar energía usando un panel
              como este.
            </p>
          </div>
          <div className="iot-intro-image">
            <img
              src="/iot-room.png"
              alt="Ejemplo de casa inteligente conectada a la nube"
            />
          </div>
        </div>

        <div className="iot-intro-bottom">
          <div className="iot-motor-illus">
            <img src="/iot-motor.png" alt="Motor controlado por IoT" />
          </div>
          <div className="iot-motor-copy">
            <h2>Control de motores</h2>
            <p>
              Con un módulo como el L298N y un ESP32 se puede variar la
              velocidad de un motor desde la web, ideal para ventiladores,
              carritos, compuertas o extractores.
            </p>
            <p>
              En esta maqueta se muestra un control básico: encender, apagar y
              elegir un valor de velocidad entre 0 y 255.
            </p>
          </div>
          <div className="iot-motor-mock">
            <p className="iot-ldrstatus">
              Estado:{" "}
              <strong>
                {mOn == null ? "—" : mOn ? "Encendido" : "Apagado"}
              </strong>{" "}
              · Vel: <strong>{mSpd}</strong>
            </p>
            <div className="iot-actions">
              <button className="on" onClick={() => motorSet(true, mSpd)}>
                Encender
              </button>
              <button className="off" onClick={() => motorSet(false, null)}>
                Apagar
              </button>
            </div>
            <div className="iot-motor-range">
              <label>Velocidad (0–255)</label>
              <input
                type="range"
                min="0"
                max="255"
                value={mSpd}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMSpd(v);
                  if (mOn) motorSet(true, v);
                }}
              />
              <div className="led-status">Valor sugerido de trabajo: 128</div>
            </div>
          </div>
        </div>
      </section>

      <section className="iot-dht-band">
        <div className="iot-dht-chart">
          <div className="iot-dht-chart-header">
            <span className="iot-pill temp">Temperatura (°C)</span>
            <span className="iot-pill hum">Humedad (%)</span>
          </div>
          <div className="iot-dht-chart-body">
            <canvas ref={canvasRef} />
          </div>
        </div>
        <div className="iot-dht-copy">
          <h2>Sensor DHT11</h2>
          <p>
            El DHT11 es un sensor digital que mide temperatura y humedad
            relativa del ambiente. Envía esos datos al ESP32 para que se vean en
            tiempo real en la gráfica del panel.
          </p>
          <p>
            Este tipo de sensor se utiliza en estaciones meteorológicas,
            invernaderos, cuartos de servidores y proyectos de domótica donde es
            importante vigilar el confort térmico.
          </p>
          <p>{interpText()}</p>
        </div>
        <div className="iot-dht-illus">
          <img src="/iot-dht11.png" alt="Módulo sensor DHT11" />
        </div>
      </section>

      <section className="iot-lamp-band">
        <div className="iot-lamp-illus">
          <img src="/iot-bulb.png" alt="Bombillo inteligente" />
        </div>
        <div className="iot-lamp-center">
          <p className="iot-ldrstatus">
            Día/Noche:{" "}
            <strong>{isDay == null ? "—" : isDay ? "Día" : "Noche"}</strong> ·
            Bombillo:{" "}
            <strong>
              {lampOn == null ? "—" : lampOn ? "Encendido" : "Apagado"}
            </strong>{" "}
            · Modo:{" "}
            <strong>
              {lampMode === "auto"
                ? "Automático (LDR)"
                : "Manual desde la web"}
            </strong>
          </p>
          <button
            className="iot-lamp-button-main"
            onClick={() =>
              lampUpdate({
                mode: lampMode === "auto" ? "manual" : "auto"
              })
            }
          >
            Cambiar a {lampMode === "auto" ? "Manual" : "Automático"}
          </button>
          <button
            className="iot-lamp-button-on"
            disabled={lampMode === "auto" || lampOn == null}
            onClick={() => lampUpdate({ on: !lampOn })}
          >
            {lampOn ? "Apagar bombillo" : "Encender bombillo"}
          </button>
        </div>
        <div className="iot-lamp-copy">
          <h2>Bombillas inteligentes</h2>
          <p>
            El ESP32 también puede controlar un bombillo usando un LDR (sensor
            de luz). Cuando oscurece, el sistema enciende automáticamente la
            iluminación y al amanecer la apaga.
          </p>
          <p>
            Este principio es el mismo que se emplea en lámparas de calle,
            fachadas, pasillos y avisos luminosos para ahorrar energía y evitar
            que alguien tenga que estar pendiente del interruptor.
          </p>
        </div>
      </section>

    </main>
  );
}
