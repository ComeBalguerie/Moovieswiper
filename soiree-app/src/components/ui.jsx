import React from 'react';
import { img } from '../lib/tmdb.js';

export const Play = ({ w = 14, h = 16, color = '#FFC400' }) => (
  <svg width={w} height={h} viewBox="0 0 14 16" aria-hidden="true"><polygon points="0,0 14,8 0,16" fill={color} /></svg>
);

export const Planet = ({ top }) => <div className="planet" style={{ top }} aria-hidden="true" />;

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
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><polygon points="14,0 0,8 14,16" fill="#081440" /></svg>
  </button>
);

export function Providers({ d, compact }) {
  if (!d) return null;
  if (d.stream.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span className="kicker" style={{ letterSpacing: 1 }}>DISPO SUR</span>
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
      <p className="russo" style={{ margin: 0, fontSize: 16, color: '#FFC400', textAlign: 'center' }}>{text}</p>
    </div>
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast" role="status">{msg}</div>;
}
