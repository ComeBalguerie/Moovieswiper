import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RAYONS } from './lib/config.js';
import { supabase, makeStore, slim, keyOf, cardNumber } from './lib/store.js';
import Login from './screens/Login.jsx';
import Rayons from './screens/Rayons.jsx';
import Deck from './screens/Deck.jsx';
import Conseil from './screens/Conseil.jsx';
import Lecture from './screens/Lecture.jsx';
import Panier from './screens/Panier.jsx';
import { Loading, Play, Planet, Toast } from './components/ui.jsx';

const PREFS = 'zapette-prefs';
const GUEST = 'zapette-guest-mode';
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* rien */ } },
};

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(() => ls.get(GUEST, false));
  const [authError, setAuthError] = useState('');
  const [lists, setLists] = useState({ panier: [], jamais: [], vus: [] });
  const [prenom, setPrenom] = useState(null);
  const prefs0 = ls.get(PREFS, {});
  const [fmt, setFmt] = useState(prefs0.fmt || 'movie');
  const [rayonIds, setRayonIds] = useState(() => {
    const r = prefs0.rayons || (prefs0.rayon ? [prefs0.rayon] : ['tension']);
    const ok = r.filter((id) => RAYONS.some((x) => x.id === id));
    return ok.length ? ok : ['tension'];
  });
  const [filters, setFilters] = useState(prefs0.filters || { duree: null, epoque: null, note: null });
  const [screen, setScreen] = useState('rayons');
  const [overlay, setOverlay] = useState(null); // {kind, item, detail}
  const [panierOpen, setPanierOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [bump, setBump] = useState(false);
  const deck = useRef(null);
  const toastT = useRef(null);

  const say = (m) => { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2600); };

  useEffect(() => { ls.set(PREFS, { fmt, rayons: rayonIds, filters }); }, [fmt, rayonIds, filters]);

  useEffect(() => {
    const h = new URLSearchParams(window.location.hash.slice(1));
    if (h.get('error_description')) {
      setAuthError(/expired|invalid/i.test(h.get('error_description')) ? 'Ce lien a expiré ou a déjà servi. Redemande une carte !' : h.get('error_description'));
      history.replaceState(null, '', window.location.pathname);
    }
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user || null); setAuthReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
      if (window.location.hash.includes('access_token')) history.replaceState(null, '', window.location.pathname);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const store = useMemo(() => (user ? makeStore(user) : guest ? makeStore(null) : null), [user?.id, guest]);

  useEffect(() => {
    if (!store) return;
    let alive = true;
    (async () => {
      try {
        // un visiteur qui crée sa carte garde ses listes
        if (!store.guest) {
          const g = makeStore(null);
          const old = await g.load();
          const all = ['panier', 'jamais', 'vus'].flatMap((l) => old[l].map((it) => [l, it]));
          if (all.length) {
            await Promise.all(all.map(([l, it]) => store.add(l, it).catch(() => {})));
            await Promise.all(all.map(([l, it]) => g.remove(l, it)));
          }
          ls.set(GUEST, false);
          setGuest(false);
        }
        const [l, p] = await Promise.all([store.load(), store.getPrenom()]);
        if (alive) { setLists(l); setPrenom(p || ''); }
      } catch (e) {
        if (alive) { setPrenom(''); say('Zap n\'arrive pas à retrouver ton panier. Réessaie plus tard.'); }
      }
    })();
    return () => { alive = false; };
  }, [store]);

  const excluded = useMemo(() => new Set([...lists.panier, ...lists.jamais, ...lists.vus].map(keyOf)), [lists]);
  const rayonName = RAYONS.find((r) => r.id === rayonIds[0])?.name;

  const mutate = (list, it, add) => {
    setLists((l) => ({ ...l, [list]: add ? [it, ...l[list].filter((x) => keyOf(x) !== keyOf(it))] : l[list].filter((x) => keyOf(x) !== keyOf(it)) }));
    (add ? store.add(list, it) : store.remove(list, it)).catch(() => say('Oups, la sauvegarde a calé. Vérifie ta connexion.'));
  };

  const addPanier = (it) => {
    mutate('panier', slim(it, { rayon: it.rayon || rayonName }), true);
    setBump(true); setTimeout(() => setBump(false), 500);
  };

  const onSwipe = (action, it) => {
    if (action === 'panier') addPanier(it);
    if (action === 'jamais') { mutate('jamais', slim(it, { rayon: it.rayon || rayonName }), true); say('Banni du rayon. Zap ne te le remontrera jamais.'); }
  };
  const onUndo = (action, it) => {
    if (action === 'panier') mutate('panier', it, false);
    if (action === 'jamais') mutate('jamais', it, false);
    say('Rembobiné !');
  };

  const isDeckCurrent = (it) => screen === 'deck' && deck.current?.current() && keyOf(deck.current.current()) === keyOf(it);

  // « On regarde ça » : rangé dans les déjà vus, puis l'animation du lecteur
  const play = (it, d) => {
    const wasPanier = lists.panier.some((x) => keyOf(x) === keyOf(it));
    mutate('vus', slim(it, { rayon: it.rayon || rayonName }), true);
    if (wasPanier) mutate('panier', it, false);
    setPanierOpen(false);
    setOverlay({ kind: 'lecture', item: it, detail: d, wasPanier });
  };
  const closeLecture = () => {
    const it = overlay.item;
    if (isDeckCurrent(it)) deck.current.swipe('skip');
    setOverlay(null);
  };
  const cancelLecture = () => {
    const { item: it, wasPanier } = overlay;
    mutate('vus', it, false);
    if (wasPanier) mutate('panier', slim(it, { rayon: it.rayon || rayonName }), true);
    setOverlay(null);
    say('Rembobiné ! On fait comme si de rien n\'était.');
  };

  if (!authReady) return <div className="app"><Loading text="Zap allume la boutique…" /></div>;
  if (!user && !guest) return <Login error={authError} onGuest={() => { ls.set(GUEST, true); setGuest(true); }} />;
  if (prenom === null) return <div className="app"><Loading text="Zap cherche ta carte…" /></div>;

  return (
    <>
      {screen === 'rayons' && (
        <Rayons fmt={fmt} setFmt={setFmt} rayonIds={rayonIds} setRayonIds={setRayonIds} filters={filters} setFilters={setFilters}
          panierCount={lists.panier.length} bump={bump} onPanier={() => setPanierOpen(true)} onEnter={() => setScreen('deck')} />
      )}
      {screen === 'deck' && (
        <Deck ref={deck} fmt={fmt} rayonIds={rayonIds} filters={filters} setFilters={setFilters} excluded={excluded}
          onBack={() => setScreen('rayons')} onPanierOpen={() => setPanierOpen(true)} panierCount={lists.panier.length} bump={bump}
          onSwipe={onSwipe} onUndo={onUndo} number={cardNumber(user).replace(' ', '').slice(-4)}
          onConseil={(item, detail) => setOverlay({ kind: 'fiche', item, detail })}
          onTonight={(item, detail) => setOverlay({ kind: 'fiche', item, detail, soir: true })} />
      )}
      {panierOpen && (
        <Panier lists={lists} prenom={prenom} number={cardNumber(user)} guest={!user}
          onClose={() => setPanierOpen(false)}
          onTonight={(item) => setOverlay({ kind: 'fiche', item, soir: true })}
          onRemove={(list, it) => mutate(list, it, false)}
          onRename={(p) => { setPrenom(p); store.setPrenom(p).catch(() => {}); }}
          onLogout={async () => { await supabase.auth.signOut(); setPanierOpen(false); setLists({ panier: [], jamais: [], vus: [] }); setPrenom(null); setScreen('rayons'); }}
          onLogin={() => { ls.set(GUEST, false); setGuest(false); setPanierOpen(false); }} />
      )}
      {overlay?.kind === 'fiche' && (
        <Conseil item={overlay.item} detail={overlay.detail} soir={overlay.soir} inPanier={lists.panier.some((x) => keyOf(x) === keyOf(overlay.item))}
          onClose={() => setOverlay(null)}
          onPanier={(it) => {
            if (isDeckCurrent(it)) { setOverlay(null); setTimeout(() => deck.current?.swipe('right'), 120); }
            else addPanier(it);
          }}
          onPlay={play} />
      )}
      {overlay?.kind === 'lecture' && <Lecture item={overlay.item} detail={overlay.detail} onClose={closeLecture} onCancel={cancelLecture} />}
      {user && prenom === '' && !panierOpen && <Prenom onDone={(p) => { setPrenom(p || ' '); if (p) store.setPrenom(p).catch(() => {}); }} />}
      <Toast msg={toast} />
    </>
  );
}

