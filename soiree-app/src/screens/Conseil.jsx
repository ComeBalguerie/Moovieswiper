import React, { useEffect, useState } from 'react';
import { details, img } from '../lib/tmdb.js';
import { conseil } from '../lib/zap.js';
import { metaLine } from './Deck.jsx';
import { Back, Play, Providers } from '../components/ui.jsx';

export function useDetail(item, initial) {
  const [d, setD] = useState(initial || null);
  useEffect(() => { let a = true; if (!initial) details(item).then((x) => a && setD(x)).catch(() => {}); return () => { a = false; }; }, [item?.id]);
  return d;
}

const Score = ({ label, value, unit, pct, color }) => (
  <div style={{ borderRadius: 10, background: 'linear-gradient(160deg, #FFFFFF, #C9D3E0 55%, #9AA6B8)', color: '#081440', padding: '10px 12px', boxShadow: '0 4px 0 #081440', display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontStyle: 'italic', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>{label}</span>
    <span className="russo" style={{ fontSize: 30, lineHeight: 1, color: '#1B3FA0' }}>{value}{unit && <span style={{ fontSize: 15 }}>{unit}</span>}</span>
    <span style={{ height: 8, borderRadius: 4, background: '#081440', overflow: 'hidden', display: 'flex' }}><span style={{ width: `${pct}%`, background: color }} /></span>
  </div>
);

export default function Conseil({ item, detail, inPanier, onClose, onPanier, onTonight }) {
  const d = useDetail(item, detail);
  const votesPct = Math.min(100, Math.round((Math.log10(Math.max(1, item.votes)) / 4.5) * 100));
  return (
    <div className="app grid" style={{ position: 'fixed', inset: 0, zIndex: 20, margin: '0 auto', overflowY: 'auto' }}>
      <div className="stars" style={{ position: 'relative', minHeight: 190, flexShrink: 0, overflow: 'hidden', paddingBottom: 40 }}>
        <div className="planet" style={{ zIndex: 0, top: 150, height: 400, left: -120, right: -120 }} />
        <div style={{ position: 'relative', padding: '16px 16px 0', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <Back onClick={onClose} label="Retour à la jaquette" />
          <img src={img(item.poster, 'w185')} alt="" width="78" height="116" style={{ flexShrink: 0, borderRadius: 4, border: '3px solid #0B0C12', boxShadow: '0 8px 18px rgba(0,0,0,.6)', objectFit: 'cover', background: '#0B1230' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4, minWidth: 0 }}>
            <h1 className="title-outline" style={{ fontSize: 23, lineHeight: 0.98, WebkitTextStroke: '5px #0E2470', textShadow: '3px 3px 0 #E2231A' }}>{item.title.toUpperCase()}</h1>
            <span style={{ fontSize: 13, color: '#C9D3E0' }}>{metaLine(item, d)}</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', margin: '-22px 18px 0', transform: 'rotate(-1.5deg)', background: '#FFC400', color: '#081440', borderRadius: 6, boxShadow: '0 6px 0 #9E7300, 0 14px 24px rgba(0,0,0,.35)' }}>
        <img src="/zap/mascotte-reflechit.webp" alt="" style={{ position: 'absolute', right: -6, top: -62, width: 80, height: 116, objectFit: 'contain', objectPosition: 'bottom', zIndex: 2, filter: 'drop-shadow(0 6px 6px rgba(0,0,0,.4))' }} />
        <div style={{ background: '#E2231A', color: '#fff', padding: '10px 90px 10px 14px', borderRadius: '6px 6px 0 0', display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span className="russo" style={{ fontSize: 16, letterSpacing: 0.5 }}>LE CONSEIL DE ZAP</span>
          <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>ton vendeur préféré™ (le seul)</span>
        </div>
        <p style={{ margin: 0, padding: '12px 14px 6px', fontSize: 16, fontWeight: 500, lineHeight: 1.35 }}>{conseil(item, d)}</p>
        <p style={{ margin: 0, padding: '0 14px 10px', fontSize: 11, fontWeight: 700, color: '#6B4C00' }}>
          D'après {d?.press ? 'la presse, ' : ''}les spectateurs et mon flair légendaire®
        </p>
      </div>

      <div style={{ margin: '22px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        {d?.press
          ? <Score label="PRESSE" value={d.press.score} unit={d.press.source === 'Metacritic' ? '/100' : '%'} pct={d.press.score} color="#E2231A" />
          : <Score label="VOTES" value={item.votes >= 1000 ? `${Math.round(item.votes / 100) / 10}k` : item.votes} pct={votesPct} color="#E2231A" />}
        <Score label="SPECTATEURS" value={item.vote.toFixed(1)} unit="/10" pct={item.vote * 10} color="#FFC400" />
      </div>

      {(d?.overview || item.overview) && (
        <p style={{ margin: '18px 16px 0', fontSize: 14, lineHeight: 1.45, color: '#E9EEF5' }}>
          <span className="kicker" style={{ letterSpacing: 1, marginRight: 6 }}>L'HISTOIRE</span>{d?.overview || item.overview}
        </p>
      )}

      <div style={{ margin: '18px 16px 0' }}><Providers d={d} /></div>

      <div style={{ margin: 'auto 16px 24px', paddingTop: 22, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {d?.trailer
          ? <a className="btn btn-navy" href={d.trailer} target="_blank" rel="noreferrer"><Play w={12} h={14} />BANDE-ANNONCE</a>
          : <button className="btn btn-navy" disabled style={{ opacity: 0.5 }}>PAS DE B.A.</button>}
        <button className="btn btn-white" onClick={() => onPanier(item)} disabled={inPanier}>{inPanier ? 'DANS LE PANIER ✓' : 'AU PANIER'}</button>
        <button className="btn btn-red" style={{ gridColumn: 'span 2', height: 60 }} onClick={() => onTonight(item, d)}>JE LE PRENDS CE SOIR <Play /></button>
      </div>
    </div>
  );
}
