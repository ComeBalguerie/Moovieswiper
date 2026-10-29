import React, { useState } from 'react';
import { supabase } from '../lib/store.js';
import { Play, Planet } from '../components/ui.jsx';

export default function Login({ onGuest, error }) {
  const [email, setEmail] = useState(() => { try { return localStorage.getItem('zapette-email') || ''; } catch (e) { return ''; } });
  const [step, setStep] = useState('email');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(error || '');
  const [pass, setPass] = useState('');
  const [member, setMember] = useState(() => { try { return !!localStorage.getItem('zapette-email'); } catch (e) { return false; } });

  const submit = async (e) => {
    e?.preventDefault();
    const mail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(mail)) { setErr('Hmm, cet email a l\'air bizarre. Vérifie ?'); return; }
    if (pass.length < 6) { setErr('Le mot de passe doit faire au moins 6 caractères.'); return; }
    setBusy(true); setErr('');
    try { localStorage.setItem('zapette-email', mail); } catch (e2) { /* rien */ }
    if (member) {
      const { error: er } = await supabase.auth.signInWithPassword({ email: mail, password: pass });
      setBusy(false);
      if (er) setErr(/confirm/i.test(er.message) ? 'Ta carte n\'est pas encore validée : clique sur le lien reçu par mail, puis reviens ici.' : 'Email ou mot de passe incorrect.');
      return;
    }
    const { data, error: er } = await supabase.auth.signUp({ email: mail, password: pass, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (er) {
      if (/registered|exists/i.test(er.message)) { setMember(true); setErr('Tu as déjà une carte avec cet email : connecte-toi.'); return; }
      setErr(/rate|seconds|limit/i.test(er.message) ? 'Doucement ! Réessaie dans une minute.' : 'Oups : ' + er.message);
      return;
    }
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setMember(true); setErr('Tu as déjà une carte avec cet email : connecte-toi.'); return;
    }
    if (!data.session) { setStep('confirm'); setMember(true); }
  };

  return (
    <div className="app" style={{ height: '100dvh', overflowY: 'auto' }}>
      <Planet top={300} />
      <h1 style={{ margin: 0, padding: '18px 12px 0', display: 'flex', justifyContent: 'center' }}>
        <img src="/logo.svg" alt="Zapette, le vidéo club de ton canapé" width="320" height="203" style={{ width: 'min(320px, 82vw)', height: 'auto' }} />
      </h1>

      <div style={{ position: 'relative', flex: 1, minHeight: 200, flexShrink: 0 }}>
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
        <img src={step === 'confirm' ? '/zap/mascotte-montre-carte.webp' : '/zap/mascotte-accueil.webp'} alt=""
          style={{ position: 'absolute', left: '50%', marginLeft: -42, top: 6, width: 200, height: 230, objectFit: 'contain', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,.5))' }} />
      </div>

      <form onSubmit={submit} style={{ position: 'relative', margin: '0 20px 28px', background: '#fff', color: '#081440', borderRadius: 12, padding: '18px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 10px 0 #081440' }}>
        {step === 'confirm' && (
          <p style={{ margin: 0, background: '#FFF4CC', border: '2px dashed #FFC400', borderRadius: 8, padding: 10, fontSize: 14, lineHeight: 1.4 }}>
            <strong>Carte presque prête !</strong> Clique sur le lien reçu par mail pour la valider, puis reviens ici et connecte-toi.
          </p>
        )}
        <div className="seg" role="group" aria-label="Type de compte" style={{ background: '#E9EEF5', gridTemplateColumns: '1fr 1fr' }}>
          <button type="button" aria-pressed={!member} onClick={() => { setMember(false); setErr(''); }} style={{ color: member ? '#4A5878' : undefined }}>NOUVEAU</button>
          <button type="button" aria-pressed={member} onClick={() => { setMember(true); setErr(''); }} style={{ color: !member ? '#4A5878' : undefined }}>DÉJÀ MEMBRE</button>
        </div>
        <h2 className="russo" style={{ margin: 0, fontSize: 21, color: '#1B3FA0' }}>{member ? 'Re-bonjour, VIP™ !' : 'Deviens membre VIP™ !'}</h2>
        <input id="email" aria-label="Email" className="field" type="email" inputMode="email" autoComplete="email" placeholder="toi@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input id="pass" aria-label="Mot de passe" className="field" type="password" autoComplete={member ? 'current-password' : 'new-password'} placeholder={member ? 'Mot de passe' : 'Choisis un mot de passe'} value={pass} onChange={(e) => setPass(e.target.value)} />
        {err && <p role="alert" style={{ margin: 0, color: '#C0170F', fontWeight: 700, fontSize: 14 }}>{err}</p>}
        <button className="btn btn-red" type="submit" disabled={busy}>{busy ? 'UN INSTANT…' : member ? 'ENTRER DANS LE CLUB' : 'CRÉER MA CARTE'} <Play /></button>
        <p style={{ margin: 0, fontSize: 13, color: '#4A5878', lineHeight: 1.35 }}>Ton panier te suit sur tous tes écrans. Satisfait ou rembobiné !</p>
      </form>
      <button className="link" onClick={onGuest} style={{ position: 'relative', margin: '-18px auto 18px', color: '#E9EEF5' }}>Juste jeter un œil, sans carte</button>
    </div>
  );
}
