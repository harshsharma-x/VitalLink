// raktsetu-donor-extra.jsx — donation history, donor profile, ABHA onboarding

const RS_DONATIONS = [
  { date: '14 Mar 2026', place: 'Civil Hospital Ludhiana', kind: 'Whole blood · 1 unit', unit: 'RKS-LDH-44102' },
  { date: '2 Jan 2026', place: 'Red Cross Bhawan', kind: 'Whole blood · 1 unit', unit: 'RKS-LDH-41877' },
  { date: '18 Oct 2025', place: 'CMC Blood Centre', kind: 'Platelets · 1 unit', unit: 'RKS-LDH-38450' },
  { date: '9 Aug 2025', place: 'Apollo Hospital', kind: 'Whole blood · 1 unit', unit: 'RKS-LDH-35216' },
];

function DonorHistory({ accent, stage }) {
  const donated = stage === 'complete';
  const count = donated ? 8 : 7;
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <RSAppHeader accent={accent} name="My donations" sub={`${count} lifetime · every unit verifiable`} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 13, overflow: 'auto' }}>
        {/* milestone */}
        <RSCard style={{ background: `linear-gradient(135deg, ${RS.deep}, ${accent})`, border: 'none', color: RS.white }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Drop size={20} color={RS.white} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}><Bi en="Silver donor" hi="सिल्वर डोनर" /></div>
              <div style={{ fontSize: 11.5, opacity: 0.85 }}>{10 - count} more to Gold · est. ~{(10 - count) * 8} lives touched so far</div>
            </div>
            <span style={{ fontFamily: RS_MONO, fontWeight: 700, fontSize: 17 }}>{count}/10</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.25)' }}>
            <div style={{ height: 6, borderRadius: 3, background: RS.white, width: `${count * 10}%`, transition: 'width 400ms' }}></div>
          </div>
        </RSCard>

        {/* timeline */}
        <RSCard style={{ padding: '6px 16px' }}>
          {donated && (
            <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px dashed ${RS.line}` }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <PulseDot color={RS.teal} size={10} />
                <span style={{ width: 1.5, flex: 1, background: RS.line, marginTop: 4 }}></span>
              </div>
              <div style={{ flex: 1, paddingBottom: 2 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: RS.teal }}>Today · Apollo Hospital</div>
                <div style={{ fontSize: 11.5, color: RS.mid, marginTop: 2 }}>Whole blood · 1 unit · emergency match</div>
                <div style={{ fontFamily: RS_MONO, fontSize: 10.5, color: RS.faint, marginTop: 3 }}>RKS-LDH-48217 · verify ↗</div>
              </div>
            </div>
          )}
          {RS_DONATIONS.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < RS_DONATIONS.length - 1 ? `1px dashed ${RS.line}` : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: RS.line, marginTop: 3 }}></span>
                {i < RS_DONATIONS.length - 1 && <span style={{ width: 1.5, flex: 1, background: RS.line, marginTop: 4 }}></span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: RS.ink }}>{d.date} · {d.place}</div>
                <div style={{ fontSize: 11.5, color: RS.mid, marginTop: 2 }}>{d.kind}</div>
                <div style={{ fontFamily: RS_MONO, fontSize: 10.5, color: RS.faint, marginTop: 3 }}>{d.unit} · verify ↗</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: RS.faint, padding: '10px 0 12px', textAlign: 'center' }}>+ 3 earlier donations</div>
        </RSCard>

        <div style={{ fontSize: 11, color: RS.faint, lineHeight: 1.5, textAlign: 'center', padding: '0 10px' }}>
          "Verify" opens the public hash-chain record for that unit — anyone can confirm it was donated, screened and transfused, with no personal data exposed.
        </div>
      </div>
    </div>
  );
}

// ── donor profile ────────────────────────────────────────────
function DonorProfile({ accent }) {
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <RSAppHeader accent={accent} name="Profile" sub="Identity, alerts & privacy" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 13, overflow: 'auto' }}>
        <RSCard style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%', background: RS.steal, color: RS.teal,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 19, flexShrink: 0,
          }}>A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: RS.ink }}>Arjun Singh</div>
            <div style={{ fontSize: 12, color: RS.mid, fontFamily: RS_MONO }}>arjun.s@abha</div>
          </div>
          <BloodTag group="O+" accent={accent} />
        </RSCard>

        <RSCard style={{ display: 'flex', alignItems: 'center', gap: 12, background: RS.steal, border: '1px solid #BFE3D6' }}>
          <span style={{
            width: 34, height: 34, borderRadius: 9, background: RS.teal, color: RS.white, fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>✓</span>
          <div style={{ fontSize: 11.5, color: RS.ink, lineHeight: 1.5 }}>
            <b>ABHA-verified donor.</b> Identity confirmed via Aadhaar-linked health ID — one person, one donor record. No fake or duplicate accounts.
          </div>
        </RSCard>

        <RSCard style={{ padding: '4px 16px' }}>
          <RSLabel style={{ margin: '12px 0 2px' }}>Emergency alerts</RSLabel>
          <SettingRow label="Alert radius" sub="How far you're willing to travel" right={
            <span style={{ display: 'flex', gap: 5 }}>
              {['5', '10', '15'].map((km, i) => (
                <span key={km} style={{
                  fontFamily: RS_MONO, fontSize: 11.5, fontWeight: 700, borderRadius: 7, padding: '5px 9px',
                  background: i === 1 ? RS.soft : RS.fog, color: i === 1 ? accent : RS.faint,
                  border: `1.5px solid ${i === 1 ? accent : 'transparent'}`,
                }}>{km}km</span>
              ))}
            </span>
          } />
          <SettingRow label="Quiet hours" sub="11 PM – 6 AM · critical alerts still ring" right={<MiniToggle on color={RS.teal} />} />
          <SettingRow label="Fatigue protection" sub="Max 2 alerts/week unless critical" right={<MiniToggle on color={RS.teal} />} last />
        </RSCard>

        <RSCard style={{ padding: '4px 16px' }}>
          <RSLabel style={{ margin: '12px 0 2px' }}>Privacy</RSLabel>
          <SettingRow label="Location sharing" sub="Only after you accept · auto-deleted after donation" right={<MiniToggle on color={RS.teal} />} />
          <SettingRow label="Masked calls" sub="Your number is never shown to patients" right={<MiniToggle on color={RS.teal} />} />
          <SettingRow label="Medical history" sub="Never shared with anyone — used only for eligibility" right={<span style={{ fontSize: 10.5, fontWeight: 700, color: RS.mid, background: RS.fog, borderRadius: 100, padding: '4px 10px' }}>PRIVATE</span>} last />
        </RSCard>

        <RSCard style={{ padding: '4px 16px' }}>
          <RSLabel style={{ margin: '12px 0 2px' }}>Eligibility</RSLabel>
          <SettingRow label="Next eligible date" sub="56-day gap since last whole-blood donation" right={<span style={{ fontFamily: RS_MONO, fontSize: 12.5, fontWeight: 700, color: RS.teal }}>Ready ✓</span>} />
          <SettingRow label="Health screening" sub="Hb 14.2 · BP 118/76 · last checked 14 Mar" right={<span style={{ color: RS.faint }}>›</span>} last />
        </RSCard>
      </div>
    </div>
  );
}

// ── donor onboarding: language → OTP → ABHA KYC → availability → done ──
function DonorOnboarding({ accent }) {
  const [step, setStep] = React.useState(0);
  const [verifying, setVerifying] = React.useState(false);
  const [lang, setLang] = React.useState('hi');
  const [radius, setRadius] = React.useState('10');
  const next = () => setStep(s => s + 1);

  const verify = () => {
    setVerifying(true);
    setTimeout(() => { setVerifying(false); next(); }, 1400);
  };

  const screens = [
    // 0 — language
    <div key="lang" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '26px 22px 22px', gap: 18 }}>
      <div>
        <div style={{ fontSize: 23, fontWeight: 800, color: RS.ink, letterSpacing: '-0.02em', lineHeight: 1.2 }}>अपनी भाषा चुनें<br /><span style={{ fontSize: 16, fontWeight: 600, color: RS.mid }}>Choose your language</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[['hi', 'हिन्दी'], ['pa', 'ਪੰਜਾਬੀ'], ['en', 'English'], ['more', '+ 9 more']].map(([id, label]) => (
          <button key={id} onClick={() => setLang(id)} style={{
            fontFamily: RS_FONT, fontSize: 17, fontWeight: 600, padding: '20px 10px', borderRadius: 14, cursor: 'pointer',
            border: `1.5px solid ${lang === id ? accent : RS.line}`,
            background: lang === id ? RS.soft : RS.white,
            color: lang === id ? accent : RS.ink,
          }}>{label}</button>
        ))}
      </div>
      <RSBtn accent={accent} big onClick={next} style={{ marginTop: 'auto' }}>आगे बढ़ें · Continue</RSBtn>
    </div>,

    // 1 — OTP
    <div key="otp" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '26px 22px 22px', gap: 18 }}>
      <div>
        <div style={{ fontSize: 23, fontWeight: 800, color: RS.ink, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          <Bi en="Verify your phone" hi="फ़ोन सत्यापित करें" />
        </div>
        <div style={{ fontSize: 13, color: RS.mid, marginTop: 8, lineHeight: 1.55 }}>No passwords — your number is your login.</div>
      </div>
      <div>
        <RSLabel>Mobile number</RSLabel>
        <div style={{ background: RS.white, border: `1.5px solid ${RS.line}`, borderRadius: 12, padding: '13px 14px', fontFamily: RS_MONO, fontWeight: 600, fontSize: 16, color: RS.ink }}>+91 98140 37265</div>
      </div>
      <div>
        <RSLabel>Enter the 6-digit code</RSLabel>
        <OtpRow accent={accent} code="8 3 0 6 5 2" />
      </div>
      <RSBtn accent={accent} big onClick={next} style={{ marginTop: 'auto' }}><Bi en="Verify & continue" hi="सत्यापित करें" /></RSBtn>
    </div>,

    // 2 — ABHA KYC
    <div key="abha" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '26px 22px 22px', gap: 16 }}>
      <div>
        <div style={{ fontSize: 23, fontWeight: 800, color: RS.ink, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          <Bi en="Verify identity with ABHA" hi="ABHA से पहचान सत्यापित करें" />
        </div>
        <div style={{ fontSize: 13, color: RS.mid, marginTop: 8, lineHeight: 1.55 }}>
          One-time KYC against your Aadhaar-linked health ID. This is what keeps fake donors and blood touts out of the network.
        </div>
      </div>
      <div>
        <RSLabel>ABHA number</RSLabel>
        <div style={{ background: RS.white, border: `1.5px solid ${RS.line}`, borderRadius: 12, padding: '13px 14px', fontFamily: RS_MONO, fontWeight: 600, fontSize: 16, color: RS.ink, letterSpacing: '0.04em' }}>91-2237-4410-8853</div>
      </div>
      <RSCard style={{ background: RS.fog, border: `1px dashed ${RS.line}` }}>
        <div style={{ fontSize: 11.5, color: RS.mid, lineHeight: 1.55 }}>
          We fetch only: <b style={{ color: RS.ink }}>name, age, gender, blood group</b>. Nothing else from your health records is read or stored.
        </div>
      </RSCard>
      <RSBtn accent={accent} big onClick={verify} disabled={verifying} style={{ marginTop: 'auto' }}>
        {verifying ? 'Verifying with ABDM…' : <Bi en="Verify with ABHA" hi="ABHA से सत्यापित करें" />}
      </RSBtn>
    </div>,

    // 3 — fetched + availability
    <div key="avail" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '26px 22px 22px', gap: 16 }}>
      <RSCard style={{ background: RS.steal, border: '1px solid #BFE3D6', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 30, height: 30, borderRadius: '50%', background: RS.teal, color: RS.white, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
        <div style={{ fontSize: 12.5, color: RS.ink, lineHeight: 1.5 }}>
          <b>Arjun Singh · 29 · Male · O+</b><br />
          <span style={{ color: RS.mid, fontSize: 11.5 }}>Fetched from ABDM — no documents to upload</span>
        </div>
      </RSCard>
      <div>
        <div style={{ fontSize: 21, fontWeight: 800, color: RS.ink, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
          <Bi en="How far would you travel to save a life?" hi="जीवन बचाने कितनी दूर जाएंगे?" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 9 }}>
        {['5', '10', '15'].map(km => (
          <button key={km} onClick={() => setRadius(km)} style={{
            flex: 1, fontFamily: RS_MONO, fontSize: 16, fontWeight: 700, padding: '16px 0', borderRadius: 12, cursor: 'pointer',
            border: `1.5px solid ${radius === km ? accent : RS.line}`,
            background: radius === km ? RS.soft : RS.white,
            color: radius === km ? accent : RS.mid,
          }}>{km} km</button>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: RS.faint, lineHeight: 1.5 }}>
        You'll only be alerted for emergencies within this radius, during hours you allow. Change anytime.
      </div>
      <RSBtn accent={accent} big onClick={next} style={{ marginTop: 'auto' }}><Bi en="Set availability" hi="उपलब्धता सेट करें" /></RSBtn>
    </div>,

    // 4 — done
    <div key="done" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '26px 22px 22px', gap: 16, textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 92, height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="rs-ring" style={{ borderColor: accent }}></span>
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: RS.soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Drop size={30} color={accent} />
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: RS.ink, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
        <Bi en="Welcome, donor #12,481" hi="स्वागत है, डोनर #12,481" />
      </div>
      <div style={{ fontSize: 13, color: RS.mid, lineHeight: 1.6, maxWidth: 290 }}>
        You're now part of Ludhiana's emergency blood network. When someone nearby needs O+, your phone will ring — and you might save a life before lunch.
      </div>
      <RSBtn accent={accent} big onClick={() => setStep(0)} style={{ marginTop: 18 }}><Bi en="Go to my dashboard" hi="डैशबोर्ड खोलें" /></RSBtn>
    </div>,
  ];

  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%', background: RS.fog }}>
      <OnbHeader accent={accent} step={step} total={5} />
      {screens[step]}
    </div>
  );
}

Object.assign(window, { DonorHistory, DonorProfile, DonorOnboarding });
