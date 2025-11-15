import React, { useMemo, useState, useEffect, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import "./DOCSS/Modulo1.css";

/* ========= utilidades ========= */
const SI = 1000;
const rateUnits = [
  { k: "bps",  f: 1,           label: "bps"  },
  { k: "Kbps", f: SI,          label: "Kbps" },
  { k: "Mbps", f: SI ** 2,     label: "Mbps" },
  { k: "Gbps", f: SI ** 3,     label: "Gbps" },
  { k: "Bps",  f: 8,           label: "B/s"  },
  { k: "KBps", f: 8 * SI,      label: "KB/s" },
  { k: "MBps", f: 8 * SI ** 2, label: "MB/s" },
  { k: "GBps", f: 8 * SI ** 3, label: "GB/s" },
];
const sizeUnits = [
  { k: "bit", bits: 1,          label: "bit"  },
  { k: "B",   bits: 8,          label: "Byte" },
  { k: "KB",  bits: 8 * SI,     label: "KB"   },
  { k: "MB",  bits: 8 * SI ** 2,label: "MB"   },
  { k: "GB",  bits: 8 * SI ** 3,label: "GB"   },
  { k: "TB",  bits: 8 * SI ** 4,label: "TB"   },
];
const fmt = (n) => Number.isFinite(n) ? new Intl.NumberFormat("es-CO",{maximumFractionDigits:6}).format(n) : "";
const secToPretty = (s)=>!isFinite(s)||s<=0?"0 s":[[86400,"d"],[3600,"h"],[60,"m"],[1,"s"]]
  .map(([v,u])=>{const q=Math.floor(s/v); s%=v; return q?`${q}${u}`:null}).filter(Boolean).join(" ");

/* ========= Wrapper ========= */
function ModuleSlab({ tone, badge, title, description, bullets=[], head, chips=[], children, footer }) {
  return (
    <div className="bt-m1-slab">
      <aside className={`bt-m1-slab__aside bt-m1-aside--${tone}`}>
        {badge && <span className="bt-m1-slab__badge">{badge}</span>}
        <h3 className="bt-m1-slab__title">{title}</h3>
        {description && <p className="bt-m1-slab__desc">{description}</p>}
        {chips?.length>0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>
            {chips.map((c,i)=> <span key={i} className="bt-m1-chip"><code>{c.left}</code> {c.right}</span>)}
          </div>
        )}
        {bullets.length>0 && <ul className="bt-m1-slab__list">{bullets.map((b,i)=><li key={i}>{b}</li>)}</ul>}
      </aside>
      <div className="bt-m1-slab__body">
        {head && <div className="bt-m1-slab__head">{head}</div>}
        <div className="bt-m1-slab__content">{children}</div>
        {footer}
      </div>
    </div>
  );
}

/* ========= Módulos ========= */
function PowerConverter({ id }) {
  const [w,setW]=useState(""),[dbw,setDbw]=useState(""),[dbm,setDbm]=useState("");
  const historyRef = useRef([]);

  const handleW=v=>{setW(v);const x=parseFloat(v);if(!isFinite(x)||x<=0){setDbw("");setDbm("");return;}const dBW=10*Math.log10(x);setDbw(dBW);setDbm(dBW+30);pushHistory({ W:x, dBW, dBm:dBW+30 });}
  const handleDbw=v=>{setDbw(v);const x=parseFloat(v);if(!isFinite(x)){setW("");setDbm("");return;}const W=Math.pow(10,x/10);setW(W);setDbm(x+30);pushHistory({ W, dBW:x, dBm:x+30 });}
  const handleDbm=v=>{setDbm(v);const x=parseFloat(v);if(!isFinite(x)){setW("");setDbw("");return;}const dBW=x-30;setDbw(dBW);setW(Math.pow(10,dBW/10));pushHistory({ W:Math.pow(10,dBW/10), dBW, dBm:x });}
  const pushHistory = (row)=>{ historyRef.current = [...historyRef.current, { idx: historyRef.current.length+1, ...row }].slice(-12); };

  const kpis = (
    <div className="bt-m1-kpi">
      <div className="bt-m1-kpi__card"><div className="bt-m1-kpi__label">Potencia</div><div className="bt-m1-kpi__value">{fmt(parseFloat(w))} W</div></div>
      <div className="bt-m1-kpi__card"><div className="bt-m1-kpi__label">Nivel</div><div className="bt-m1-kpi__value">{fmt(parseFloat(dbw))} dBW</div></div>
      <div className="bt-m1-kpi__card"><div className="bt-m1-kpi__label">Nivel</div><div className="bt-m1-kpi__value">{fmt(parseFloat(dbm))} dBm</div></div>
    </div>
  );

  const head=(
    <>
      <div><label>Potencia (W)</label><input className="bt-m1-input" value={w} onChange={e=>handleW(e.target.value)} placeholder="Ej:0.05"/></div>
      <div><label>Nivel (dBW)</label><input className="bt-m1-input" value={dbw} onChange={e=>handleDbw(e.target.value)} placeholder="Ej:-13"/></div>
      <div><label>Nivel (dBm)</label><input className="bt-m1-input" value={dbm} onChange={e=>handleDbm(e.target.value)} placeholder="Ej:17"/></div>
    </>
  );

  const chartData = historyRef.current.map((r)=>({ name:`#${r.idx}`, W:r.W, dBm:r.dBm }));

  return (
    <section id={id} className="bt-m1-section">
      <ModuleSlab tone="blue" badge="Módulo 1" title="Conversor de potencia"
        description="Convierte entre W, dBW y dBm al instante, con historial visual."
        chips={[{left:"dBW", right:"= 10·log10(W)"},{left:"dBm", right:"= dBW + 30"}]}
        bullets={["Validaciones básicas","Histórico de 12 mediciones"]}
        head={head}>
        {kpis}
        <div className="bt-m1-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{top:6,right:10,left:0,bottom:0}}>
              <defs>
                <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2E5AA7" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#2E5AA7" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="name" tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:12}}/>
              <Tooltip formatter={(v,n)=>[fmt(v), n]} cursor={{stroke:"#e6eefc"}}/>
              <Area type="monotone" dataKey="dBm" stroke="#2E5AA7" fill="url(#gBlue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <small className="bt-m1-help">Sugerencia: usa valores positivos para W.</small>
      </ModuleSlab>
    </section>
  );
}

