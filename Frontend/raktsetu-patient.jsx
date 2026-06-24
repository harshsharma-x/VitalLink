// raktsetu-patient.jsx — Patient (attendant) phone screens
// Persona: Meera, attendant at Apollo Hospital Ludhiana, needs O+ × 2 for emergency surgery.

function PatientHome({ accent, onRequest }) {
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%', background: RS.fog }}>
      <RSAppHeader accent={accent} name="VitalLink" sub="Ludhiana, Punjab" right={
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: RS.teal, fontWeight: 600 }}>
          <PulseDot color={RS.teal} /> 12,480 donors nearby
        </span>
      } />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: RS.ink, letterSpacing: '-0.02em', lineHeight: 1.25, marginTop: 6 }}>
          <Bi en="Namaste, Meera" hi="नमस्ते, मीरा" />
        </div>

        {/* emergency CTA */}
        <div style={{
          background: `linear-gradient(135deg, ${RS.deep}, ${accent})`, borderRadius: 18,
          padding: '22px 20px', color: RS.white, boxShadow: `0 14px 34px ${accent}3d`,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            <Bi en="Need blood urgently?" hi="तुरंत रक्त चाहिए?" />
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.85, lineHeight: 1.5, marginBottom: 16 }}>
            <Bi en="Verified donors near you are alerted in under 90 seconds." hi="90 सेकंड में आस-पास के डोनर को सूचना" />
          </div>
          <RSBtn kind="onAccent" accent={accent} big onClick={onRequest}>
            <Drop size={13} color={accent} />
            <Bi en="Request blood now" hi="अभी रक्त अनुरोध करें" />
          </RSBtn>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <RSCard style={{ padding: '14px 14px' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: RS.ink, marginBottom: 2 }}><Bi en="Blood banks" hi="ब्लड बैंक" /></div>
            <div style={{ fontSize: 11.5, color: RS.mid }}>9 nearby · live stock</div>
          </RSCard>
          <RSCard style={{ padding: '14px 14px' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: RS.ink, marginBottom: 2 }}><Bi en="My requests" hi="मेरे अनुरोध" /></div>
            <div style={{ fontSize: 11.5, color: RS.mid }}>No active requests</div>
          </RSCard>
        </div>

        <RSCard style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px' }}>
          <span style={{ fontSize: 11, fontFamily: RS_MONO, background: RS.steal, color: RS.teal, fontWeight: 700, borderRadius: 6, padding: '3px 8px' }}>SMS</span>
          <div style={{ fontSize: 11.5, color: RS.mid, lineHeight: 1.45 }}>
            No internet? Dial <b style={{ color: RS.ink, fontFamily: RS_MONO }}>*BLOOD#</b> or send a missed call — same network, any phone.
          </div>
        </RSCard>
      </div>
    </div>
  );
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function PatientForm({ accent, onSubmit }) {
  const [group, setGroup] = React.useState('O+');
  const [units, setUnits] = React.useState(2);
  const [urgency, setUrgency] = React.useState('critical');
  const urgencies = [
    ['critical', 'Critical — now', RS.soft, accent],
    ['day', 'Within 24 hrs', RS.samber, RS.amber],
    ['planned', 'Planned', RS.steal, RS.teal],
  ];
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%', background: RS.fog }}>
      <RSAppHeader accent={accent} name="Emergency request" sub="Step 1 of 1 — takes ~30 seconds" />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflow: 'auto' }}>
        <div>
          <RSLabel><Bi en="Blood group needed" hi="रक्त समूह" /></RSLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {BLOOD_GROUPS.map(g => (
              <button key={g} onClick={() => setGroup(g)} style={{
                fontFamily: RS_MONO, fontWeight: 700, fontSize: 14, padding: '11px 0',
                borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${g === group ? accent : RS.line}`,
                background: g === group ? RS.soft : RS.white,
                color: g === group ? accent : RS.mid,
              }}>{g}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <RSLabel><Bi en="Units" hi="यूनिट" /></RSLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: RS.white, border: `1.5px solid ${RS.line}`, borderRadius: 10, overflow: 'hidden' }}>
              <button onClick={() => setUnits(Math.max(1, units - 1))} style={{ border: 'none', background: 'none', fontSize: 18, padding: '9px 14px', cursor: 'pointer', color: RS.mid }}>−</button>
              <span style={{ flex: 1, textAlign: 'center', fontFamily: RS_MONO, fontWeight: 700, fontSize: 16, color: RS.ink }}>{units}</span>
              <button onClick={() => setUnits(Math.min(6, units + 1))} style={{ border: 'none', background: 'none', fontSize: 18, padding: '9px 14px', cursor: 'pointer', color: RS.mid }}>+</button>
            </div>
          </div>
          <div>
            <RSLabel><Bi en="Patient Hb" hi="हीमोग्लोबिन" /></RSLabel>
            <div style={{ background: RS.white, border: `1.5px solid ${RS.line}`, borderRadius: 10, padding: '10px 12px', fontFamily: RS_MONO, fontWeight: 600, fontSize: 14, color: RS.ink }}>6.8 g/dL</div>
          </div>
        </div>

        <div>
          <RSLabel><Bi en="Hospital" hi="अस्पताल" /></RSLabel>
          <div style={{ background: RS.white, border: `1.5px solid ${RS.line}`, borderRadius: 10, padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: accent, flexShrink: 0 }}></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: RS.ink }}>Apollo Hospital, Ludhiana</div>
              <div style={{ fontSize: 11, color: RS.teal, fontWeight: 600 }}>✓ Verified on HFR registry</div>
            </div>
          </div>
        </div>

        <div>
          <RSLabel><Bi en="How urgent?" hi="कितना ज़रूरी?" /></RSLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            {urgencies.map(([id, label, bg, fg]) => (
              <button key={id} onClick={() => setUrgency(id)} style={{
                flex: 1, fontFamily: RS_FONT, fontSize: 12, fontWeight: 600, padding: '10px 4px',
                borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${urgency === id ? fg : RS.line}`,
                background: urgency === id ? bg : RS.white,
                color: urgency === id ? fg : RS.mid,
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: RS.faint, lineHeight: 1.5 }}>
          Your phone number stays masked. Donors see the hospital location only — never the patient's identity.
        </div>
      </div>
      <div style={{ padding: '0 18px 18px', flexShrink: 0 }}>
        <RSBtn accent={accent} big onClick={() => onSubmit({ group, units, urgency })}>
          <Bi en="Send emergency request" hi="आपातकालीन अनुरोध भेजें" />
        </RSBtn>
      </div>
    </div>
  );
}

function PatientSearching({ accent, donorsAlerted, urgencyScore, radiusKm }) {
  const steps = [
    ['Hospital verified against HFR registry', true],
    [`Urgency scored — ${urgencyScore < 82 ? '…' : 'CRITICAL (82/100)'}`, urgencyScore >= 82],
    [`Alerting O+ / O− donors within ${radiusKm} km`, donorsAlerted > 0],
  ];
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%', background: RS.fog }}>
      <RSAppHeader accent={accent} name="Finding donors" sub="O+ · 2 units · Apollo Hospital" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 18px 18px', gap: 20 }}>
        {/* radar */}
        <div style={{ position: 'relative', width: 170, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="rs-ring" style={{ borderColor: accent }}></span>
          <span className="rs-ring" style={{ borderColor: accent, animationDelay: '0.9s' }}></span>
          <div style={{
            width: 96, height: 96, borderRadius: '50%', background: RS.white, border: `2px solid ${accent}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            boxShadow: `0 10px 30px ${accent}2e`,
          }}>
            <span style={{ fontFamily: RS_MONO, fontWeight: 700, fontSize: 26, color: accent }}>{donorsAlerted}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: RS.mid, textTransform: 'uppercase' }}>alerted</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: RS.ink }}>
            <Bi en="Alerting nearby donors…" hi="डोनर को सूचित किया जा रहा है…" />
          </div>
          <div style={{ fontSize: 12.5, color: RS.mid, marginTop: 4 }}>
            Search radius <b style={{ fontFamily: RS_MONO, color: RS.ink }}>{radiusKm} km</b> — expands automatically if needed
          </div>
        </div>

        <RSCard style={{ width: '100%', padding: '6px 16px' }}>
          {steps.map(([label, done], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < steps.length - 1 ? `1px dashed ${RS.line}` : 'none' }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: done ? RS.teal : RS.fog, border: done ? 'none' : `1.5px solid ${RS.line}`,
                color: RS.white, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{done ? '✓' : ''}</span>
              <span style={{ fontSize: 12.5, color: done ? RS.ink : RS.faint, fontWeight: done ? 600 : 400 }}>{label}</span>
            </div>
          ))}
        </RSCard>

        <div style={{ fontSize: 11, color: RS.faint, textAlign: 'center', lineHeight: 1.5, marginTop: 'auto' }}>
          If no donor accepts in 3 minutes, we expand the radius and show<br />nearest blood-bank stock with phone numbers.
        </div>
      </div>
    </div>
  );
}

function PatientTracking({ accent, progress, etaMin, arrived, onCall }) {
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%', background: RS.fog }}>
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <RouteMap progress={progress} accent={accent} height="100%" arrived={arrived} />
        {/* status chip overlay */}
        <div style={{
          position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'center',
        }}>
          <span style={{
            background: arrived ? RS.teal : RS.ink, color: RS.white, fontSize: 12, fontWeight: 600,
            borderRadius: 100, padding: '7px 14px', boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <PulseDot color="#fff" size={7} />
            {arrived ? <Bi en="Donor has arrived at the hospital" hi="डोनर अस्पताल पहुंच गए" /> : <Bi en="Donor found — on the way" hi="डोनर मिल गया — रास्ते में" />}
          </span>
        </div>
      </div>

      {/* bottom sheet */}
      <div style={{
        background: RS.white, borderRadius: '18px 18px 0 0', marginTop: -16, position: 'relative',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.10)', padding: '14px 18px 18px', flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: RS.line, margin: '0 auto' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%', background: RS.steal, color: RS.teal,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, flexShrink: 0,
          }}>A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: RS.ink }}>Arjun S.</div>
            <div style={{ fontSize: 11.5, color: RS.mid }}>7 donations · 94% reliability · verified via ABHA</div>
          </div>
          <BloodTag group="O+" accent={accent} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: RS.fog, borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: RS.faint }}>ETA</div>
            <div style={{ fontFamily: RS_MONO, fontWeight: 700, fontSize: 20, color: arrived ? RS.teal : RS.ink }}>
              {arrived ? 'Arrived' : `${etaMin} min`}
            </div>
          </div>
          <div style={{ flex: 1, background: RS.fog, borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: RS.faint }}>Distance</div>
            <div style={{ fontFamily: RS_MONO, fontWeight: 700, fontSize: 20, color: RS.ink }}>
              {arrived ? '0.0 km' : `${(2.3 * (1 - progress)).toFixed(1)} km`}
            </div>
          </div>
        </div>

        <RSBtn kind="ghost" accent={accent} onClick={onCall} style={{ color: RS.ink }}>
          ☎ <Bi en="Call donor (number stays masked)" hi="कॉल करें (नंबर गुप्त रहेगा)" />
        </RSBtn>
      </div>
    </div>
  );
}

function PatientComplete({ accent }) {
  return (
    <div style={{ fontFamily: RS_FONT, display: 'flex', flexDirection: 'column', height: '100%', background: RS.fog }}>
      <RSAppHeader accent={accent} name="Request fulfilled" sub="O+ · 2 units · Apollo Hospital" />
      <div style={{ flex: 1, padding: '30px 18px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{
          width: 76, height: 76, borderRadius: '50%', background: RS.steal,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: RS.teal, color: RS.white, fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: RS.ink, letterSpacing: '-0.01em' }}>
            <Bi en="Donation completed" hi="रक्तदान पूर्ण हुआ" />
          </div>
          <div style={{ fontSize: 12.5, color: RS.mid, marginTop: 4 }}>2 units of O+ donated at Apollo Hospital · 10:14 AM</div>
        </div>

        <RSCard style={{ width: '100%' }}>
          <RSLabel>Tamper-proof record</RSLabel>
          <div style={{ fontFamily: RS_MONO, fontSize: 11.5, color: RS.ink, background: RS.fog, borderRadius: 8, padding: '9px 12px', wordBreak: 'break-all', lineHeight: 1.5 }}>
            sha256:9f2a…c41e · unit RKS-LDH-48217
          </div>
          <div style={{ fontSize: 11.5, color: RS.mid, marginTop: 8, lineHeight: 1.5 }}>
            Every step of this unit's journey is hash-chained and publicly verifiable — no one can silently alter it.
          </div>
        </RSCard>

        <RSBtn accent={accent} style={{ marginTop: 'auto' }}>
          <Bi en="Send thanks to Arjun" hi="अर्जुन को धन्यवाद भेजें" />
        </RSBtn>
      </div>
    </div>
  );
}

Object.assign(window, { PatientHome, PatientForm, PatientSearching, PatientTracking, PatientComplete });
