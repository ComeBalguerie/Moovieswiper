import React, { useEffect, useState } from 'react';
import { RAYONS, FILTERS, filterLabel, PLATEFORMES } from '../lib/config.js';
import { countRayon } from '../lib/tmdb.js';
import { Basket, Play, Planet } from '../components/ui.jsx';

const fmtN = (n) => n.toLocaleString('fr-FR');

export default function Rayons({ conseils = [], abos = [], setAbos, duoLabel, onDuo, fmt, setFmt, rayonIds, setRayonIds, filters, setFilters, panierCount, onPanier, onCarte, onEnter, bump }) {
  const [counts, setCounts] = useState({});
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let alive = true;
    setCounts({});
    const t = setTimeout(() => {
      RAYONS.forEach((r) => countRayon(fmt, r, filters).then((n) => alive && setCounts((c) => ({ ...c, [r.id]: n }))).catch(() => {}));
    }, 150);
    return () => { alive = false; clearTimeout(t); };
  }, [fmt, filters.duree, filters.epoque, filters.note, filters.origine, filters.dispo, (filters.abos || []).join()]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 32 }}>
            <button role="switch" aria-checked={!!filters.dispo} aria-label="Dispo sur mes plateformes"
              onClick={() => { if (!abos.length) { setFilters({ ...filters, dispo: true }); onCarte(); return; } setFilters({ ...filters, dispo: !filters.dispo }); }}
              style={{ position: 'relative', flexShrink: 0, width: 42, height: 24, borderRadius: 12, border: '1px solid rgba(255,255,255,.5)', padding: 0,
                background: filters.dispo ? 'linear-gradient(#FFE07A, #FFC400 55%, #E0A800)' : 'linear-gradient(#0A1A4A, #11307F)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,.45)' }}>
              <span style={{ position: 'absolute', top: 2, left: filters.dispo ? 20 : 2, width: 18, height: 18, borderRadius: '50%', transition: 'left .18s', background: 'radial-gradient(circle at 35% 30%, #fff, #C9D3E0 70%, #8D99AD)', boxShadow: '0 2px 3px rgba(0,0,0,.4)' }} />
            </button>
            <span style={{ fontWeight: 700, fontSize: 14, color: filters.dispo ? '#FFC400' : '#E9EEF5' }}>Dispo sur mes plateformes</span>
            <button className="link" onClick={onCarte} aria-label="Choisir mes plateformes sur ma carte club" style={{ padding: '4px 0', fontSize: 12, color: '#BFD6FF' }}>
              {abos.length ? `(${abos.length}) modifier` : 'choisir'}
            </button>
          </div>
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
          {open && open !== 'abos' && (
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
        {conseils.length > 0 && (
          <button onClick={onEnter} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px 8px 8px', borderRadius: 14, border: '1px solid rgba(255,196,0,.8)', background: 'rgba(255,196,0,.14)', color: '#fff', textAlign: 'left' }}>
            <img src="/zap/mascotte-montre-carte.webp" alt="" width="48" height="48" style={{ objectFit: 'contain', flexShrink: 0 }} />
            <span style={{ fontSize: 14, lineHeight: 1.3 }}>
              <strong style={{ color: '#FFC400' }}>{[...new Set(conseils.map((c) => c.conseil.de))].join(', ')}</strong>
              {conseils.length > 1 ? ` : ${conseils.length} films conseillés, ils t'attendent en tête de pile.` : ' te conseille un film, il t\'attend en tête de pile.'}
            </span>
          </button>
        )}
        <button className="btn btn-red" onClick={onEnter}>C'EST PARTI <Play /></button>
        <button className="btn btn-glass" onClick={onDuo} style={{ height: 50, gap: 10 }}>
          <img src="/zap/mascotte-duo-check.webp" alt="" width="44" height="36" style={{ objectFit: 'contain', margin: '-8px 0 -6px' }} />
          {duoLabel === 'attente' ? 'DOUBLE PROGRAMME · EN ATTENTE' : duoLabel ? `DOUBLE PROGRAMME · ${duoLabel.toUpperCase()}` : 'DOUBLE PROGRAMME · À DEUX'}
        </button>
      </div>
    </div>
  );
}
