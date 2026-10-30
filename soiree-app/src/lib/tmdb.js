import { TMDB_KEY, OMDB_KEY, ORIGINES, PLATEFORMES } from './config.js';

const BASE = 'https://api.themoviedb.org/3';
export const img = (p, size = 'w500') => (p ? `https://image.tmdb.org/t/p/${size}${p}` : null);

async function get(path, params = {}) {
  const u = new URL(BASE + path);
  u.searchParams.set('api_key', TMDB_KEY);
  u.searchParams.set('language', 'fr-FR');
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, v);
  const r = await fetch(u);
  if (!r.ok) throw new Error('TMDB ' + r.status);
  return r.json();
}

const RANGES = {
  old: [null, '1979-12-31'], '80': ['1980-01-01', '1989-12-31'], '90': ['1990-01-01', '1999-12-31'],
  '00': ['2000-01-01', '2009-12-31'], '10': ['2010-01-01', '2019-12-31'], '20': ['2020-01-01', null],
};

export function discoverParams(type, rayon, f = {}) {
  const mv = type === 'movie';
  // Seuil de notoriété : un film doit avoir été noté par assez de monde pour entrer dans la boutique.
  // Plus on exige une bonne note, plus on exige de votants (sinon les 8/10 sont des films notés par 50 personnes).
  const note = +f.note || 0;
  const floor = mv ? (note >= 8 ? 2000 : note >= 7 ? 1200 : 800) : (note >= 8 ? 600 : note >= 7 ? 400 : 250);
  // les vieux films ont moins de votants sur TMDB : on assouplit un peu pour ne pas vider l'époque
  const old = f.epoque === 'old' || f.epoque === '80';
  // les films français ont beaucoup moins de votants sur TMDB (base surtout anglophone) : seuil adapté
  const div = (old ? 2 : 1) * (f.origine === 'fr' ? 4 : f.origine && f.origine !== 'us' ? 2 : 1) * (f.plateforme || (f.dispo && f.abos?.length) ? 1.5 : 1);
  const p = { sort_by: 'popularity.desc', include_adult: 'false', 'vote_count.gte': Math.round(floor / div), ...rayon[type] };
  // séries : pas de dessins animés ni de programmes jeunesse (Scooby-Doo & co)
  if (!mv) p.without_genres = [p.without_genres, '16|10762'].filter(Boolean).join('|');
  if (f.duree === 'court') p['with_runtime.lte'] = mv ? 100 : 30;
  if (f.duree === 'moyen') { p['with_runtime.gte'] = mv ? 80 : 31; p['with_runtime.lte'] = mv ? 120 : 55; }
  if (f.duree === 'long') p['with_runtime.gte'] = mv ? 121 : 56;
  if (f.epoque && RANGES[f.epoque]) {
    const [a, b] = RANGES[f.epoque];
    const k = mv ? 'primary_release_date' : 'first_air_date';
    if (a) p[k + '.gte'] = a;
    if (b) p[k + '.lte'] = b;
  }
  if (f.note) p['vote_average.gte'] = f.note;
  if (f.origine && ORIGINES[f.origine]) p.with_origin_country = ORIGINES[f.origine];
  const pf = f.plateforme && PLATEFORMES.find(([k]) => k === f.plateforme);
  const mes = !pf && f.dispo && Array.isArray(f.abos) ? PLATEFORMES.filter(([k]) => f.abos.includes(k)).map((x) => x[2]) : [];
  if (pf || mes.length) { p.with_watch_providers = pf ? pf[2] : mes.join('|'); p.watch_region = 'FR'; p.with_watch_monetization_types = 'flatrate'; }
  if (!mv && rayon.id !== 'curieux') p.without_genres = [p.without_genres, '10763|10764|10767'].filter(Boolean).join('|');
  return p;
}

const norm = (type) => (r) => ({
  id: r.id,
  type,
  title: type === 'movie' ? r.title : r.name,
  original: type === 'movie' ? r.original_title : r.original_name,
  year: ((type === 'movie' ? r.release_date : r.first_air_date) || '').slice(0, 4),
  poster: r.poster_path,
  backdrop: r.backdrop_path,
  vote: r.vote_average || 0,
  votes: r.vote_count || 0,
  overview: r.overview,
  genre_ids: r.genre_ids || [],
});

