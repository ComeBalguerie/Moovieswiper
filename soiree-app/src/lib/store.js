import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
});

const LS = 'zapette-invite';
const safe = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* rien */ } },
};

export const keyOf = (it) => it.type + ':' + it.id;

// Un item stocké = { id, type, title, year, poster, runtime, rayon }
export function slim(item, extra = {}) {
  return { id: item.id, type: item.type, title: item.title, year: item.year, poster: item.poster, vote: item.vote, ...extra };
}

export function makeStore(user) {
  if (!user) {
    return {
      guest: true,
      async load() { return safe.get(LS, { panier: [], jamais: [], vus: [] }); },
      async add(list, item) { const s = safe.get(LS, { panier: [], jamais: [], vus: [] }); s[list] = [item, ...s[list].filter((x) => keyOf(x) !== keyOf(item))]; safe.set(LS, s); },
      async remove(list, item) { const s = safe.get(LS, { panier: [], jamais: [], vus: [] }); s[list] = s[list].filter((x) => keyOf(x) !== keyOf(item)); safe.set(LS, s); },
      async getPrenom() { return safe.get(LS + '-prenom', ''); },
      async setPrenom(p) { safe.set(LS + '-prenom', p); },
      async getAbos() { return safe.get(LS + '-abos', []); },
      async setAbos(a) { safe.set(LS + '-abos', a); },
    };
  }
  return {
    guest: false,
    async load() {
      const { data, error } = await supabase.from('film_lists').select('tmdb_id, media_type, list, payload, created_at').order('created_at', { ascending: false });
      if (error) throw error;
      const out = { panier: [], jamais: [], vus: [] };
      for (const r of data || []) out[r.list]?.push({ ...r.payload, id: r.tmdb_id, type: r.media_type });
      return out;
    },
    async add(list, item) {
      const { error } = await supabase.from('film_lists').upsert(
        { user_id: user.id, tmdb_id: item.id, media_type: item.type, list, payload: item },
        { onConflict: 'user_id,tmdb_id,media_type,list', ignoreDuplicates: true },
      );
      if (error) throw error;
    },
    async remove(list, item) {
      const { error } = await supabase.from('film_lists').delete().match({ tmdb_id: item.id, media_type: item.type, list });
      if (error) throw error;
    },
    async getPrenom() {
      const { data } = await supabase.from('profiles').select('prenom').eq('id', user.id).maybeSingle();
      return data?.prenom || '';
    },
    async setPrenom(prenom) {
      await supabase.from('profiles').upsert({ id: user.id, prenom });
    },
    async getAbos() {
      const { data } = await supabase.from('profiles').select('abonnements').eq('id', user.id).maybeSingle();
      return data?.abonnements || [];
    },
    async setAbos(abonnements) {
      const { error } = await supabase.from('profiles').update({ abonnements }).eq('id', user.id);
      if (error) throw error;
    },
  };
}

export function cardNumber(user) {
  if (!user) return '0000 0000';
  const n = parseInt(user.id.replace(/-/g, '').slice(0, 8), 16) % 100000000;
  const s = String(n).padStart(8, '0');
  return s.slice(0, 4) + ' ' + s.slice(4);
}
