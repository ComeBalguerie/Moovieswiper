import React, { useEffect, useState } from 'react';
import { img } from '../lib/tmdb.js';
import { useDetail } from './Conseil.jsx';
import { Play, Planet, Providers } from '../components/ui.jsx';

// Fin de parcours : le DVD sort, se pose sur le tiroir du lecteur, le tiroir se referme, PLAY.
const CSS = `
@keyframes zl-tray { 0% { transform: rotateX(-62deg) translateY(-104%); } 16% { transform: rotateX(-62deg) translateY(0); }
  58% { transform: rotateX(-62deg) translateY(0); } 74%, 100% { transform: rotateX(-62deg) translateY(-104%); } }
@keyframes zl-disc { 0%, 14% { transform: translate(-50%, -50%) translateY(-300px) translateZ(140px) rotate(0); opacity: 0; }
  18% { opacity: 1; } 40% { transform: translate(-50%, -50%) translateZ(3px) rotate(200deg); }
  44% { transform: translate(-50%, -50%) translateZ(12px) rotate(230deg); }
  48%, 100% { transform: translate(-50%, -50%) translateZ(3px) rotate(260deg); opacity: 1; } }
@keyframes zl-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
@keyframes zl-blink { 50% { opacity: .25; } }
@keyframes zl-led { 0%, 100% { box-shadow: 0 0 4px #4CFF8A; } 50% { box-shadow: 0 0 10px #4CFF8A; } }
`;

