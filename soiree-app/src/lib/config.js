export const TMDB_KEY = import.meta.env.VITE_TMDB_KEY || '609ee3c8392453ef85789f0bc4d0bce0';
export const OMDB_KEY = import.meta.env.VITE_OMDB_KEY || '';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fkiadpmyfdgmhdgdnape.supabase.co';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Wey2UhR2AtnjBZRkRDBcwQ_Ma61c4cZ';

// Genres TMDB. "|" = OU.
export const RAYONS = [
  { id: 'adrenaline', name: 'ADRÉNALINE', icon: '/zap/rayons-adrenaline.webp',
    movie: { with_genres: '28|12' }, tv: { with_genres: '10759' } },
  { id: 'marrant', name: 'MARRANT', icon: '/zap/rayons-marrant.webp',
    movie: { with_genres: '35', without_genres: '27' }, tv: { with_genres: '35', without_genres: '16' } },
  { id: 'tension', name: 'TENSION', icon: '/zap/rayons-tension.webp',
    movie: { with_genres: '53|80' }, tv: { with_genres: '80|9648' } },
  { id: 'romantique', name: 'ROMANTIQUE', icon: '/zap/rayons-romantique.webp',
    movie: { with_genres: '10749' }, tv: { with_keywords: 'ROMANCE' } },
  { id: 'flipper', name: 'FLIPPER', icon: '/zap/rayons-flipper.webp',
    movie: { with_genres: '27' }, tv: { with_genres: '9648|10765', with_keywords: 'HORROR' } },
  { id: 'ailleurs', name: 'AILLEURS', icon: '/zap/rayons-ailleurs.webp',
    movie: { with_genres: '878|14' }, tv: { with_genres: '10765' } },
  { id: 'emotions', name: 'ÉMOTIONS', icon: '/zap/rayons-emotions.webp',
    movie: { with_genres: '18', without_genres: '27|28' }, tv: { with_genres: '18', without_genres: '10759|80' } },
  { id: 'curieux', name: 'CURIEUX', icon: '/zap/rayons-curieux.webp',
    movie: { with_genres: '99|36' }, tv: { with_genres: '99' } },
];

export const PLATES = [['#E2231A', '#FFFFFF'], ['#081440', '#FFFFFF'], ['#FFFFFF', '#1B3FA0'], ['#0E2470', '#FFC400']];

export const FILTERS = {
  duree: {
    label: 'Durée',
    options: (fmt) => fmt === 'tv'
      ? [['court', 'Épisodes courts'], ['moyen', 'Épisodes ~45 min'], ['long', 'Épisodes longs']]
      : [['court', 'Moins de 1h40'], ['moyen', 'Moins de 2h'], ['long', 'Plus de 2h']],
  },
  epoque: {
    label: 'Époque',
    options: () => [['old', 'Avant 1980'], ['80', 'Années 80'], ['90', 'Années 90'], ['00', 'Années 2000'], ['10', 'Années 2010'], ['20', 'Récents']],
  },
  note: {
    label: 'Note',
    options: () => [['6', 'Note 6+'], ['7', 'Note 7+'], ['8', 'Note 8+']],
  },
};

export function filterLabel(key, value, fmt) {
  const o = FILTERS[key].options(fmt).find(([v]) => v === value);
  return o ? o[1] : value;
}
