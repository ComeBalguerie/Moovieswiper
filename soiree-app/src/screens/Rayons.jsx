import React, { useEffect, useState } from 'react';
import { RAYONS, PLATES, FILTERS, filterLabel } from '../lib/config.js';
import { countRayon } from '../lib/tmdb.js';
import { Basket, Play, Planet } from '../components/ui.jsx';

const fmtN = (n) => n.toLocaleString('fr-FR');

export default function Rayons({ fmt, setFmt, rayonIds, setRayonIds, filters, setFilters, panierCount, onPanier, onEnter, bump }) {
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
      <Planet top="calc(100dvh - 180px)" />
      <div style={{ padding: '10px 12px 4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/logo-mini.svg" alt="Zapette" width="190" height="61" />
        <Basket count={panierCount} onClick={onPanier} bump={bump} />
      </div>
      <div style={{ background: 'linear-gradient(#FFD43A, #F2B200)', borderTop: '3px solid #FFF2A8', borderBottom: '4px solid #9E7300', padding: '8px 16px 6px' }}>
        <h1 className="russo" style={{ margin: 0, fontSize: 34, lineHeight: 1, color: '#E2231A', textShadow: '2px 2px 0 #fff, 4px 4px 0 #6B0A06' }}>LES RAYONS</h1>
      </div>
      <div className="russo" style={{ background: '#E2231A', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 12, letterSpacing: 1, borderBottom: '3px solid #081440' }} aria-hidden="true">
        <span>MÉGA CHOIX !</span><span style={{ color: '#FFC400' }}>★</span><span>NOUVEAUTÉS</span><span style={{ color: '#FFC400' }}>★</span><span>TOP 10 !</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        <div className="seg" role="group" aria-label="Format" style={{ margin: '16px 16px 0' }}>
          {[['movie', 'FILMS'], ['tv', 'SÉRIES'], ['all', 'TOUT']].map(([v, l]) => (
            <button key={v} aria-pressed={fmt === v} onClick={() => setFmt(v)}>{l}</button>
          ))}
        </div>

        <p className="kicker" style={{ margin: '16px 16px 0' }}>UN OU PLUSIEURS RAYONS</p>
        <div style={{ margin: '8px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          {RAYONS.map((r, i) => {
            const active = rayonIds.includes(r.id);
            const [bg, fg] = active ? ['#FFC400', '#081440'] : PLATES[i % PLATES.length];
            return (
              <button key={r.id} onClick={() => toggle(r.id)} aria-pressed={active}
                style={{ position: 'relative', height: 64, border: active ? '3px solid #fff' : '3px solid rgba(255,255,255,.18)', borderRadius: 10, background: bg, color: fg, textAlign: 'left', padding: '6px 10px 6px 8px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: active ? '0 0 0 3px #E2231A, 0 6px 0 #081440' : '0 4px 0 rgba(8,20,64,.6)', transform: active ? 'translateY(-2px)' : 'none', transition: 'transform .15s' }}>
                <img src={r.icon} alt="" width="48" height="48" style={{ objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.35))' }} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  <span className="russo" style={{ fontSize: 13, whiteSpace: 'nowrap', lineHeight: 1 }}>{r.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.8 }}>{counts[r.id] == null ? '…' : `${fmtN(counts[r.id])} titres`}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ margin: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="kicker">AFFINER (COMME UN PRO™)</p>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: 'rgba(8,20,64,.75)', padding: 10, borderRadius: 10, border: '2px dashed #FFC400' }}>
              {FILTERS[open].options(fmt).map(([v, l]) => (
                <button key={v} className="chip" onClick={() => { setFilters({ ...filters, [open]: v }); setOpen(null); }}><span className="hole" />{l}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ margin: '0 16px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 14, color: '#E9EEF5' }} aria-live="polite">
          {n == null ? <>Zap compte les boîtiers : <strong style={{ color: '#FFC400' }}>{label}</strong>…</>
            : n === 0 ? <>Rien en <strong style={{ color: '#FFC400' }}>{label}</strong> avec ces filtres. Allège un peu ?</>
              : <>{fmtN(n)} méga-titres en <strong style={{ color: '#FFC400' }}>{label}</strong>. Rien que ça.</>}
        </p>
        <button className="btn btn-red" onClick={onEnter}>ENTRER DANS LE RAYON <Play /></button>
      </div>
    </div>
  );
}
