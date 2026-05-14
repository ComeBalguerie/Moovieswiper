import { useState, useRef, useMemo, useCallback } from "react";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MOODS = [
  { id:"action",   label:"Adrénaline", emoji:"💥", genres:[28,12] },
  { id:"comedy",   label:"Marrant",    emoji:"😂", genres:[35] },
  { id:"thriller", label:"Tension",    emoji:"😰", genres:[53,9648] },
  { id:"romance",  label:"Romantique", emoji:"💕", genres:[10749] },
  { id:"horror",   label:"Flipper",    emoji:"👻", genres:[27] },
  { id:"scifi",    label:"Ailleurs",   emoji:"🚀", genres:[878,14] },
  { id:"drama",    label:"Émotions",   emoji:"🎭", genres:[18] },
  { id:"doc",      label:"Curieux",    emoji:"🧠", genres:[99] },
];

const DURATIONS = [
  { id:"all",    label:"Peu importe",       min:0,   max:999 },
  { id:"short",  label:"Court  < 1h30",     min:0,   max:90  },
  { id:"normal", label:"Normal  1h30–2h",   min:90,  max:120 },
  { id:"long",   label:"Long  > 2h",        min:120, max:999 },
];

const ERAS = [
  { id:"all",     label:"Peu importe",          min:1900, max:2099 },
  { id:"classic", label:"Classique  avant 1990",min:1900, max:1989 },
  { id:"modern",  label:"Moderne  1990–2010",   min:1990, max:2010 },
  { id:"recent",  label:"Récent  après 2010",   min:2011, max:2099 },
];

const RATINGS = [
  { id:0,   label:"Peu importe" },
  { id:7,   label:"Bien  7+" },
  { id:8,   label:"Excellent  8+" },
  { id:8.5, label:"Chef-d'œuvre  8.5+" },
];

