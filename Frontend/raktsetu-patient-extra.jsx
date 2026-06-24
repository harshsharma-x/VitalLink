// raktsetu-patient-extra.jsx — Blood banks, request history, profile, patient onboarding

const RS_BANKS = [
  {
    id: 'apollo', name: 'Apollo Hospital Blood Bank', dist: '2.3 km', updated: '2 min ago',
    addr: 'Sherpur Chowk, GT Road, Ludhiana', hours: 'Open 24×7', hfr: 'HFR-PB-0412',
    stock: { 'A+': 8, 'A-': 0, 'B+': 15, 'B-': 3, 'O+': 12, 'O-': 2, 'AB+': 4, 'AB-': 1 },
  },
  {
    id: 'civil', name: 'Civil Hospital Blood Bank', dist: '3.8 km', updated: '6 min ago',
    addr: 'Mall Road, Civil Lines, Ludhiana', hours: 'Open 24×7', hfr: 'HFR-PB-0027',
    stock: { 'A+': 14, 'A-': 2, 'B+': 9, 'B-': 0, 'O+': 6, 'O-': 0, 'AB+': 7, 'AB-': 2 },
  },
  {
    id: 'cmc', name: 'CMC Blood Centre', dist: '5.1 km', updated: '11 min ago',
    addr: 'Brown Road, Ludhiana', hours: '8 AM – 8 PM', hfr: 'HFR-PB-0186',
    stock: { 'A+': 5, 'A-': 1, 'B+': 6, 'B-': 1, 'O+': 18, 'O-': 4, 'AB+': 2, 'AB-': 0 },
  },
  {
    id: 'redcross', name: 'Red Cross Bhawan', dist: '6.0 km', updated: '24 min ago',
    addr: 'Bharat Nagar Chowk, Ludhiana', hours: '9 AM – 5 PM', hfr: 'HFR-PB-0233',
    stock: { 'A+': 3, 'A-': 0, 'B+': 4, 'B-': 0, 'O+': 2, 'O-': 1, 'AB+': 1, 'AB-': 0 },
  },
];

function stockTone(n) {
  if (n === 0) return { bg: RS.soft, fg: '#A4123F', label: 'out' };
  if (n <= 3) return { bg: RS.samber, fg: RS.amber, label: 'low' };
  return { bg: RS.steal, fg: RS.teal, label: 'ok' };
}

function StockChip({ g, n }) {
  const t = stockTone(n);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, background: t.bg,
      borderRadius: 7, padding: '4px 8px', fontFamily: RS_MONO, fontSize: 11, fontWeight: 700, color: t.fg,
    }}>
      {g}<span style={{ opacity: 0.85, fontWeight: 600 }}>{n}</span>
    </span>
  );
}

function PatientBankList({ accent, onOpen }) {
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <RSAppHeader accent={accent} name="Blood banks" sub="Ludhiana · 9 verified centres" right={
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: RS.teal, fontWeight: 700 }}>
          <PulseDot color={RS.teal} /> LIVE STOCK
        </span>
      } />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        {RS_BANKS.map(b => (
          <button key={b.id} onClick={() => onOpen(b.id)} style={{
            textAlign: 'left', fontFamily: RS_FONT, cursor: 'pointer',
            background: RS.white, border: `1px solid ${RS.line}`, borderRadius: 14, padding: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: RS.ink, flex: 1 }}>{b.name}</span>
              <span style={{ fontFamily: RS_MONO, fontSize: 11.5, fontWeight: 600, color: RS.mid, flexShrink: 0 }}>{b.dist}</span>
            </div>
            <div style={{ fontSize: 11, color: RS.faint, marginBottom: 10 }}>✓ HFR verified · updated {b.updated}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(b.stock).map(([g, n]) => <StockChip key={g} g={g} n={n} />)}
            </div>
          </button>
        ))}
        <div style={{ fontSize: 11, color: RS.faint, lineHeight: 1.5, textAlign: 'center', padding: '2px 10px 8px' }}>
          Stock synced from bank inventory every 30 seconds. Units shown are available, screened whole blood.
        </div>
      </div>
    </div>
  );
}

