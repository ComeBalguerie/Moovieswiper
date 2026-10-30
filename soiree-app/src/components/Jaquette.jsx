import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { img } from '../lib/tmdb.js';
import { coupDeCoeur } from '../lib/zap.js';

const clamp = (v, m) => Math.max(-m, Math.min(m, v));
const THRESHOLD = 95;

// La jaquette DVD en 3D : on l'attrape, elle pivote, on la lance.
const Jaquette = forwardRef(function Jaquette({ item, meta, tilt, w, onDone, onTap, number }, ref) {
  const [s, setS] = useState({ dx: 0, dy: 0, dragging: false, flying: null, picked: false });
    const busy = useRef(false);
  // boîtier cristal calé sur l'affiche 2:3 : tranche 14 px à gauche, 7 px de marge ailleurs
  const h = Math.round((w - 21) * 1.5 + 14);

  const fly = (dir) => {
    if (busy.current) return;
    busy.current = true;
    setS({ dx: 0, dy: 0, dragging: false, flying: dir, picked: false });
    setTimeout(() => {
      busy.current = false;
      setS({ dx: 0, dy: 0, dragging: false, flying: null, picked: false });
      doneRef.current(dir);
    }, 380);
  };
  useImperativeHandle(ref, () => ({ fly, pick: (v) => setS((x) => ({ ...x, picked: v })) }));

  // Le geste : souris (pointer), doigt (touch natif) et trackpad (molette horizontale).
  const box = useRef(null);
  const drag = useRef({ on: false, x: 0, y: 0, dx: 0, dy: 0 });
  const wheel = useRef({ timer: null, lockUntil: 0, last: 0 });
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const tapRef = useRef(onTap);
  tapRef.current = onTap;

  const begin = (x, y, viaWheel) => {
    if (busy.current) return false;
    drag.current = { on: true, x, y, dx: 0, dy: 0, t: Date.now(), wheel: !!viaWheel };
    setS((v) => ({ ...v, dragging: true, picked: false }));
    return true;
  };
  const move = (dx, dy) => {
    const d = drag.current;
    if (!d.on) return;
    d.dx = dx; d.dy = dy;
    setS((v) => ({ ...v, dx, dy }));
  };
  const end = () => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    if (!d.wheel && Math.abs(d.dx) < 8 && Math.abs(d.dy) < 8 && Date.now() - d.t < 350) {
      setS((v) => ({ ...v, dragging: false, dx: 0, dy: 0 }));
      if (tapRef.current) tapRef.current();
      return;
    }
    if (d.dx > THRESHOLD) fly('right');
    else if (d.dx < -THRESHOLD) fly('left');
    else setS((v) => ({ ...v, dragging: false, dx: 0, dy: 0 }));
  };

  const onDown = (e) => {
    if (e.pointerType === 'touch') return; // le doigt passe par les événements touch
    if (!begin(e.clientX, e.clientY)) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
  };
  const onMove = (e) => {
    if (e.pointerType === 'touch' || !drag.current.on) return;
    move(e.clientX - drag.current.x, e.clientY - drag.current.y);
  };
  const onUp = (e) => { if (e.pointerType !== 'touch') end(); };

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const ts = (e) => { if (e.touches.length !== 1) return; const t = e.touches[0]; begin(t.clientX, t.clientY); };
    const tm = (e) => {
      if (!drag.current.on) return;
      e.preventDefault();
      const t = e.touches[0];
      move(t.clientX - drag.current.x, t.clientY - drag.current.y);
    };
    const te = () => end();
    const wh = (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 1) return;
      e.preventDefault();
      const now = Date.now();
      const w = wheel.current;
      const gap = now - w.last;
      w.last = now;
      if (now < w.lockUntil) { if (gap < 120) w.lockUntil = now + 150; return; } // inertie du geste précédent
      if (!drag.current.on && !begin(0, 0, true)) return;
      const k = e.deltaMode === 1 ? 16 : 1;
      move(drag.current.dx - e.deltaX * k * 1.2, 0);
      clearTimeout(w.timer);
      w.timer = setTimeout(() => { w.lockUntil = Date.now() + 400; end(); }, 140);
    };
    el.addEventListener('touchstart', ts, { passive: true });
    el.addEventListener('touchmove', tm, { passive: false });
    el.addEventListener('touchend', te);
    el.addEventListener('touchcancel', te);
    el.addEventListener('wheel', wh, { passive: false });
    return () => {
      el.removeEventListener('touchstart', ts);
      el.removeEventListener('touchmove', tm);
      el.removeEventListener('touchend', te);
      el.removeEventListener('touchcancel', te);
      el.removeEventListener('wheel', wh);
      clearTimeout(wheel.current.timer);
    };
  }, []);
  const onKey = (e) => {
    if (e.key === 'ArrowRight') fly('right');
    if (e.key === 'ArrowLeft') fly('left');
  };

  let ry = clamp(s.dx * 0.13, 38) + (tilt?.y || 0);
  let rx = clamp(-s.dy * 0.09, 20) + (tilt?.x || 0);
  let rz = s.dx * 0.035;
  let tx = s.dx, ty = s.dy * 0.35, tz = s.dragging ? 30 : 0, scale = 1;
  if (s.flying === 'left') { tx = -560; ry = -55; rz = -18; ty = 40; }
  if (s.flying === 'right') { tx = 560; ry = 55; rz = 18; ty = 40; }
  if (s.flying === 'down') { ty = 760; rx = 50; rz = 6; }
  if (s.picked) { tz = 70; scale = 1.04; }
  const trans = s.dragging ? 'none' : s.flying ? 'transform .38s cubic-bezier(.4,0,.8,.6)' : 'transform .55s cubic-bezier(.2,1.5,.4,1)';
  const idle = !s.dragging && !s.flying && !tilt && s.dx === 0;
  const near = Math.abs(ry) + Math.abs(rx);
  const strength = Math.min(1, Math.abs(s.dx) / 110);
  const depth = 14;
  const ridges = 'repeating-linear-gradient(180deg, rgba(255,255,255,.30) 0 2px, rgba(255,255,255,.06) 2px 6px)';

  const stamp = {
    position: 'absolute', top: h * 0.3, padding: '6px 14px', borderRadius: 6, fontFamily: 'var(--russo)', fontSize: 22,
    letterSpacing: 1, border: '4px solid', boxShadow: '0 4px 0 rgba(0,0,0,.35)', opacity: strength, whiteSpace: 'nowrap', pointerEvents: 'none',
  };

  return (
    <div
      ref={box}
      style={{ position: 'absolute', inset: 0, perspective: 900, perspectiveOrigin: '50% 40%', touchAction: 'none', overscrollBehavior: 'none', WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      tabIndex={0} onKeyDown={onKey}
      role="group" aria-label={`Jaquette : ${item.title}. Glisse à droite pour le panier, à gauche pour passer.`}
    >
      <div style={{
        position: 'absolute', left: '50%', top: 18 + h + 22, width: 230 - near * 2, height: 26, marginLeft: -(230 - near * 2) / 2 + tx * 0.4,
        borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(5,10,40,.6), transparent 70%)', transition: s.dragging ? 'none' : 'all .5s', opacity: s.flying ? 0 : 1,
      }} />
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', animation: idle ? 'idle 5s ease-in-out infinite' : 'none' }}>
        <div style={{
          position: 'absolute', left: '50%', marginLeft: -w / 2, top: 18, width: w, height: h, transformStyle: 'preserve-3d',
          transform: `translate3d(${tx}px,${ty}px,${tz}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${scale})`,
          transition: trans, cursor: s.dragging ? 'grabbing' : 'grab', willChange: 'transform',
        }}>
          {/* le disque qui dépasse derrière */}
          <div style={{
            position: 'absolute', top: h * 0.17, left: w * 0.45, width: w * 0.86, height: w * 0.86, borderRadius: '50%',
            transform: `translate3d(${36 + Math.max(0, ry) * 2.2 + (s.picked ? 50 : 0)}px, 0, -${depth + 6}px)`, transition: s.dragging ? 'none' : 'transform .5s cubic-bezier(.2,1.4,.4,1)',
            background: `radial-gradient(circle, #1B4FC4 0 8%, #E9EEF5 8.5% 12%, rgba(255,255,255,.15) 12.5% 13.5%, transparent 14%), conic-gradient(from ${10 + ry * 3}deg, #C9D3E0, #FFFFFF, #8D99AD, #F2C6FF, #E9EEF5, #A9E4FF, #FFFFFF, #8D99AD, #C9D3E0)`,
            boxShadow: '0 0 0 2px rgba(255,255,255,.5), 0 10px 24px rgba(0,0,0,.45)',
          }} />
          {/* l'épaisseur du boîtier : quatre tranches en plastique translucide */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: depth, height: '100%', transformOrigin: 'left center', transform: 'rotateY(90deg)', background: `${ridges}, linear-gradient(90deg, rgba(200,220,255,.45), rgba(90,130,210,.35))`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: 'var(--russo)', fontSize: 9, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', maxHeight: h - 16 }}>{item.title.toUpperCase()}</span>
          </div>
          <div style={{ position: 'absolute', right: 0, top: 0, width: depth, height: '100%', transformOrigin: 'right center', transform: 'rotateY(-90deg)', background: 'linear-gradient(90deg, rgba(120,150,210,.45), rgba(220,232,255,.5))' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: depth, transformOrigin: 'center top', transform: 'rotateX(-90deg)', background: 'linear-gradient(rgba(230,240,255,.55), rgba(140,170,230,.35))' }} />
          <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: depth, transformOrigin: 'center bottom', transform: 'rotateX(90deg)', background: 'linear-gradient(rgba(60,80,150,.5), rgba(160,190,240,.45))' }} />
          {/* le dos du boîtier, très léger */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 10, transform: `translateZ(-${depth}px)`, background: 'rgba(120,150,210,.18)', border: '1px solid rgba(191,214,255,.35)' }} />
          {/* l'affiche, entière, au format 2:3 */}
          <div style={{ position: 'absolute', top: 7, left: 14, right: 7, bottom: 7, borderRadius: 2, overflow: 'hidden', transform: 'translateZ(-3px)', background: 'linear-gradient(180deg, #0B1230, #23104A 45%, #8E1B4A 75%, #E2531A)' }}>
            {item.poster && <img src={img(item.poster, 'w500')} alt="" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, background: 'linear-gradient(180deg, transparent, rgba(5,10,31,.9) 70%)' }} />
            <div style={{ position: 'absolute', left: 10, right: 10, bottom: 9, fontSize: 12, fontWeight: 700, color: '#E9EEF5' }}>{meta}</div>
          </div>
          {/* la face avant en plastique cristal */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 10, pointerEvents: 'none', background: 'linear-gradient(135deg, rgba(230,240,255,.16), rgba(140,180,255,.05) 40%, rgba(230,240,255,.10))', border: '1px solid rgba(255,255,255,.65)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18), inset 0 0 22px rgba(191,214,255,.18)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, borderRadius: '10px 0 0 10px', background: ridges, borderRight: '1px solid rgba(255,255,255,.45)', transform: 'translateZ(.5px)' }} />
          <div style={{ position: 'absolute', left: 3, top: '30%', width: 6, height: 34, borderRadius: 3, background: 'rgba(255,255,255,.55)', transform: 'translateZ(1px)' }} />
          <div style={{ position: 'absolute', left: 3, bottom: '30%', width: 6, height: 34, borderRadius: 3, background: 'rgba(255,255,255,.55)', transform: 'translateZ(1px)' }} />
          {/* reflet diffus qui glisse quand la boîte pivote */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 10, transform: 'translateZ(1px)', pointerEvents: 'none',
            backgroundImage: 'linear-gradient(118deg, rgba(255,255,255,0) 8%, rgba(255,255,255,.16) 30%, rgba(255,255,255,.22) 40%, rgba(255,255,255,.08) 55%, rgba(255,255,255,0) 75%), radial-gradient(ellipse at 20% 0%, rgba(255,255,255,.2), rgba(255,255,255,0) 55%)',
            backgroundSize: '220% 100%, 100% 100%', backgroundPosition: `${50 + ry * 2}% 0, 0 0`, backgroundRepeat: 'no-repeat', transition: s.dragging ? 'none' : 'background-position .55s',
          }} />
          {/* stickers */}
          <div style={{ position: 'absolute', top: -12, left: -14, width: 62, height: 62, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #FF7A6B, #E2231A 55%, #A0110B)', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1, transform: 'translateZ(22px) rotate(-12deg)' }}>
            <span className="russo" style={{ fontSize: 9, letterSpacing: 1 }}>{item.type === 'tv' ? 'SÉRIE' : 'LOCATION'}</span>
            <span className="russo" style={{ fontSize: 20 }}>{item.type === 'tv' ? 'TV' : '48H'}</span>
          </div>
          {coupDeCoeur(item) && (
            <div style={{ position: 'absolute', right: -28, bottom: h * 0.22, width: 96, height: 92, transform: 'translateZ(32px) rotate(10deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/zap/objets-etoile-coup-de-coeur.webp" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
              <span className="russo" style={{ position: 'relative', fontSize: 12, lineHeight: 1.05, color: '#E2231A', textAlign: 'center' }}>COUP DE<br />CŒUR</span>
            </div>
          )}
          <div style={{ position: 'absolute', left: 30, bottom: -10, background: '#fff', color: '#0A1A4A', borderRadius: 3, padding: '3px 8px', fontSize: 10, fontWeight: 800, letterSpacing: 1, transform: 'translateZ(14px) rotate(-2deg)', boxShadow: '0 2px 0 rgba(0,0,0,.4)' }}>ZAPETTE · N° {number}</div>
          {s.dx > 25 && <div style={{ ...stamp, right: 18, background: '#FFC400', color: '#0A1A4A', borderColor: '#0A1A4A', transform: 'translateZ(40px) rotate(-12deg)' }}>AU PANIER</div>}
          {s.dx < -25 && <div style={{ ...stamp, left: 28, background: '#fff', color: '#4A5878', borderColor: '#4A5878', transform: 'translateZ(40px) rotate(12deg)' }}>PASSER</div>}
        </div>
      </div>
    </div>
  );
});

export default Jaquette;