const COLORS = ["#FFD600","#FF4B4B","#4BFFA5","#4BBFFF","#FF4BF0","#FF9A3C","#B4FF4B","#FF6B6B"];
const K = (i) => COLORS[i % COLORS.length];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]       = useState("filters");
  const [type, setType]           = useState("movie");
  const [mood, setMood]           = useState(null);
  const [duration, setDuration]   = useState("all");
  const [era, setEra]             = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [cards, setCards]         = useState([]);
  const [idx, setIdx]             = useState(0);
  const [loading, setLoading]     = useState(false);
  const [saved, setSaved]         = useState([]);
  const [banned, setBanned]       = useState([]);
  const [matched, setMatched]     = useState(null);
  const [dragX, setDragX]         = useState(0);
  const [dragging, setDragging]   = useState(false);
  const dragStart = useRef(null);

  const activeDeck = useMemo(
    () => cards.filter(c => !banned.includes(c.id) && !saved.find(s => s.id === c.id)),
    [cards, banned, saved]
  );
  const current = activeDeck[idx];
  const nextCard = activeDeck[idx + 1];

  const fetchCards = useCallback(async (moodObj) => {
    setLoading(true);
    setCards([]);
    setIdx(0);
    try {
      const eraObj = ERAS.find(e => e.id === era) || ERAS[0];
      const durObj = DURATIONS.find(d => d.id === duration) || DURATIONS[0];

      const buildParams = (mediaType, page) => {
        const p = new URLSearchParams({
          api_key: TMDB_KEY,
          language: "fr-FR",
          sort_by: "popularity.desc",
          with_genres: moodObj.genres.join(","),
          "vote_count.gte": "10",
          page: String(page),
        });
        if (minRating > 0) p.set("vote_average.gte", String(minRating));
        if (eraObj.id !== "all") {
          if (mediaType === "movie") {
            p.set("primary_release_date.gte", `${eraObj.min}-01-01`);
            p.set("primary_release_date.lte", `${eraObj.max}-12-31`);
          } else {
            p.set("first_air_date.gte", `${eraObj.min}-01-01`);
            p.set("first_air_date.lte", `${eraObj.max}-12-31`);
          }
        }
        if (durObj.id !== "all" && mediaType === "movie") {
          p.set("with_runtime.gte", String(durObj.min));
          if (durObj.max < 999) p.set("with_runtime.lte", String(durObj.max));
        }
        return p;
      };

      const fetchPages = async (mediaType, pages) => {
        const results = await Promise.all(
          pages.map(page =>
            fetch(`${TMDB_BASE}/discover/${mediaType}?${buildParams(mediaType, page)}`)
              .then(r => r.json())
              .then(d => (d.results || []).filter(m => m.poster_path).map(m => ({ ...m, _type: mediaType })))
          )
        );
        return results.flat();
      };

      let all = [];
      if (type === "all") {
        const [movies, tvs] = await Promise.all([
          fetchPages("movie", [1, 2, 3]),
          fetchPages("tv", [1, 2, 3]),
        ]);
        all = [...movies, ...tvs];
      } else {
        all = await fetchPages(type, [1, 2, 3, 4, 5]);
      }

      const seen = new Set();
      const unique = all.filter(m => {
        const k = `${m._type}-${m.id}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      }).sort(() => Math.random() - 0.5);

      setCards(unique);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [type, era, duration, minRating]);

  const startSwipe = () => {
    if (!mood) return;
    fetchCards(mood);
    setScreen("swipe");
  };

  const onDown = (e) => { dragStart.current = e.clientX ?? e.touches?.[0]?.clientX; setDragging(true); };
  const onMove = (e) => { if (!dragging || dragStart.current == null) return; setDragX((e.clientX ?? e.touches?.[0]?.clientX) - dragStart.current); };
  const onUp   = () => { if (dragX > 90) doSave(); else if (dragX < -90) doSkip(); setDragX(0); setDragging(false); dragStart.current = null; };

  const advance  = () => { if (idx >= activeDeck.length - 1) setIdx(0); else setIdx(i => i + 1); };
  const doSkip   = () => { setDragX(0); advance(); };
  const doSave   = () => { if (!current) return; setSaved(s => [...s, current]); advance(); };
  const doBan    = () => { if (!current) return; setBanned(b => [...b, current.id]); advance(); };
  const doMatch  = () => { if (!current) return; setMatched(current); setScreen("match"); };
  const removeSaved = (id) => setSaved(s => s.filter(x => x.id !== id));

  // ── FILTERS SCREEN ───────────────────────────────────────────────────────────
  if (screen === "filters") return (
    <div style={S.root}>
      <div style={S.topBar}>
        <span style={S.logo}>CE SOIR<span style={{color:"#FFD600"}}>.</span></span>
        {saved.length > 0 && (
          <button style={S.chip} onClick={() => setScreen("saved")}>🔖 {saved.length}</button>
        )}
      </div>

      <div style={S.scroll}>
        {/* FORMAT */}
        <Section label="Format">
          <div style={S.row}>
            {[["movie","🎬 Films"],["tv","📺 Séries"],["all","Tout"]].map(([v,l]) => (
              <ChipBtn key={v} active={type===v} color="#FFD600" onClick={() => setType(v)}>{l}</ChipBtn>
            ))}
          </div>
        </Section>

        {/* MOOD */}
        <Section label="Mood">
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            {MOODS.map((m, i) => (
              <button key={m.id} onClick={() => setMood(mood?.id===m.id ? null : m)} style={{
                ...S.moodBtn,
                background: mood?.id===m.id ? K(i) : "#141414",
                color: mood?.id===m.id ? "#000" : "#444",
                border: mood?.id===m.id ? `2px solid ${K(i)}` : "2px solid #222",
              }}>
                <span style={{fontSize:22}}>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* DURATION */}
        <Section label="Durée">
          <div style={S.col}>
            {DURATIONS.map(d => (
              <WideBtn key={d.id} active={duration===d.id} color="#4BFFA5" onClick={() => setDuration(d.id)}>{d.label}</WideBtn>
            ))}
          </div>
        </Section>

        {/* ERA */}
        <Section label="Époque">
          <div style={S.col}>
            {ERAS.map(e => (
              <WideBtn key={e.id} active={era===e.id} color="#4BBFFF" onClick={() => setEra(e.id)}>{e.label}</WideBtn>
            ))}
          </div>
        </Section>

        {/* RATING */}
        <Section label="Note minimum">
          <div style={S.col}>
            {RATINGS.map(r => (
              <WideBtn key={r.id} active={minRating===r.id} color="#FF9A3C" onClick={() => setMinRating(r.id)}>{r.label}</WideBtn>
            ))}
          </div>
        </Section>

        <div style={{height:100}} />
      </div>

      <div style={S.bottomBar}>
        <button
          style={{...S.bigBtn, opacity: mood ? 1 : 0.3}}
          disabled={!mood}
          onClick={startSwipe}
        >
          {mood ? `${mood.emoji} Lancer le swipe →` : "Choisis un mood pour commencer"}
        </button>
      </div>
    </div>
  );

  // ── SAVED SCREEN ─────────────────────────────────────────────────────────────
  if (screen === "saved") return (
    <div style={S.root}>
      <div style={S.topBar}>
        <button style={S.iconBtn} onClick={() => setScreen(cards.length ? "swipe" : "filters")}>←</button>
        <span style={S.logo}>Ma sélection 🔖</span>
        <div style={{width:40}} />
      </div>
      <div style={{...S.scroll, paddingTop:8}}>
        {saved.length === 0 ? (
          <p style={{color:"#333", textAlign:"center", fontFamily:"'DM Sans',sans-serif", marginTop:60}}>Aucun film mis de côté.</p>
        ) : saved.map(m => (
          <div key={m.id} style={S.savedRow}>
            <img
              src={`${IMG}${m.poster_path}`}
              alt={m.title || m.name}
              style={S.thumb}
              onError={e => { e.target.style.background="#1a1a1a"; e.target.src=""; }}
            />
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontWeight:800, color:"#fff", fontSize:15, lineHeight:1.2, fontFamily:"'Bricolage Grotesque',sans-serif"}}>{m.title || m.name}</div>
              <div style={{color:"#444", fontSize:12, marginTop:4, fontFamily:"'DM Sans',sans-serif"}}>
                {(m.release_date || m.first_air_date || "").slice(0,4)} · ⭐ {m.vote_average?.toFixed(1)} · {m._type === "movie" ? "🎬" : "📺"}
              </div>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              <button style={S.iconBtn} onClick={() => { setMatched(m); setScreen("match"); }}>▶</button>
              <button style={{...S.iconBtn, background:"#1a1a1a", color:"#555"}} onClick={() => removeSaved(m.id)}>✕</button>
            </div>
          </div>
        ))}
        <div style={{height:40}} />
      </div>
    </div>
  );

  // ── MATCH SCREEN ─────────────────────────────────────────────────────────────
  if (screen === "match") return (
    <div style={{...S.root, justifyContent:"flex-start", overflowY:"auto"}}>
      <div style={{position:"relative", width:"100%", maxWidth:480}}>
        <img
          src={`${IMG}${matched?.poster_path}`}
          alt=""
          style={{width:"100%", display:"block", maxHeight:"70vh", objectFit:"cover"}}
        />
        <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,#000 70%)",padding:"60px 24px 20px"}}>
          <div style={{...S.tag, background:"#4BFFA5", color:"#000", marginBottom:12, display:"inline-flex"}}>✅ Ce soir c'est ça !</div>
          <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:900, fontSize:34, color:"#fff", lineHeight:1.05, margin:0}}>
            {matched?.title || matched?.name}
          </h1>
        </div>
      </div>
      <div style={{padding:"20px 24px 40px", maxWidth:480, width:"100%"}}>
        <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:20}}>
          <span style={{...S.tag, background:"#FFD600", color:"#000"}}>⭐ {matched?.vote_average?.toFixed(1)}</span>
          <span style={{...S.tag, background:"#1a1a1a", color:"#555"}}>{(matched?.release_date || matched?.first_air_date || "").slice(0,4)}</span>
          <span style={{...S.tag, background:"#1a1a1a", color:"#555"}}>{matched?._type === "movie" ? "🎬 Film" : "📺 Série"}</span>
        </div>
        {matched?.overview && (
          <p style={{color:"#888", fontFamily:"'DM Sans',sans-serif", lineHeight:1.65, fontSize:14, marginBottom:24}}>{matched.overview}</p>
        )}
        <div style={{display:"flex", gap:10}}>
          <button style={{...S.bigBtn, flex:1}} onClick={() => { setScreen("swipe"); setMatched(null); }}>← Continuer</button>
          <button style={{...S.bigBtn, flex:1, background:"#1a1a1a", color:"#fff"}} onClick={() => { setScreen("filters"); setMatched(null); }}>Filtres</button>
        </div>
      </div>
    </div>
  );

  // ── SWIPE SCREEN ─────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>
      <div style={S.topBar}>
        <button style={S.iconBtn} onClick={() => setScreen("filters")}>←</button>
        <div style={{display:"flex", gap:6}}>
          {mood && <span style={{...S.tag, background: K(MOODS.findIndex(m=>m.id===mood.id)), color:"#000"}}>{mood.emoji} {mood.label}</span>}
          <span style={{...S.tag, background:"#1a1a1a", color:"#444"}}>{type==="movie"?"🎬":type==="tv"?"📺":"🎬📺"}</span>
        </div>
        <button style={S.chip} onClick={() => setScreen("saved")}>🔖 {saved.length}</button>
      </div>

      <div style={{flex:1, width:"100%", maxWidth:480, display:"flex", flexDirection:"column", alignItems:"center", padding:"0 16px 16px", boxSizing:"border-box"}}>
        {loading ? (
          <div style={S.centered}><Loader /></div>
        ) : !current ? (
          <div style={S.centered}>
            <p style={{color:"#aaa", fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:22}}>Plus rien !</p>
            <p style={{color:"#333", fontSize:13, fontFamily:"'DM Sans',sans-serif", textAlign:"center"}}>Élargis les filtres ou change de mood</p>
            <button style={{...S.bigBtn, marginTop:20, width:"auto", padding:"16px 32px"}} onClick={() => setScreen("filters")}>Modifier les filtres</button>
          </div>
        ) : (
          <>
            {/* Card stack */}
            <div style={{position:"relative", width:"100%", flex:1, display:"flex", alignItems:"flex-start", paddingTop:8}}>
              {nextCard && (
                <div style={{...S.card, position:"absolute", top:16, left:"50%", transform:"translateX(-50%) scale(0.92)", zIndex:0, filter:"brightness(0.3)", width:"calc(100% - 0px)"}}>
                  <img src={`${IMG}${nextCard.poster_path}`} alt="" style={S.poster} />
                </div>
              )}
              <div
                style={{
                  ...S.card,
                  position:"relative", zIndex:1, width:"100%",
                  transform:`translateX(${dragX}px) rotate(${dragX*0.025}deg)`,
                  transition: dragging ? "none" : "transform 0.25s cubic-bezier(.17,.67,.43,1.2)",
                  cursor: dragging ? "grabbing" : "grab",
                }}
                onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
              >
                <img
                  src={`${IMG}${current.poster_path}`}
                  alt={current.title || current.name}
                  style={S.poster}
                  draggable={false}
                />
                <div style={S.overlay} />

                {dragX > 30 && <div style={{...S.swipeHint, left:16, background:"#FFD600", color:"#000"}}>🔖 PLUS TARD</div>}
                {dragX < -30 && <div style={{...S.swipeHint, right:16, background:"#222", color:"#888"}}>PASSER</div>}

                <div style={S.cardInfo}>
                  <h2 style={S.cardTitle}>{current.title || current.name}</h2>
                  <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
                    <span style={{...S.tag, background:"#FFD600", color:"#000", fontSize:11}}>⭐ {current.vote_average?.toFixed(1)}</span>
                    <span style={{...S.tag, background:"rgba(0,0,0,0.6)", color:"#888", fontSize:11}}>{(current.release_date||current.first_air_date||"").slice(0,4)}</span>
                    <span style={{...S.tag, background:"rgba(0,0,0,0.6)", color:"#888", fontSize:11}}>{current._type==="movie"?"🎬 Film":"📺 Série"}</span>
                  </div>
                  {current.overview && (
                    <p style={{color:"#aaa", fontFamily:"'DM Sans',sans-serif", fontSize:12, lineHeight:1.5, marginTop:8}}>
                      {current.overview.slice(0,110)}{current.overview.length>110?"…":""}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 4 action buttons */}
            <div style={S.actions}>
              <ActionBtn emoji="→" label="Passer" bg="#1a1a1a" fg="#555" onClick={doSkip} />
              <ActionBtn emoji="🔖" label="Plus tard" bg="#FFD600" fg="#000" onClick={doSave} big />
              <ActionBtn emoji="❤️" label="Ce soir !" bg="#4BFFA5" fg="#000" onClick={doMatch} big />
              <ActionBtn emoji="🚫" label="Jamais" bg="#1a1a1a" fg="#FF4B4B" onClick={doBan} />
            </div>

            <p style={{color:"#222", fontFamily:"'DM Sans',sans-serif", fontSize:10, marginTop:6}}>{idx+1} / {activeDeck.length}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={{marginBottom:28}}>
      <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#333", letterSpacing:2.5, textTransform:"uppercase", marginBottom:12}}>{label}</p>
      {children}
    </div>
  );
}

function ChipBtn({ active, color, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding:"10px 18px", borderRadius:50, border: active ? `2px solid ${color}` : "2px solid #222",
      background: active ? color : "#141414", color: active ? "#000" : "#444",
      cursor:"pointer", transition:"all 0.15s",
      fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight: active ? 800 : 500, fontSize:13,
    }}>{children}</button>
  );
}

function WideBtn({ active, color, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width:"100%", padding:"14px 18px", borderRadius:14, textAlign:"left",
      border: active ? `2px solid ${color}` : "2px solid #1a1a1a",
      background: active ? color : "#0f0f0f", color: active ? "#000" : "#444",
      cursor:"pointer", transition:"all 0.15s", marginBottom:6,
      fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight: active ? 700 : 400, fontSize:13,
    }}>{children}</button>
  );
}

function ActionBtn({ emoji, label, bg, fg, onClick, big }) {
  return (
    <button onClick={onClick} style={{
      width: big ? 70 : 56, height: big ? 70 : 56, borderRadius:"50%",
      border:"none", background:bg, color:fg, cursor:"pointer",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1,
      boxShadow:"0 4px 24px rgba(0,0,0,0.7)", transition:"transform 0.12s",
      fontFamily:"'DM Sans',sans-serif",
    }}
      onMouseEnter={e => e.currentTarget.style.transform="scale(1.1)"}
      onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
    >
      <span style={{fontSize: big ? 22 : 18}}>{emoji}</span>
      <span style={{fontSize:8, fontWeight:700, letterSpacing:0.5, opacity:0.65, textTransform:"uppercase"}}>{label}</span>
    </button>
  );
}

function Loader() {
  return (
    <div style={{display:"flex", gap:10}}>
      {[0,1,2].map(i => (
        <div key={i} style={{width:12, height:12, borderRadius:"50%", background:"#FFD600",
          animation:`bob 0.7s ${i*0.13}s infinite alternate`}} />
      ))}
      <style>{`@keyframes bob{from{transform:translateY(0)}to{transform:translateY(-14px)}}`}</style>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  root:      { width:"100%", maxWidth:480, minHeight:"100vh", background:"#0a0a0a", display:"flex", flexDirection:"column", userSelect:"none" },
  topBar:    { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 20px 8px" },
  logo:      { fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:900, fontSize:20, color:"#fff", letterSpacing:-0.5 },
  scroll:    { flex:1, overflowY:"auto", padding:"8px 20px 0" },
  bottomBar: { padding:"12px 20px 36px", background:"linear-gradient(transparent,#0a0a0a 35%)", position:"sticky", bottom:0 },
  bigBtn:    { width:"100%", padding:"18px", background:"#FFD600", color:"#000", border:"none", borderRadius:50, fontSize:16, fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, cursor:"pointer", letterSpacing:-0.2 },
  iconBtn:   { background:"#141414", border:"none", color:"#fff", width:40, height:40, borderRadius:50, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:600 },
  chip:      { background:"#141414", border:"none", color:"#FFD600", padding:"8px 14px", borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer", fontWeight:600 },
  tag:       { display:"inline-flex", alignItems:"center", gap:4, padding:"5px 12px", borderRadius:50, fontSize:12, fontFamily:"'DM Sans',sans-serif", fontWeight:600, whiteSpace:"nowrap" },
  moodBtn:   { display:"flex", alignItems:"center", gap:8, padding:"14px 14px", borderRadius:14, cursor:"pointer", transition:"all 0.15s", fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:14 },
  row:       { display:"flex", flexWrap:"wrap", gap:8 },
  col:       { display:"flex", flexDirection:"column" },
  card:      { borderRadius:24, overflow:"hidden", boxShadow:"0 24px 60px rgba(0,0,0,0.95)", background:"#111", aspectRatio:"2/3" },
  poster:    { width:"100%", height:"100%", objectFit:"cover", display:"block" },
  overlay:   { position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.97) 0%,rgba(0,0,0,0.1) 50%,transparent 100%)" },
  cardInfo:  { position:"absolute", bottom:0, left:0, right:0, padding:"20px 20px 16px" },
  cardTitle: { fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:900, fontSize:24, color:"#fff", margin:"0 0 8px", lineHeight:1.1 },
  swipeHint: { position:"absolute", top:20, padding:"8px 16px", borderRadius:50, fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:13, letterSpacing:0.5, zIndex:10 },
  actions:   { display:"flex", gap:12, alignItems:"center", marginTop:14, justifyContent:"center" },
  savedRow:  { display:"flex", gap:14, alignItems:"center", padding:"14px 0", borderBottom:"1px solid #141414" },
  thumb:     { width:54, height:80, objectFit:"cover", borderRadius:10, background:"#141414", flexShrink:0 },
  centered:  { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 },
};