function PatientBankDetail({ accent, bank, onBack }) {
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
        background: RS.white, borderBottom: `1px solid ${RS.line}`, flexShrink: 0,
      }}>
        <button onClick={onBack} aria-label="Back" style={{
          border: 'none', background: RS.fog, borderRadius: 9, width: 32, height: 32,
          cursor: 'pointer', fontSize: 16, color: RS.ink, flexShrink: 0,
        }}>‹</button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: RS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bank.name}</div>
          <div style={{ fontSize: 11, color: RS.mid }}>{bank.dist} · {bank.hours}</div>
        </div>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 13, overflow: 'auto' }}>
        <RSCard style={{ padding: '12px 14px' }}>
          <RSLabel style={{ marginBottom: 10 }}>Live stock · updated {bank.updated}</RSLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {Object.entries(bank.stock).map(([g, n]) => {
              const t = stockTone(n);
              return (
                <div key={g} style={{ background: t.bg, borderRadius: 10, padding: '9px 4px', textAlign: 'center' }}>
                  <div style={{ fontFamily: RS_MONO, fontWeight: 700, fontSize: 13, color: t.fg }}>{g}</div>
                  <div style={{ fontFamily: RS_MONO, fontWeight: 700, fontSize: 16, color: t.fg }}>{n}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.fg, opacity: 0.8 }}>{t.label}</div>
                </div>
              );
            })}
          </div>
        </RSCard>

        <RSCard style={{ padding: '4px 14px' }}>
          <SettingRow label="Address" sub={bank.addr} />
          <SettingRow label="Registry" sub={`${bank.hfr} · verified against NHA Health Facility Registry`} />
          <SettingRow label="Component availability" sub="Whole blood · PRBC · FFP · Platelets on request" last />
        </RSCard>

        <div style={{ display: 'flex', gap: 10 }}>
          <RSBtn accent={accent} style={{ flex: 1 }}>☎ Call blood bank</RSBtn>
          <RSBtn kind="ghost" accent={accent} style={{ flex: 1, color: RS.ink }}>Directions</RSBtn>
        </div>
        <div style={{ fontSize: 11, color: RS.faint, lineHeight: 1.5, textAlign: 'center' }}>
          Carry a doctor's requisition slip. Replacement donation may be requested by the bank.
        </div>
      </div>
    </div>
  );
}

function PatientBanksTab({ accent }) {
  const [openId, setOpenId] = React.useState(null);
  const bank = RS_BANKS.find(b => b.id === openId);
  if (bank) return <PatientBankDetail accent={accent} bank={bank} onBack={() => setOpenId(null)} />;
  return <PatientBankList accent={accent} onOpen={setOpenId} />;
}

// ── request history ──────────────────────────────────────────
function ReqStatusPill({ tone, children }) {
  const tones = {
    live: { bg: RS.soft, fg: '#A4123F' },
    done: { bg: RS.steal, fg: RS.teal },
    closed: { bg: RS.fog, fg: RS.mid },
  };
  const t = tones[tone];
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      background: t.bg, color: t.fg, borderRadius: 100, padding: '4px 10px', flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>{children}</span>
  );
}

