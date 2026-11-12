import React, { useEffect, useMemo, useState } from 'react';
import { img } from '../lib/tmdb.js';
import { keyOf } from '../lib/store.js';
import { track } from '../lib/track.js';
import { Back, Play, Planet } from '../components/ui.jsx';

// « Zap tranche » : 3 films tirés du panier, on en élimine un, puis on garde son préféré. Fini l'hésitation.
const tirer = (pool, n, sauf = []) => {
  const a = pool.filter((x) => !sauf.includes(keyOf(x)));
  const src = a.length >= n ? a : pool.slice();
  for (let i = src.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [src[i], src[j]] = [src[j], src[i]]; }
  return src.slice(0, n);
};

const CSS = `
@keyframes tr-in { from { opacity: 0; transform: translateY(30px) rotate(var(--r, 0deg)) scale(.9); } to { opacity: 1; transform: rotate(var(--r, 0deg)); } }
@keyframes tr-out { to { opacity: 0; transform: translateY(120px) rotate(18deg) scale(.7); } }
@keyframes tr-win { 0% { transform: scale(.6) rotate(-8deg); opacity: 0; } 60% { transform: scale(1.08) rotate(2deg); opacity: 1; } 100% { transform: scale(1) rotate(-2deg); } }
`;

export default function Tranche({ panier, onClose, onPlay, onFiche }) {
  const [main, setMain] = useState(() => tirer(panier, 3));
  const [sort, setSort] = useState(null); // la jaquette en train de partir
  const gagnant = main.length === 1 ? main[0] : null;
  const vus = useMemo(() => new Set(), []);
  useEffect(() => { track('tranche_debut', { n: panier.length }); }, []);
  useEffect(() => { main.forEach((m) => vus.add(keyOf(m))); if (gagnant) track('tranche_fin'); }, [main]);

  const choisir = (it) => {
    if (sort) return;
    if (main.length === 3) { // on élimine celui qu'on touche
      setSort(keyOf(it));
      setTimeout(() => { setMain((m) => m.filter((x) => keyOf(x) !== keyOf(it))); setSort(null); }, 380);
    } else if (main.length === 2) { // on garde celui qu'on touche
      const autre = main.find((x) => keyOf(x) !== keyOf(it));
      setSort(keyOf(autre));
      setTimeout(() => { setMain([it]); setSort(null); }, 380);
    }
  };
  const retirage = () => { setMain(tirer(panier, 3, [...vus])); };

  const w = main.length === 3 ? 104 : 140;
  return (
    <div className="app" style={{ position: 'fixed', inset: 0, zIndex: 19, margin: '0 auto', overflowY: 'auto' }}>
      <style>{CSS}</style>
      <Planet top="calc(100dvh - 200px)" />
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Back onClick={onClose} />
        <h1 className="title-outline" style={{ fontSize: 26 }}>ZAP TRANCHE</h1>
      </div>

      {!gagnant ? (
        <>
          <div style={{ margin: '14px 16px 0', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <img src="/zap/mascotte-reflechit.webp" alt="" width="76" height="100" style={{ flexShrink: 0, objectFit: 'contain' }} />
            <div className="bubble" style={{ flex: 1, marginBottom: 14, fontFamily: 'Archivo, sans-serif', fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>
              {main.length === 3
                ? <>J'ai sorti 3 films de ton panier. <strong>Touche celui que tu veux le moins</strong>, je le remets en rayon.</>
                : <>Plus que deux. <strong>Touche celui que tu gardes</strong> pour ce soir !</>}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: main.length === 3 ? 10 : 22, padding: '10px 12px', minHeight: 250 }}>
            {main.map((it, i) => (
              <button key={keyOf(it)} onClick={() => choisir(it)} aria-label={(main.length === 3 ? 'Éliminer ' : 'Garder ') + it.title}
                style={{ '--r': `${(i - (main.length - 1) / 2) * 5}deg`, width: w, background: 'none', border: 'none', padding: 0, color: '#fff', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
                  animation: sort === keyOf(it) ? 'tr-out .38s ease-in forwards' : `tr-in .4s ${i * 0.08}s ease-out both` }}>
                <span style={{ position: 'relative', width: w, height: w * 1.5, borderRadius: 6, overflow: 'hidden', border: '2px solid rgba(255,255,255,.8)', boxShadow: '0 14px 22px rgba(0,0,0,.55)', background: '#11307F', display: 'block' }}>
                  {it.poster && <img src={img(it.poster, 'w342')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,.28), transparent 38%)' }} />
                </span>
                <span style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.15, textAlign: 'center', transform: 'none' }}>{it.title}</span>
              </button>
            ))}
          </div>
          <div style={{ margin: '0 16px 24px', textAlign: 'center' }}>
            {panier.length > 3 && <button className="link" onClick={retirage} style={{ color: '#BFD6FF' }}>Aucun ne me tente, ressors-en 3 autres</button>}
          </div>
        </>
      ) : (
        <>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '10px 20px', textAlign: 'center' }}>
            <p className="kicker" style={{ color: '#FFC400' }}>CE SOIR, C'EST LUI</p>
            <div style={{ position: 'relative', animation: 'tr-win .55s cubic-bezier(.2,1.4,.4,1) both' }}>
              <span style={{ display: 'block', width: 170, height: 255, borderRadius: 6, overflow: 'hidden', border: '2px solid rgba(255,255,255,.85)', boxShadow: '0 18px 30px rgba(0,0,0,.6)', background: '#11307F' }}>
                {gagnant.poster && <img src={img(gagnant.poster, 'w342')} alt={`Affiche de ${gagnant.title}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </span>
              <img src="/zap/mascotte-saute-de-joie.webp" alt="" className="floaty" style={{ position: 'absolute', right: -74, bottom: -14, width: 100, height: 120, objectFit: 'contain', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,.5))' }} />
            </div>
            <h2 className="title-relief" style={{ fontSize: 26, marginTop: 6 }}>{gagnant.title.toUpperCase()}</h2>
          </div>
          <div style={{ margin: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-red" style={{ height: 58 }} onClick={() => onPlay(gagnant)}>ON REGARDE ÇA ! <Play /></button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="btn btn-glass" onClick={() => onFiche(gagnant)}>VOIR LA FICHE</button>
              <button className="btn btn-glass" onClick={retirage}>RETIRAGE</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
