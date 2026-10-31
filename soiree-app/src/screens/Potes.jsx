import React, { useState } from 'react';
import { demanderPote, inviter, repondrePote, retirerPote } from '../lib/potes.js';
import { Back, Play } from '../components/ui.jsx';

const Rond = ({ nom, size = 40, on }) => (
  <span className="russo" style={{ width: size, height: size, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42,
    background: on ? 'linear-gradient(#FFF0A0, #FFC400 55%, #F2AE00)' : 'linear-gradient(160deg, #3463DA, #11307F)', color: on ? '#0A1A4A' : '#fff',
    boxShadow: '0 0 0 2px rgba(255,255,255,.5), 0 4px 8px rgba(0,0,0,.4)' }}>{(nom || '?').trim().charAt(0).toUpperCase()}</span>
);
export { Rond };

export default function Potes({ userId, prenom, data, onRefresh, onClose }) {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [retrait, setRetrait] = useState(null);

  const ajouter = async (e) => {
    e.preventDefault();
    if (q.trim().length < 2) return;
    setBusy(true); setMsg(null);
    try {
      const r = await demanderPote(q);
      setMsg({ ok: true, t: r?.status === 'ok' ? `Toi et ${r.prenom}, vous êtes potes !` : `Demande envoyée à ${r?.prenom}. Dès qu'il ou elle accepte, vous serez potes.` });
      setQ(''); onRefresh();
    } catch (er) { setMsg({ ok: false, t: er.message }); }
    setBusy(false);
  };
  const repondre = async (id, ok) => { await repondrePote(id, ok).catch(() => {}); onRefresh(); };
  const retirer = async (id) => { await retirerPote(userId, id).catch(() => {}); setRetrait(null); onRefresh(); };

  const Ligne = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(5,10,31,.55)', border: '1px solid rgba(191,214,255,.25)' }}>{children}</div>
  );

  return (
    <div className="app" style={{ position: 'fixed', inset: 0, zIndex: 34, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Back onClick={onClose} />
        <h1 className="title-outline" style={{ fontSize: 28 }}>MES POTES</h1>
        <img src="/zap/mascotte-duo-check.webp" alt="" width="92" height="74" style={{ marginLeft: 'auto', objectFit: 'contain', margin: '-10px -6px -12px auto' }} />
      </div>

      <div style={{ margin: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {data.recues.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="kicker">ILS VEULENT T'AJOUTER</p>
            {data.recues.map((m) => (
              <Ligne key={m.id}>
                <Rond nom={m.prenom} on />
                <span style={{ flex: 1, fontWeight: 800, fontSize: 16 }}>{m.prenom}</span>
                <button className="btn btn-red" onClick={() => repondre(m.id, true)} style={{ height: 36, padding: '0 12px', fontSize: 13 }}>ACCEPTER</button>
                <button className="link" onClick={() => repondre(m.id, false)} style={{ color: '#BFD6FF', fontSize: 13 }}>Refuser</button>
              </Ligne>
            ))}
          </section>
        )}

        <form onSubmit={ajouter} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="ppseudo" className="kicker">AJOUTER UN POTE</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="ppseudo" className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Son pseudo exact" autoCapitalize="none" autoCorrect="off" spellCheck={false} style={{ flex: 1, minWidth: 0 }} />
            <button className="btn btn-blue" type="submit" disabled={busy || q.trim().length < 2} style={{ height: 48, padding: '0 14px', fontSize: 14 }}>{busy ? '…' : 'AJOUTER'}</button>
          </div>
          {msg && <p role="status" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: msg.ok ? '#FFC400' : '#FF8A80' }}>{msg.t}</p>}
        </form>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="kicker">PAS ENCORE SUR ZAPETTE ?</p>
          <button className="btn btn-glass" onClick={async () => { const r = await inviter(userId, prenom); if (r === 'copié') setMsg({ ok: true, t: 'Lien copié, colle-le dans un message.' }); }}>ENVOYER MON LIEN D'INVITATION <Play /></button>
          <span style={{ fontSize: 13, color: '#8DA4D6' }}>Celui ou celle qui crée sa carte avec ton lien devient ton pote directement.</span>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="kicker">MES POTES{data.potes.length ? ` · ${data.potes.length}` : ''}</p>
          {data.potes.length === 0 && <p style={{ margin: 0, fontSize: 15, color: '#E9EEF5' }}>Personne pour l'instant. Ajoute un pseudo ou envoie ton lien.</p>}
          {data.potes.map((m) => (
            <Ligne key={m.id}>
              <Rond nom={m.prenom} />
              <span style={{ flex: 1, fontWeight: 800, fontSize: 16 }}>{m.prenom}</span>
              {retrait === m.id
                ? <><button className="link" onClick={() => retirer(m.id)} style={{ color: '#FF8A80', fontSize: 13 }}>Confirmer</button><button className="link" onClick={() => setRetrait(null)} style={{ color: '#BFD6FF', fontSize: 13 }}>Non</button></>
                : <button className="link" onClick={() => setRetrait(m.id)} style={{ color: '#8DA4D6', fontSize: 13 }}>Retirer</button>}
            </Ligne>
          ))}
          {data.envoyees.map((m) => (
            <Ligne key={m.id}>
              <Rond nom={m.prenom} />
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: '#BFD6FF' }}>{m.prenom} <span style={{ fontWeight: 500, fontSize: 13 }}>· en attente</span></span>
              <button className="link" onClick={() => retirer(m.id)} style={{ color: '#8DA4D6', fontSize: 13 }}>Annuler</button>
            </Ligne>
          ))}
        </section>
      </div>
    </div>
  );
}
