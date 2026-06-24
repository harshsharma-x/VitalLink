// raktsetu-donor.jsx — Donor phone screens
// Persona: Arjun, O+ donor, 2.3 km from Apollo Hospital, 7 prior donations.

function DonorHome({ accent, available, onToggle }) {
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%', background: RS.fog }}>
      <RSAppHeader accent={accent} name="VitalLink" sub="Donor · Ludhiana" right={<BloodTag group="O+" accent={accent} />} />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: RS.ink, letterSpacing: '-0.02em', marginTop: 6 }}>
          <Bi en="Namaste, Arjun" hi="नमस्ते, अर्जुन" />
        </div>

        {/* availability */}
        <div style={{
          background: available ? RS.steal : RS.white, border: `1.5px solid ${available ? RS.teal : RS.line}`,
          borderRadius: 16, padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 12,
          transition: 'background 200ms, border-color 200ms',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: available ? RS.teal : RS.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
              {available && <PulseDot color={RS.teal} />}
              <Bi en={available ? 'Available for emergencies' : 'Not available'} hi={available ? 'आपातकाल के लिए उपलब्ध' : 'उपलब्ध नहीं'} />
            </div>
            <div style={{ fontSize: 11.5, color: RS.mid, marginTop: 3, lineHeight: 1.45 }}>
              {available ? 'You may get an emergency alert if someone nearby needs O+.' : 'You won\u2019t receive emergency alerts.'}
            </div>
          </div>
          <button onClick={onToggle} aria-label="Toggle availability" style={{
            width: 52, height: 30, borderRadius: 100, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: available ? RS.teal : RS.line, position: 'relative', transition: 'background 200ms',
          }}>
            <span style={{
              position: 'absolute', top: 3, left: available ? 25 : 3, width: 24, height: 24,
              borderRadius: '50%', background: RS.white, transition: 'left 200ms', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            }}></span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[['7', 'donations'], ['94%', 'reliability'], ['Ready', 'eligibility']].map(([v, k], i) => (
            <RSCard key={i} style={{ padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontFamily: RS_MONO, fontWeight: 700, fontSize: 18, color: i === 2 ? RS.teal : RS.ink }}>{v}</div>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: RS.faint, marginTop: 2 }}>{k}</div>
            </RSCard>
          ))}
        </div>

        <RSCard style={{ padding: '13px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: RS.ink, marginBottom: 2 }}><Bi en="Last donation" hi="पिछला रक्तदान" /></div>
          <div style={{ fontSize: 11.5, color: RS.mid, lineHeight: 1.5 }}>
            14 March 2026 · Civil Hospital Ludhiana<br />56-day safety gap completed ✓
          </div>
        </RSCard>

        <div style={{ fontSize: 11, color: RS.faint, lineHeight: 1.5, marginTop: 'auto' }}>
          Your location is never tracked in the background. It is shared only after you accept an emergency, and deleted after the donation.
        </div>
      </div>
    </div>
  );
}