function PatientRequests({ accent, stage, onFollow }) {
  const active = ['searching', 'alert', 'tracking', 'arrived'].includes(stage);
  const fulfilled = stage === 'complete';
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <RSAppHeader accent={accent} name="My requests" sub="Raised by you or linked hospital staff" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        {(active || fulfilled) && (
          <RSCard style={{ border: `1.5px solid ${active ? accent : '#BFE3D6'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <BloodTag group="O+" accent={accent} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: RS.ink }}>O+ · 2 units · Critical</div>
                <div style={{ fontSize: 11.5, color: RS.mid }}>Apollo Hospital · today</div>
              </div>
              {active
                ? <ReqStatusPill tone="live"><PulseDot color="#A4123F" size={6} /> In progress</ReqStatusPill>
                : <ReqStatusPill tone="done">✓ Fulfilled</ReqStatusPill>}
            </div>
            {active
              ? <RSBtn accent={accent} onClick={onFollow} style={{ padding: '11px 16px', fontSize: 14 }}>Follow live</RSBtn>
              : <div style={{ fontSize: 11.5, color: RS.mid, lineHeight: 1.5 }}>Donated by Arjun S. at 10:14 AM · unit <b style={{ fontFamily: RS_MONO, color: RS.ink }}>RKS-LDH-48217</b></div>}
          </RSCard>
        )}

        <RSCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <BloodTag group="B+" accent={accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: RS.ink }}>B+ · 1 unit · Within 24 hrs</div>
              <div style={{ fontSize: 11.5, color: RS.mid }}>Civil Hospital · 11 Feb 2026</div>
            </div>
            <ReqStatusPill tone="done">✓ Fulfilled</ReqStatusPill>
          </div>
          <div style={{ fontSize: 11.5, color: RS.mid, lineHeight: 1.5 }}>Donated by Simran K. · 14 donors alerted · matched in 4 min</div>
        </RSCard>

        <RSCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <BloodTag group="O+" accent={accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: RS.ink }}>O+ · 1 unit · Planned</div>
              <div style={{ fontSize: 11.5, color: RS.mid }}>Apollo Hospital · 28 Dec 2025</div>
            </div>
            <ReqStatusPill tone="closed">Closed</ReqStatusPill>
          </div>
          <div style={{ fontSize: 11.5, color: RS.mid, lineHeight: 1.5 }}>Fulfilled from Apollo blood bank stock — no donor needed</div>
        </RSCard>

        <div style={{ fontSize: 11, color: RS.faint, textAlign: 'center', lineHeight: 1.5, padding: '0 12px' }}>
          Every request is verified against the hospital registry and rate-limited to prevent misuse.
        </div>
      </div>
    </div>
  );
}

// ── patient profile ──────────────────────────────────────────
function PatientProfile({ accent }) {
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <RSAppHeader accent={accent} name="Profile" sub="Account & privacy" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 13, overflow: 'auto' }}>
        <RSCard style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%', background: RS.soft, color: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 19, flexShrink: 0,
          }}>M</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: RS.ink }}>Meera Kapoor</div>
            <div style={{ fontSize: 12, color: RS.mid, fontFamily: RS_MONO }}>+91 ••••• •4821</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: RS.teal, background: RS.steal, borderRadius: 100, padding: '4px 10px' }}>✓ OTP verified</span>
        </RSCard>

        <RSCard style={{ padding: '4px 16px' }}>
          <RSLabel style={{ margin: '12px 0 2px' }}>Consent manager · ABDM</RSLabel>
          <SettingRow label="Emergency request consent" sub="Active · auto-expires 24 h after request closes" right={<MiniToggle on color={RS.teal} />} />
          <SettingRow label="Share hospital location with donors" sub="Only during an active match" right={<MiniToggle on color={RS.teal} />} />
          <SettingRow label="WhatsApp updates" sub="Status changes on your requests" right={<MiniToggle on color={RS.teal} />} last />
        </RSCard>

        <RSCard style={{ padding: '4px 16px' }}>
          <RSLabel style={{ margin: '12px 0 2px' }}>Data rights · DISHA</RSLabel>
          <SettingRow label="Download my data" sub="Requests, consents, access log" right={<span style={{ color: RS.faint }}>›</span>} />
          <SettingRow label="Who accessed my records" sub="3 accesses this month — all by you" right={<span style={{ color: RS.faint }}>›</span>} />
          <SettingRow label="Delete my account" sub="Removes everything except anonymized unit hashes" right={<span style={{ color: RS.faint }}>›</span>} last />
        </RSCard>

        <RSCard style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', background: RS.fog, border: `1px dashed ${RS.line}` }}>
          <span style={{ fontSize: 11, fontFamily: RS_MONO, background: RS.steal, color: RS.teal, fontWeight: 700, borderRadius: 6, padding: '3px 8px', flexShrink: 0 }}>SMS</span>
          <div style={{ fontSize: 11.5, color: RS.mid, lineHeight: 1.45 }}>
            Offline fallback is always on: dial <b style={{ color: RS.ink, fontFamily: RS_MONO }}>*BLOOD#</b> from any phone — no app, no internet.
          </div>
        </RSCard>
      </div>
    </div>
  );
}

// ── patient onboarding (OTP-only — no signup wall in an emergency) ──
function PatientOnboarding({ accent }) {
  const [step, setStep] = React.useState(0);
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%', background: RS.fog }}>
      <OnbHeader accent={accent} step={step} total={2} />
      {step === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '26px 22px 22px', gap: 18 }}>
          <div>
            <div style={{ fontSize: 23, fontWeight: 800, color: RS.ink, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              <Bi en="One number. That's all." hi="सिर्फ एक नंबर। बस।" />
            </div>
            <div style={{ fontSize: 13, color: RS.mid, marginTop: 8, lineHeight: 1.55 }}>
              In an emergency there's no time for forms. Verify your phone and you can raise a request immediately.
            </div>
          </div>
          <div>
            <RSLabel>Mobile number</RSLabel>
            <div style={{ background: RS.white, border: `1.5px solid ${RS.line}`, borderRadius: 12, padding: '13px 14px', fontFamily: RS_MONO, fontWeight: 600, fontSize: 16, color: RS.ink }}>
              +91 98765 24821
            </div>
          </div>
          <div>
            <RSLabel>Enter the 6-digit code</RSLabel>
            <OtpRow accent={accent} />
            <div style={{ fontSize: 11.5, color: RS.faint, textAlign: 'center', marginTop: 10 }}>Sent via SMS · auto-detected ✓</div>
          </div>
          <RSBtn accent={accent} big onClick={() => setStep(1)} style={{ marginTop: 'auto' }}>
            <Bi en="Verify & continue" hi="सत्यापित करें" />
          </RSBtn>
        </div>
      )}
      {step === 1 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '26px 22px 22px', gap: 16 }}>
          <div>
            <div style={{ fontSize: 23, fontWeight: 800, color: RS.ink, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              <Bi en="You're set, Meera" hi="आप तैयार हैं, मीरा" />
            </div>
            <div style={{ fontSize: 13, color: RS.mid, marginTop: 8, lineHeight: 1.55 }}>
              Request blood through whichever channel works in the moment — they all reach the same network of 12,480 donors.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              ['App', 'Fastest — live tracking included', RS.soft, accent],
              ['WhatsApp', '"Need O+ 2 units Apollo Ludhiana" — that\u2019s enough', RS.steal, RS.teal],
              ['SMS / USSD', 'Dial *BLOOD# from any keypad phone', RS.samber, RS.amber],
              ['Missed call', 'We call you back within 60 seconds', RS.fog, RS.mid],
            ].map(([ch, note, bg, fg], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: RS.white, border: `1px solid ${RS.line}`, borderRadius: 12, padding: '11px 14px' }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, fontFamily: RS_MONO, background: bg, color: fg, borderRadius: 6, padding: '4px 9px', flexShrink: 0, minWidth: 64, textAlign: 'center' }}>{ch}</span>
                <span style={{ fontSize: 12, color: RS.mid, lineHeight: 1.45 }}>{note}</span>
              </div>
            ))}
          </div>
          <RSBtn accent={accent} big onClick={() => setStep(0)} style={{ marginTop: 'auto' }}>
            <Bi en="Open VitalLink" hi="VitalLink खोलें" />
          </RSBtn>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { RS_BANKS, StockChip, PatientBanksTab, PatientRequests, PatientProfile, PatientOnboarding });
