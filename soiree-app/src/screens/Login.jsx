import CarteClub from '../components/CarteClub.jsx';
import React, { useState } from 'react';
import { supabase } from '../lib/store.js';
import { Play, Planet } from '../components/ui.jsx';

// Pas de mail : on se connecte avec un pseudo. Supabase veut une adresse, on en fabrique une
// à partir du pseudo (aucun mail n'est jamais envoyé, "Confirm email" est désactivé).
export const pseudoVersMail = (v) => {
  const t = v.trim();
  if (t.includes('@')) return t; // anciens comptes créés avec un vrai mail
  const slug = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
  return slug ? `${slug}.zapette@comebalguerie.com` : '';
};

export default function Login({ onGuest, error }) {
  const [email, setEmail] = useState(() => { try { return localStorage.getItem('zapette-pseudo') || ''; } catch (e) { return ''; } });
  const [step, setStep] = useState('email');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(error || '');
  const [pass, setPass] = useState('');
  const [member, setMember] = useState(() => { try { return !!localStorage.getItem('zapette-pseudo'); } catch (e) { return false; } });

  const submit = async (e) => {
    e?.preventDefault();
    const pseudo = email.trim();
    const mail = pseudoVersMail(pseudo);
    if (pseudo.length < 2 || !mail) { setErr('Choisis un pseudo d\'au moins 2 lettres.'); return; }
    if (pass.length < 6) { setErr('Le mot de passe doit faire au moins 6 caractères.'); return; }
    setBusy(true); setErr('');
    try { localStorage.setItem('zapette-pseudo', pseudo); } catch (e2) { /* rien */ }
    if (member) {
      const { error: er } = await supabase.auth.signInWithPassword({ email: mail, password: pass });
      setBusy(false);
      if (er) setErr(/confirm/i.test(er.message) ? 'Ta carte n\'est pas encore validée : clique sur le lien reçu par mail, puis reviens ici.' : 'Pseudo ou mot de passe incorrect.');
      return;
    }
    const { data, error: er } = await supabase.auth.signUp({ email: mail, password: pass, options: { data: { pseudo } } });
    setBusy(false);
    if (er) {
      if (/registered|exists/i.test(er.message)) { setErr('Ce pseudo est déjà pris. Si c\'est toi, passe par DÉJÀ MEMBRE, sinon choisis-en un autre.'); return; }
      setErr(/rate|seconds|limit/i.test(er.message) ? 'Doucement ! Réessaie dans une minute.' : 'Oups : ' + er.message);
      return;
    }
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setErr('Ce pseudo est déjà pris. Si c\'est toi, passe par DÉJÀ MEMBRE, sinon choisis-en un autre.'); return;
    }
    if (!data.session) { setStep('confirm'); setMember(true); }
  };

  return (
    <div className="app" style={{ height: '100dvh', overflowY: 'auto', overflowX: 'hidden' }}>
      <Planet top={300} />
      <h1 style={{ margin: 0, padding: '18px 12px 0', display: 'flex', justifyContent: 'center' }}>
        <img src="/logo.svg" alt="Zapette, le vidéo club de ton canapé" width="320" height="203" style={{ width: 'min(320px, 82vw)', height: 'auto' }} />
      </h1>

      <div style={{ position: 'relative', flex: 1, minHeight: 200, flexShrink: 0 }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, marginLeft: -153, transform: 'rotate(-4deg) scale(var(--cs, 1))', transformOrigin: 'center top' }} aria-hidden="true">
          <CarteClub w={306} interactive={false} />
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
        <div className="seg" role="group" aria-label="Type de compte" style={{ background: '#0A1A4A', gridTemplateColumns: '1fr 1fr' }}>
          <button type="button" aria-pressed={!member} onClick={() => { setMember(false); setErr(''); }} >NOUVEAU</button>
          <button type="button" aria-pressed={member} onClick={() => { setMember(true); setErr(''); }} >DÉJÀ MEMBRE</button>
        </div>
        <h2 className="russo" style={{ margin: 0, fontSize: 21, color: '#1B4FC4' }}>{member ? 'Re-bonjour, VIP™ !' : 'Deviens membre VIP™ !'}</h2>
        <input id="email" aria-label="Pseudo" className="field" type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="username" maxLength={40} placeholder={member ? 'Ton pseudo' : 'Choisis un pseudo'} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input id="pass" aria-label="Mot de passe" className="field" type="password" autoComplete={member ? 'current-password' : 'new-password'} placeholder={member ? 'Mot de passe' : 'Choisis un mot de passe'} value={pass} onChange={(e) => setPass(e.target.value)} />
        {err && <p role="alert" style={{ margin: 0, color: '#C0170F', fontWeight: 700, fontSize: 14 }}>{err}</p>}
        <button className="btn btn-red" type="submit" disabled={busy}>{busy ? 'UN INSTANT…' : member ? 'ENTRER DANS LE CLUB' : 'CRÉER MA CARTE'} <Play /></button>
        <p style={{ margin: 0, fontSize: 13, color: '#4A5878', lineHeight: 1.35 }}>Pas besoin de mail : un pseudo et un mot de passe suffisent. Ton panier te suit sur tous tes écrans.</p>
      </form>
      <button className="link" onClick={onGuest} style={{ position: 'relative', margin: '-18px auto 18px', color: '#E9EEF5' }}>Juste jeter un œil, sans carte</button>
    </div>
  );
}
