import React, { useState } from 'react';
import { supabase } from '../lib/store.js';
import { Play, Planet } from '../components/ui.jsx';

export default function Login({ onGuest, error }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(error || '');

  const send = async (e) => {
    e?.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Hmm, cet email a l\'air bizarre. Vérifie ?'); return; }
    setBusy(true); setErr('');
    const { error: er } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (er) {
      setErr(/rate|seconds|limit/i.test(er.message)
        ? 'Doucement ! Trop de cartes demandées d\'un coup. Réessaie dans une minute.'
        : 'Impossible d\'envoyer la carte : ' + er.message);
      return;
    }
    setStep('sent');
  };

  return (
    <div className="app">
      <Planet top={300} />
      <h1 style={{ margin: 0, padding: '18px 12px 0', display: 'flex', justifyContent: 'center' }}>
        <img src="/logo.svg" alt="Zapette, le vidéo club de ton canapé" width="320" height="203" style={{ width: 'min(320px, 82vw)', height: 'auto' }} />
      </h1>

      <div style={{ position: 'relative', flex: 1, minHeight: 210 }}>
        <div style={{
          position: 'absolute', left: '50%', top: 0, marginLeft: -153, width: 306, height: 193, borderRadius: 14, transform: 'rotate(-4deg) scale(var(--cs, 1))', transformOrigin: 'center top', overflow: 'hidden',
          background: 'linear-gradient(160deg, #2A55C8 0%, #1B3FA0 45%, #0E2470 100%)', boxShadow: '0 18px 36px rgba(0,0,0,.55), inset 0 0 0 2px rgba(255,255,255,.35)',
        }} aria-hidden="true">
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.09) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          <div style={{ position: 'absolute', right: -40, bottom: -48, width: 170, height: 170, borderRadius: '50%', background: 'radial-gradient(circle, #0E2470 0 9%, #E9EEF5 9.5% 13%, transparent 13.5%), conic-gradient(from 30deg, #C9D3E0, #FFFFFF, #8D99AD, #E9EEF5, #A9B6C9, #FFFFFF, #8D99AD, #C9D3E0)', boxShadow: '0 0 0 2px rgba(255,255,255,.4)' }} />
          <div style={{ position: 'absolute', left: 16, top: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="title-outline" style={{ fontSize: 26, WebkitTextStroke: '4px #0E2470', textShadow: '3px 3px 0 #E2231A' }}>ZAPETTE</span>
            <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: 11, letterSpacing: 2, color: '#FFC400' }}>CARTE CLUB PRIVILÈGE ★</span>
          </div>
          <div style={{ position: 'absolute', right: 16, top: 18 }}><Play w={26} h={30} /></div>
          <div style={{ position: 'absolute', left: 16, bottom: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: 3, color: '#E9EEF5' }}>0000 0042</span>
            <span style={{ fontStyle: 'italic', fontWeight: 800, fontSize: 17 }}>[Ton prénom]</span>
          </div>
        </div>
        <img src={step === 'sent' ? '/zap/mascotte-montre-carte.webp' : '/zap/mascotte-accueil.webp'} alt=""
          style={{ position: 'absolute', left: '50%', marginLeft: -42, top: 6, width: 200, height: 230, objectFit: 'contain', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,.5))' }} />
      </div>

      <form onSubmit={send} style={{ position: 'relative', margin: '0 20px 28px', background: '#fff', color: '#081440', borderRadius: 12, padding: '18px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 10px 0 #081440' }}>
        {step === 'email' ? (
          <>
            <h2 className="russo" style={{ margin: 0, fontSize: 21, color: '#1B3FA0' }}>Deviens membre VIP™ !</h2>
            <label htmlFor="email" style={{ fontSize: 15, fontWeight: 500 }}>Ton email, et ta carte arrive à la vitesse de la lumière.</label>
            <input id="email" className="field" type="email" inputMode="email" autoComplete="email" placeholder="toi@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
            {err && <p role="alert" style={{ margin: 0, color: '#C0170F', fontWeight: 700, fontSize: 14 }}>{err}</p>}
            <button className="btn btn-red" type="submit" disabled={busy}>{busy ? 'ENVOI…' : 'RECEVOIR MA CARTE'} <Play /></button>
            <p style={{ margin: 0, fontSize: 13, color: '#4A5878', lineHeight: 1.35 }}>Zéro mot de passe, 100 % magie : un lien arrive dans ta boîte mail. Satisfait ou rembobiné !</p>
          </>
        ) : (
          <>
            <h2 className="russo" style={{ margin: 0, fontSize: 21, color: '#1B3FA0' }}>Carte en route !</h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.4 }}>Un lien magique file vers <strong>{email}</strong>. Ouvre-le sur ce téléphone et t'es dans le club. Pense à regarder dans les spams, Zap a parfois une tête suspecte.</p>
            {err && <p role="alert" style={{ margin: 0, color: '#C0170F', fontWeight: 700, fontSize: 14 }}>{err}</p>}
            <button type="button" className="btn btn-white" style={{ border: '2px solid #C9D3E0' }} onClick={() => setStep('email')}>Changer d'email</button>
            <button type="button" className="link" style={{ color: '#1B3FA0' }} onClick={send} disabled={busy}>Renvoyer le lien</button>
          </>
        )}
      </form>
      <button className="link" onClick={onGuest} style={{ position: 'relative', margin: '-18px auto 18px', color: '#E9EEF5' }}>Juste jeter un œil, sans carte</button>
    </div>
  );
}