function DonorAlert({ accent, secondsLeft, onAccept, onDecline, alertStyle }) {
  const alarm = alertStyle === 'alarm';
  const bg = alarm ? `linear-gradient(160deg, ${RS.deep}, ${accent})` : RS.fog;
  const fg = alarm ? RS.white : RS.ink;
  return (
    <div className={alarm ? 'rs-alarm' : ''} style={{
      fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%',
      background: bg, color: fg,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 22px', gap: 16, textAlign: 'center' }}>
        <div style={{
          width: 84, height: 84, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: alarm ? 'rgba(255,255,255,0.14)' : RS.soft, position: 'relative',
        }}>
          <span className="rs-ring" style={{ borderColor: alarm ? 'rgba(255,255,255,0.7)' : accent }}></span>
          <Drop size={34} color={alarm ? RS.white : accent} />
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: alarm ? 0.8 : 0.6, marginBottom: 6 }}>
            <Bi en="Emergency · Critical" hi="आपातकाल" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            <Bi en="O+ blood needed now" hi="O+ रक्त की तुरंत आवश्यकता" />
          </div>
        </div>

        <div style={{
          background: alarm ? 'rgba(255,255,255,0.12)' : RS.white, borderRadius: 14, padding: '13px 18px',
          border: alarm ? '1px solid rgba(255,255,255,0.25)' : `1px solid ${RS.line}`, width: '100%', boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0' }}>
            <span style={{ opacity: 0.75 }}>Hospital</span><b>Apollo, Ludhiana</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0' }}>
            <span style={{ opacity: 0.75 }}>Distance</span><b style={{ fontFamily: RS_MONO }}>2.3 km · ~8 min</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0' }}>
            <span style={{ opacity: 0.75 }}>Units needed</span><b style={{ fontFamily: RS_MONO }}>2</b>
          </div>
        </div>

        <div style={{ fontSize: 12.5, opacity: alarm ? 0.85 : 0.7 }}>
          <Bi en="Responding first?" hi="पहले जवाब देंगे?" /> <b style={{ fontFamily: RS_MONO, fontSize: 15 }}>{fmtMMSS(secondsLeft)}</b> <Bi en="left to accept" hi="शेष" />
        </div>
      </div>

      <div style={{ padding: '0 20px 22px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
        <RSBtn kind={alarm ? 'onAccent' : 'primary'} accent={accent} big onClick={onAccept}>
          <Bi en="I can donate — accept" hi="मैं रक्तदान कर सकता हूं" />
        </RSBtn>
        <RSBtn kind={alarm ? 'ghostOnAccent' : 'ghost'} accent={accent} onClick={onDecline}>
          <Bi en="Can't this time" hi="इस बार नहीं" />
        </RSBtn>
      </div>
    </div>
  );
}

function DonorNavigate({ accent, progress, etaMin, onArrived }) {
  const here = progress >= 1;
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%', background: RS.fog }}>
      <RSAppHeader accent={accent} name="Apollo Hospital" sub="Blood bank · Gate 3, Basement 1" right={
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: RS.teal, fontWeight: 700 }}>
          <PulseDot color={RS.teal} /> LIVE
        </span>
      } />
      <RouteMap progress={progress} accent={accent} height={210} arrived={here} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: RS.white, border: `1px solid ${RS.line}`, borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: RS.faint }}>ETA</div>
            <div style={{ fontFamily: RS_MONO, fontWeight: 700, fontSize: 19, color: here ? RS.teal : RS.ink }}>{here ? 'Here' : `${etaMin} min`}</div>
          </div>
          <div style={{ flex: 1, background: RS.white, border: `1px solid ${RS.line}`, borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: RS.faint }}>Remaining</div>
            <div style={{ fontFamily: RS_MONO, fontWeight: 700, fontSize: 19, color: RS.ink }}>{(2.3 * (1 - progress)).toFixed(1)} km</div>
          </div>
        </div>

        <RSCard style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px' }}>
          <PulseDot color={accent} />
          <div style={{ fontSize: 11.5, color: RS.mid, lineHeight: 1.45, flex: 1 }}>
            <b style={{ color: RS.ink }}>Sharing live location</b> — the patient's attendant can see your ETA. Stops automatically when you arrive.
          </div>
        </RSCard>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <RSBtn accent={accent} kind={here ? 'teal' : 'primary'} big onClick={onArrived} disabled={!here}>
            {here ? <Bi en="I've reached the blood bank" hi="मैं ब्लड बैंक पहुंच गया" /> : <Bi en="Arrive to check in" hi="पहुंचने पर चेक-इन करें" />}
          </RSBtn>
          <RSBtn kind="ghost" accent={accent} style={{ padding: '10px 18px', fontSize: 13 }}>
            <Bi en="Stop sharing location" hi="लोकेशन साझा करना बंद करें" />
          </RSBtn>
        </div>
      </div>
    </div>
  );
}

