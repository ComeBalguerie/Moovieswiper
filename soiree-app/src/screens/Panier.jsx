import React, { useEffect, useState } from 'react';
import { panierDuBinome } from '../lib/duo.js';
import { conseilsEnvoyes } from '../lib/conseils.js';
import { img } from '../lib/tmdb.js';
import { keyOf } from '../lib/store.js';
import { Back } from '../components/ui.jsx';
import CarteClub from '../components/CarteClub.jsx';

const TABS = [['panier', 'PANIER'], ['vus', 'DÉJÀ VUS'], ['jamais', 'JAMAIS']];

export default function Panier({ userId, onConseiller, startFlipped, abos = [], setAbos, partner, onDuo, lists, prenom, number, guest, onClose, onTonight, onRemove, onRename, onLogout, onLogin }) {
  const [tab, setTab] = useState('panier');
  const [flipped, setFlipped] = useState(!!startFlipped);
  const [sienne, setSienne] = useState([]);
  const [envois, setEnvois] = useState([]);
  useEffect(() => { if (userId) conseilsEnvoyes(userId).then(setEnvois).catch(() => {}); }, [userId]);
  const ETAT = { nouveau: 'pas encore vu', panier: 'au panier ✓', passe: 'pas tenté', regarde: 'regardé ✓✓' };
  // le panier du binôme se recharge à l'ouverture, en ouvrant l'onglet À deux, puis toutes les 10 s tant qu'on y est
  useEffect(() => {
    if (!partner?.id) return undefined;
    const charger = () => panierDuBinome(partner.id).then(setSienne).catch(() => {});
    charger();
    if (tab !== 'communs') return undefined;
    const t = setInterval(charger, 10000);
    return () => clearInterval(t);
  }, [partner?.id, tab]);
  const communs = lists.panier.filter((it) => sienne.some((x) => keyOf(x) === keyOf(it)));
  const tabs = partner ? [['panier', 'PANIER'], ['communs', 'À DEUX'], ['vus', 'VUS'], ['jamais', 'JAMAIS']] : TABS;
  const items = tab === 'communs' ? communs : lists[tab];

  return (
    <div className="app grid" style={{ position: 'fixed', inset: 0, zIndex: 20, margin: '0 auto', overflowY: 'auto' }}>
      <div className="stars" style={{ position: 'relative', flexShrink: 0, padding: '16px 16px 20px', borderBottom: '1px solid rgba(191,214,255,.3)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Back onClick={onClose} />
          <h1 className="title-outline" style={{ fontSize: 30 }}>MON PANIER</h1>
          <img src={lists.panier.length ? '/zap/objets-panier-plein.webp' : '/zap/objets-panier-vide.webp'} alt="" style={{ width: 86, height: 80, margin: '-18px -4px -22px auto', objectFit: 'contain', transform: 'rotate(8deg)', filter: 'drop-shadow(0 8px 8px rgba(0,0,0,.55))' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 4 }}>
          {guest
            ? <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: 2, color: '#BFD6FF', alignSelf: 'flex-start' }}>VISITEUR · SANS CARTE</span>
            : null}
          <CarteClub w={Math.min(330, (typeof window !== 'undefined' ? window.innerWidth : 390) - 40)} number={number} prenom={prenom} vus={lists.vus.length}
            abos={abos} onAbos={setAbos} onRename={onRename} flipped={flipped} onFlip={setFlipped} />
        </div>
      </div>

      <div className="seg" role="tablist" style={{ margin: '16px 16px 0', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, ...(tabs.length > 3 ? { fontSize: 12 } : {}) }}>
        {tabs.map(([k, l]) => {
          const n = k === 'communs' ? communs.length : lists[k].length;
          return <button key={k} role="tab" style={tabs.length > 3 ? { fontSize: 12, padding: 0 } : undefined} aria-selected={tab === k} onClick={() => setTab(k)}>{l}{n ? ` · ${n}` : ''}</button>;
        })}
      </div>

      <div style={{ flex: 1, padding: '14px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tab === 'communs' && (
          <p className="kicker" style={{ margin: '0 0 2px', textAlign: 'center' }}>VOS COUPS DE CŒUR COMMUNS AVEC {(partner?.prenom || '').toUpperCase()}</p>
        )}
        {items.length === 0 && tab === 'communs' && (
          <div style={{ textAlign: 'center', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <img src="/zap/mascotte-duo-check.webp" alt="" width="160" height="130" style={{ objectFit: 'contain' }} />
            <p style={{ margin: 0, fontSize: 15, color: '#E9EEF5', lineHeight: 1.4 }}>Pas encore de film en commun dans vos paniers. Lancez un Double Programme, ça va vite.</p>
          </div>
        )}
        {items.length === 0 && tab !== 'communs' && (
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
              {envois.filter((e) => e.tmdb_id === it.id && e.media_type === it.type).slice(0, 3).map((e) => (
                <span key={e.id} style={{ fontSize: 11, color: e.status === 'regarde' || e.status === 'panier' ? '#1B7A3A' : '#4A5878', fontWeight: 700 }}>Conseillé à {e.a} · {ETAT[e.status]}</span>
              ))}
            </div>
            <div style={{ width: 96, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: 8 }}>
              {tab !== 'jamais' && <button className="btn btn-red" onClick={() => onTonight(it)} style={{ height: 34, fontSize: 12 }}>{tab === 'vus' ? 'REVOIR' : 'CE SOIR'}</button>}
              {tab === 'vus' && onConseiller && <button className="btn btn-blue" onClick={() => onConseiller(it)} style={{ height: 30, fontSize: 10, letterSpacing: 0, padding: 0 }}>CONSEILLER</button>}
              <button className="btn" onClick={() => onRemove(tab === 'communs' ? 'panier' : tab, it)} style={{ height: 30, border: '2px solid #C9D3E0', borderRadius: 6, background: '#fff', color: '#4A5878', fontWeight: 700, fontSize: 11 }}>
                {tab === 'panier' ? 'Rendre' : tab === 'vus' ? 'Pas vu' : 'Repêcher'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onDuo} style={{ margin: '0 16px 12px', background: 'rgba(10,26,74,.85)', border: '1px solid rgba(191,214,255,.35)', borderRadius: 14, padding: '10px 14px 10px 8px', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, textAlign: 'left', color: 'inherit', cursor: 'pointer' }}>
        <img src="/zap/mascotte-duo-check.webp" alt="" width="96" height="78" style={{ flexShrink: 0, objectFit: 'contain', marginTop: -26, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,.4))' }} />
        <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="russo" style={{ alignSelf: 'flex-start', fontSize: 11, background: '#FFC400', color: '#081440', padding: '3px 7px', borderRadius: 3 }}>DOUBLE PROGRAMME</span>
          <span style={{ fontSize: 13, lineHeight: 1.3, color: '#E9EEF5' }}>{partner ? `Une soirée avec ${partner.prenom} ? Lance une session, même film = match.` : 'Envoie un code à quelqu\'un : même film au panier = match.'}</span>
        </span>
        <span style={{ marginLeft: 'auto', color: '#FFC400', fontSize: 20 }}>›</span>
      </button>
      <div style={{ textAlign: 'center', paddingBottom: 14, flexShrink: 0 }}>
        {guest
          ? <button className="link" onClick={onLogin}>Créer ma carte club pour tout garder</button>
          : <button className="link" style={{ color: '#C9D3E0' }} onClick={onLogout}>Rendre ma carte (déconnexion)</button>}
      </div>
    </div>
  );
}
