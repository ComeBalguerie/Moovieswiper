import React, { useEffect, useState } from 'react';
import { RAYONS, FILTERS, filterLabel, PLATEFORMES } from '../lib/config.js';
import { countRayon } from '../lib/tmdb.js';
import { AbosPicker, Basket, Play, Planet } from '../components/ui.jsx';

const fmtN = (n) => n.toLocaleString('fr-FR');

export default function Rayons({ abos = [], setAbos, duoLabel, onDuo, fmt, setFmt, rayonIds, setRayonIds, filters, setFilters, panierCount, onPanier, onEnter, bump }) {
  const [counts, setCounts] = useState({});
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let alive = true;
    setCounts({});
    const t = setTimeout(() => {
      RAYONS.forEach((r) => countRayon(fmt, r, filters).then((n) => alive && setCounts((c) => ({ ...c, [r.id]: n }))).catch(() => {}));
    }, 150);
    return () => { alive = false; clearTimeout(t); };
  }, [fmt, filters.duree, filters.epoque, filters.note, filters.origine, filters.plateforme, filters.dispo, (filters.abos || []).join()]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 8px 12px', borderRadius: 14, background: filters.dispo ? 'rgba(255,196,0,.12)' : 'rgba(5,10,31,.55)', border: '1px solid ' + (filters.dispo ? 'rgba(255,196,0,.7)' : 'rgba(191,214,255,.3)') }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>Dispo sur mes plateformes</span>
              <button className="link" onClick={() => setOpen(open === 'abos' ? null : 'abos')} style={{ alignSelf: 'flex-start', padding: 0, fontSize: 12, color: '#BFD6FF', textAlign: 'left' }}>
                {abos.length ? PLATEFORMES.filter(([k]) => abos.includes(k)).map((x) => x[1]).join(', ') + ' · modifier' : 'Choisir mes abonnements'}
              </button>
            </span>
            <button role="switch" aria-checked={!!filters.dispo} aria-label="Dispo sur mes plateformes"
              onClick={() => { if (!abos.length) { setOpen('abos'); return; } setFilters({ ...filters, dispo: !filters.dispo, plateforme: null }); }}
              style={{ position: 'relative', flexShrink: 0, width: 52, height: 30, borderRadius: 15, border: '1px solid rgba(255,255,255,.5)', padding: 0,
                background: filters.dispo ? 'linear-gradient(#FFE07A, #FFC400 55%, #E0A800)' : 'linear-gradient(#0A1A4A, #11307F)', boxShadow: 'inset 0 2px 5px rgba(0,0,0,.45)' }}>
              <span style={{ position: 'absolute', top: 2, left: filters.dispo ? 24 : 2, width: 24, height: 24, borderRadius: '50%', transition: 'left .18s', background: 'radial-gradient(circle at 35% 30%, #fff, #C9D3E0 70%, #8D99AD)', boxShadow: '0 2px 4px rgba(0,0,0,.4)' }} />
            </button>
          </div>
          {open === 'abos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(5,10,31,.7)', padding: 10, borderRadius: 14, border: '1px solid rgba(191,214,255,.35)' }}>
              <span style={{ fontSize: 13, color: '#BFD6FF' }}>Coche tes abonnements, ils seront gardés sur ta carte club.</span>
              <AbosPicker value={abos} onChange={setAbos} plateformes={PLATEFORMES} />
              <button className="btn btn-blue" style={{ height: 42, fontSize: 14 }} disabled={!abos.length}
                onClick={() => { setFilters({ ...filters, dispo: true, plateforme: null }); setOpen(null); }}>C'EST BON</button>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(FILTERS).filter(([k]) => !(k === 'plateforme' && filters.dispo)).map(([k, f]) => {
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
        <button className="btn btn-red" onClick={onEnter}>C'EST PARTI <Play /></button>
        <button className="btn btn-glass" onClick={onDuo} style={{ height: 50, gap: 10 }}>
          <img src="/zap/mascotte-duo-check.webp" alt="" width="44" height="36" style={{ objectFit: 'contain', margin: '-8px 0 -6px' }} />
          {duoLabel === 'attente' ? 'DOUBLE PROGRAMME · EN ATTENTE' : duoLabel ? `DOUBLE PROGRAMME · ${duoLabel.toUpperCase()}` : 'DOUBLE PROGRAMME · À DEUX'}
        </button>
      </div>
    </div>
  );
}
