// raktsetu-dash-data.jsx — mock data + shared dashboard primitives
// Govt + blood-bank web dashboard. District officer scope: Ludhiana.

const D = {
  ink: '#16161A', mid: '#55555E', faint: '#8E8E96',
  fog: '#F6F4F3', line: '#E6DEDD', panel: '#FFFFFF',
  red: '#C0152A', deep: '#7A0A18', soft: '#FFF0F0', softLine: '#F2C4CB',
  teal: '#0D7A5F', steal: '#E4F4EE', tealLine: '#BFE3D6',
  amber: '#B45309', samber: '#FDF2DE', amberLine: '#F0DCB0',
  blue: '#1E5FA8', sblue: '#E5EEF7',
  sidebar: '#15151A', sidebarHi: '#23232B',
};
const DFONT = "'IBM Plex Sans','Noto Sans Devanagari',system-ui,sans-serif";
const DMONO = "'IBM Plex Mono',ui-monospace,monospace";
const GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

// ── live emergency feed ──────────────────────────────────────
const DASH_EMERGENCIES = [
  { id: 'RKS-48217', group: 'O+', units: 2, hosp: 'Apollo Hospital', score: 82, status: 'matched', mins: 4, donor: 'Arjun S.', live: true },
  { id: 'RKS-48214', group: 'B-', units: 1, hosp: 'CMC Hospital', score: 91, status: 'searching', mins: 2, donor: null, live: true },
  { id: 'RKS-48209', group: 'A+', units: 3, hosp: 'Civil Hospital', score: 68, status: 'matched', mins: 6, donor: 'Priya R.', live: true },
  { id: 'RKS-48201', group: 'O-', units: 2, hosp: 'DMC Hospital', score: 88, status: 'fulfilled', mins: 9, donor: 'Rahul V.', live: false },
  { id: 'RKS-48198', group: 'AB+', units: 1, hosp: 'SPS Hospital', score: 54, status: 'fulfilled', mins: 12, donor: 'Bank stock', live: false },
  { id: 'RKS-48190', group: 'B+', units: 2, hosp: 'Apollo Hospital', score: 73, status: 'fulfilled', mins: 7, donor: 'Kiran M.', live: false },
];

// ── district blood banks · live stock ────────────────────────
const DASH_BANKS = [
  { name: 'Apollo Hospital Blood Bank', hfr: 'PB-0412', stock: { 'O+': 12, 'O-': 2, 'A+': 8, 'A-': 0, 'B+': 15, 'B-': 3, 'AB+': 4, 'AB-': 1 }, updated: 2 },
  { name: 'Civil Hospital Blood Bank', hfr: 'PB-0027', stock: { 'O+': 6, 'O-': 0, 'A+': 14, 'A-': 2, 'B+': 9, 'B-': 0, 'AB+': 7, 'AB-': 2 }, updated: 6 },
  { name: 'CMC Blood Centre', hfr: 'PB-0186', stock: { 'O+': 18, 'O-': 4, 'A+': 5, 'A-': 1, 'B+': 6, 'B-': 1, 'AB+': 2, 'AB-': 0 }, updated: 11 },
  { name: 'DMC Heart Centre Bank', hfr: 'PB-0091', stock: { 'O+': 9, 'O-': 1, 'A+': 11, 'A-': 3, 'B+': 7, 'B-': 2, 'AB+': 5, 'AB-': 1 }, updated: 4 },
  { name: 'Red Cross Bhawan', hfr: 'PB-0233', stock: { 'O+': 2, 'O-': 1, 'A+': 3, 'A-': 0, 'B+': 4, 'B-': 0, 'AB+': 1, 'AB-': 0 }, updated: 24 },
  { name: 'SPS Hospital Blood Bank', hfr: 'PB-0305', stock: { 'O+': 7, 'O-': 0, 'A+': 6, 'A-': 1, 'B+': 5, 'B-': 1, 'AB+': 3, 'AB-': 0 }, updated: 9 },
];

// ── fraud flags (Isolation Forest) ───────────────────────────
const DASH_FRAUD = [
  { id: 'FF-2291', type: 'Duplicate donor identity', target: 'Phone +91 ••••• 7781', score: 0.94, sev: 'high', detail: '3 ABHA IDs sharing one device fingerprint · blood-farm pattern', when: '8 min ago', status: 'open' },
  { id: 'FF-2288', type: 'Unit chain break', target: 'Unit RKS-LDH-47710', score: 0.88, sev: 'high', detail: 'Hash mismatch between issue and transfusion event', when: '41 min ago', status: 'open' },
  { id: 'FF-2284', type: 'Abnormal request rate', target: 'Patient acct ••4490', score: 0.71, sev: 'med', detail: '6 emergency requests in 24h across 3 hospitals', when: '2 h ago', status: 'review' },
  { id: 'FF-2280', type: 'Inventory anomaly', target: 'Red Cross Bhawan', score: 0.66, sev: 'med', detail: 'O+ stock fell 14→2 with no recorded issue events', when: '3 h ago', status: 'review' },
  { id: 'FF-2275', type: 'Geo-velocity', target: 'Donor acct ••1120', score: 0.58, sev: 'low', detail: 'Accepted 2 alerts 60km apart within 18 min', when: '5 h ago', status: 'cleared' },
];

