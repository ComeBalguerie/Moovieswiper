import React, { useState } from 'react';
import { img } from '../lib/tmdb.js';
import { keyOf } from '../lib/store.js';
import { Back } from '../components/ui.jsx';

const TABS = [['panier', 'PANIER'], ['vus', 'DÉJÀ VUS'], ['jamais', 'JAMAIS']];

export default function Panier({ lists, prenom, number, guest, onClose, onTonight, onRemove, onRename, onLogout, onLogin }) {
  const [tab, setTab] = useState('panier');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(prenom);
  const items = lists[tab];

  return (
    <div className="app grid" style={{ position: 'fixed', inset: 0, zIndex: 20, margin: '0 auto' }}>
      <div className="stars" style={{ position: 'relative', flexShrink: 0, padding: '16px 16px 20px', borderBottom: '4px solid #3B6FE0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Back onClick={onClose} />
          <h1 className="title-outline" style={{ fontSize: 30 }}>MON PANIER</h1>
          <img src={lists.panier.length ? '/zap/objets-panier-plein.webp' : '/zap/objets-panier-vide.webp'} alt="" style={{ width: 86, height: 80, margin: '-18px -4px -22px auto', objectFit: 'contain', transform: 'rotate(8deg)', filter: 'drop-shadow(0 8px 8px rgba(0,0,0,.55))' }} />
        </div>
        <div style={{ position: 'relative', minHeight: 92, borderRadius: 10, overflow: 'hidden', background: 'linear-gradient(160deg, #2A55C8 0%, #1B3FA0 45%, #0E2470 100%)', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', gap: 10 }}>
          <div style={{ position: 'absolute', right: -30, top: -26, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, #0E2470 0 9%, #E9EEF5 9.5% 13%, transparent 13.5%), conic-gradient(from 30deg, #C9D3E0, #FFFFFF, #8D99AD, #E9EEF5, #A9B6C9, #FFFFFF, #8D99AD, #C9D3E0)', opacity: 0.9 }} />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <span style={{ fontStyle: 'italic', fontWeight: 800, fontSize: 11, letterSpacing: 2, color: '#FFC400' }}>{guest ? 'VISITEUR · SANS CARTE' : `CARTE CLUB · ${number}`}</span>
            {editing ? (
              <form onSubmit={(e) => { e.preventDefault(); onRename(name.trim()); setEditing(false); }} style={{ display: 'flex', gap: 6 }}>
                <input className="field" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={24} style={{ height: 36, fontSize: 15, width: 150 }} aria-label="Ton prénom" />
                <button className="btn" type="submit" style={{ height: 36, padding: '0 10px', borderRadius: 8, background: '#FFC400', color: '#081440', fontWeight: 800 }}>OK</button>
              </form>
            ) : (
              <button onClick={() => { setName((prenom || '').trim()); setEditing(true); }} className="russo" style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, padding: 0, textAlign: 'left' }} aria-label="Modifier ton prénom">
                {prenom?.trim() || '[Ton prénom]'} <span style={{ fontSize: 13, color: '#C9D3E0' }}>✎</span>
              </button>
            )}
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#E2231A', border: '3px solid #fff', borderRadius: 8, padding: '4px 10px', marginRight: 28, lineHeight: 1, flexShrink: 0 }}>
            <span className="russo" style={{ fontSize: 24 }}>{lists.vus.length}</span>
            <span style={{ fontSize: 10, fontWeight: 700 }}>VUS</span>
          </div>
        </div>
      </div>

      <div className="seg" role="tablist" style={{ margin: '16px 16px 0' }}>
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}{lists[k].length ? ` · ${lists[k].length}` : ''}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <img src={tab === 'jamais' ? '/zap/mascotte-fou-rire.webp' : tab === 'vus' ? '/zap/mascotte-mange-popcorn.webp' : '/zap/mascotte-tient-panier.webp'} alt="" width="140" height="140" style={{ objectFit: 'contain' }} />
            <p style={{ margin: 0, fontSize: 15, color: '#E9EEF5', lineHeight: 1.4 }}>
              {tab === 'panier' ? 'Panier vide. Va swiper à droite dans les rayons, Zap s\'occupe du reste.' : tab === 'vus' ? 'Rien de vu pour l\'instant. Le canapé t\'attend.' : 'Aucun film blacklisté. T\'es bon public !'}
            </p>
          </div>
        )}
        {items.map((it) => (
          <div key={keyOf(it)} style={{ display: 'flex', background: '#fff', color: '#081440', borderRadius: 8, boxShadow: '0 4px 0 #081440', overflow: 'hidden', flexShrink: 0 }}>
            <img src={img(it.poster, 'w185')} alt="" width="64" style={{ width: 64, flexShrink: 0, objectFit: 'cover', background: '#0B1230', minHeight: 96 }} />
            <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, borderRight: '2px dashed #C9D3E0' }}>
              <span style={{ fontWeight: 900, fontStretch: '90%', fontSize: 16, lineHeight: 1.05 }}>{it.title}</span>
              <span style={{ fontSize: 12, color: '#4A5878' }}>{[it.year, it.type === 'tv' ? 'Série' : 'Film', it.vote ? `${it.vote.toFixed(1)}/10` : ''].filter(Boolean).join(' · ')}</span>
              {it.rayon && <span style={{ alignSelf: 'flex-start', fontStyle: 'italic', fontWeight: 800, fontSize: 11, background: '#1B3FA0', color: '#fff', padding: '2px 7px', borderRadius: 3 }}>{it.rayon}</span>}
            </div>
            <div style={{ width: 84, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: 8 }}>
              {tab !== 'jamais' && <button className="btn russo" onClick={() => onTonight(it)} style={{ height: 34, borderRadius: 6, background: '#E2231A', color: '#fff', fontSize: 12 }}>{tab === 'vus' ? 'REVOIR' : 'CE SOIR'}</button>}
              <button className="btn" onClick={() => onRemove(tab, it)} style={{ height: 30, border: '2px solid #C9D3E0', borderRadius: 6, background: '#fff', color: '#4A5878', fontWeight: 700, fontSize: 11 }}>
                {tab === 'panier' ? 'Rendre' : tab === 'vus' ? 'Pas vu' : 'Repêcher'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: '0 16px 12px', background: '#081440', border: '2px dashed #FFC400', borderRadius: 10, padding: '10px 14px 10px 8px', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <img src="/zap/mascotte-duo-check.webp" alt="" width="96" height="78" style={{ flexShrink: 0, objectFit: 'contain', marginTop: -26, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,.4))' }} />
        <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="russo" style={{ alignSelf: 'flex-start', fontSize: 11, background: '#FFC400', color: '#081440', padding: '3px 7px', borderRadius: 3 }}>BIENTÔT · À DEUX</span>
          <span style={{ fontSize: 13, lineHeight: 1.3, color: '#E9EEF5' }}>Partage ta carte : quand vous mettez le même film au panier, c'est un match.</span>
        </span>
      </div>
      <div style={{ textAlign: 'center', paddingBottom: 14, flexShrink: 0 }}>
        {guest
          ? <button className="link" onClick={onLogin}>Créer ma carte club pour tout garder</button>
          : <button className="link" style={{ color: '#C9D3E0' }} onClick={onLogout}>Rendre ma carte (déconnexion)</button>}
      </div>
    </div>
  );
}
