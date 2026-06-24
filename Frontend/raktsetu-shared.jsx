// raktsetu-shared.jsx — design tokens + shared primitives for the RaktSetu demo
// Tokens lifted from uploads/raktsetu-system-design.jsx (doc palette).

const RS = {
  ink: '#16161A',
  mid: '#55555E',
  faint: '#8E8E96',
  fog: '#F6F4F3',
  line: '#E6DEDD',
  soft: '#FFF0F0',
  softLine: '#F2C4CB',
  teal: '#0D7A5F',
  steal: '#E4F4EE',
  amber: '#B45309',
  samber: '#FDF2DE',
  white: '#FFFFFF',
  deep: '#7A0A18',
};
const RS_FONT = "'IBM Plex Sans','Noto Sans Devanagari',system-ui,sans-serif";
const RS_MONO = "'IBM Plex Mono',ui-monospace,monospace";

// language context: 'en' or 'bi' (English + Hindi)
const RSLang = React.createContext('en');

// Bilingual text — renders Hindi sub-line when lang === 'bi'
function Bi({ en, hi, hiStyle, style }) {
  const lang = React.useContext(RSLang);
  if (lang !== 'bi' || !hi) return <span style={style}>{en}</span>;
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1, ...style }}>
      <span>{en}</span>
      <span style={{ fontSize: '0.72em', fontWeight: 500, opacity: 0.75, ...hiStyle }}>{hi}</span>
    </span>
  );
}

// CSS teardrop (blood drop) — circle with one sharp corner
function Drop({ size = 18, color = '#C0152A', style }) {
  return (
    <span aria-hidden="true" style={{
      width: size, height: size, background: color, display: 'inline-block',
      borderRadius: `0 ${size}px ${size}px ${size}px`,
      transform: 'rotate(45deg)', flexShrink: 0, ...style,
    }}></span>
  );
}

function RSBtn({ children, onClick, accent, kind = 'primary', big = false, disabled = false, style }) {
  const base = {
    fontFamily: RS_FONT, fontWeight: 600, border: 'none', cursor: disabled ? 'default' : 'pointer',
    borderRadius: 12, width: '100%', boxSizing: 'border-box',
    padding: big ? '17px 20px' : '13px 18px', fontSize: big ? 17 : 15,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'transform 120ms ease, box-shadow 120ms ease, opacity 120ms',
    opacity: disabled ? 0.45 : 1,
  };
  const kinds = {
    primary: { background: accent, color: RS.white, boxShadow: `0 6px 18px ${accent}44` },
    onAccent: { background: RS.white, color: accent },
    ghost: { background: 'transparent', color: RS.mid, border: `1.5px solid ${RS.line}` },
    ghostOnAccent: { background: 'rgba(255,255,255,0.14)', color: RS.white, border: '1.5px solid rgba(255,255,255,0.4)' },
    teal: { background: RS.teal, color: RS.white },
  };
  return (
    <button onClick={disabled ? undefined : onClick}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.985)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      style={{ ...base, ...kinds[kind], ...style }}>
      {children}
    </button>
  );
}

function RSCard({ children, style }) {
  return (
    <div style={{
      background: RS.white, border: `1px solid ${RS.line}`, borderRadius: 14,
      padding: 16, boxSizing: 'border-box', ...style,
    }}>{children}</div>
  );
}

function RSLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase',
      color: RS.faint, marginBottom: 8, ...style,
    }}>{children}</div>
  );
}

function BloodTag({ group, accent, size = 'md' }) {
  const s = size === 'lg' ? { w: 54, f: 20 } : { w: 40, f: 14 };
  return (
    <span style={{
      width: s.w, height: s.w, borderRadius: 10, background: RS.soft,
      border: `1.5px solid ${accent}`, color: accent, fontWeight: 700, fontSize: s.f,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: RS_MONO, flexShrink: 0,
    }}>{group}</span>
  );
}

function PulseDot({ color = '#0D7A5F', size = 8 }) {
  return (
    <span style={{ position: 'relative', width: size, height: size, display: 'inline-block', flexShrink: 0 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }}></span>
      <span className="rs-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }}></span>
    </span>
  );
}

