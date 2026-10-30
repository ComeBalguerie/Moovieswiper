import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Le ciel : des étoiles semées au hasard (trois tailles, quelques reflets bleus), générées une fois.
(function semerEtoiles() {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const W = 480, H = 960, out = [];
  for (let i = 0; i < 190; i++) {
    const x = (rnd() * W).toFixed(1), y = (rnd() * H).toFixed(1), k = rnd();
    const r = k < 0.72 ? 0.6 : k < 0.94 ? 1 : 1.6;
    const o = (k < 0.72 ? 0.35 + rnd() * 0.35 : 0.6 + rnd() * 0.4).toFixed(2);
    out.push(`<circle cx='${x}' cy='${y}' r='${r}' fill='${rnd() < 0.25 ? '#9FC2FF' : '#FFFFFF'}' opacity='${o}'/>`);
  }
  for (let i = 0; i < 3; i++) {
    const x = 20 + rnd() * (W - 40), y = 20 + rnd() * (H - 40), k = 5 + rnd() * 4;
    out.push(`<path d='M${x},${y - k} Q${x + 1},${y - 1} ${x + k},${y} Q${x + 1},${y + 1} ${x},${y + k} Q${x - 1},${y + 1} ${x - k},${y} Q${x - 1},${y - 1} ${x},${y - k}Z' fill='#FFFFFF' opacity='.9'/>`);
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'>${out.join('')}</svg>`;
  document.documentElement.style.setProperty('--stars', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
})();

// Si quelque chose plante, on affiche l'erreur au lieu d'un écran noir.
function Panne({ msg }) {
  return (
    <div className="app" style={{ alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', gap: 14 }}>
      <img src="/zap/objets-prise-debranchee.webp" alt="" width="160" height="160" style={{ objectFit: 'contain' }} />
      <h1 className="title-outline" style={{ fontSize: 28 }}>PANNE DE COURANT</h1>
      <p style={{ margin: 0, color: '#E9EEF5', fontSize: 15, lineHeight: 1.4 }}>Zap a trébuché sur un câble. Fais une capture de cet écran pour le réparateur, puis relance.</p>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%', fontSize: 11, color: '#FFC400', background: 'rgba(8,20,64,.8)', padding: 10, borderRadius: 8, textAlign: 'left' }}>{msg}</pre>
      <button className="btn btn-red" style={{ width: '100%', maxWidth: 320 }} onClick={() => window.location.reload()}>RELANCER</button>
    </div>
  );
}

class Garde extends React.Component {
  constructor(p) { super(p); this.state = { msg: null }; }
  static getDerivedStateFromError(e) { return { msg: String((e && (e.stack || e.message)) || e) }; }
  componentDidMount() {
    this.onErr = (ev) => { const e = ev.error || ev.reason || ev; window.__zapLastErr = String((e && (e.message || e)) || e); };
    window.addEventListener('error', this.onErr);
    window.addEventListener('unhandledrejection', this.onErr);
  }
  componentWillUnmount() { window.removeEventListener('error', this.onErr); window.removeEventListener('unhandledrejection', this.onErr); }
  render() { return this.state.msg ? <Panne msg={(this.state.msg + (window.__zapLastErr ? '\n\n' + window.__zapLastErr : '')).slice(0, 900)} /> : this.props.children; }
}

createRoot(document.getElementById('root')).render(<Garde><App /></Garde>);