// ── 7-day shortage forecast (units of projected deficit; +ve = surplus) ──
const DASH_FORECAST = {
  'O+': [4, 1, -2, -5, -8, -11, -9],
  'O-': [-2, -3, -5, -6, -7, -9, -10],
  'A+': [6, 5, 3, 2, 0, -1, -2],
  'B+': [3, 2, 1, -1, -2, -2, -3],
  'AB-': [-1, -1, -2, -2, -3, -3, -4],
};

const DASH_DESERTS = [
  { block: 'Jagraon', km: 38, banks: 1, risk: 'high', gap: 'O−, AB−' },
  { block: 'Khanna', km: 42, banks: 1, risk: 'high', gap: 'O−' },
  { block: 'Raikot', km: 51, banks: 0, risk: 'critical', gap: 'all groups' },
  { block: 'Samrala', km: 33, banks: 1, risk: 'med', gap: 'B−' },
];

const DASH_CAMPS = [
  { place: 'Raikot Community Hall', date: 'Sat 14 Jun', need: 'O−, AB−', reach: '~120 donors', why: 'Zero banks within 50km' },
  { place: 'GNDU Campus, Jagraon', date: 'Tue 17 Jun', need: 'O+, O−', reach: '~340 donors', why: 'Young eligible pool, low coverage' },
  { place: 'Khanna Grain Market', date: 'Sat 21 Jun', need: 'O−', reach: '~200 donors', why: 'Forecast deficit in 5 days' },
];

// ── audit / hash-chain events ────────────────────────────────
const DASH_AUDIT = [
  { evt: 'unit.transfused', unit: 'RKS-LDH-48217', hash: '9f2a…c41e', prev: '7b10…aa92', t: '10:14:06', ok: true },
  { evt: 'unit.issued', unit: 'RKS-LDH-48217', hash: '7b10…aa92', prev: 'c3d8…1f04', t: '10:09:51', ok: true },
  { evt: 'match.accepted', unit: 'RKS-LDH-48217', hash: 'c3d8…1f04', prev: '11ab…77e3', t: '09:58:20', ok: true },
  { evt: 'emergency.created', unit: 'RKS-LDH-48217', hash: '11ab…77e3', prev: '—', t: '09:56:02', ok: true },
  { evt: 'unit.transfused', unit: 'RKS-LDH-47710', hash: '02ee…b5c1', prev: 'd9f0…3a18', t: '09:40:11', ok: false },
];

// ── primitives ───────────────────────────────────────────────
function DPanel({ title, sub, right, pad = 18, children, style }) {
  return (
    <section style={{ background: D.panel, border: `1px solid ${D.line}`, borderRadius: 14, display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
      {(title || right) && (
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${D.line}` }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && <div style={{ fontSize: 14, fontWeight: 700, color: D.ink, letterSpacing: '-0.01em' }}>{title}</div>}
            {sub && <div style={{ fontSize: 11.5, color: D.faint, marginTop: 2 }}>{sub}</div>}
          </div>
          {right}
        </header>
      )}
      <div style={{ padding: pad, flex: 1, minWidth: 0 }}>{children}</div>
    </section>
  );
}

function DLabel({ children, style }) {
  return <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: D.faint, ...style }}>{children}</div>;
}

function DPill({ tone = 'neutral', dot, children }) {
  const tones = {
    red: { bg: D.soft, fg: D.deep }, teal: { bg: D.steal, fg: D.teal },
    amber: { bg: D.samber, fg: D.amber }, blue: { bg: D.sblue, fg: D.blue },
    neutral: { bg: D.fog, fg: D.mid },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, background: t.bg, color: t.fg,
      borderRadius: 100, padding: '4px 11px', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.fg }}></span>}
      {children}
    </span>
  );
}

function DDrop({ size = 16, color = D.red, style }) {
  return <span aria-hidden="true" style={{ width: size, height: size, background: color, display: 'inline-block', borderRadius: `0 ${size}px ${size}px ${size}px`, transform: 'rotate(45deg)', flexShrink: 0, ...style }}></span>;
}

function DGroup({ g, color = D.red }) {
  return <span style={{ fontFamily: DMONO, fontWeight: 700, fontSize: 12, color, background: D.soft, border: `1px solid ${D.softLine}`, borderRadius: 7, padding: '3px 7px', display: 'inline-block', minWidth: 30, textAlign: 'center' }}>{g}</span>;
}

function DPulse({ color = D.teal, size = 8 }) {
  return (
    <span style={{ position: 'relative', width: size, height: size, display: 'inline-block', flexShrink: 0 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }}></span>
      <span className="rs-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }}></span>
    </span>
  );
}

// sparkline (SVG polyline, auto-scaled)
function DSpark({ data, color = D.red, w = 70, h = 24 }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / span) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function stockTone(n) {
  if (n === 0) return { bg: D.soft, fg: D.deep, label: 'OUT' };
  if (n <= 3) return { bg: D.samber, fg: D.amber, label: 'LOW' };
  return { bg: D.steal, fg: D.teal, label: 'OK' };
}

Object.assign(window, {
  D, DFONT, DMONO, GROUPS,
  DASH_EMERGENCIES, DASH_BANKS, DASH_FRAUD, DASH_FORECAST, DASH_DESERTS, DASH_CAMPS, DASH_AUDIT,
  DPanel, DLabel, DPill, DDrop, DGroup, DPulse, DSpark, stockTone,
});
