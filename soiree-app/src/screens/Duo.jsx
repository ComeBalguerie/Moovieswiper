import React, { useState } from 'react';
import { img } from '../lib/tmdb.js';
import { partager } from '../lib/duo.js';
import { Back, Play, Planet } from '../components/ui.jsx';

// Écran Double Programme : lancer une soirée, attendre le binôme, ou rejoindre avec un code.
export function DoubleProgramme({ soiree, partnerName, guest, onLancer, onRejoindre, onClose, onTerminer, onLogin, initialCode }) {
  const [mode, setMode] = useState(initialCode ? 'rejoindre' : 'menu');
  const [code, setCode] = useState(initialCode || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const run = async (fn) => {
    setBusy(true); setErr('');
    try { await fn(); } catch (e) { setErr(e.message || 'Oups, ça a coupé. Réessaie.'); }
    setBusy(false);
  };

  const enAttente = soiree && soiree.status === 'attente';

  return (
    <div className="app" style={{ position: 'fixed', inset: 0, zIndex: 30, margin: '0 auto', overflowY: 'auto' }}>
      <Planet top="calc(100dvh - 200px)" />
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Back onClick={onClose} />
      </div>
      <div style={{ padding: '6px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
        <img src="/zap/mascotte-duo-check.webp" alt="" width="190" height="150" style={{ objectFit: 'contain', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,.5))' }} />
        <h1 className="title-relief" style={{ fontSize: 30 }}>DOUBLE PROGRAMME</h1>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45, color: '#BFD6FF', maxWidth: 330 }}>
          Chacun swipe sur son téléphone, les mêmes films dans le même ordre. Dès que vous mettez tous les deux le même au panier : c'est un match.
        </p>
      </div>

      <div style={{ margin: 'auto 20px 26px', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {guest ? (
          <>
            <p style={{ margin: 0, textAlign: 'center', color: '#E9EEF5', fontSize: 15 }}>Pour jouer à deux, il faut une carte club.</p>
            <button className="btn btn-red" onClick={onLogin}>CRÉER MA CARTE <Play /></button>
          </>
        ) : enAttente ? (
          <>
            <p className="kicker" style={{ textAlign: 'center' }}>TON CODE DE SOIRÉE</p>
            <div className="russo" style={{ alignSelf: 'center', fontSize: 52, letterSpacing: 12, padding: '10px 18px 10px 30px', borderRadius: 18, background: 'rgba(5,10,31,.65)', border: '1px solid rgba(191,214,255,.4)', boxShadow: 'inset 0 2px 8px rgba(0,0,0,.6)', color: '#FFFFFF', textShadow: '0 0 18px rgba(77,134,240,.7)' }}>{soiree.code}</div>
            <p style={{ margin: 0, textAlign: 'center', color: '#BFD6FF', fontSize: 14 }}>En attente de ton binôme… Envoie-lui le code, l'écran se mettra à jour tout seul.</p>
            <button className="btn btn-blue" onClick={async () => { const r = await partager(soiree.code); if (r) setInfo(r === 'copié' ? 'Lien copié, colle-le dans un message.' : ''); }}>ENVOYER LE CODE</button>
            {info && <p style={{ margin: 0, textAlign: 'center', color: '#FFC400', fontSize: 13 }}>{info}</p>}
            <button className="link" style={{ color: '#BFD6FF' }} onClick={onTerminer}>Annuler la soirée</button>
          </>
        ) : soiree && soiree.status === 'live' ? (
          <>
            <p style={{ margin: 0, textAlign: 'center', color: '#E9EEF5', fontSize: 15 }}>Soirée en cours avec <strong style={{ color: '#FFC400' }}>{partnerName}</strong>.</p>
            <button className="btn btn-red" onClick={onClose}>CONTINUER À SWIPER <Play /></button>
            <button className="btn btn-glass" onClick={onTerminer}>TERMINER LA SOIRÉE</button>
          </>
        ) : mode === 'rejoindre' ? (
          <form onSubmit={(e) => { e.preventDefault(); run(() => onRejoindre(code)); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label htmlFor="dpcode" className="kicker" style={{ textAlign: 'center' }}>LE CODE DE TON BINÔME</label>
            <input id="dpcode" className="field" autoFocus value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))}
              placeholder="ABCD" autoCapitalize="characters" autoComplete="off" style={{ height: 64, fontSize: 34, letterSpacing: 12, textAlign: 'center', fontFamily: 'var(--russo)' }} />
            {err && <p role="alert" style={{ margin: 0, color: '#FF8A80', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>{err}</p>}
            <button className="btn btn-red" type="submit" disabled={busy || code.length !== 4}>{busy ? 'UN INSTANT…' : 'REJOINDRE LA SOIRÉE'} <Play /></button>
            <button type="button" className="link" style={{ color: '#BFD6FF' }} onClick={() => { setMode('menu'); setErr(''); }}>Retour</button>
          </form>
        ) : (
          <>
            {err && <p role="alert" style={{ margin: 0, color: '#FF8A80', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>{err}</p>}
            <button className="btn btn-red" disabled={busy} onClick={() => run(onLancer)}>{busy ? 'UN INSTANT…' : 'LANCER UNE SOIRÉE'} <Play /></button>
            <button className="btn btn-glass" onClick={() => setMode('rejoindre')}>J'AI UN CODE</button>
            <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#8DA4D6' }}>La soirée reprend les rayons et les filtres de celui qui la lance.</p>
          </>
        )}
      </div>
    </div>
  );
}

// L'écran du match
export function MatchDuo({ item, partnerName, onPlay, onContinue }) {
  return (
    <div className="app" style={{ position: 'fixed', inset: 0, zIndex: 40, margin: '0 auto', overflowY: 'auto' }}>
      <Planet top="calc(100dvh - 220px)" />
      <div style={{ padding: '30px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
        <h1 className="title-relief" style={{ fontSize: 46, animation: 'pop .5s cubic-bezier(.2,1.5,.4,1)' }}>MATCH !</h1>
        <p style={{ margin: 0, fontSize: 15, color: '#BFD6FF' }}>Toi et <strong style={{ color: '#FFC400' }}>{partnerName}</strong>, vous voulez voir le même film.</p>
      </div>
      <div style={{ position: 'relative', height: 330, flexShrink: 0, marginTop: 14 }}>
        <img src={img(item.poster, 'w500')} alt={`Affiche de ${item.title}`} style={{ position: 'absolute', left: '50%', marginLeft: -88, top: 0, width: 176, height: 264, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,.7)', boxShadow: '0 18px 30px rgba(0,0,0,.6)', transform: 'rotate(-3deg)' }} />
        <img src="/zap/mascotte-duo-check.webp" alt="" className="floaty" style={{ position: 'absolute', left: '50%', marginLeft: -120, top: 196, width: 240, height: 140, objectFit: 'contain', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,.5))' }} />
      </div>
      <h2 className="title-outline" style={{ fontSize: 24, textAlign: 'center', margin: '8px 20px 0' }}>{item.title}</h2>
      <div style={{ margin: 'auto 20px 26px', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-red" onClick={onPlay}>ON REGARDE ÇA ! <Play /></button>
        <button className="btn btn-glass" onClick={onContinue}>ON CONTINUE DE SWIPER</button>
      </div>
    </div>
  );
}
