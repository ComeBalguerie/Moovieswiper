// Mesure d'usage, anonyme pour les visiteurs : un nom d'action, rien de personnel.
import { supabase } from './store.js';

let uid = null;
export const setTrackUser = (id) => { uid = id || null; };

function device() {
  try {
    let d = localStorage.getItem('zapette-device');
    if (!d) { d = 'd' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36); localStorage.setItem('zapette-device', d); }
    return d;
  } catch (e) { return 'sans-stockage'; }
}

export function track(name, props) {
  try {
    supabase.from('events').insert({ user_id: uid, device: device(), name, props: props || null }).then(() => {}, () => {});
  } catch (e) { /* la mesure ne doit jamais gêner l'appli */ }
}

export async function estAdmin(userId) {
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
  return !!data;
}
export async function chiffres() {
  const { data, error } = await supabase.rpc('stats_zapette');
  if (error) throw error;
  return data;
}
export async function supprimerCompte() {
  const { error } = await supabase.rpc('supprimer_mon_compte');
  if (error) throw error;
}
