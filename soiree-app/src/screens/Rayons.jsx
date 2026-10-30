import React, { useEffect, useState } from 'react';
import { RAYONS, FILTERS, filterLabel } from '../lib/config.js';
import { countRayon } from '../lib/tmdb.js';
import { Basket, Play, Planet } from '../components/ui.jsx';

const fmtN = (n) => n.toLocaleString('fr-FR');

export default function Rayons({ duoLabel, onDuo, fmt, setFmt, rayonIds, setRayonIds, filters, setFilters, panierCount, onPanier, onEnter, bump }) {
  const [counts, setCounts] = useState({});
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let alive = true;
    setCounts({});
    const t = setTimeout(() => {
      RAYONS.forEach((r) => countRayon(fmt, r, filters).then((n) => alive && setCounts((c) => ({ ...c, [r.id]: n }))).catch(() => {}));
    }, 150);
    return () => { alive = false; clearTimeout(t); };
  }, [fmt, filters.duree, filters.epoque, filters.note]);

  const chosen = RAYONS.filter((r) => rayonIds.includes(r.id));
  const n = chosen.some((r) => counts[r.id] == null) ? null : chosen.reduce((a, r) => a + counts[r.id], 0);
  const nice = (r) => r.name.charAt(0) + r.name.slice(1).toLowerCase();
  const label = chosen.length <= 3 ? chosen.map(nice).join(' + ') : `${chosen.length} rayons`;
  const toggle = (id) => {
    if (rayonIds.includes(id)) { if (rayonIds.length > 1) setRayonIds(rayonIds.filter((x) => x !== id)); }
    else setRayonIds([...rayonIds, id]);
  };

  return (
    <div className="app">
      <Planet top="calc(100dvh - 190px)" />
      <div style={{ padding: '10px 12px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/logo-mini.svg" alt="Zapette" width="160" height="52" />
        <Basket count={panierCount} onClick={onPanier} bump={bump} size={56} />
      </div>
      <h1 className="title-outline" style={{ fontSize: 26, margin: '14px 16px 0' }}>Qu'est-ce qu'on regarde ?</h1>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        <div className="seg" role="group" aria-label="Format" style={{ margin: '14px 16px 0' }}>
          {[['movie', 'Films'], ['tv', 'Séries'], ['all', 'Tout']].map(([v, l]) => (
            <button key={v} aria-pressed={fmt === v} onClick={() => setFmt(v)}>{l}</button>
          ))}
        </div>

        <p className="kicker" style={{ margin: '16px 16px 0' }}>UN OU PLUSIEURS RAYONS</p>
        <div style={{ margin: '8px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          {RAYONS.map((r, i) => {
            const active = rayonIds.includes(r.id);
            return (
              <button key={r.id} className="tile" onClick={() => toggle(r.id)} aria-pressed={active}>
                <img src={r.icon} alt="" width="46" height="46" style={{ objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.35))' }} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  <span className="russo" style={{ fontSize: 13, whiteSpace: 'nowrap', lineHeight: 1 }}>{r.name}</span>
                  <span style={{ fontSize: 12, color: '#BFD6FF' }}>{counts[r.id] == null ? '…' : `${fmtN(counts[r.id])} titres`}</span>
                </span>
                {active && <span className="check" aria-hidden="true"><svg width="11" height="9" viewBox="0 0 11 9"><path d="M1 4.5 L4 7.5 L10 1" fill="none" stroke="#0A1A4A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}
              </button>
            );
          })}
        </div>

        <div style={{ margin: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="kicker">AFFINER</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(FILTERS).map(([k, f]) => {
              const v = filters[k];
              return (
                <button key={k} className={'chip' + (v ? ' on' : open === k ? ' open' : '')} aria-expanded={open === k}
                  onClick={() => (v ? setFilters({ ...filters, [k]: null }) : setOpen(open === k ? null : k))}>
                  <span className="hole" />{v ? <>{filterLabel(k, v, fmt)} <span aria-label="retirer">✕</span></> : '+ ' + f.label}
                </button>
              );
            })}
          </div>
          {open && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: 'rgba(5,10,31,.7)', padding: 10, borderRadius: 14, border: '1px solid rgba(191,214,255,.35)' }}>
              {FILTERS[open].options(fmt).map(([v, l]) => (
                <button key={v} className="chip" onClick={() => { setFilters({ ...filters, [open]: v }); setOpen(null); }}><span className="hole" />{l}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ margin: '0 16px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 14, color: '#BFD6FF' }} aria-live="polite">
          {n == null ? <>Zap compte les boîtiers : <strong style={{ color: '#FFC400' }}>{label}</strong>…</>
            : n === 0 ? <>Rien en <strong style={{ color: '#FFC400' }}>{label}</strong> avec ces filtres. Allège un peu ?</>
              : <>{fmtN(n)} titres en <strong style={{ color: '#FFC400' }}>{label}</strong></>}
        </p>
        <button className="btn btn-red" onClick={onEnter}>C'EST PARTI <Play /></button>
        <button className="btn btn-glass" onClick={onDuo} style={{ height: 50, gap: 10 }}>
          <img src="/zap/mascotte-duo-check.webp" alt="" width="44" height="36" style={{ objectFit: 'contain', margin: '-8px 0 -6px' }} />
          {duoLabel === 'attente' ? 'DOUBLE PROGRAMME · EN ATTENTE' : duoLabel ? `DOUBLE PROGRAMME · ${duoLabel.toUpperCase()}` : 'DOUBLE PROGRAMME · À DEUX'}
        </button>
      </div>
    </div>
  );
}
