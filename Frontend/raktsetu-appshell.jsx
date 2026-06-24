// raktsetu-appshell.jsx — bottom nav, icons, shell, small shared bits for the full app

// ── tiny CSS nav icons (no hand-drawn SVGs) ──────────────────
function NavIcoHome({ c }) { return <Drop size={15} color={c} />; }
function NavIcoBank({ c }) {
  return (
    <span style={{ width: 16, height: 16, borderRadius: 5, border: `2px solid ${c}`, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: c, fontSize: 11, fontWeight: 800, lineHeight: 1 }}>+</span>
    </span>
  );
}
function NavIcoList({ c }) {
  return (
    <span style={{ width: 16, height: 14, display: 'inline-flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <span style={{ height: 2.5, borderRadius: 2, background: c }}></span>
      <span style={{ height: 2.5, borderRadius: 2, background: c, width: '78%' }}></span>
      <span style={{ height: 2.5, borderRadius: 2, background: c, width: '56%' }}></span>
    </span>
  );
}
function NavIcoUser({ c }) {
  return (
    <span style={{ width: 16, height: 16, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c }}></span>
      <span style={{ width: 13, height: 6, borderRadius: '7px 7px 2px 2px', background: c }}></span>
    </span>
  );
}
const RS_NAV_ICONS = { home: NavIcoHome, bank: NavIcoBank, list: NavIcoList, user: NavIcoUser };

function RSBottomNav({ tabs, active, onChange, accent }) {
  return (
    <nav style={{
      display: 'flex', background: RS.white, borderTop: `1px solid ${RS.line}`,
      flexShrink: 0, paddingBottom: 2,
    }}>
      {tabs.map(t => {
        const is = t.id === active;
        const Ico = RS_NAV_ICONS[t.icon];
        const c = is ? accent : RS.faint;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flex: 1, border: 'none', background: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '10px 0 8px', fontFamily: RS_FONT, minHeight: 52,
          }}>
            <Ico c={c} />
            <span style={{ fontSize: 10.5, fontWeight: is ? 700 : 500, color: c }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// Shell: content + bottom nav inside the phone
function AppShell({ accent, tabs, active, onChange, hideNav, children }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: RS.fog }}>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {!hideNav && <RSBottomNav tabs={tabs} active={active} onChange={onChange} accent={accent} />}
    </div>
  );
}

// ── onboarding bits ──────────────────────────────────────────
function OnbHeader({ accent, step, total }) {
  return (
    <div style={{ padding: '20px 22px 0', display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <Drop size={16} color={accent} />
        <span style={{ fontFamily: RS_FONT, fontSize: 15, fontWeight: 800, color: RS.ink, letterSpacing: '-0.01em' }}>VitalLink</span>
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{
            height: 4, borderRadius: 2, flex: 1, transition: 'background 250ms',
            background: i <= step ? accent : RS.line,
          }}></span>
        ))}
      </div>
    </div>
  );
}

function OtpRow({ accent, code = '4 7 2 9 1 8' }) {
  const digits = code.split(' ');
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <span key={i} style={{
          width: 44, height: 52, borderRadius: 10, background: RS.white,
          border: `1.5px solid ${i === digits.length - 1 ? accent : RS.line}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: RS_MONO, fontWeight: 700, fontSize: 20, color: RS.ink,
        }}>{d}</span>
      ))}
    </div>
  );
}

function SettingRow({ label, sub, right, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
      borderBottom: last ? 'none' : `1px dashed ${RS.line}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: RS.ink }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: RS.mid, marginTop: 2, lineHeight: 1.45 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function MiniToggle({ on, color }) {
  return (
    <span style={{
      width: 40, height: 23, borderRadius: 100, flexShrink: 0, position: 'relative',
      background: on ? color : RS.line, display: 'inline-block',
    }}>
      <span style={{
        position: 'absolute', top: 2.5, left: on ? 19 : 2.5, width: 18, height: 18,
        borderRadius: '50%', background: RS.white, boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }}></span>
    </span>
  );
}

Object.assign(window, { RSBottomNav, AppShell, OnbHeader, OtpRow, SettingRow, MiniToggle });
