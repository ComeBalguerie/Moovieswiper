import React, { useState } from 'react';
import { supprimerCompte } from '../lib/track.js';
import { Back } from '../components/ui.jsx';

const TMDB_LOGO = 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg';
const CONTACT = 'contact@comebalguerie.com';

const H = ({ children }) => <h2 className="kicker" style={{ margin: '22px 0 8px', color: '#FFC400' }}>{children}</h2>;
const P = ({ children }) => <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.5, color: '#E9EEF5' }}>{children}</p>;

// À propos, crédits, confidentialité et suppression du compte.
export default function Apropos({ connecte, onClose, onSupprime }) {
  const [etape, setEtape] = useState(0); // 0 rien, 1 confirmation, 2 en cours
  const [err, setErr] = useState('');
  const supprimer = async () => {
    setEtape(2); setErr('');
    try { await supprimerCompte(); onSupprime(); } catch (e) { setErr('La suppression a échoué. Réessaie, ou écris-nous.'); setEtape(1); }
  };
  return (
    <div className="app" style={{ position: 'fixed', inset: 0, zIndex: 46, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Back onClick={onClose} />
        <h1 className="title-outline" style={{ fontSize: 26 }}>À PROPOS</h1>
      </div>
      <div style={{ padding: '4px 18px 30px' }}>
        <P>Zapette, le vidéo club de ton canapé. Une appli pour choisir le film ou la série du soir sans y passer la soirée.</P>

        <H>D'OÙ VIENNENT LES FILMS</H>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 8px' }}>
          <img src={TMDB_LOGO} alt="TMDB" width="120" onError={(e) => { e.currentTarget.replaceWith(Object.assign(document.createElement('strong'), { textContent: 'TMDB' })); }} />
        </div>
        <P>This product uses the TMDB API but is not endorsed or certified by TMDB.</P>
        <P>Les affiches, résumés, génériques et notes viennent de TMDB (The Movie Database). Zapette utilise l'API de TMDB mais n'est ni approuvée ni certifiée par TMDB.</P>
        <P>Les plateformes où regarder un film sont fournies par JustWatch. Les notes presse et IMDb passent par OMDb API.</P>

        <H>TES DONNÉES</H>
        <P><strong>Ce qu'on garde :</strong> ton pseudo, ton mot de passe (chiffré, illisible pour nous), tes listes de films (panier, déjà vus) et tes avis, tes plateformes, tes potes, les conseils échangés et les soirées Double Programme.</P>
        <P><strong>Mesure d'usage :</strong> on compte les actions faites dans l'appli (ouvertures, swipes, fiches ouvertes) pour l'améliorer. Aucune publicité, aucun traceur publicitaire, rien n'est vendu ni partagé.</P>
        <P><strong>Qui voit quoi :</strong> tes potes voient ton prénom et les conseils que tu leur envoies. Ton binôme de Double Programme voit ton panier, pour trouver vos films en commun. Personne d'autre.</P>
        <P><strong>Où c'est stocké :</strong> chez Supabase (base de données) et Vercel (hébergement du site). En mode visiteur, tout reste sur ton téléphone.</P>
        <P><strong>Tes droits :</strong> tu peux modifier ton prénom et tes listes à tout moment, et supprimer ton compte ci-dessous. Pour toute question ou demande : <a href={`mailto:${CONTACT}`} style={{ color: '#FFC400' }}>{CONTACT}</a>.</P>

        <H>ÉDITEUR</H>
        <P>Zapette est éditée par Côme Balguerie EI, Nice. Contact : {CONTACT}. Hébergement : Vercel Inc. (San Francisco, États-Unis).</P>

        {connecte && (
          <>
            <H>SUPPRIMER MON COMPTE</H>
            {etape === 0 && (
              <>
                <P>Ça efface définitivement ton compte, tes listes, tes potes et tes conseils. Impossible de revenir en arrière.</P>
                <button className="btn btn-glass" onClick={() => setEtape(1)} style={{ height: 46, fontSize: 14 }}>RENDRE MA CARTE DÉFINITIVEMENT</button>
              </>
            )}
            {etape >= 1 && (
              <div style={{ padding: 14, borderRadius: 14, border: '1px solid #FF8A80', background: 'rgba(226,35,26,.14)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Sûr de toi ? Tout sera effacé, pour de bon.</span>
                {err && <span role="alert" style={{ color: '#FF8A80', fontSize: 14, fontWeight: 700 }}>{err}</span>}
                <button className="btn btn-red" disabled={etape === 2} onClick={supprimer} style={{ height: 48 }}>{etape === 2 ? 'UN INSTANT…' : 'OUI, TOUT SUPPRIMER'}</button>
                <button className="link" disabled={etape === 2} onClick={() => setEtape(0)} style={{ color: '#BFD6FF' }}>Non, je garde ma carte</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
