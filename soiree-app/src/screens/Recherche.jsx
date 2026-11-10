import React, { useEffect, useRef, useState } from 'react';
import { img, rechercher } from '../lib/tmdb.js';
import { keyOf } from '../lib/store.js';
import { Back } from '../components/ui.jsx';

// Chercher un film, une série ou une personne précise.
export default function Recherche({ lists, onClose, onOpen, onPersonne }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const t = useRef(null);
  const input = useRef(null);
  useEffect(() => { setTimeout(() => input.current?.focus(), 80); }, []);

  useEffect(() => {
    clearTimeout(t.current);
    if (q.trim().length < 2) { setRes(null); setBusy(false); return undefined; }
    setBusy(true);
    t.current = setTimeout(() => {
      rechercher(q.trim()).then(setRes).catch(() => setRes({ items: [], gens: [], err: true })).finally(() => setBusy(false));
    }, 350);
    return () => clearTimeout(t.current);
  }, [q]);

  const etat = (it) => {
    const k = keyOf(it);
    if (lists.panier.some((x) => keyOf(x) === k)) return ['AU PANIER', '#FFC400', '#0A1A4A'];
    if (lists.vus.some((x) => keyOf(x) === k)) return ['DÉJÀ VU', '#1B7A3A', '#fff'];
    if (lists.jamais.some((x) => keyOf(x) === k)) return ['JAMAIS', '#4A5878', '#fff'];
    return null;
  };

  return (
    <div className="app grid" style={{ position: 'fixed', inset: 0, zIndex: 18, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 2, padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(#050A1F 70%, rgba(5,10,31,0))' }}>
        <Back onClick={onClose} />
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ position: 'absolute', left: 14, top: 15, opacity: 0.7 }}>
            <circle cx="10" cy="10" r="7" fill="none" stroke="#0A1A4A" strokeWidth="2.6" /><path d="M15.5 15.5 21 21" stroke="#0A1A4A" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          <input ref={input} className="field" type="search" enterKeyHint="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Un film, une série, un acteur…" aria-label="Rechercher" autoCorrect="off" style={{ paddingLeft: 42 }} />
        </div>
      </div>

      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!res && !busy && (
          <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <img src="/zap/mascotte-reflechit.webp" alt="" width="130" height="150" style={{ objectFit: 'contain' }} />
            <p style={{ margin: 0, fontSize: 15, color: '#E9EEF5', lineHeight: 1.4 }}>Tu as un titre en tête ? Dis-le moi, je fouille l'arrière-boutique.</p>
          </div>
        )}
        {busy && <p style={{ margin: '10px 0', textAlign: 'center', color: '#BFD6FF' }}>Zap fouille les rayons…</p>}
        {res && !busy && !res.items.length && !res.gens.length && (
          <p style={{ margin: '20px 0', textAlign: 'center', color: '#E9EEF5' }}>{res.err ? 'Oups, la recherche a coupé. Réessaie.' : `Rien trouvé pour « ${q.trim()} ». Vérifie l'orthographe ?`}</p>
        )}

        {res && res.gens.length > 0 && onPersonne && (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -16px', padding: '2px 16px 4px', scrollbarWidth: 'none' }}>
            {res.gens.map((p) => (
              <button key={p.id} onClick={() => onPersonne(p)}
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px', borderRadius: 30, background: 'rgba(5,10,31,.6)', border: '1px solid rgba(191,214,255,.35)', color: '#fff', textAlign: 'left' }}>
                <img src={img(p.photo, 'w185')} alt="" width="38" height="38" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: '#FFC400', fontWeight: 700 }}>Swipe spécial ›</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {res && res.items.map((it) => {
          const e = etat(it);
          return (
            <button key={keyOf(it)} onClick={() => onOpen(it)}
              style={{ display: 'flex', alignItems: 'stretch', background: '#fff', color: '#081440', borderRadius: 8, boxShadow: '0 4px 0 #081440', overflow: 'hidden', border: 'none', padding: 0, textAlign: 'left', flexShrink: 0 }}>
              {it.poster
                ? <img src={img(it.poster, 'w185')} alt="" width="58" style={{ width: 58, minHeight: 86, objectFit: 'cover', flexShrink: 0, background: '#0B1230' }} />
                : <span className="russo" style={{ width: 58, minHeight: 86, flexShrink: 0, background: '#11307F', color: '#BFD6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>?</span>}
              <span style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                <span style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.1 }}>{it.title}</span>
                <span style={{ fontSize: 12, color: '#4A5878' }}>{[it.year, it.type === 'tv' ? 'Série' : 'Film', it.votes >= 20 && it.vote ? `${it.vote.toFixed(1)}/10` : ''].filter(Boolean).join(' · ')}</span>
                {e && <span className="russo" style={{ alignSelf: 'flex-start', fontSize: 10, padding: '2px 7px', borderRadius: 3, background: e[1], color: e[2] }}>{e[0]}</span>}
              </span>
              <span style={{ alignSelf: 'center', padding: '0 14px', color: '#1B4FC4', fontSize: 22 }}>›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
