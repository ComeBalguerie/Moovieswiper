import React, { useState } from 'react';
import CarteClub from '../components/CarteClub.jsx';
import { Planet, Play } from '../components/ui.jsx';

// Petit parcours de première visite : Zap présente le club en 4 écrans.
const CSS = `
@keyframes tz-wiggle { 0%, 100% { transform: translateX(0) rotate(0); } 20% { transform: translateX(46px) rotate(9deg); } 40% { transform: translateX(0) rotate(0); }
  60% { transform: translateX(-46px) rotate(-9deg); } 80% { transform: translateY(0); } 88% { transform: translateY(26px); } }
@keyframes tz-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
`;

function Geste({ dir, label, color }) {
  const pos = { right: { right: -96, top: 90 }, left: { left: -96, top: 90 }, down: { left: '50%', bottom: -34, transform: 'translateX(-50%)' }, tap: { left: '50%', top: -30, transform: 'translateX(-50%)' } }[dir];
  const fl = { right: '→', left: '←', down: '↓', tap: '☝' }[dir];
  return (
    <span className="russo" style={{ position: 'absolute', ...pos, zIndex: 3, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, whiteSpace: 'nowrap', padding: '4px 9px', borderRadius: 12, background: color, color: color === '#FFC400' ? '#0A1A4A' : '#fff', border: '1.5px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,.4)' }}>
      {dir === 'left' && fl} {label} {dir !== 'left' && fl}
    </span>
  );
}

const ETAPES = [
  {
    titre: 'BIENVENUE AU CLUB !',
    texte: 'Moi c\'est Zap, ton vendeur préféré. Chaque soir je te sors des films de mes rayons, et toi tu choisis. Pas besoin de scroller pendant une heure.',
    visuel: () => <img src="/zap/mascotte-accueil.webp" alt="" width="220" height="250" style={{ objectFit: 'contain', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,.5))' }} />,
  },
  {
    titre: 'ÇA SE JOUE AU DOIGT',
    texte: 'Glisse la jaquette : à droite, au panier. À gauche, tu passes. Vers le bas, tu ne la revois jamais. Et si tu la touches, je te dis tout sur le film.',
    visuel: () => (
      <div style={{ position: 'relative', width: 150, height: 210, margin: '30px 0 40px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 6, animation: 'tz-wiggle 4.5s ease-in-out infinite',
          background: 'linear-gradient(160deg, #3463DA, #11307F 60%, #0A1A4A)', border: '2px solid rgba(255,255,255,.7)', boxShadow: '0 14px 24px rgba(0,0,0,.55)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 14, right: 14, top: 18, height: 110, borderRadius: 4, background: 'radial-gradient(circle at 65% 30%, #FFE7A8 0 14%, transparent 15%), linear-gradient(#2A1F5C, #0B0C12)' }} />
          <div style={{ position: 'absolute', left: 14, right: 40, top: 142, height: 10, borderRadius: 3, background: '#E2231A' }} />
          <div style={{ position: 'absolute', left: 14, right: 70, top: 160, height: 7, borderRadius: 3, background: 'rgba(255,255,255,.5)' }} />
        </div>
        <Geste dir="right" label="PANIER" color="#FFC400" />
        <Geste dir="left" label="PASSER" color="#11307F" />
        <Geste dir="down" label="JAMAIS" color="#E2231A" />
        <Geste dir="tap" label="CONSEIL DE ZAP" color="#1B4FC4" />
      </div>
    ),
  },
  {
    titre: 'TA CARTE CLUB',
    texte: 'Elle est dans ton panier. Touche-la pour la retourner : derrière, ton prénom et tes plateformes. Ensuite, active « Dispo sur mes plateformes » pour ne voir que ce que tu peux regarder.',
    visuel: () => <div style={{ margin: '24px 0 18px' }}><CarteClub w={280} prenom="Ton prénom" interactive={false} /></div>,
  },
  {
    titre: 'ET À PLUSIEURS',
    texte: 'Ajoute tes potes pour vous conseiller des films. Et pour choisir à deux, lance un Double Programme : chacun swipe sur son téléphone, et dès que vous aimez le même, c\'est un match !',
    visuel: () => <img src="/zap/mascotte-duo-check.webp" alt="" width="250" height="200" style={{ objectFit: 'contain', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,.5))' }} />,
  },
];

export default function Tuto({ onDone }) {
  const [i, setI] = useState(0);
  const e = ETAPES[i];
  const last = i === ETAPES.length - 1;
  return (
    <div className="app" style={{ position: 'fixed', inset: 0, zIndex: 50, margin: '0 auto', overflowY: 'auto' }}>
      <style>{CSS}</style>
      <Planet top="calc(100dvh - 210px)" />
      <div style={{ padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }} aria-label={`Étape ${i + 1} sur ${ETAPES.length}`}>
          {ETAPES.map((_, k) => <span key={k} style={{ width: k === i ? 22 : 8, height: 8, borderRadius: 4, background: k === i ? '#FFC400' : 'rgba(191,214,255,.4)', transition: 'width .2s' }} />)}
        </div>
        {!last && <button className="link" onClick={onDone} style={{ color: '#BFD6FF' }}>Passer</button>}
      </div>

      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '10px 24px 0', animation: 'tz-in .35s ease-out both' }}>
        {e.visuel()}
        <h1 className="title-relief" style={{ fontSize: 30, marginTop: 6 }}>{e.titre}</h1>
        <p style={{ margin: '12px 0 0', fontSize: 16, lineHeight: 1.45, color: '#E9EEF5', maxWidth: 340 }}>{e.texte}</p>
      </div>

      <div style={{ margin: '0 16px 24px', paddingTop: 22, display: 'flex', gap: 10, position: 'relative' }}>
        {i > 0 && <button className="btn btn-glass" onClick={() => setI(i - 1)} style={{ width: 96 }}>RETOUR</button>}
        <button className="btn btn-red" style={{ flex: 1, height: 58 }} onClick={() => (last ? onDone() : setI(i + 1))}>{last ? 'C\'EST PARTI' : 'SUIVANT'} <Play /></button>
      </div>
    </div>
  );
}