export default function Lecture({ item, detail, onClose, onCancel }) {
  const d = useDetail(item, detail);
  const [phase, setPhase] = useState(0); // 0 tiroir, 1 chargement, 2 play
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2300);
    const t2 = setTimeout(() => setPhase(2), 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  useEffect(() => {
    if (phase !== 2) return undefined;
    const i = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, [phase]);

  const lcd = phase === 0 ? 'OPEN' : phase === 1 ? 'LOADING' : `▶ 0:00:${String(secs).padStart(2, '0')}`;
  const where = d?.stream?.length ? d.stream.slice(0, 2).map((p) => p.provider_name.replace(/ (Standard with Ads|with Ads|Amazon Channel)$/, '')).join(' ou ') : null;

  return (
    <div className="app" style={{ position: 'fixed', inset: 0, zIndex: 35, margin: '0 auto', overflowY: 'auto' }}>
      <style>{CSS}</style>
      <Planet top="calc(100dvh - 230px)" />

      <div style={{ flexShrink: 0, height: 360, position: 'relative', marginTop: 24 }}>
        {/* le lecteur */}
        <div style={{ position: 'absolute', left: '50%', top: 70, width: 300, marginLeft: -150, height: 92, zIndex: 3, borderRadius: '12px 12px 6px 6px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #DDE4EE 30%, #A9B6C9 62%, #C9D3E0 82%, #8D99AD 100%)',
          boxShadow: 'inset 0 2px 0 #fff, inset 0 -2px 0 rgba(8,20,64,.35), 0 18px 30px rgba(0,0,0,.55)' }}>
          <div style={{ position: 'absolute', left: 14, top: 12, fontFamily: 'var(--russo)', fontStyle: 'italic', fontSize: 11, color: '#1B3FA0', letterSpacing: 1 }}>ZAPETTE <span style={{ color: '#E2231A' }}>DVD</span></div>
          <div style={{ position: 'absolute', right: 14, top: 14, width: 150, height: 40, borderRadius: 6, background: 'linear-gradient(#0B1A2E, #050B16)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,.8), 0 1px 0 rgba(255,255,255,.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700, fontSize: 18, letterSpacing: 2, color: '#6CF2FF', textShadow: '0 0 8px rgba(108,242,255,.8)' }}>
            <span style={{ animation: phase === 1 ? 'zl-blink .5s steps(1) infinite' : 'none' }}>{lcd}</span>
          </div>
          <div style={{ position: 'absolute', left: 16, top: 40, display: 'flex', gap: 8 }}>
            {[0, 1, 2].map((i) => <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fff, #A9B6C9 60%, #6E7A90)', boxShadow: '0 1px 0 rgba(8,20,64,.4)' }} />)}
            <span style={{ width: 8, height: 8, marginTop: 4, borderRadius: '50%', background: phase === 2 ? '#4CFF8A' : '#2B6B45', animation: phase === 2 ? 'zl-led 1.2s infinite' : 'none' }} />
          </div>
          <div style={{ position: 'absolute', left: 30, right: 30, bottom: 0, height: 6, borderRadius: '3px 3px 0 0', background: '#0B0C12' }} />
        </div>

        {/* le tiroir, qui sort sous le lecteur */}
        <div style={{ position: 'absolute', left: '50%', top: 162, width: 240, marginLeft: -120, height: 190, perspective: 700, zIndex: 2, clipPath: 'inset(0 -60% -80% -60%)' }}>
          <div style={{ position: 'absolute', inset: 0, transformOrigin: 'center top', transformStyle: 'preserve-3d', animation: 'zl-tray 3s ease-in-out forwards',
            background: 'linear-gradient(180deg, #2A2D3C, #14161F)', borderRadius: '0 0 10px 10px', boxShadow: 'inset 0 0 0 2px #3A3E52' }}>
            <div style={{ position: 'absolute', left: '50%', top: '50%', width: 170, height: 170, margin: '-85px 0 0 -85px', borderRadius: '50%', background: '#0B0C12', boxShadow: 'inset 0 3px 8px rgba(0,0,0,.8)' }} />
            <div style={{ position: 'absolute', left: '50%', top: '50%', width: 160, height: 160, borderRadius: '50%', animation: 'zl-disc 3s ease-in forwards',
              background: 'radial-gradient(circle, #1B3FA0 0 7%, #E9EEF5 7.5% 11%, transparent 11.5%), conic-gradient(from 20deg, #C9D3E0, #FFFFFF, #8D99AD, #F2C6FF, #E9EEF5, #A9E4FF, #FFFFFF, #8D99AD, #C9D3E0)',
              boxShadow: '0 0 0 2px rgba(255,255,255,.6)' }}>
              {item.poster && <div style={{ position: 'absolute', inset: '20%', borderRadius: '50%', backgroundImage: `url(${img(item.poster, 'w185')})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.7)' }} />}
              <div style={{ position: 'absolute', left: '50%', top: '50%', width: 18, height: 18, margin: '-9px 0 0 -9px', borderRadius: '50%', background: '#14161F', boxShadow: '0 0 0 3px #E9EEF5' }} />
            </div>
          </div>
        </div>

        {phase === 2 && (
          <img src="/zap/mascotte-saute-de-joie.webp" alt="" className="floaty" style={{ position: 'absolute', right: 6, top: 150, width: 120, height: 140, objectFit: 'contain', zIndex: 4, animation: 'zl-up .5s ease-out both', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,.5))' }} />
        )}
      </div>

      {phase === 2 && (
        <div style={{ margin: '0 20px', textAlign: 'center', animation: 'zl-up .5s ease-out both', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h1 className="title-outline" style={{ fontSize: 34 }}>BONNE SÉANCE !</h1>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.4, color: '#E9EEF5' }}>
            <strong style={{ color: '#fff' }}>{item.title}</strong> est rangé dans tes déjà vus.
            {where ? <> Allume la télé et lance-le sur <strong style={{ color: '#FFC400' }}>{where}</strong>.</> : <> Allume la télé, Zap éteint la lumière.</>}
          </p>
          {d && !where && <div style={{ display: 'flex', justifyContent: 'center' }}><Providers d={d} compact /></div>}
        </div>
      )}

      {phase === 2 && (
        <div style={{ margin: 'auto 16px 22px', paddingTop: 22, display: 'flex', flexDirection: 'column', gap: 8, animation: 'zl-up .5s .15s ease-out both' }}>
          <button className="btn btn-red" style={{ height: 58 }} onClick={onClose}>RETOUR AU CLUB <Play /></button>
          <button className="link" style={{ color: '#C9D3E0' }} onClick={onCancel}>Oups, pas celui-là</button>
        </div>
      )}
    </div>
  );
}
