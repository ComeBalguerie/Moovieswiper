// Conseils entre membres : "prends celui-là, tu vas kiffer".
import { supabase } from './store.js';

export async function trouverMembre(pseudo) {
  const { data, error } = await supabase.rpc('trouver_membre', { p_pseudo: pseudo });
  if (error) throw error;
  return data || [];
}

export async function envoyerConseil(toUser, item, mot) {
  const { error } = await supabase.from('conseils').insert({
    to_user: toUser, tmdb_id: item.id, media_type: item.type, payload: item, mot: (mot || '').trim() || null,
  });
  if (error) throw error;
}

// les conseils reçus qui n'ont pas encore été swipés
export async function conseilsRecus(userId) {
  const { data } = await supabase.from('conseils').select('id, from_user, tmdb_id, media_type, payload, mot, created_at')
    .eq('to_user', userId).eq('status', 'nouveau').order('created_at', { ascending: true });
  const rows = data || [];
  const ids = [...new Set(rows.map((r) => r.from_user))];
  const noms = await prenoms(ids);
  return rows.map((r) => ({ ...r.payload, id: r.tmdb_id, type: r.media_type, conseil: { id: r.id, de: noms[r.from_user] || 'Un membre', mot: r.mot } }));
}

export async function repondre(conseilId, status) {
  await supabase.from('conseils').update({ status, updated_at: new Date().toISOString() }).eq('id', conseilId);
}

// pour la personne qui conseille : ce que sont devenus ses conseils
export async function conseilsEnvoyes(userId) {
  const { data } = await supabase.from('conseils').select('id, to_user, tmdb_id, media_type, status, created_at')
    .eq('from_user', userId).order('created_at', { ascending: false });
  const rows = data || [];
  const noms = await prenoms([...new Set(rows.map((r) => r.to_user))]);
  return rows.map((r) => ({ ...r, a: noms[r.to_user] || 'un membre' }));
}

// les personnes à qui j'ai déjà envoyé un conseil (raccourcis)
export async function destinatairesRecents(userId) {
  const { data } = await supabase.from('conseils').select('to_user, created_at').eq('from_user', userId).order('created_at', { ascending: false }).limit(40);
  const ids = [...new Set((data || []).map((r) => r.to_user))].slice(0, 6);
  const noms = await prenoms(ids);
  return ids.map((id) => ({ id, prenom: noms[id] || 'Membre' }));
}

async function prenoms(ids) {
  if (!ids.length) return {};
  const { data } = await supabase.from('profiles').select('id, prenom').in('id', ids);
  return Object.fromEntries((data || []).map((p) => [p.id, (p.prenom || '').trim()]));
}

// quand je regarde un film qu'on m'a conseillé (même plus tard, depuis le panier)
export async function marquerRegarde(userId, item) {
  await supabase.from('conseils').update({ status: 'regarde', updated_at: new Date().toISOString() })
    .eq('to_user', userId).eq('tmdb_id', item.id).eq('media_type', item.type).neq('status', 'regarde');
}