function DonorDonation({ accent, onComplete }) {
  const steps = [
    ['Check-in at blood bank', 'done'],
    ['Health screening · Hb, BP, pulse', 'done'],
    ['Donation — 1 unit whole blood', 'active'],
    ['Rest & refreshments', 'todo'],
  ];
  const dot = (s) => s === 'done'
    ? { background: RS.teal, color: RS.white, label: '✓' }
    : s === 'active' ? { background: accent, color: RS.white, label: '●' }
    : { background: RS.fog, border: `1.5px solid ${RS.line}`, label: '' };
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%', background: RS.fog }}>
      <RSAppHeader accent={accent} name="At the blood bank" sub="Apollo Hospital · checked in 10:02 AM" />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <RSCard style={{ padding: '6px 16px' }}>
          {steps.map(([label, s], i) => {
            const d = dot(s);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < steps.length - 1 ? `1px dashed ${RS.line}` : 'none' }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
                  background: d.background, color: d.color, border: d.border || 'none',
                }}>{d.label}</span>
                <span style={{ fontSize: 13, fontWeight: s === 'todo' ? 400 : 600, color: s === 'todo' ? RS.faint : RS.ink }}>{label}</span>
              </div>
            );
          })}
        </RSCard>

        <RSCard>
          <RSLabel>Unit tag — scanned by staff</RSLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* QR placeholder */}
            <div style={{
              width: 64, height: 64, borderRadius: 8, flexShrink: 0, border: `1.5px solid ${RS.line}`,
              background: `repeating-linear-gradient(45deg, ${RS.fog}, ${RS.fog} 4px, ${RS.line} 4px, ${RS.line} 8px)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: RS_MONO, fontSize: 9, color: RS.mid, background: RS.white, padding: '1px 4px', borderRadius: 3 }}>QR</span>
            </div>
            <div style={{ fontSize: 11.5, color: RS.mid, lineHeight: 1.5 }}>
              <b style={{ color: RS.ink, fontFamily: RS_MONO }}>RKS-LDH-48217</b><br />
              Every scan is hash-chained — this unit can't be diverted or resold without detection.
            </div>
          </div>
        </RSCard>

        <RSBtn accent={accent} kind="teal" big onClick={onComplete} style={{ marginTop: 'auto' }}>
          <Bi en="Donation recorded ✓" hi="रक्तदान दर्ज हुआ" />
        </RSBtn>
      </div>
    </div>
  );
}

function DonorComplete({ accent }) {
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%', background: RS.fog }}>
      <div style={{
        background: `linear-gradient(150deg, ${RS.teal}, #0A5C48)`, color: RS.white,
        padding: '34px 22px 26px', textAlign: 'center', flexShrink: 0,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.16)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
        }}>
          <Drop size={26} color={RS.white} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
          <Bi en="You saved a life today" hi="आज आपने एक जीवन बचाया" />
        </div>
        <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 6 }}>8th donation · Apollo Hospital, Ludhiana</div>
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <RSCard style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: RS.ink }}>Reliability score</div>
            <div style={{ fontSize: 11.5, color: RS.mid }}>Fast response, completed donation</div>
          </div>
          <div style={{ fontFamily: RS_MONO, fontWeight: 700, fontSize: 18, color: RS.teal }}>94 → 96</div>
        </RSCard>
        <RSCard style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: RS.ink }}><Bi en="Next eligible" hi="अगली पात्रता" /></div>
            <div style={{ fontSize: 11.5, color: RS.mid }}>56-day safety gap</div>
          </div>
          <div style={{ fontFamily: RS_MONO, fontWeight: 700, fontSize: 14, color: RS.ink }}>5 Aug 2026</div>
        </RSCard>
        <RSCard style={{ background: RS.fog, border: `1px dashed ${RS.line}` }}>
          <div style={{ fontSize: 11.5, color: RS.mid, lineHeight: 1.55 }}>
            Your location history from this trip has been <b style={{ color: RS.ink }}>permanently deleted</b>. Only "donated at Apollo Hospital, 10:14 AM" is kept on the record.
          </div>
        </RSCard>
        <RSBtn kind="ghost" accent={accent} style={{ marginTop: 'auto', color: RS.ink }}>
          <Bi en="Share your milestone" hi="अपनी उपलब्धि साझा करें" />
        </RSBtn>
      </div>
    </div>
  );
}

Object.assign(window, { DonorHome, DonorAlert, DonorNavigate, DonorDonation, DonorComplete });
