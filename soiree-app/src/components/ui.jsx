import React from 'react';
import { img } from '../lib/tmdb.js';

export const Play = ({ w = 14, h = 16, color = '#FFC400' }) => (
  <svg width={w} height={h} viewBox="0 0 14 16" aria-hidden="true"><polygon points="0,0 14,8 0,16" fill={color} /></svg>
);

// Le globe : une vraie sphère quadrillée (parallèles + méridiens), lumière par le haut.
const globeCache = new Map();
function globePaths(r, tilt) {
  const key = r + ':' + tilt;
  if (globeCache.has(key)) return globeCache.get(key);
  const c = r + 24;
  const proj = (lat, lon) => {
    const p = (lat * Math.PI) / 180, l = (lon * Math.PI) / 180;
    const x = Math.cos(p) * Math.sin(l), y = Math.sin(p), z = Math.cos(p) * Math.cos(l);
    const y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = z * Math.cos(tilt) + y * Math.sin(tilt);
    return [c + r * x, c - r * y2, z2];
  };
  const path = (pts) => {
    let d = '', cur = [];
    const flush = () => { if (cur.length > 1) d += 'M' + cur.join(' L') + ' '; cur = []; };
    pts.forEach(([X, Y, Z]) => { if (Z > 0) cur.push(X.toFixed(1) + ',' + Y.toFixed(1)); else flush(); });
    flush();
    return d;
  };
  const lats = [], lons = [];
  for (let lat = -80; lat <= 80; lat += 10) { const pts = []; for (let lo = -180; lo <= 180; lo += 4) pts.push(proj(lat, lo)); lats.push({ d: path(pts), eq: lat === 0 }); }
  for (let lon = 0; lon < 360; lon += 12) { const pts = []; for (let la = -90; la <= 90; la += 3) pts.push(proj(la, lon)); lons.push(path(pts)); }
  const res = { lats, lons };
  globeCache.set(key, res);
  return res;
}

export function Globe({ top, r = 250, tilt = 0.5 }) {
  const { lats, lons } = globePaths(r, tilt);
  const c = r + 24, S = c * 2;
  const t = typeof top === 'number' ? top + 'px' : top;
  return (
    <svg className="globe" aria-hidden="true" width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ top: `calc(${t} - 24px)`, marginLeft: -c }}>
      <defs>
        <radialGradient id="glo-g" cx={c} cy={c - r * 0.92} r={r * 1.25} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8DB6FF" /><stop offset="0.18" stopColor="#4D86F0" /><stop offset="0.42" stopColor="#1B4FC4" /><stop offset="0.7" stopColor="#11307F" /><stop offset="1" stopColor="#050A1F" />
        </radialGradient>
        <radialGradient id="glo-h" cx={c} cy={c} r={r * 1.08} gradientUnits="userSpaceOnUse">
          <stop offset="0.88" stopColor="#4D86F0" stopOpacity="0" /><stop offset="0.93" stopColor="#7FAAFF" stopOpacity=".55" /><stop offset="1" stopColor="#4D86F0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glo-f" x1="0" y1={c - r} x2="0" y2={c + r * 0.2} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <mask id="glo-m"><rect width={S} height={S} fill="url(#glo-f)" /></mask>
        <clipPath id="glo-c"><circle cx={c} cy={c} r={r} /></clipPath>
      </defs>
      <circle cx={c} cy={c} r={r * 1.08} fill="url(#glo-h)" />
      <circle cx={c} cy={c} r={r} fill="url(#glo-g)" />
      <g clipPath="url(#glo-c)" mask="url(#glo-m)" fill="none" stroke="#E4EEFF">
        {lats.map((l, i) => <path key={'a' + i} d={l.d} strokeOpacity={l.eq ? 0.55 : 0.42} strokeWidth={l.eq ? 2.4 : 1.8} />)}
        {lons.map((d, i) => <path key={'o' + i} d={d} strokeOpacity={0.38} strokeWidth={1.7} />)}
      </g>
      <circle cx={c} cy={c} r={r - 1} fill="none" stroke="#CFE0FF" strokeWidth="2" strokeOpacity=".85" />
    </svg>
  );
}
export const Planet = Globe;

export function Basket({ count, onClick, bump, size = 60 }) {
  return (
    <button className={'basket' + (bump ? ' bump' : '')} style={{ width: size, height: size * 0.93 }} onClick={onClick} aria-label={`Mon panier, ${count} titre${count > 1 ? 's' : ''}`}>
      <img src={count ? '/zap/objets-panier-plein.webp' : '/zap/objets-panier-vide.webp'} alt="" />
      {count > 0 && <span className="count">{count}</span>}
    </button>
  );
}

export const Back = ({ onClick, label = 'Retour' }) => (
  <button className="btn-chrome" onClick={onClick} aria-label={label}>
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true" style={{ transform: 'translateX(-1.5px)' }}><polygon points="13,1 1,8 13,15" fill="#0A1A4A" strokeLinejoin="round" stroke="#0A1A4A" strokeWidth="1.5" /></svg>
  </button>
);

export function Providers({ d, compact }) {
  if (!d) return null;
  if (d.stream.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span className="kicker" style={{ letterSpacing: 1, color: '#FFC400' }}>DISPO SUR</span>
        {d.stream.slice(0, compact ? 3 : 6).map((p) => (
          <a key={p.provider_id} href={d.watchLink} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, background: '#fff', color: '#081440', borderRadius: 6, padding: '4px 8px 4px 4px', textDecoration: 'none', boxShadow: '0 2px 0 #081440' }}>
            <img src={img(p.logo_path, 'w92')} alt="" width="22" height="22" style={{ borderRadius: 5 }} />
            {p.provider_name.replace(/ (Standard with Ads|with Ads|Amazon Channel)$/, '')}
          </a>
        ))}
      </div>
    );
  }
  return (
    <p style={{ margin: 0, fontSize: 13, color: '#C9D3E0', lineHeight: 1.4 }}>
      <span className="kicker" style={{ letterSpacing: 1, marginRight: 6 }}>DISPO SUR</span>
      {d.rent.length
        ? <>Pas en abonnement en ce moment. En location chez {d.rent.slice(0, 2).map((p) => p.provider_name).join(', ')}.</>
        : <>Introuvable en streaming en France pour l'instant. Va falloir ressortir le lecteur DVD.</>}
    </p>
  );
}

export function Loading({ text = 'Zap fouille la réserve…' }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
      <img src="/zap/mascotte-chargement.webp" alt="" width="150" height="150" className="floaty" style={{ objectFit: 'contain', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,.5))' }} />
      <p className="russo" style={{ margin: 0, fontSize: 16, color: '#BFD6FF', textAlign: 'center' }}>{text}</p>
    </div>
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast" role="status">{msg}</div>;
}
