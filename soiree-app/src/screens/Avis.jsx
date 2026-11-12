import React from 'react';
import { img } from '../lib/tmdb.js';

// « Alors, ce film d'hier ? » : un avis en un geste, le lendemain d'une séance.
const CHOIX = [['top', 'TOP !', 'btn-red'], ['bien', 'BIEN', 'btn-blue'], ['bof', 'BOF', 'btn-glass']];
export const AVIS_LABEL = { top: 'TOP !', bien: 'BIEN', bof: 'BOF' };

export default function Avis({ item, onAvis, onPasVu, onPlusTard }) {
  return (
    <div role="dialog" aria-label="Ton avis sur le film" style={{ position: 'fixed', inset: 0, zIndex: 45, background: 'rgba(3,6,20,.72)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480, background: 'linear-gradient(#11307F, #0A1A4A 60%, #050A1F)', borderRadius: '22px 22px 0 0', border: '1px solid rgba(191,214,255,.4)', borderBottom: 'none', padding: '18px 18px 22px', boxShadow: '0 -14px 40px rgba(0,0,0,.6)', animation: 'zl-sheet .32s ease-out both' }}>
        <style>{'@keyframes zl-sheet { from { transform: translateY(100%); } to { transform: none; } }'}</style>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <img src={img(item.poster, 'w185')} alt="" width="74" height="110" style={{ borderRadius: 4, border: '3px solid #0B0C12', objectFit: 'cover', background: '#0B1230', transform: 'rotate(-4deg)', boxShadow: '0 8px 16px rgba(0,0,0,.5)', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <span className="kicker" style={{ color: '#FFC400' }}>ZAP VEUT SAVOIR</span>
            <span className="russo" style={{ fontSize: 20, lineHeight: 1.1, color: '#fff' }}>Alors, {item.title} ?</span>
            <span style={{ fontSize: 13, color: '#BFD6FF' }}>Un geste et c'est noté sur ta carte.</span>
          </div>
          <img src="/zap/mascotte-reflechit.webp" alt="" width="62" height="84" style={{ marginLeft: 'auto', objectFit: 'contain', flexShrink: 0 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
          {CHOIX.map(([k, l, c]) => <button key={k} className={'btn ' + c} style={{ height: 54 }} onClick={() => onAvis(k)}>{l}</button>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <button className="link" style={{ color: '#BFD6FF', fontSize: 13 }} onClick={onPasVu}>Pas regardé finalement</button>
          <button className="link" style={{ color: '#8DA4D6', fontSize: 13 }} onClick={onPlusTard}>Plus tard</button>
        </div>
      </div>
    </div>
  );
}