function RateConverter({ id }) {
  const [value,setValue]=useState(""),[unit,setUnit]=useState("bps");
  const values=useMemo(()=>{
    const x=parseFloat(value);
    if(!isFinite(x)||x<0) return {};
    const base=x*(rateUnits.find(u=>u.k===unit)?.f||1);
    const o={};
    for(const u of rateUnits) o[u.k]=base/u.f;
    return o;
  },[value,unit]);

  const tableData = rateUnits.map(u=>({ unidad:u.label, valor: values[u.k]??null }));

  const head=(
    <>
      <div><label>Valor</label><input className="bt-m1-input" value={value} onChange={e=>setValue(e.target.value)} placeholder="Ej:100"/></div>
      <div><label>Unidad</label>
        <select className="bt-m1-input" value={unit} onChange={e=>setUnit(e.target.value)}>
          {rateUnits.map(u=> <option key={u.k} value={u.k}>{u.label}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <section id={id} className="bt-m1-section">
      <ModuleSlab tone="green" badge="Módulo 2" title="Conversor de tasa"
        description="Pasa entre bps/Bps y múltiplos SI manteniendo precisión."
        chips={[{left:"1 Byte", right:"= 8 bits"},{left:"K/M/G", right:"según SI"}]}
        bullets={["Salida tabulada","Vista de barras por unidad"]}
        head={head}>
        <div className="bt-m1-kpi">
          <div className="bt-m1-kpi__card"><div className="bt-m1-kpi__label">Base</div><div className="bt-m1-kpi__value">{fmt(parseFloat(value))} {rateUnits.find(u=>u.k===unit)?.label}</div></div>
          <div className="bt-m1-kpi__card"><div className="bt-m1-kpi__label">Equivalente</div><div className="bt-m1-kpi__value">{fmt(values["MBps"])||"-"} MB/s</div></div>
          <div className="bt-m1-kpi__card"><div className="bt-m1-kpi__label">Máxima</div><div className="bt-m1-kpi__value">{fmt(values["Gbps"])||"-"} Gbps</div></div>
        </div>

        <div className="bt-m1-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tableData} margin={{top:8,right:10,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="unidad" tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:12}}/>
              <Tooltip formatter={(v)=>fmt(v)} cursor={{fill:"rgba(46,90,167,.06)"}}/>
              <Bar dataKey="valor" fill="#19A27C" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <table className="bt-m1-table"><thead><tr><th>Unidad</th><th>Valor</th></tr></thead><tbody>
          {rateUnits.map(u=> <tr key={u.k}><td>{u.label}</td><td>{fmt(values[u.k])}</td></tr>)}
        </tbody></table>
      </ModuleSlab>
    </section>
  );
}

function TransferTime({ id }) {
  const [s,setS]=useState(""),[su,setSu]=useState("MB"),[r,setR]=useState(""),[ru,setRu]=useState("Mbps"),[e,setE]=useState(100);
  const bits=useMemo(()=>{const v=parseFloat(s);if(!isFinite(v)||v<=0)return 0;const u=sizeUnits.find(x=>x.k===su)?.bits||1;return v*u;},[s,su]);
  const bps=useMemo(()=>{const v=parseFloat(r);if(!isFinite(v)||v<=0)return 0;const u=rateUnits.find(x=>x.k===ru)?.f||1;return v*u;},[r,ru]);
  const seconds=useMemo(()=>(!bits||!bps)?0:bits/(bps*(e/100)),[bits,bps,e]);
  const mbps=useMemo(()=>bps?bps/(8*SI**2):0,[bps]);

  const head=(
    <>
      <div><label>Tamaño</label><input className="bt-m1-input" value={s} onChange={e=>setS(e.target.value)} placeholder="Ej:700"/></div>
      <div><label>Unidad</label>
        <select className="bt-m1-input" value={su} onChange={e=>setSu(e.target.value)}>{sizeUnits.map(u=><option key={u.k} value={u.k}>{u.label}</option>)}</select>
      </div>
      <div><label>Ancho de banda</label><input className="bt-m1-input" value={r} onChange={e=>setR(e.target.value)} placeholder="Ej:20"/></div>
      <div><label>Unidad</label>
        <select className="bt-m1-input" value={ru} onChange={e=>setRu(e.target.value)}>{rateUnits.map(u=><option key={u.k} value={u.k}>{u.label}</option>)}</select>
      </div>
      <div><label>Eficiencia (%)</label><input className="bt-m1-input" value={e} onChange={e=>setE(e.target.value)} /></div>
    </>
  );

  const kpis=(
    <div className="bt-m1-kpi">
      <div className="bt-m1-kpi__card"><div className="bt-m1-kpi__label">Tiempo estimado</div><div className="bt-m1-kpi__value">{secToPretty(seconds)}</div></div>
      <div className="bt-m1-kpi__card"><div className="bt-m1-kpi__label">Rendimiento efectivo</div><div className="bt-m1-kpi__value">{fmt(mbps)} MB/s</div></div>
      <div className="bt-m1-kpi__card"><div className="bt-m1-kpi__label">Tamaño total</div><div className="bt-m1-kpi__value">{fmt(bits)} bits</div></div>
    </div>
  );

  const timeline=[
    {name:"0%",    s:0},
    {name:"25%",   s:seconds*0.25},
    {name:"50%",   s:seconds*0.50},
    {name:"75%",   s:seconds*0.75},
    {name:"100%",  s:seconds}
  ];

  return (
    <section id={id} className="bt-m1-section">
      <ModuleSlab tone="purple" badge="Módulo 3" title="Tiempo de transferencia"
        description="Calcula la duración estimada según tamaño, ancho de banda y eficiencia."
        chips={[{left:"Decimal", right:"1 KB = 1000 B"},{left:"Overhead", right:"control + protocolos"}]}
        bullets={["Eficiencia ajustable","Línea de progreso temporal"]}
        head={head}>
        {kpis}
        <div className="bt-m1-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{top:8,right:10,left:0,bottom:4}}>
              <defs>
                <linearGradient id="gPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6B3BE3" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#6B3BE3" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="name" tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:12}} tickFormatter={(v)=>`${v.toFixed(0)}s`} domain={[0, Math.max(seconds, 1)]}/>
              <Tooltip formatter={(v)=>`${fmt(v)} s`} cursor={{stroke:"#eee"}}/>
              <Area type="monotone" dataKey="s" stroke="#6B3BE3" fill="url(#gPurple)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ModuleSlab>
    </section>
  );
}

/* ========= Página ========= */
export default function Conversion1(){
  useEffect(()=>{
    const links=[...document.querySelectorAll(".bt-m1-tabs a")];
    const h=()=>{const y=window.scrollY+140;for(const a of links){const id=a.getAttribute("href");const el=id&&document.querySelector(id);if(!el)continue;const t=el.offsetTop,b=t+el.offsetHeight;a.classList.toggle("is-active",y>=t&&y<b);}};h();
    window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);
  },[]);
  return (
    <div className="bt-m1-root">
      <header className="bt-m1-top">
  <div className="bt-m1-top__title">
    <h1>
      Velocidades de <span>transmisión</span>
    </h1>

  </div>
  <nav className="bt-m1-tabs">
    <a href="#potencia">Potencia</a>
    <a href="#tasa">Tasa</a>
    <a href="#tiempo">Tiempo</a>
  </nav>
</header>

      <main>
        <PowerConverter id="potencia"/>
        <RateConverter id="tasa"/>
        <TransferTime id="tiempo"/>
      </main>
    </div>
  );
}
