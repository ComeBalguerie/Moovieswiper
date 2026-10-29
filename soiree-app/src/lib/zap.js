// Le conseil de Zap : un petit texte écrit à partir des notes, sans IA.
import { fmtRuntime } from './tmdb.js';

const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];
const num = (v) => v.toFixed(1).replace('.', ',');

const FLAVOR = {
  28: ['ça va secouer le canapé', 'prévois de la place pour les cascades'],
  12: ['embarquement immédiat pour l\'aventure', 'sac à dos et pop-corn obligatoires'],
  16: ['ça marche aussi bien pour les grands que pour les petits', 'du dessin animé qui a du coffre'],
  35: ['de quoi rire sans se prendre la tête', 'zygomatiques en surchauffe garantis'],
  80: ['ça sent le flingue et le café froid', 'prépare-toi à soupçonner tout le monde'],
  99: ['tu vas briller au prochain dîner', 'ta culture G te dira merci'],
  18: ['prépare-toi à être secoué', 'garde un mouchoir pas trop loin'],
  10751: ['parfait pour une soirée en famille', 'tout le monde sur le canapé'],
  14: ['magie et grand spectacle au menu', 'direction un autre monde'],
  36: ['un petit cours d\'histoire sans s\'ennuyer', 'la grande Histoire en version XXL'],
  27: ['garde la lumière allumée', 'à regarder les pieds bien sous la couette'],
  10402: ['ça va chanter dans le salon', 'monte le son'],
  9648: ['t\'auras le cerveau en mode enquête', 'essaie de deviner avant la fin'],
  10749: ['prévois les mouchoirs ou la personne à côté', 'ça va papillonner dans le ventre'],
  878: ['décollage immédiat', 'direction les étoiles'],
  53: ['fonce si t\'as envie d\'avoir les mains moites', 'tu vas oublier de respirer'],
  10752: ['casque sur la tête, c\'est du lourd', 'ça remue les tripes'],
  37: ['santiags et poussière au programme', 'duel au soleil garanti'],
  10759: ['ça va secouer le canapé', 'action non-stop'],
  10765: ['décollage immédiat vers l\'imaginaire', 'direction un autre monde'],
  10768: ['ça complote sec', 'jeux de pouvoir au menu'],
};

function pressLine(press, seed) {
  if (!press) return null;
  const s = press.score;
  if (s >= 85) return pick(['La presse est quasi unanime, c\'est la standing ovation.', 'Les critiques ont sorti les superlatifs, rien que ça.'], seed);
  if (s >= 70) return pick(['La presse est franchement conquise.', 'Les critiques ont aimé, et pas qu\'un peu.'], seed);
  if (s >= 50) return pick(['La presse est partagée, moitié fans, moitié bougons.', 'Côté critiques, c\'est un oui... avec des réserves.'], seed);
  return pick(['La presse a sorti la sulfateuse.', 'Les critiques ont fait la grimace.'], seed);
}

function publicLine(item, seed) {
  const v = item.vote, n = item.votes;
  const note = `${num(v)}/10`;
  if (n < 80) return `Peu de spectateurs l'ont noté pour l'instant (${note}), c'est une pépite confidentielle ou un pari.`;
  if (v >= 8) return pick([`Côté public, c'est l'extase : ${note}.`, `Les spectateurs l'adorent, ${note} au compteur.`], seed);
  if (v >= 7) return pick([`Le public suit à fond : ${note}.`, `Les spectateurs valident avec un solide ${note}.`], seed);
  if (v >= 6) return pick([`Le public est plutôt content, ${note}.`, `Les spectateurs lui mettent un honnête ${note}.`], seed);
  if (v >= 5) return `Le public reste tiède, ${note}.`;
  return `Le public n'a pas été tendre : ${note}.`;
}

function extraLine(item, d, seed) {
  const y = parseInt(item.year, 10);
  if (item.type === 'movie' && d.runtime >= 150) return `Attention, c'est un pavé de ${fmtRuntime(d.runtime)} : prévois les pop-corn en double.`;
  if (item.type === 'movie' && d.runtime && d.runtime <= 90) return 'Format court, parfait si t\'es déjà en pyjama.';
  if (item.type === 'tv' && d.seasons >= 5) return `${d.seasons} saisons au compteur : de quoi squatter le canapé un moment.`;
  if (item.type === 'tv' && d.seasons === 1) return 'Une seule saison, idéal pour un marathon express.';
  if (y && y < 1985) return 'Un classique qui a de la bouteille, et ça se respecte.';
  if (item.votes > 8000) return 'Tout le monde l\'a vu, sauf peut-être toi.';
  return null;
}

export function conseil(item, d) {
  const seed = item.id;
  const ids = d?.genreIds?.length ? d.genreIds : item.genre_ids || [];
  const flavor = ids.map((g) => FLAVOR[g]).find(Boolean);
  const parts = [pressLine(d?.press, seed), publicLine(item, seed), d && extraLine(item, d, seed)].filter(Boolean);
  let verdict;
  if (item.vote >= 7.5) verdict = flavor ? `Mon verdict : fonce, ${pick(flavor, seed)}.` : 'Mon verdict : fonce, les yeux fermés.';
  else if (item.vote >= 6.3) verdict = flavor ? `Mon verdict : bon choix si t'as envie de ça, ${pick(flavor, seed)}.` : 'Mon verdict : bon choix pour une soirée tranquille.';
  else verdict = 'Mon verdict : à tes risques et périls. Je dis ça, je dis rien.';
  return '« ' + [...parts, verdict].join(' ') + ' »';
}

export function quip(item) {
  const s = item.id;
  if (item.votes < 80) return pick(['« Une pépite planquée au fond du rayon. »', '« Peu de gens l\'ont vu. T\'es un pionnier. »'], s);
  if (item.vote >= 8) return pick(['« Celui-là, je l\'ai vu trois fois. »', '« Du lourd. Fais-moi confiance. »', '« Si t\'hésites, t\'as tort. »'], s);
  if (item.vote >= 7) return pick(['« Solide. Tu prends pas de risque. »', '« Un bon client, ça. »', '« Le public valide, moi aussi. »'], s);
  if (item.vote >= 6) return pick(['« Sympa, pour un soir tranquille. »', '« Pas un chef-d\'œuvre, mais ça passe crème. »'], s);
  return pick(['« Hmm. Je dis ça, je dis rien. »', '« Plaisir coupable assumé ? »'], s);
}

export const coupDeCoeur = (item) => item.vote >= 7.8 && item.votes >= 300;
