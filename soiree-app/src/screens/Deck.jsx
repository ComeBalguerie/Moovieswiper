import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { RAYONS, filterLabel } from '../lib/config.js';
import { discover, details, fmtRuntime, img } from '../lib/tmdb.js';
import { keyOf } from '../lib/store.js';
import { quip } from '../lib/zap.js';
import Jaquette from '../components/Jaquette.jsx';
import { Back, Basket, Loading, Play, Planet } from '../components/ui.jsx';

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const MAX_PAGES = 40;

function useCardWidth() {
  const calc = () => Math.round(Math.max(170, Math.min(272, (window.innerHeight - 400) / 1.6 + 20, window.innerWidth * 0.62)));
  const [w, setW] = useState(calc);
  useEffect(() => { const f = () => setW(calc()); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  return w;
}

export const metaLine = (it, d) => [it.year, d && (it.type === 'movie' ? fmtRuntime(d.runtime) : d.seasons ? `${d.seasons} saison${d.seasons > 1 ? 's' : ''}` : ''), d?.genres?.[0], d?.cert].filter(Boolean).join(' · ');

const Deck = forwardRef(function Deck({ fmt, rayonId, filters, setFilters, excluded, onBack, onPanierOpen, panierCount, bump, onSwipe, onUndo, onConseil, onTonight, number }, ref) {
  const rayon = RAYONS.find((r) => r.id === rayonId);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('loading');
  const [detail, setDetail] = useState({});
  const [history, setHistory] = useState([]);
  const [tilt, setTilt] = useState(null);
  const [tick, setTick] = useState(0);
  const cursor = useRef({});
  const seen = useRef(new Set());
  const loading = useRef(false);
  const card = useRef(null);
  const gen = useRef(0);
  const w = useCardWidth();

  const types = fmt === 'all' ? ['movie', 'tv'] : [fmt];

  const loadMore = useCallback(async (g) => {
    if (loading.current) return;
    loading.current = true;
    try {
      for (let attempt = 0; attempt < 5; attempt++) {
        const batches = await Promise.all(types.map(async (t) => {
          const c = cursor.current[t] || (cursor.current[t] = { page: 0, pages: Infinity });
          const out = [];
          for (let k = 0; k < 2 && c.page < Math.min(c.pages, MAX_PAGES); k++) {
            c.page += 1;
            const r = await discover(t, rayon, filters, c.page);
            c.pages = r.pages;
            out.push(...r.items);
          }
          return out;
        }));
        if (g !== gen.current) return;
        const fresh = batches.map((b) => shuffle(b.filter((it) => !seen.current.has(keyOf(it)) && !excluded.has(keyOf(it)))));
        const mixed = [];
        const L = Math.max(...fresh.map((b) => b.length), 0);
        for (let i = 0; i < L; i++) fresh.forEach((b) => b[i] && mixed.push(b[i]));
        mixed.forEach((it) => seen.current.add(keyOf(it)));
        const exhausted = types.every((t) => cursor.current[t].page >= Math.min(cursor.current[t].pages, MAX_PAGES));
        if (mixed.length) {
          setQueue((q) => [...q, ...mixed]);
          setStatus('ready');
          return;
        }
        if (exhausted) {
          setStatus(seen.current.size ? 'ready' : 'empty');
          return;
        }
      }
    } catch (e) {
      if (g === gen.current) setStatus((s) => (s === 'ready' ? s : 'error'));
    } finally {
      loading.current = false;
      setTick((t) => t + 1);
    }
  }, [fmt, rayonId, filters.duree, filters.epoque, filters.note, excluded]);

  // nouveau rayon / filtres = on vide le bac
  useEffect(() => {
    gen.current += 1;
    cursor.current = {}; seen.current = new Set(); loading.current = false;
    setQueue([]); setIdx(0); setHistory([]); setStatus('loading');
    loadMore(gen.current);
  }, [fmt, rayonId, filters.duree, filters.epoque, filters.note]);

  const current = queue[idx];

  useEffect(() => {
    if (status === 'ready' && queue.length - idx < 6 && !loading.current) loadMore(gen.current);
    if (status === 'ready' && idx >= queue.length && !loading.current) {
      const ex = types.every((t) => cursor.current[t] && cursor.current[t].page >= Math.min(cursor.current[t].pages, MAX_PAGES));
      if (ex) setStatus('exhausted');
    }
    // fiches détaillées + préchargement des affiches suivantes
    queue.slice(idx, idx + 3).forEach((it) => {
      if (!detail[keyOf(it)]) details(it).then((d) => setDetail((x) => ({ ...x, [keyOf(it)]: d }))).catch(() => {});
      if (it.poster) { const im = new Image(); im.src = img(it.poster, 'w500'); }
    });
  }, [idx, queue.length, status, tick]);

  const done = (dir) => {
    const it = queue[idx];
    if (!it) return;
    const action = dir === 'right' ? 'panier' : dir === 'down' ? 'jamais' : dir === 'skip' ? 'skip' : 'passer';
    setHistory((h) => [...h.slice(-30), { idx, it, action }]);
    setIdx((i) => i + 1);
    // sécurité : on remet l'écran droit si le navigateur l'a fait glisser
    try { document.querySelectorAll('.app').forEach((a) => { a.scrollLeft = 0; }); window.scrollTo(0, window.scrollY); } catch (e) { /* rien */ }
    onSwipe(action, it, detail[keyOf(it)]);
  };

  useImperativeHandle(ref, () => ({
    current: () => queue[idx],
    swipe: (dir) => (dir === 'skip' ? done('skip') : card.current?.fly(dir)),
  }));

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setIdx(last.idx);
    onUndo(last.action, last.it);
  };

  const onOrient = useRef((e) => {
    if (e.beta == null) return;
    const c = (v, m) => Math.max(-m, Math.min(m, v));
    setTilt({ y: c((e.gamma || 0) * 0.7, 22), x: c(((e.beta || 45) - 45) * -0.4, 16) });
  });
  useEffect(() => () => window.removeEventListener('deviceorientation', onOrient.current), []);
  const toggleGyro = () => {
    if (tilt) { window.removeEventListener('deviceorientation', onOrient.current); setTilt(null); return; }
    const on = () => { window.addEventListener('deviceorientation', onOrient.current); setTilt({ x: 0, y: 0 }); };
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then((r) => r === 'granted' && on()).catch(() => {});
      } else on();
    } catch (e) { /* rien */ }
  };

  const d = current ? detail[keyOf(current)] : null;
  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  return (
    <div className="app" style={{ userSelect: 'none' }}>
      <Planet top="calc(100dvh - 285px)" />
      <div style={{ padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Back onClick={onBack} label="Retour aux rayons" />
        <span className="sticker-y">RAYON {rayon.name}</span>
        <Basket count={panierCount} onClick={onPanierOpen} bump={bump} size={56} />
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <Vide kind="error" onBack={onBack} onRetry={() => { setStatus('loading'); loadMore(gen.current); }} />}
      {(status === 'empty' || status === 'exhausted') && !current && (
        <Vide kind={status} filters={activeFilters} fmt={fmt} onRemove={(k) => setFilters({ ...filters, [k]: null })} onBack={onBack} />
      )}
      {status === 'ready' && !current && <Loading text="Zap va chercher d'autres boîtiers…" />}

      {current && (
        <>
          <div style={{ margin: '14px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontStyle: 'italic', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>
            <button onClick={() => card.current?.fly('left')} style={{ background: 'none', border: 'none', padding: 4, display: 'flex', alignItems: 'center', gap: 6, color: '#C9D3E0', fontStyle: 'italic', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>
              <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true"><polygon points="10,0 0,6 10,12" fill="#C9D3E0" /></svg>PASSER
            </button>
            <button onClick={toggleGyro} style={{ height: 30, padding: '0 10px', border: '2px solid ' + (tilt ? '#FFC400' : 'rgba(255,255,255,.35)'), borderRadius: 15, background: tilt ? '#FFC400' : 'transparent', color: tilt ? '#081440' : '#E9EEF5', fontWeight: 800, fontSize: 10, letterSpacing: 1 }}>
              {tilt ? 'INCLINAISON ON' : 'INCLINER LE TÉLÉPHONE'}
            </button>
            <button onClick={() => card.current?.fly('right')} style={{ background: 'none', border: 'none', padding: 4, display: 'flex', alignItems: 'center', gap: 6, color: '#FFC400', fontStyle: 'italic', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>
              AU PANIER<svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true"><polygon points="0,0 10,6 0,12" fill="#FFC400" /></svg>
            </button>
          </div>

          <div style={{ position: 'relative', flex: 1, minHeight: Math.round(w * 1.6) + 70, overflowX: 'clip' }}>
            <Jaquette key={keyOf(current)} ref={card} item={current} meta={metaLine(current, d)} tilt={tilt} w={w} number={number} onDone={done} />
          </div>

          <button onClick={() => onConseil(current, d)} style={{ margin: '0 16px', minHeight: 72, background: '#fff', color: '#081440', borderRadius: 10, boxShadow: '0 5px 0 #081440', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, border: 'none', textAlign: 'left' }}>
            <img src="/zap/mascotte-reflechit.webp" alt="" width="58" height="88" style={{ flexShrink: 0, objectFit: 'contain', objectPosition: 'bottom', margin: '-32px 0 -10px -4px', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,.3))' }} />
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span className="russo" style={{ fontSize: 12, letterSpacing: 1, color: '#E2231A' }}>LE CONSEIL DE ZAP</span>
              <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.25 }}>{quip(current)}</span>
            </span>
            <Play />
          </button>

          <div style={{ margin: '16px 16px 22px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-chrome" onClick={undo} disabled={!history.length} aria-label="Annuler le dernier swipe" style={{ width: 54, height: 54, boxShadow: '0 4px 0 #081440', opacity: history.length ? 1 : 0.55 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="#081440" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 5 L3 10 L8 15" /><path d="M3 10 H14 a5 5 0 0 1 0 10 H10" /></svg>
            </button>
            <button className="btn russo" onClick={() => card.current?.fly('down')} style={{ width: 104, height: 58, flexShrink: 0, border: '3px solid #E2231A', borderRadius: 10, background: '#fff', color: '#E2231A', fontSize: 16, boxShadow: '0 4px 0 #081440' }}>JAMAIS</button>
            <button className="btn btn-red" onClick={() => onTonight(current, d)} style={{ flex: 1, height: 62, fontSize: 20 }}>CE SOIR ! <Play /></button>
          </div>
        </>
      )}
    </div>
  );
});

function Vide({ kind, filters = [], fmt, onRemove, onBack, onRetry }) {
  const txt = {
    empty: ['RAYON VIDE !', 'Même en fouillant la réserve, rien. Retire un filtre, ça devrait débloquer les étagères.'],
    exhausted: ['T\'AS TOUT VU !', 'Tu as dévalisé ce rayon. Respect. Change de rayon ou retire un filtre pour en voir plus.'],
    error: ['PANNE DE COURANT', 'Impossible de joindre la réserve de films. Vérifie ta connexion et on réessaie.'],
  }[kind];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 24px 32px', textAlign: 'center' }}>
      <img src={kind === 'error' ? '/zap/objets-prise-debranchee.webp' : kind === 'exhausted' ? '/zap/mascotte-dort.webp' : '/zap/mascotte-rien-trouve.webp'} alt="" width="190" height="190" style={{ objectFit: 'contain', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,.5))' }} />
      <h2 className="title-outline" style={{ fontSize: 32 }}>{txt[0]}</h2>
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.4, color: '#E9EEF5', maxWidth: 320 }}>{txt[1]}</p>
      {filters.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {filters.map(([k, v]) => (
            <button key={k} className="chip on" onClick={() => onRemove(k)} aria-label={`Retirer le filtre ${filterLabel(k, v, fmt)}`}><span className="hole" />{filterLabel(k, v, fmt)} ✕</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 340, marginTop: 6 }}>
        {onRetry && <button className="btn btn-white" style={{ flex: 1 }} onClick={onRetry}>RÉESSAYER</button>}
        <button className="btn btn-red" style={{ flex: 1, fontSize: 16 }} onClick={onBack}>AUX RAYONS <Play /></button>
      </div>
    </div>
  );
}

export default Deck;
