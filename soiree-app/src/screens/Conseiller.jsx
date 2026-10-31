import React, { useEffect, useState } from 'react';
import { img } from '../lib/tmdb.js';
import { destinatairesRecents, envoyerConseil } from '../lib/conseils.js';
import { Back, Play } from '../components/ui.jsx';

// "Conseiller ce film" : choisir un membre (pseudo), ajouter un petit mot, envoyer.
const norm = (x) => (x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function Conseiller({ item, userId, potes = [], onPotes, onClose, onSent }) {
  const [q, setQ] = useState('');
  const [recents, setRecents] = useState([]);
  const [cible, setCible] = useState(null);
  const [mot, setMot] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { destinatairesRecents(userId).then((r) => setRecents(r.map((x) => x.id))).catch(() => {}); }, [userId]);

  // suggestions : uniquement parmi mes potes, dès la première lettre ; sans recherche, les derniers destinataires d'abord
  const liste = q.trim()
    ? potes.filter((m) => norm(m.prenom).split(/[\s.\-_]+/).some((w) => w.startsWith(norm(q.trim()))) || norm(m.prenom).startsWith(norm(q.trim())))
    : [...potes].sort((a, b) => (recents.indexOf(a.id) + 1 || 99) - (recents.indexOf(b.id) + 1 || 99));

  const envoyer = async () => {
    if (!cible) return;
    setBusy(true); setErr('');
    try { await envoyerConseil(cible.id, item, mot); onSent(cible); } catch (e) { setErr('Envoi raté, réessaie.'); setBusy(false); }
  };

  const Chip = ({ m }) => (
    <button type="button" className={'chip' + (cible?.id === m.id ? ' on' : '')} onClick={() => setCible(m)}><span className="hole" />{m.prenom}</button>
  );

  return (
    <div className="app" style={{ position: 'fixed', inset: 0, zIndex: 32, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Back onClick={onClose} />
        <h1 className="title-outline" style={{ fontSize: 26 }}>CONSEILLER</h1>
      </div>

      <div style={{ margin: '18px 16px 0', display: 'flex', gap: 14, alignItems: 'center' }}>
        <img src={img(item.poster, 'w185')} alt="" width="70" height="104" style={{ borderRadius: 4, border: '3px solid #0B0C12', objectFit: 'cover', background: '#0B1230', transform: 'rotate(-4deg)', boxShadow: '0 8px 16px rgba(0,0,0,.5)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span className="russo" style={{ fontSize: 19, lineHeight: 1.1 }}>{item.title}</span>
          <span style={{ fontSize: 14, color: '#BFD6FF', lineHeight: 1.35 }}>Le film arrivera en tête de sa prochaine pile, avec ton nom dessus.</span>
        </div>
      </div>

      <div style={{ margin: '22px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p className="kicker" style={{ margin: 0 }}>À QUI ?</p>
        {potes.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, borderRadius: 12, background: 'rgba(5,10,31,.55)', border: '1px solid rgba(191,214,255,.25)' }}>
            <span style={{ fontSize: 15 }}>Tu n'as pas encore de potes sur Zapette. Ajoute-en un pour lui conseiller ce film.</span>
            <button type="button" className="btn btn-blue" onClick={onPotes} style={{ height: 44, fontSize: 14 }}>AJOUTER UN POTE</button>
          </div>
        ) : (
          <>
            {<input id="cpseudo" className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tape le début d'un prénom…" autoCapitalize="none" autoCorrect="off" spellCheck={false} />}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {liste.slice(0, 12).map((m) => <Chip key={m.id} m={m} />)}
              {q.trim() && !liste.length && <span style={{ fontSize: 14, color: '#8DA4D6' }}>Aucun pote avec ce nom.</span>}
            </div>
            <button type="button" className="link" onClick={onPotes} style={{ alignSelf: 'flex-start', padding: 0, fontSize: 13, color: '#BFD6FF' }}>+ Ajouter un pote</button>
          </>
        )}

        <label htmlFor="cmot" className="kicker" style={{ marginTop: 8 }}>UN PETIT MOT ? <span style={{ fontWeight: 500, letterSpacing: 0, color: '#8DA4D6' }}>(facultatif)</span></label>
        <textarea id="cmot" className="field" value={mot} onChange={(e) => setMot(e.target.value.slice(0, 140))} rows={3} placeholder="La fin m'a retourné…" style={{ height: 'auto', padding: '10px 12px', resize: 'none', lineHeight: 1.35, fontFamily: 'inherit', fontSize: 16 }} />
        {err && <p role="alert" style={{ margin: 0, color: '#FF8A80', fontWeight: 700, fontSize: 14 }}>{err}</p>}
      </div>

      <div style={{ margin: 'auto 16px 24px', paddingTop: 22 }}>
        <button className="btn btn-red" style={{ width: '100%', height: 58 }} disabled={!cible || busy} onClick={envoyer}>
          {busy ? 'UN INSTANT…' : cible ? `ENVOYER À ${cible.prenom.toUpperCase()}` : 'CHOISIS UN POTE'} <Play />
        </button>
      </div>
    </div>
  );
}