// ── stylized map (CSS blocks + one simple polyline) ──────────────
const RS_ROUTE = [[14, 84], [30, 66], [47, 70], [60, 46], [76, 34], [84, 20]];

function rsRoutePos(progress) {
  const pts = RS_ROUTE;
  const lens = []; let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    lens.push(d); total += d;
  }
  let target = Math.min(Math.max(progress, 0), 1) * total;
  for (let i = 0; i < lens.length; i++) {
    if (target <= lens[i]) {
      const f = lens[i] === 0 ? 0 : target / lens[i];
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
    }
    target -= lens[i];
  }
  return pts[pts.length - 1];
}

function RouteMap({ progress = 0, accent, height = 300, arrived = false, compact = false }) {
  const [x, y] = rsRoutePos(progress);
  const ptsStr = RS_ROUTE.map(p => p.join(',')).join(' ');
  const road = (st) => <div style={{ position: 'absolute', background: '#E3DDD2', ...st }}></div>;
  return (
    <div style={{
      position: 'relative', height, borderRadius: compact ? 12 : 0, overflow: 'hidden',
      background: '#EFEBE2', flexShrink: 0,
    }}>
      {/* blocks + roads (abstract city) */}
      {road({ left: 0, right: 0, top: '30%', height: 10 })}
      {road({ left: 0, right: 0, top: '64%', height: 10 })}
      {road({ top: 0, bottom: 0, left: '24%', width: 10 })}
      {road({ top: 0, bottom: 0, left: '56%', width: 10 })}
      {road({ top: 0, bottom: 0, left: '80%', width: 8 })}
      <div style={{ position: 'absolute', left: '6%', top: '8%', width: '14%', height: '16%', background: '#DCE8D8', borderRadius: 8 }}></div>
      <div style={{ position: 'absolute', left: '62%', top: '72%', width: '20%', height: '18%', background: '#DCE8D8', borderRadius: 8 }}></div>
      <div style={{ position: 'absolute', left: '32%', top: '40%', width: '16%', height: '14%', background: '#E7E2D7', borderRadius: 6 }}></div>

      {/* route */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <polyline points={ptsStr} fill="none" stroke={accent} strokeOpacity="0.25" strokeWidth="2.6"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 5 }} />
      </svg>

      {/* hospital marker */}
      <div style={{ position: 'absolute', left: '84%', top: '20%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <div style={{
          width: compact ? 26 : 34, height: compact ? 26 : 34, borderRadius: 9, background: RS.white,
          border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
        }}>
          <span style={{ color: accent, fontWeight: 800, fontSize: compact ? 15 : 19, fontFamily: RS_FONT }}>+</span>
        </div>
        {!compact && <span style={{ fontSize: 10, fontWeight: 700, color: RS.ink, background: 'rgba(255,255,255,0.9)', padding: '2px 7px', borderRadius: 6 }}>Apollo Hospital</span>}
      </div>

      {/* donor marker */}
      <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', transition: 'left 600ms linear, top 600ms linear' }}>
        <span style={{ position: 'relative', display: 'block', width: compact ? 18 : 24, height: compact ? 18 : 24 }}>
          <span className="rs-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: arrived ? RS.teal : accent }}></span>
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%', background: arrived ? RS.teal : accent,
            border: `3px solid ${RS.white}`, boxSizing: 'border-box', boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
          }}></span>
        </span>
      </div>
    </div>
  );
}

// status bar replacement note: AndroidDevice provides chrome.
// App header used inside both apps
function RSAppHeader({ accent, name, sub, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px 12px',
      background: RS.white, borderBottom: `1px solid ${RS.line}`, flexShrink: 0,
    }}>
      <Drop size={16} color={accent} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: RS.ink, letterSpacing: '-0.01em' }}>{name}</div>
        {sub && <div style={{ fontSize: 11.5, color: RS.mid }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function fmtMMSS(totalSec) {
  const m = Math.floor(totalSec / 60), s = Math.max(0, Math.round(totalSec % 60));
  return `${m}:${String(s).padStart(2, '0')}`;
}

Object.assign(window, {
  RS, RS_FONT, RS_MONO, RSLang, Bi, Drop, RSBtn, RSCard, RSLabel, BloodTag,
  PulseDot, RouteMap, RSAppHeader, fmtMMSS, rsRoutePos,
});
