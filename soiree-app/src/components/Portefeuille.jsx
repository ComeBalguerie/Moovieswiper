import React from 'react';

// Le portefeuille de mes potes : leurs mini cartes club sortent en éventail.
const TEINTES = [
  ['#3463DA', '#11307F', '#fff'], ['#FF4A3F', '#A3140D', '#fff'], ['#FFE07A', '#E0A800', '#0A1A4A'],
  ['#E9EEF5', '#8D99AD', '#0A1A4A'], ['#2A2D3C', '#0B0C12', '#FFC400'], ['#5FD3FF', '#1B6FB8', '#0A1A4A'],
];
const teinte = (id) => TEINTES[[...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % TEINTES.length];

function MiniCarte({ nom, id, angle, x, nouveau, plus, z }) {
  const [c1, c2, txt] = plus ? ['transparent', 'transparent', '#BFD6FF'] : teinte(id);
  return (
    <div style={{ position: 'absolute', left: x, bottom: 20, width: 74, height: 50, borderRadius: 6, zIndex: z,
      transform: `rotate(${angle}deg)`, transformOrigin: '50% 140%',
      background: plus ? 'rgba(5,10,31,.4)' : `linear-gradient(150deg, ${c1}, ${c2})`,
      border: plus ? '1.5px dashed rgba(191,214,255,.7)' : '1px solid rgba(255,255,255,.55)',
      boxShadow: plus ? 'none' : '0 4px 8px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.5)', overflow: 'hidden' }}>
      {plus ? (
        <span className="russo" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: txt }}>+ AJOUTER</span>
      ) : (
        <>
          <div style={{ position: 'absolute', left: -6, right: -6, top: 24, height: 6, transform: 'rotate(-8deg)', background: 'rgba(255,255,255,.22)' }} />
          <div style={{ position: 'absolute', right: 6, top: 18, width: 11, height: 8, borderRadius: 2, background: 'linear-gradient(135deg, #FFF0A0, #E0A800 50%, #FFD95A)' }} />
          <span style={{ position: 'absolute', left: 6, top: 5, right: 6, fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 800, fontSize: 10, letterSpacing: 0.5, color: txt, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            textShadow: txt === '#fff' ? '0 -1px 0 rgba(255,255,255,.6), 0 1px 0 rgba(0,0,0,.5)' : 'none' }}>{nom}</span>
          {nouveau && (
            <span className="russo" style={{ position: 'absolute', left: 8, top: 20, fontSize: 9, color: '#E2231A', border: '1.5px solid #E2231A', borderRadius: 3, padding: '1px 3px', background: 'rgba(255,255,255,.85)', transform: 'rotate(-10deg)' }}>NOUVEAU ?</span>
          )}
        </>
      )}
    </div>
  );
}

export default function Portefeuille({ potes = [], recues = [], onClick }) {
  const cartes = [
    ...recues.slice(0, 2).map((m) => ({ ...m, nouveau: true })),
    ...potes.slice(0, 5 - Math.min(2, recues.length)),
  ];
  const tout = [...cartes, { id: '+', plus: true }];
  const n = tout.length;
  const span = Math.min(40, n * 9);
  return (
    <button onClick={onClick} aria-label={`Mes potes : ${potes.length}${recues.length ? `, ${recues.length} demande` : ''}`}
      style={{ alignSelf: 'stretch', position: 'relative', height: 112, display: 'flex', alignItems: 'stretch', gap: 8, padding: '0 6px 0 14px', borderRadius: 16,
        background: 'linear-gradient(160deg, rgba(27,79,196,.35), rgba(5,10,31,.6))', border: '1px solid rgba(191,214,255,.3)', color: '#fff', textAlign: 'left', overflow: 'hidden' }}>
      <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, flexShrink: 0, zIndex: 2 }}>
        <span className="kicker">MES POTES</span>
        <span className="russo" style={{ fontSize: 26, lineHeight: 1 }}>{potes.length}</span>
        <span style={{ fontSize: 12, color: recues.length ? '#FFC400' : '#BFD6FF', fontWeight: 700 }}>
          {recues.length ? `${recues.length} demande${recues.length > 1 ? 's' : ''} !` : potes.length ? 'Voir le club ›' : 'Invite tes potes ›'}
        </span>
      </span>

      {/* le portefeuille */}
      <span style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        {tout.map((c, i) => {
          const t = n === 1 ? 0 : i / (n - 1);
          return <MiniCarte key={c.id} id={c.id} nom={c.prenom} nouveau={c.nouveau} plus={c.plus} z={c.plus ? 0 : i + 1}
            angle={-span / 2 + t * span} x={`calc(50% - 35px + ${(t - 0.5) * Math.min(150, n * 28)}px)`} />;
        })}
        <span style={{ position: 'absolute', left: '4%', right: '4%', bottom: -10, height: 34, zIndex: 20, borderRadius: '10px 10px 0 0',
          background: 'linear-gradient(#3A2A22, #24170F 60%, #1A100A)', boxShadow: '0 -3px 8px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.18)' }}>
          <span style={{ position: 'absolute', inset: 5, bottom: -10, borderRadius: '7px 7px 0 0', border: '1.5px dashed rgba(255,214,150,.45)', borderBottom: 'none' }} />
          <span className="russo" style={{ position: 'absolute', left: 0, right: 0, top: 9, textAlign: 'center', fontSize: 9, letterSpacing: 2, color: 'rgba(255,214,150,.75)' }}>ZAPETTE · CLUB</span>
        </span>
        {recues.length > 0 && (
          <span className="russo" style={{ position: 'absolute', right: 10, top: 8, zIndex: 25, minWidth: 22, height: 22, borderRadius: 11, background: '#E2231A', border: '2px solid #fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{recues.length}</span>
        )}
      </span>
    </button>
  );
}
