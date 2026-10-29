import React from 'react';
import { img } from '../lib/tmdb.js';
import { useDetail } from './Conseil.jsx';
import { metaLine } from './Deck.jsx';
import { Play, Planet, Providers } from '../components/ui.jsx';

const SPARKS = [[8, 18, 22], [86, 12, 16], [14, 52, 12], [90, 46, 20], [72, 30, 10], [24, 30, 9]];

export default function Match({ item, detail, onWatch, onClose }) {
  const d = useDetail(item, detail);
  return (
    <div className="app" style={{ position: 'fixed', inset: 0, zIndex: 30, margin: '0 auto', overflowY: 'auto' }}>
      <Planet top="calc(100dvh - 300px)" />
      {SPARKS.map(([x, y, s], i) => (
        <svg key={i} width={s * 2} height={s * 2} viewBox="-14 -14 28 28" aria-hidden="true" style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, animation: `twinkle ${1.6 + i * 0.3}s ease-in-out infinite` }}>
          <path d="M0,-14 C2,-3 3,-2 14,0 C3,2 2,3 0,14 C-2,3 -3,2 -14,0 C-3,-2 -2,-3 0,-14Z" fill={i % 2 ? '#FFC400' : '#fff'} />
        </svg>
      ))}
      <div style={{ marginTop: 18, background: 'linear-gradient(#FFD43A, #F2B200)', borderTop: '3px solid #FFF2A8', borderBottom: '4px solid #9E7300', padding: '8px 16px 6px', transform: 'rotate(-2deg)', marginLeft: -10, marginRight: -10 }}>
        <h1 className="russo" style={{ margin: 0, fontSize: 36, lineHeight: 1, color: '#E2231A', textShadow: '2px 2px 0 #fff, 4px 4px 0 #6B0A06', textAlign: 'center' }}>FILM DU SOIR !</h1>
      </div>
      <p className="russo" style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 13, color: '#FFC400', letterSpacing: 1 }}>SATISFAIT OU REMBOBINÉ !</p>

      <div style={{ position: 'relative', height: 300, flexShrink: 0, marginTop: 10 }}>
        <img src={img(item.poster, 'w500')} alt={`Affiche de ${item.title}`} style={{ position: 'absolute', left: '50%', marginLeft: -130, top: 6, width: 170, height: 255, objectFit: 'cover', borderRadius: 6, border: '4px solid #0B0C12', transform: 'rotate(-6deg)', boxShadow: '0 18px 30px rgba(0,0,0,.6)' }} />
        <img src="/zap/mascotte-match.webp" alt="" className="floaty" style={{ position: 'absolute', left: '50%', marginLeft: 10, top: 50, width: 170, height: 230, objectFit: 'contain', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,.5))' }} />
      </div>

      <div style={{ margin: '0 20px', textAlign: 'center' }}>
        <h2 className="title-outline" style={{ fontSize: 26, lineHeight: 1 }}>{item.title.toUpperCase()}</h2>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#C9D3E0' }}>{metaLine(item, d)}</p>
      </div>

      <div style={{ margin: '16px 16px 0', background: 'rgba(8,20,64,.8)', border: '2px dashed #FFC400', borderRadius: 10, padding: 12 }}>
        <Providers d={d} />
      </div>

      <div style={{ margin: 'auto 16px 24px', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          {d?.trailer
            ? <a className="btn btn-navy" href={d.trailer} target="_blank" rel="noreferrer"><Play w={12} h={14} />BANDE-ANNONCE</a>
            : <button className="btn btn-navy" disabled style={{ opacity: 0.5 }}>PAS DE B.A.</button>}
          <button className="btn btn-white" onClick={onClose}>CHANGER D'AVIS</button>
        </div>
        <button className="btn btn-red" style={{ height: 62, fontSize: 20 }} onClick={() => onWatch(item)}>C'EST PARTI ! <Play /></button>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#C9D3E0' }}>On le range dans tes « déjà vus » au passage.</p>
      </div>
    </div>
  );
}
