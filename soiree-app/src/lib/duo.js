// Double Programme : une soirée à deux, et le duo permanent qui en découle.
import { supabase } from './store.js';

const ACTIVE_MS = 6 * 3600 * 1000; // une soirée s'arrête toute seule au bout de 6 h

export async function lancerSoiree(settings) {
  const { data, error } = await supabase.rpc('lancer_soiree', { p_settings: settings });
  if (error) throw error;
  return data;
}

export async function rejoindreSoiree(code) {
  const { data, error } = await supabase.rpc('rejoindre_soiree', { p_code: code });
  if (error) {
    if (/inconnu/.test(error.message)) throw new Error('Ce code ne mène à aucune soirée. Vérifie les 4 lettres ?');
    if (/complete/.test(error.message)) throw new Error('Cette soirée a déjà ses deux spectateurs.');
    throw error;
  }
  return data;
}

// la soirée en cours (lancée ou rejointe), s'il y en a une
export async function soireeEnCours(userId) {
  const { data } = await supabase.from('soirees').select('*')
    .or(`host.eq.${userId},guest.eq.${userId}`).neq('status', 'fini')
    .order('created_at', { ascending: false }).limit(1);
  const s = data?.[0];
  if (!s || Date.now() - new Date(s.created_at).getTime() > ACTIVE_MS) return null;
  return s;
}

export async function terminerSoiree(id) {
  await supabase.from('soirees').update({ status: 'fini' }).eq('id', id);
}

export async function lireSoiree(id) {
  const { data } = await supabase.from('soirees').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function aimer(soireeId, userId, item) {
  const { error } = await supabase.from('soiree_likes').upsert(
    { soiree_id: soireeId, user_id: userId, tmdb_id: item.id, media_type: item.type, payload: item },
    { onConflict: 'soiree_id,user_id,tmdb_id,media_type', ignoreDuplicates: true },
  );
  if (error) throw error;
}

export async function retirer(soireeId, userId, item) {
  await supabase.from('soiree_likes').delete().match({ soiree_id: soireeId, user_id: userId, tmdb_id: item.id, media_type: item.type });
}

export async function likesDeLaSoiree(soireeId) {
  const { data } = await supabase.from('soiree_likes').select('user_id, tmdb_id, media_type, payload').eq('soiree_id', soireeId);
  return data || [];
}

// écoute en direct : les "au panier" de l'autre, et l'arrivée du binôme
export function ecouter(soireeId, { onLike, onSoiree }) {
  const ch = supabase.channel('soiree-' + soireeId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'soiree_likes', filter: `soiree_id=eq.${soireeId}` }, (p) => onLike && onLike(p.new))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'soirees', filter: `id=eq.${soireeId}` }, (p) => onSoiree && onSoiree(p.new))
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}

// le binôme (duo permanent) : son id et son prénom
export async function monBinome(userId) {
  const { data } = await supabase.from('duos').select('user_a, user_b, created_at').order('created_at', { ascending: false }).limit(1);
  const d = data?.[0];
  if (!d) return null;
  const id = d.user_a === userId ? d.user_b : d.user_a;
  const { data: p } = await supabase.from('profiles').select('prenom').eq('id', id).maybeSingle();
  return { id, prenom: (p?.prenom || '').trim() || 'ton binôme' };
}

export async function panierDuBinome(partnerId) {
  const { data } = await supabase.from('film_lists').select('tmdb_id, media_type, payload').eq('user_id', partnerId).eq('list', 'panier');
  return (data || []).map((r) => ({ ...r.payload, id: r.tmdb_id, type: r.media_type }));
}

export async function prenomDe(userId) {
  const { data } = await supabase.from('profiles').select('prenom').eq('id', userId).maybeSingle();
  return (data?.prenom || '').trim();
}

export async function partager(code) {
  const url = `${window.location.origin}/?dp=${code}`;
  const text = `Double Programme sur Zapette : rejoins ma soirée avec le code ${code}`;
  try {
    if (navigator.share) { await navigator.share({ title: 'Double Programme', text, url }); return 'partagé'; }
  } catch (e) { /* annulé */ }
  try { await navigator.clipboard.writeText(`${text} ${url}`); return 'copié'; } catch (e) { return null; }
}
