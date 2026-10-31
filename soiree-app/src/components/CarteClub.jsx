import React, { useEffect, useRef, useState } from 'react';
import { PLATEFORMES } from '../lib/config.js';

// La carte club : un vrai objet en plastique, avec une tranche, qui bouge sous le doigt.
// Recto : logo, numéro embossé, prénom. Verso : les réglages (signature = prénom, abonnements).
const DEPTH = 6; // épaisseur en px
const REPOS = { x: -12, y: 7 }; // au repos, la carte est un peu de biais pour qu'on voie sa tranche

export default function CarteClub({ w = 320, number = '0000 0042', prenom, vus, abos = [], onAbos, onRename, flipped: flippedProp, onFlip, interactive = true, hint = true, style }) {
  const h = Math.round(w / 1.586);
  const [flipLocal, setFlipLocal] = useState(false);
  const flipped = flippedProp ?? flipLocal;
  const flip = (v) => { onFlip ? onFlip(v) : setFlipLocal(v); };
  const [tilt, setTilt] = useState(REPOS);
  const [name, setName] = useState(prenom || '');
  useEffect(() => { setName((prenom || '').trim()); }, [prenom]);
  const start = useRef(null);
  const box = useRef(null);
  const s = w / 320; // échelle de tout le contenu

  const move = (e) => {
    if (!interactive) return;
    const r = box.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: Math.max(-1, Math.min(1, px)) * 16, y: Math.max(-1, Math.min(1, py)) * -12 });
  };
  const down = (e) => { start.current = { x: e.clientX, y: e.clientY, t: Date.now() }; move(e); };
  const up = (e) => {
    const st = start.current; start.current = null;
    setTilt(REPOS);
    if (!interactive || flipped || !st) return;
    if (Math.hypot(e.clientX - st.x, e.clientY - st.y) < 10 && Date.now() - st.t < 400) flip(true);
  };

  const ry = flipped ? 180 - tilt.x * 0.5 : tilt.x;
  const shine = 50 + tilt.x * 2.4;
  const face = { position: 'absolute', inset: 0, borderRadius: 14 * s, overflow: 'hidden', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' };
  const toggle = (k) => onAbos && onAbos(abos.includes(k) ? abos.filter((x) => x !== k) : [...abos, k]);
  const saveName = () => { const n = name.trim(); if (onRename && n !== (prenom || '').trim()) onRename(n); };

  return (
    <div ref={box} style={{ width: w, height: h, perspective: 900, position: 'relative', touchAction: interactive && !flipped ? 'none' : 'auto', ...style }}
      onPointerDown={flipped ? undefined : down} onPointerMove={(e) => (start.current || e.pointerType === 'mouse') && !flipped && move(e)}
      onPointerUp={flipped ? undefined : up} onPointerLeave={() => { start.current = null; setTilt(REPOS); }} onPointerCancel={() => { start.current = null; setTilt(REPOS); }}>
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transition: start.current ? 'transform .08s linear' : 'transform .6s cubic-bezier(.3,1.3,.5,1)',
        transform: `rotateX(${tilt.y}deg) rotateY(${ry}deg)` }}>

        {/* la tranche : des couches empilées, comme un vrai plastique */}
        {Array.from({ length: DEPTH }, (_, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: 14 * s, transform: `translateZ(${-i - 0.5}px)`,
            background: i === 0 || i === DEPTH - 1 ? '#E9EEF5' : '#9AA6B8', boxShadow: i === DEPTH - 1 ? '0 18px 30px rgba(0,0,0,.55)' : 'none' }} />
        ))}

        {/* RECTO */}
        <div style={{ ...face, transform: 'translateZ(0.5px)', pointerEvents: flipped ? 'none' : 'auto', cursor: interactive ? 'pointer' : 'default',
          background: 'linear-gradient(160deg, #3463DA 0%, #1B4FC4 38%, #11307F 78%, #0A1A4A 100%)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.45), inset 0 2px 0 rgba(255,255,255,.5)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: `${18 * s}px ${18 * s}px` }} />
          {/* bande rouge diagonale, façon carte de vidéo club */}
          <div style={{ position: 'absolute', left: -20 * s, right: -20 * s, top: 92 * s, height: 22 * s, transform: 'rotate(-8deg)', background: 'linear-gradient(#FF4A3F, #E2231A 50%, #A3140D)', boxShadow: '0 2px 0 rgba(0,0,0,.25)' }} />
          <div style={{ position: 'absolute', left: -20 * s, right: -20 * s, top: 116 * s, height: 4 * s, transform: 'rotate(-8deg)', background: '#FFC400' }} />
          {/* hologramme DVD */}
          <div style={{ position: 'absolute', right: -34 * s, bottom: -40 * s, width: 150 * s, height: 150 * s, borderRadius: '50%',
            background: `radial-gradient(circle, #0E2470 0 9%, #E9EEF5 9.5% 13%, transparent 13.5%), conic-gradient(from ${30 + tilt.x * 6}deg, #C9D3E0, #FFFFFF, #A9E4FF, #F2C6FF, #FFFFFF, #8D99AD, #FFF3B0, #C9D3E0)`,
            boxShadow: '0 0 0 2px rgba(255,255,255,.5), inset 0 0 12px rgba(255,255,255,.6)' }} />
          <img src="/logo-mini.svg" alt="Zapette" style={{ position: 'absolute', left: 12 * s, top: 10 * s, width: 150 * s, height: 'auto', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.35))' }} />
          <span style={{ position: 'absolute', left: 16 * s, top: 62 * s, fontStyle: 'italic', fontWeight: 800, fontSize: 10.5 * s, letterSpacing: 2 * s, color: '#FFC400' }}>CARTE CLUB PRIVILÈGE ★</span>
          {/* puce dorée */}
          <div style={{ position: 'absolute', right: 22 * s, top: 18 * s, width: 40 * s, height: 30 * s, borderRadius: 6 * s,
            background: 'linear-gradient(135deg, #FFF0A0, #E0A800 45%, #FFD95A 60%, #B88600)', boxShadow: 'inset 0 0 0 1px rgba(90,60,0,.6)',
            backgroundImage: 'linear-gradient(135deg, #FFF0A0, #E0A800 45%, #FFD95A 60%, #B88600)' }}>
            <div style={{ position: 'absolute', inset: `${7 * s}px ${8 * s}px`, borderTop: '1px solid rgba(90,60,0,.55)', borderBottom: '1px solid rgba(90,60,0,.55)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', borderLeft: '1px solid rgba(90,60,0,.55)' }} />
          </div>
          {vus != null && (
            <div style={{ position: 'absolute', right: 22 * s, top: 58 * s, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#E2231A', border: `${2.5 * s}px solid #fff`, borderRadius: 7 * s, padding: `${3 * s}px ${8 * s}px`, lineHeight: 1, transform: 'rotate(6deg)', boxShadow: '0 3px 0 rgba(0,0,0,.3)' }}>
              <span className="russo" style={{ fontSize: 18 * s, color: '#fff' }}>{vus}</span>
              <span style={{ fontSize: 8 * s, fontWeight: 800, color: '#fff' }}>VUS</span>
            </div>
          )}
          {/* numéro et prénom embossés */}
          <div style={{ position: 'absolute', left: 16 * s, bottom: 14 * s, display: 'flex', flexDirection: 'column', gap: 2 * s }}>
            <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700, fontSize: 17 * s, letterSpacing: 3 * s, color: '#E9EEF5',
              textShadow: '0 -1px 0 rgba(255,255,255,.9), 0 1.5px 0 rgba(0,0,0,.55)' }}>{number}</span>
            <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700, fontSize: 15 * s, letterSpacing: 1.5 * s, color: '#FFFFFF', textTransform: 'uppercase',
              textShadow: '0 -1px 0 rgba(255,255,255,.9), 0 1.5px 0 rgba(0,0,0,.55)' }}>{(prenom || '').trim() || '[Ton prénom]'}</span>
          </div>
          {interactive && hint && (
            <span style={{ position: 'absolute', right: 16 * s, bottom: 12 * s, fontSize: 9.5 * s, fontWeight: 800, letterSpacing: 1, color: '#0A1A4A', background: 'rgba(255,255,255,.85)', borderRadius: 10, padding: `${3 * s}px ${7 * s}px` }}>RÉGLAGES ↻</span>
          )}
          {/* reflet qui suit le doigt */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen',
            background: `linear-gradient(115deg, transparent ${shine - 30}%, rgba(255,255,255,.28) ${shine - 6}%, rgba(255,255,255,.05) ${shine + 4}%, transparent ${shine + 22}%)` }} />
        </div>

        {/* VERSO : les réglages */}
        <div style={{ ...face, transform: `translateZ(${-DEPTH - 0.5}px) rotateY(180deg)`, pointerEvents: flipped ? 'auto' : 'none',
          background: 'linear-gradient(160deg, #E9EEF5, #C9D3E0 60%, #A9B6C9)', color: '#0A1A4A', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.8)' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 12 * s, height: 26 * s, background: 'linear-gradient(#1A1C24, #0B0C12 60%, #2A2D3C)' }} />
          <button onClick={() => { saveName(); flip(false); }} aria-label="Retourner la carte"
            style={{ position: 'absolute', right: 8 * s, top: 14 * s, height: 22 * s, padding: `0 ${9 * s}px`, borderRadius: 11 * s, border: '1px solid rgba(255,255,255,.6)', background: 'linear-gradient(#FFF0A0, #FFC400 55%, #F2AE00)', color: '#0A1A4A', fontWeight: 800, fontSize: 10.5 * s }}>OK ↻</button>
          <div style={{ position: 'absolute', left: 12 * s, right: 12 * s, top: 46 * s, display: 'flex', alignItems: 'center', gap: 8 * s }}>
            <span style={{ fontSize: 8.5 * s, fontWeight: 800, letterSpacing: 1, color: '#4A5878' }}>SIGNATURE</span>
            <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} maxLength={24} aria-label="Ton prénom" placeholder="Ton prénom"
              style={{ flex: 1, minWidth: 0, height: 28 * s, border: 'none', borderRadius: 3, padding: `0 ${8 * s}px`, fontSize: 17 * s, fontStyle: 'italic', fontWeight: 700, color: '#1B3FA0',
                background: 'repeating-linear-gradient(-45deg, #FFFFFF 0 6px, #F2F6FC 6px 12px)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,.25)' }} />
          </div>
          <span style={{ position: 'absolute', left: 12 * s, top: 84 * s, fontSize: 8.5 * s, fontWeight: 800, letterSpacing: 1, color: '#4A5878' }}>MES PLATEFORMES · touche pour cocher</span>
          <div style={{ position: 'absolute', left: 10 * s, right: 10 * s, top: 98 * s, display: 'flex', flexWrap: 'wrap', gap: 5 * s }}>
            {PLATEFORMES.map(([k, l]) => {
              const on = abos.includes(k);
              return (
                <button key={k} onClick={() => toggle(k)} aria-pressed={on}
                  style={{ height: 24 * s, padding: `0 ${8 * s}px`, borderRadius: 12 * s, fontSize: 11 * s, fontWeight: 800, cursor: 'pointer',
                    border: on ? '1px solid #8A5E00' : '1px dashed #8D99AD', color: on ? '#0A1A4A' : '#4A5878',
                    background: on ? 'linear-gradient(#FFF0A0, #FFC400 55%, #F2AE00)' : 'rgba(255,255,255,.55)',
                    boxShadow: on ? 'inset 0 1px 0 rgba(255,255,255,.8), 0 2px 0 rgba(0,0,0,.2)' : 'none' }}>
                  {on ? '✓ ' : ''}{l}
                </button>
              );
            })}
          </div>
          <span style={{ position: 'absolute', left: 12 * s, bottom: 8 * s, right: 12 * s, fontSize: 7.5 * s, color: '#4A5878', lineHeight: 1.3 }}>
            Carte strictement personnelle. À présenter au comptoir. Zapette décline toute responsabilité en cas de film nul choisi sans Zap.
          </span>
        </div>
      </div>
    </div>
  );
}
