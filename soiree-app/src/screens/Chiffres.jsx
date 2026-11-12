import React, { useEffect, useState } from 'react';
import { chiffres } from '../lib/track.js';
import { Back } from '../components/ui.jsx';

const Tuile = ({ n, label, sub, fort }) => (
  <div style={{ borderRadius: 12, padding: '10px 12px', background: fort ? 'linear-gradient(#FFF0A0, #FFC400 55%, #F2AE00)' : 'rgba(5,10,31,.6)', border: '1px solid rgba(191,214,255,.3)', color: fort ? '#0A1A4A' : '#fff', display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span className="russo" style={{ fontSize: 28, lineHeight: 1 }}>{n}</span>
    <span style={{ fontSize: 12, fontWeight: 800 }}>{label}</span>
    {sub && <span style={{ fontSize: 11, opacity: 0.75 }}>{sub}</span>}
  </div>
);

// Tableau de bord réservé à l'équipe : est-ce que les gens reviennent, et est-ce qu'ils choisissent un film ?
export default function Chiffres({ onClose }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => { chiffres().then(setD).catch(() => setErr(true)); }, []);
  const max = d ? Math.max(1, ...d.par_jour.map((j) => j.actifs)) : 1;
  return (
    <div className="app" style={{ position: 'fixed', inset: 0, zIndex: 46, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Back onClick={onClose} />
        <h1 className="title-outline" style={{ fontSize: 26 }}>LES CHIFFRES</h1>
      </div>
      {err && <p style={{ margin: 20, color: '#FF8A80' }}>Impossible de charger les chiffres.</p>}
      {!d && !err && <p style={{ margin: 20, color: '#BFD6FF' }}>Zap compte la caisse…</p>}
      {d && (
        <div style={{ padding: '14px 16px 30px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            <Tuile fort n={d.actifs_7j} label="actifs sur 7 jours" sub={`${d.actifs_hier_ou_ajd} hier ou aujourd'hui`} />
            <Tuile fort n={`${d.revenus}/${d.personnes_vues}`} label="sont revenus un autre jour" sub="depuis le début de la mesure" />
            <Tuile n={d.membres} label="membres" sub={`+${d.nouveaux_7j} cette semaine`} />
            <Tuile n={d.ce_soir_7j} label="« on regarde ça » (7 j)" sub={`${d.vus_total} films vus au total`} />
          </div>

          <div>
            <p className="kicker" style={{ margin: '0 0 8px' }}>PERSONNES ACTIVES PAR JOUR · 14 JOURS</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 110, padding: '8px 8px 0', borderRadius: 12, background: 'rgba(5,10,31,.6)', border: '1px solid rgba(191,214,255,.3)' }}>
              {d.par_jour.map((j) => (
                <div key={j.d} title={`${j.d} : ${j.actifs} actifs, ${j.swipes} swipes`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 3, height: '100%' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{j.actifs || ''}</span>
                  <span style={{ width: '100%', height: `${(j.actifs / max) * 62}px`, minHeight: 2, borderRadius: '3px 3px 0 0', background: j.ce_soir ? '#FFC400' : '#4D86F0' }} />
                  <span style={{ fontSize: 8, color: '#8DA4D6', paddingBottom: 4 }}>{j.d.slice(0, 2)}</span>
                </div>
              ))}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#8DA4D6' }}>En jaune : les jours où au moins un film a été choisi.</p>
          </div>

          <div>
            <p className="kicker" style={{ margin: '0 0 8px' }}>CETTE SEMAINE</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              <Tuile n={d.swipes_7j} label="swipes" />
              <Tuile n={d.fiches_7j} label="fiches ouvertes" />
              <Tuile n={d.tranche_7j} label="Zap tranche" />
              <Tuile n={d.avis_7j} label="avis donnés" />
              <Tuile n={d.duo_7j} label="soirées à deux" />
              <Tuile n={d.conseils_7j} label="conseils" />
            </div>
          </div>

          <div>
            <p className="kicker" style={{ margin: '0 0 8px' }}>LA BOUCLE</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              <Tuile n={d.panier_total} label="films dans les paniers" />
              <Tuile n={d.vus_total} label="films regardés" sub={`avis : ${d.avis.top || 0} top, ${d.avis.bien || 0} bien, ${d.avis.bof || 0} bof`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
