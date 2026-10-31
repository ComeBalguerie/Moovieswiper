// Mes potes : demande, acceptation, lien d'invitation.
import { supabase } from './store.js';

export async function mesPotes(userId) {
  const { data } = await supabase.from('potes').select('user_a, user_b, demandeur, status, created_at');
  const rows = (data || []).map((r) => ({ ...r, autre: r.user_a === userId ? r.user_b : r.user_a }));
  const ids = rows.map((r) => r.autre);
  const noms = {};
  if (ids.length) {
    const { data: p } = await supabase.from('profiles').select('id, prenom').in('id', ids);
    (p || []).forEach((x) => { noms[x.id] = (x.prenom || '').trim(); });
  }
  const fiche = (r) => ({ id: r.autre, prenom: noms[r.autre] || 'Membre' });
  const tri = (a, b) => a.prenom.localeCompare(b.prenom, 'fr');
  return {
    potes: rows.filter((r) => r.status === 'ok').map(fiche).sort(tri),
    recues: rows.filter((r) => r.status === 'demande' && r.demandeur !== userId).map(fiche),
    envoyees: rows.filter((r) => r.status === 'demande' && r.demandeur === userId).map(fiche),
  };
}

export async function demanderPote(pseudo) {
  const { data, error } = await supabase.rpc('demander_pote', { p_pseudo: pseudo });
  if (error) {
    if (/introuvable/.test(error.message)) throw new Error('Aucun membre avec ce pseudo. Vérifie l\'orthographe ?');
    if (/ambigu/.test(error.message)) throw new Error('Plusieurs membres portent ce prénom : demande-lui son pseudo exact.');
    if (/soi-meme/.test(error.message)) throw new Error('C\'est toi, ça !');
    throw new Error('Oups, ça a coupé. Réessaie.');
  }
  return data?.[0];
}

export async function repondrePote(autreId, ok) {
  const { error } = await supabase.rpc('repondre_pote', { p_autre: autreId, p_ok: ok });
  if (error) throw error;
}

export async function retirerPote(userId, autreId) {
  const a = userId < autreId ? userId : autreId;
  const b = userId < autreId ? autreId : userId;
  await supabase.from('potes').delete().match({ user_a: a, user_b: b });
}

export async function accepterInvitation(deId) {
  const { data } = await supabase.rpc('accepter_invitation', { p_de: deId });
  return data;
}

export async function inviter(userId, prenom) {
  const url = `${window.location.origin}/?pote=${userId}`;
  const text = `${prenom || 'Un pote'} t'invite sur Zapette, le vidéo club de ton canapé. On se conseille des films ?`;
  try {
    if (navigator.share) { await navigator.share({ title: 'Zapette', text, url }); return 'partagé'; }
  } catch (e) { /* annulé */ }
  try { await navigator.clipboard.writeText(`${text} ${url}`); return 'copié'; } catch (e) { return null; }
}
