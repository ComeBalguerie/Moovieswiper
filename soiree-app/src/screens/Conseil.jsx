import React, { useEffect, useState } from 'react';
import { details, img } from '../lib/tmdb.js';
import { conseil } from '../lib/zap.js';
import { metaLine } from './Deck.jsx';
import { Back, Play, Providers } from '../components/ui.jsx';

export function useDetail(item, initial) {
  const [d, setD] = useState(initial || null);
  useEffect(() => { let a = true; if (!initial) details(item).then((x) => a && setD(x)).catch(() => {}); return () => { a = false; }; }, [item?.id]);
  return d;
}

const Score = ({ label, value, unit, pct, color, source }) => (
  <div style={{ borderRadius: 10, background: 'linear-gradient(160deg, #FFFFFF, #C9D3E0 55%, #9AA6B8)', color: '#081440', padding: '10px 12px', boxShadow: '0 4px 0 #081440', display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontStyle: 'italic', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>{label}</span>
    <span className="russo" style={{ fontSize: 30, lineHeight: 1, color: '#1B3FA0' }}>{value}{unit && <span style={{ fontSize: 15 }}>{unit}</span>}</span>
    <span style={{ height: 8, borderRadius: 4, background: '#081440', overflow: 'hidden', display: 'flex' }}><span style={{ width: `${pct}%`, background: color }} /></span>
    {source && <span style={{ fontSize: 10, fontWeight: 700, color: '#4A5878' }}>{source}</span>}
  </div>
);

function Generique({ d, onPersonne }) {
  const gens = [...(d?.crew || []), ...(d?.cast || [])];
  const [sel, setSel] = useState(null);
  if (!gens.length) return null;
  const choisi = sel || gens[0];
  const nom = choisi.name.split(' ').slice(-1)[0];
  return (
    <div style={{ margin: '18px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span className="kicker" style={{ margin: '0 16px', letterSpacing: 1 }}>AU GÉNÉRIQUE</span>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '2px 16px 4px', scrollbarWidth: 'none' }}>
        {gens.map((p) => {
          const on = choisi.id === p.id;
          return (
            <button key={p.id + p.role} onClick={() => setSel(p)} aria-pressed={on}
              style={{ flexShrink: 0, width: 74, background: 'none', border: 'none', padding: 0, color: '#E9EEF5', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textAlign: 'center' }}>
              <span style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: '#11307F', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: on ? '0 0 0 3px #FFC400, 0 6px 12px rgba(0,0,0,.5)' : '0 0 0 2px rgba(191,214,255,.45), 0 6px 12px rgba(0,0,0,.4)' }}>
                {p.photo ? <img src={img(p.photo, 'w185')} alt="" width="64" height="64" style={{ objectFit: 'cover', width: 64, height: 64 }} />
                  : <span className="russo" style={{ fontSize: 22, color: '#BFD6FF' }}>{p.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}</span>}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.15, color: on ? '#FFC400' : '#fff' }}>{p.name}</span>
              <span style={{ fontSize: 10.5, lineHeight: 1.15, color: p.real ? '#FFC400' : '#8DA4D6', fontWeight: p.real ? 800 : 500, maxHeight: 25, overflow: 'hidden' }}>{p.real ? p.role.toUpperCase() : p.role}</span>
            </button>
          );
        })}
      </div>
      {onPersonne && (
        <div style={{ margin: '0 16px', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          <img src="/zap/mascotte-saute-de-joie.webp" alt="" width="70" height="86" style={{ flexShrink: 0, objectFit: 'contain', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,.4))' }} />
          <div className="bubble" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14, lineHeight: 1.3, fontFamily: 'Archivo, sans-serif', fontWeight: 500 }}>
              {choisi.real ? <>Fan de <strong>{choisi.name}</strong> ? Je te sors tous ses films, un par un.</> : <>Envie de revoir <strong>{choisi.name}</strong> ? J'ai tous ses films en rayon.</>}
            </span>
            <button className="btn btn-blue" onClick={() => onPersonne(choisi)} style={{ height: 40, fontSize: 13 }}>SWIPE SPÉCIAL {nom.toUpperCase()} <Play w={10} h={12} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Conseil({ item, detail, inPanier, soir, onClose, onPanier, onPlay, onPersonne, onConseiller }) {
  const d = useDetail(item, detail);
  const votesPct = Math.min(100, Math.round((Math.log10(Math.max(1, item.votes)) / 4.5) * 100));
  return (
    <div className="app grid" style={{ position: 'fixed', inset: 0, zIndex: 20, margin: '0 auto', overflowY: 'auto' }}>
      {soir && (
        <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
          <p className="title-relief" style={{ fontSize: 28, textAlign: 'center' }}>FILM DU SOIR ?</p>
        </div>
      )}
      <div style={{ position: 'relative', flexShrink: 0, paddingBottom: 40 }}>
        <div style={{ position: 'relative', padding: '16px 16px 0', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <Back onClick={onClose} label="Retour à la jaquette" />
          <img src={img(item.poster, 'w185')} alt="" width="78" height="116" style={{ flexShrink: 0, borderRadius: 4, border: '3px solid #0B0C12', boxShadow: '0 8px 18px rgba(0,0,0,.6)', objectFit: 'cover', background: '#0B1230' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4, minWidth: 0 }}>
            <h1 className="title-outline" style={{ fontSize: 22, lineHeight: 1.02 }}>{item.title.toUpperCase()}</h1>
            <span style={{ fontSize: 13, color: '#C9D3E0' }}>{metaLine(item, d)}</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', margin: '-22px 18px 0', background: '#F2F6FC', color: '#0A1A4A', borderRadius: 14, boxShadow: '0 1px 0 #fff inset, 0 14px 24px rgba(0,0,0,.35)' }}>
        <img src={soir ? '/zap/mascotte-match.webp' : '/zap/mascotte-reflechit.webp'} alt="" style={{ position: 'absolute', right: -6, top: -62, width: 80, height: 116, objectFit: 'contain', objectPosition: 'bottom', zIndex: 2, filter: 'drop-shadow(0 6px 6px rgba(0,0,0,.4))' }} />
        <div style={{ background: 'linear-gradient(180deg, #4D86F0, #1B4FC4 50%, #11307F 51%, #1B4FC4)', color: '#fff', padding: '10px 90px 10px 14px', borderRadius: '14px 14px 0 0', display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span className="russo" style={{ fontSize: 16, letterSpacing: 0.5 }}>LE CONSEIL DE ZAP</span>
          <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>ton vendeur préféré™ (le seul)</span>
        </div>
        <p style={{ margin: 0, padding: '12px 14px 6px', fontSize: 16, fontWeight: 500, lineHeight: 1.35 }}>{conseil(item, d)}</p>
        <p style={{ margin: 0, padding: '0 14px 10px', fontSize: 11, fontWeight: 700, color: '#4A5878' }}>
          D'après {d?.press ? 'la presse, ' : ''}les spectateurs et mon flair légendaire®
        </p>
      </div>

      <div style={{ margin: '22px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        {d?.press
          ? <Score label="PRESSE" value={d.press.score} unit={d.press.source === 'Metacritic' ? '/100' : '%'} pct={d.press.score} color="#E2231A" source={d.press.source} />
          : <Score label="VOTES" value={item.votes >= 1000 ? `${Math.round(item.votes / 100) / 10}k` : item.votes} pct={votesPct} color="#E2231A" source="TMDB" />}
        {d?.imdb_note
          ? <Score label="SPECTATEURS" value={d.imdb_note.score.toFixed(1)} unit="/10" pct={d.imdb_note.score * 10} color="#FFC400" source={`IMDb · ${d.imdb_note.votes >= 1000 ? Math.round(d.imdb_note.votes / 1000) + 'k' : d.imdb_note.votes} votes`} />
          : <Score label="SPECTATEURS" value={item.vote.toFixed(1)} unit="/10" pct={item.vote * 10} color="#FFC400" source="TMDB" />}
      </div>

      {(d?.overview || item.overview) && (
        <p style={{ margin: '18px 16px 0', fontSize: 14, lineHeight: 1.45, color: '#E9EEF5' }}>
          <span className="kicker" style={{ letterSpacing: 1, marginRight: 6 }}>L'HISTOIRE</span>{d?.overview || item.overview}
        </p>
      )}

      <Generique d={d} onPersonne={onPersonne} />

      <div style={{ margin: '18px 16px 0' }}><Providers d={d} /></div>

      <div style={{ margin: 'auto 16px 24px', paddingTop: 22, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {d?.trailer
          ? <a className="btn btn-navy" href={d.trailer} target="_blank" rel="noreferrer"><Play w={12} h={14} />BANDE-ANNONCE</a>
          : <button className="btn btn-navy" disabled style={{ opacity: 0.5 }}>PAS DE B.A.</button>}
        <button className="btn btn-white" onClick={() => onPanier(item)} disabled={inPanier}>{inPanier ? 'DANS LE PANIER ✓' : 'AU PANIER'}</button>
        <button className="btn btn-red" style={{ gridColumn: 'span 2', height: 60 }} onClick={() => onPlay(item, d)}>{soir ? 'ON REGARDE ÇA !' : 'CE SOIR, C\'EST LUI !'} <Play /></button>
        {onConseiller && <button className="link" style={{ gridColumn: 'span 2', color: '#BFD6FF' }} onClick={() => onConseiller(item)}>Conseiller ce film à un membre</button>}
      </div>
    </div>
  );
}