function Prenom({ onDone }) {
  const [v, setV] = useState('');
  return (
    <div className="app" style={{ position: 'fixed', inset: 0, zIndex: 40, margin: '0 auto', justifyContent: 'center' }}>
      <Planet top="calc(100dvh - 220px)" />
      <img src="/zap/mascotte-saute-de-joie.webp" alt="" width="200" height="200" className="floaty" style={{ alignSelf: 'center', objectFit: 'contain', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,.5))' }} />
      <form onSubmit={(e) => { e.preventDefault(); onDone(v.trim()); }} style={{ margin: '10px 20px 0', background: '#fff', color: '#081440', borderRadius: 12, padding: '18px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 10px 0 #081440' }}>
        <h2 className="russo" style={{ margin: 0, fontSize: 21, color: '#1B3FA0' }}>Bienvenue au club !</h2>
        <label htmlFor="prenom" style={{ fontSize: 15, fontWeight: 500 }}>Dernière formalité : quel prénom on imprime sur ta carte ?</label>
        <input id="prenom" className="field" autoFocus maxLength={24} autoComplete="given-name" placeholder="Ton prénom" value={v} onChange={(e) => setV(e.target.value)} />
        <button className="btn btn-red" type="submit">VALIDER MA CARTE <Play /></button>
        <button type="button" className="link" style={{ color: '#4A5878' }} onClick={() => onDone('')}>Plus tard</button>
      </form>
    </div>
  );
}