// Mots-clés écrits en MAJUSCULES dans la config = résolus à la volée via la recherche TMDB.
const kwCache = new Map();
async function resolveKw(word) {
  if (!kwCache.has(word)) {
    kwCache.set(word, get('/search/keyword', { query: word.toLowerCase() }).then((d) => {
      const r = (d.results || []).find((x) => x.name.toLowerCase() === word.toLowerCase()) || (d.results || [])[0];
      return r ? String(r.id) : '';
    }).catch(() => ''));
  }
  return kwCache.get(word);
}
async function params(type, rayon, filters, page) {
  const p = { ...discoverParams(type, rayon, filters), page };
  if (p.with_keywords && /[A-Z]/.test(p.with_keywords)) {
    const ids = await Promise.all(p.with_keywords.split('|').map((w) => (/[A-Z]/.test(w) ? resolveKw(w) : w)));
    p.with_keywords = ids.filter(Boolean).join('|');
  }
  return p;
}

export async function discover(type, rayon, filters, page = 1) {
  const d = await get(`/discover/${type}`, await params(type, rayon, filters, page));
  return { items: (d.results || []).filter((r) => r.poster_path).map(norm(type)), total: d.total_results || 0, pages: d.total_pages || 0 };
}

export async function countRayon(fmt, rayon, filters) {
  const types = fmt === 'all' ? ['movie', 'tv'] : [fmt];
  const res = await Promise.all(types.map(async (t) => get(`/discover/${t}`, await params(t, rayon, filters, 1)).then((d) => d.total_results || 0)));
  return res.reduce((a, b) => a + b, 0);
}

const detailCache = new Map();
export function details(item) {
  const key = item.type + item.id;
  if (!detailCache.has(key)) {
    const append = item.type === 'movie' ? 'videos,watch/providers,release_dates' : 'videos,watch/providers,content_ratings,external_ids';
    const p = get(`/${item.type}/${item.id}`, { append_to_response: append, include_video_language: 'fr,en,null' })
      .then(async (d) => {
        const fr = d['watch/providers']?.results?.FR || {};
        const uniq = (arr) => {
          const seen = new Set();
          return (arr || []).filter((x) => !seen.has(x.provider_id) && seen.add(x.provider_id));
        };
        const vids = (d.videos?.results || []).filter((v) => v.site === 'YouTube');
        const trailer =
          vids.find((v) => v.type === 'Trailer' && v.iso_639_1 === 'fr') ||
          vids.find((v) => v.type === 'Trailer') ||
          vids.find((v) => v.type === 'Teaser') || vids[0];
        let cert = '';
        if (item.type === 'movie') {
          const r = (d.release_dates?.results || []).find((x) => x.iso_3166_1 === 'FR');
          cert = r?.release_dates?.find((x) => x.certification)?.certification || '';
        } else {
          cert = (d.content_ratings?.results || []).find((x) => x.iso_3166_1 === 'FR')?.rating || '';
        }
        const out = {
          tagline: d.tagline || '',
          overview: d.overview || item.overview,
          genres: (d.genres || []).map((g) => g.name),
          genreIds: (d.genres || []).map((g) => g.id),
          runtime: item.type === 'movie' ? d.runtime || 0 : (d.episode_run_time || [])[0] || d.last_episode_to_air?.runtime || 0,
          seasons: d.number_of_seasons || 0,
          episodes: d.number_of_episodes || 0,
          imdb: d.imdb_id || d.external_ids?.imdb_id || null,
          stream: uniq([...(fr.flatrate || []), ...(fr.free || []), ...(fr.ads || [])]),
          rent: uniq([...(fr.rent || []), ...(fr.buy || [])]),
          watchLink: fr.link || `https://www.themoviedb.org/${item.type}/${item.id}/watch?locale=FR`,
          trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
          cert: cert && cert !== 'U' && cert !== 'TP' && cert !== 'NR' ? '-' + cert.replace(/^-/, '') : '',
          press: null,
        };
        if (OMDB_KEY && out.imdb) {
          try {
            const o = await fetch(`https://www.omdbapi.com/?i=${out.imdb}&apikey=${OMDB_KEY}`).then((r) => r.json());
            const rt = (o.Ratings || []).find((x) => x.Source === 'Rotten Tomatoes');
            const mc = (o.Ratings || []).find((x) => x.Source === 'Metacritic');
            if (rt) out.press = { score: parseInt(rt.Value, 10), source: 'Rotten Tomatoes' };
            else if (mc) out.press = { score: parseInt(mc.Value, 10), source: 'Metacritic' };
          } catch (e) { /* pas grave */ }
        }
        return out;
      })
      .catch((e) => { detailCache.delete(key); throw e; });
    detailCache.set(key, p);
  }
  return detailCache.get(key);
}

export function fmtRuntime(min) {
  if (!min) return '';
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h}h${String(m).padStart(2, '0')}` : `${m} min`;
}
