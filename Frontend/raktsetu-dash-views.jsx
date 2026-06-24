// raktsetu-dash-views.jsx — dashboard view panels

function statusPill(status) {
  if (status === 'matched') return <DPill tone="teal" dot>Donor matched</DPill>;
  if (status === 'searching') return <DPill tone="red" dot>Searching</DPill>;
  if (status === 'fulfilled') return <DPill tone="neutral">Fulfilled</DPill>;
  return <DPill tone="neutral">{status}</DPill>;
}

// ── KPI strip ────────────────────────────────────────────────
function KpiStrip() {
  const kpis = [
    { label: 'Active emergencies', value: '3', sub: '2 matched · 1 searching', tone: 'red', spark: [1, 2, 1, 3, 2, 3, 3] },
    { label: 'Donors available now', value: '12,480', sub: '+318 vs. yesterday', tone: 'teal', spark: [11, 11.5, 12, 11.8, 12.2, 12.3, 12.48] },
    { label: 'Units in district', value: '241', sub: 'across 6 blood banks', tone: 'blue', spark: [260, 255, 250, 248, 245, 243, 241] },
    { label: 'Avg match time', value: '4.2 min', sub: '−38% since launch', tone: 'teal', spark: [9, 8, 7, 6, 5.5, 4.8, 4.2] },
    { label: 'Open fraud flags', value: '2', sub: '2 high · 2 in review', tone: 'amber', spark: [0, 1, 1, 2, 1, 2, 2] },
    { label: 'Blood deserts', value: '3', sub: '1 critical · Raikot', tone: 'red', spark: [3, 3, 3, 3, 3, 3, 3] },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
      {kpis.map((k, i) => {
        const c = k.tone === 'red' ? D.red : k.tone === 'teal' ? D.teal : k.tone === 'amber' ? D.amber : D.blue;
        return (
          <div key={i} style={{ background: D.panel, border: `1px solid ${D.line}`, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <DLabel>{k.label}</DLabel>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontFamily: DMONO, fontWeight: 700, fontSize: 26, color: D.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>{k.value}</span>
              <DSpark data={k.spark} color={c} w={56} h={22} />
            </div>
            <div style={{ fontSize: 11, color: D.mid }}>{k.sub}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── live emergency feed ──────────────────────────────────────
function EmergencyFeed({ rows, compact }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {rows.map((e, i) => (
        <div key={e.id} style={{
          display: 'grid', gridTemplateColumns: compact ? '34px 1fr auto' : '40px 1.4fr 0.8fr 0.7fr auto',
          alignItems: 'center', gap: 12, padding: '12px 0',
          borderBottom: i < rows.length - 1 ? `1px dashed ${D.line}` : 'none',
        }}>
          <DGroup g={e.group} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: D.ink, display: 'flex', alignItems: 'center', gap: 7 }}>
              {e.live && <DPulse color={e.status === 'searching' ? D.red : D.teal} size={7} />}
              {e.hosp}
            </div>
            <div style={{ fontSize: 11, color: D.faint, fontFamily: DMONO }}>{e.id} · {e.units} unit{e.units > 1 ? 's' : ''}</div>
          </div>
          {!compact && (
            <div>
              <DLabel style={{ marginBottom: 2 }}>Urgency</DLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: DMONO, fontWeight: 700, fontSize: 13, color: e.score >= 80 ? D.deep : e.score >= 65 ? D.amber : D.mid }}>{e.score}</span>
                <span style={{ flex: 1, maxWidth: 46, height: 4, borderRadius: 2, background: D.fog, overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: `${e.score}%`, background: e.score >= 80 ? D.red : e.score >= 65 ? D.amber : D.teal }}></span>
                </span>
              </div>
            </div>
          )}
          {!compact && (
            <div style={{ fontSize: 12, color: D.mid }}>
              <span style={{ fontFamily: DMONO, fontWeight: 600, color: D.ink }}>{e.mins}m</span> {e.donor ? `· ${e.donor}` : ''}
            </div>
          )}
          {statusPill(e.status)}
        </div>
      ))}
    </div>
  );
}

// ── OVERVIEW ─────────────────────────────────────────────────
function ViewOverview() {
  const live = DASH_EMERGENCIES.filter(e => e.live);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <KpiStrip />
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, alignItems: 'start' }}>
        <DPanel title="Live emergencies" sub="Real-time across Ludhiana district" right={<DPill tone="red" dot>3 active</DPill>}>
          <EmergencyFeed rows={DASH_EMERGENCIES} />
        </DPanel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <DPanel title="Fraud watch" sub="Isolation Forest · live scoring" right={<DPill tone="amber">2 high</DPill>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DASH_FRAUD.filter(f => f.status === 'open').map(f => (
                <div key={f.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: D.red, marginTop: 5, flexShrink: 0 }}></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: D.ink }}>{f.type}</div>
                    <div style={{ fontSize: 11, color: D.mid, lineHeight: 1.4 }}>{f.detail}</div>
                  </div>
                  <span style={{ fontFamily: DMONO, fontWeight: 700, fontSize: 12, color: D.deep }}>{f.score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </DPanel>
          <DPanel title="7-day shortage forecast" sub="LSTM + Prophet · projected deficit">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {Object.entries(DASH_FORECAST).map(([g, series]) => {
                const end = series[series.length - 1];
                const deficit = end < 0;
                return (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <DGroup g={g} color={deficit ? D.red : D.teal} />
                    <DSpark data={series} color={deficit ? D.red : D.teal} w={120} h={22} />
                    <span style={{ marginLeft: 'auto', fontFamily: DMONO, fontWeight: 700, fontSize: 12.5, color: deficit ? D.deep : D.teal }}>
                      {end > 0 ? '+' : ''}{end}
                    </span>
                  </div>
                );
              })}
            </div>
          </DPanel>
        </div>
      </div>
    </div>
  );
}

// ── EMERGENCIES ──────────────────────────────────────────────
function ViewEmergencies() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[['Today', '47', 'requests'], ['Match rate', '96%', 'donor or bank'], ['Median fan-out', '74', 'donors alerted'], ['SMS fallbacks', '3', 'no-internet']].map(([l, v, s], i) => (
          <div key={i} style={{ background: D.panel, border: `1px solid ${D.line}`, borderRadius: 14, padding: 16 }}>
            <DLabel>{l}</DLabel>
            <div style={{ fontFamily: DMONO, fontWeight: 700, fontSize: 24, color: D.ink, margin: '4px 0 2px' }}>{v}</div>
            <div style={{ fontSize: 11, color: D.mid }}>{s}</div>
          </div>
        ))}
      </div>
      <DPanel title="All requests" sub="Live + last 24 hours" right={<DPill tone="red" dot>3 active</DPill>}>
        <EmergencyFeed rows={DASH_EMERGENCIES} />
      </DPanel>
      <DPanel title="Fallback ladder" sub="What happens when no donor accepts — per system spec">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            ['No accept in 3 min', 'Auto-expand radius 10 → 20 → 30 km, re-broadcast to new donors', D.amber],
            ['Still none / zero in 30 km', 'Return nearest blood-bank stock + phone numbers · alert district officer', D.red],
            ['FCM delivery fails', 'SMS fallback via Twilio to same list within 30 seconds', D.blue],
            ['Tracking socket drops', 'Show last known location + timestamp · phone-call button stays visible', D.teal],
          ].map(([step, detail, c], i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px dashed ${D.line}` : 'none' }}>
              <span style={{ fontFamily: DMONO, fontWeight: 700, fontSize: 12, color: c, width: 18, flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: D.ink }}>{step}</div>
                <div style={{ fontSize: 11.5, color: D.mid, marginTop: 1 }}>{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </DPanel>
    </div>
  );
}

// ── INVENTORY ────────────────────────────────────────────────
function ViewInventory() {
  const totals = {};
  GROUPS.forEach(g => totals[g] = DASH_BANKS.reduce((s, b) => s + (b.stock[g] || 0), 0));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DPanel title="District blood-bank inventory" sub="Live stock · 30-second inventory cache · HFR-verified centres" right={<DPill tone="teal" dot>Synced</DPill>} pad={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: DFONT }}>
            <thead>
              <tr style={{ background: D.fog }}>
                <th style={{ textAlign: 'left', padding: '11px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: D.faint, position: 'sticky', left: 0, background: D.fog }}>Blood bank</th>
                {GROUPS.map(g => <th key={g} style={{ padding: '11px 8px', fontSize: 11, fontWeight: 700, fontFamily: DMONO, color: D.mid, minWidth: 48 }}>{g}</th>)}
                <th style={{ padding: '11px 16px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: D.faint }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {DASH_BANKS.map((b, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${D.line}` }}>
                  <td style={{ padding: '12px 18px', position: 'sticky', left: 0, background: D.panel }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: D.ink, whiteSpace: 'nowrap' }}>{b.name}</div>
                    <div style={{ fontSize: 10.5, color: D.faint, fontFamily: DMONO }}>HFR {b.hfr}</div>
                  </td>
                  {GROUPS.map(g => {
                    const n = b.stock[g] || 0; const t = stockTone(n);
                    return (
                      <td key={g} style={{ textAlign: 'center', padding: '8px 6px' }}>
                        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 34, height: 38, borderRadius: 8, background: t.bg, color: t.fg, fontFamily: DMONO, fontWeight: 700, fontSize: 14 }}>{n}</span>
                      </td>
                    );
                  })}
                  <td style={{ padding: '12px 16px', fontSize: 11, color: b.updated > 15 ? D.amber : D.mid, whiteSpace: 'nowrap' }}>{b.updated}m ago</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${D.line}`, background: D.fog }}>
                <td style={{ padding: '12px 18px', position: 'sticky', left: 0, background: D.fog, fontSize: 12.5, fontWeight: 700, color: D.ink }}>District total</td>
                {GROUPS.map(g => {
                  const t = stockTone(totals[g]);
                  return <td key={g} style={{ textAlign: 'center', padding: '12px 6px', fontFamily: DMONO, fontWeight: 700, fontSize: 14, color: totals[g] <= 6 ? D.deep : D.ink }}>{totals[g]}</td>;
                })}
                <td style={{ padding: '12px 16px' }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </DPanel>
      <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: D.mid, alignItems: 'center', paddingLeft: 4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: D.steal }}></span> OK (4+)</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: D.samber }}></span> Low (1–3)</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: D.soft }}></span> Out (0)</span>
        <span style={{ marginLeft: 'auto', fontFamily: DMONO, color: D.faint }}>Numbers = screened whole-blood units available</span>
      </div>
    </div>
  );
}

// ── FRAUD ────────────────────────────────────────────────────
function ViewFraud() {
  const sevTone = { high: 'red', med: 'amber', low: 'neutral' };
  const statusTone = { open: 'red', review: 'amber', cleared: 'teal' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <div style={{ background: D.panel, border: `1px solid ${D.line}`, borderRadius: 14, padding: 16 }}>
          <DLabel>Hash-chain integrity</DLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 2px' }}>
            <span style={{ fontFamily: DMONO, fontWeight: 700, fontSize: 24, color: D.teal }}>99.98%</span>
            <DPill tone="teal" dot>Healthy</DPill>
          </div>
          <div style={{ fontSize: 11, color: D.mid }}>1 break flagged in 48,217 unit events</div>
        </div>
        <div style={{ background: D.panel, border: `1px solid ${D.line}`, borderRadius: 14, padding: 16 }}>
          <DLabel>Model</DLabel>
          <div style={{ fontFamily: DMONO, fontWeight: 700, fontSize: 17, color: D.ink, margin: '8px 0 2px' }}>Isolation Forest</div>
          <div style={{ fontSize: 11, color: D.mid }}>Scores donors, units, requests &amp; banks hourly</div>
        </div>
        <div style={{ background: D.panel, border: `1px solid ${D.line}`, borderRadius: 14, padding: 16 }}>
          <DLabel>Authority dispatch</DLabel>
          <div style={{ fontFamily: DMONO, fontWeight: 700, fontSize: 17, color: D.amber, margin: '8px 0 2px' }}>2 escalated</div>
          <div style={{ fontSize: 11, color: D.mid }}>Sent to State Blood Transfusion Council</div>
        </div>
      </div>
      <DPanel title="Fraud flags" sub="Anomalies ranked by score · click would open full case file">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {DASH_FRAUD.map((f, i) => (
            <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '54px 1.6fr 1fr auto auto', gap: 14, alignItems: 'center', padding: '13px 0', borderBottom: i < DASH_FRAUD.length - 1 ? `1px dashed ${D.line}` : 'none' }}>
              <span style={{ fontFamily: DMONO, fontSize: 11, color: D.faint }}>{f.id}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: D.ink }}>{f.type}</div>
                <div style={{ fontSize: 11.5, color: D.mid, lineHeight: 1.4 }}>{f.detail}</div>
              </div>
              <div style={{ fontSize: 12, color: D.mid, fontFamily: DMONO }}>{f.target}<div style={{ fontSize: 10.5, color: D.faint, fontFamily: DFONT, marginTop: 2 }}>{f.when}</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: DMONO, fontWeight: 700, fontSize: 14, color: f.score >= 0.85 ? D.deep : f.score >= 0.65 ? D.amber : D.mid }}>{f.score.toFixed(2)}</span>
                <DPill tone={sevTone[f.sev]}>{f.sev.toUpperCase()}</DPill>
              </div>
              <DPill tone={statusTone[f.status]}>{f.status}</DPill>
            </div>
          ))}
        </div>
      </DPanel>
    </div>
  );
}

// ── FORECASTS ────────────────────────────────────────────────
function ViewForecasts() {
  const riskTone = { critical: 'red', high: 'red', med: 'amber', low: 'neutral' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <DPanel title="7-day shortage forecast" sub="Projected deficit vs. demand · negative = shortfall">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(DASH_FORECAST).map(([g, series]) => {
              const end = series[series.length - 1]; const deficit = end < 0;
              const c = deficit ? D.red : D.teal;
              return (
                <div key={g}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <DGroup g={g} color={c} />
                    <span style={{ fontSize: 12, color: D.mid }}>{deficit ? `Shortfall of ${Math.abs(end)} units projected by day 7` : `Surplus holding at +${end} units`}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: DMONO, fontWeight: 700, fontSize: 13, color: deficit ? D.deep : D.teal }}>{end > 0 ? '+' : ''}{end}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 46 }}>
                    {series.map((v, i) => {
                      const mag = Math.min(1, Math.abs(v) / 11);
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
                          <div style={{ width: '100%', maxWidth: 26, height: `${20 + mag * 80}%`, borderRadius: 5, background: v < 0 ? c : D.tealLine, opacity: v < 0 ? (0.45 + mag * 0.55) : 0.8 }}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize: 10.5, color: D.faint, fontFamily: DMONO, display: 'flex', justifyContent: 'space-between' }}>
              <span>Today</span><span>+7 days</span>
            </div>
          </div>
        </DPanel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <DPanel title="Blood deserts" sub="Blocks &gt; 30 km from any adequate bank" right={<DPill tone="red">1 critical</DPill>}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {DASH_DESERTS.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < DASH_DESERTS.length - 1 ? `1px dashed ${D.line}` : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: D.ink }}>{d.block}</div>
                    <div style={{ fontSize: 11, color: D.mid }}>{d.km} km to nearest · {d.banks} bank{d.banks !== 1 ? 's' : ''} · gap: {d.gap}</div>
                  </div>
                  <DPill tone={riskTone[d.risk]} dot={d.risk === 'critical'}>{d.risk}</DPill>
                </div>
              ))}
            </div>
          </DPanel>
          <DPanel title="Recommended donation camps" sub="Auto-generated from deficits + donor density">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DASH_CAMPS.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: D.fog, borderRadius: 10, padding: '11px 13px' }}>
                  <DDrop size={14} style={{ marginTop: 3 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: D.ink }}>{c.place}</div>
                    <div style={{ fontSize: 11, color: D.mid, marginTop: 1 }}>{c.date} · needs {c.need} · {c.reach}</div>
                    <div style={{ fontSize: 10.5, color: D.faint, marginTop: 3 }}>Why: {c.why}</div>
                  </div>
                </div>
              ))}
            </div>
          </DPanel>
        </div>
      </div>
    </div>
  );
}

// ── AUDIT ────────────────────────────────────────────────────
function ViewAudit() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DPanel title="Public verification" sub="Anyone can confirm a unit's journey — no login, no personal data" pad={18}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: D.fog, border: `1px solid ${D.line}`, borderRadius: 10, padding: '11px 14px' }}>
            <span style={{ color: D.faint, fontSize: 14 }}>🔎</span>
            <span style={{ fontFamily: DMONO, fontSize: 13, color: D.ink }}>vitallink.in/verify/<b>RKS-LDH-48217</b></span>
          </div>
          <DPill tone="teal" dot>Chain valid</DPill>
        </div>
      </DPanel>
      <DPanel title="Hash-chain event log" sub="SHA-256 linked · Hyperledger async writer · append-only" pad={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: DFONT }}>
            <thead>
              <tr style={{ background: D.fog }}>
                {['Event', 'Unit', 'Hash', 'Prev', 'Time', 'Verify'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '11px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: D.faint }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DASH_AUDIT.map((a, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${D.line}` }}>
                  <td style={{ padding: '12px 18px', fontFamily: DMONO, fontSize: 12, color: D.ink, fontWeight: 600 }}>{a.evt}</td>
                  <td style={{ padding: '12px 18px', fontFamily: DMONO, fontSize: 12, color: D.mid }}>{a.unit}</td>
                  <td style={{ padding: '12px 18px', fontFamily: DMONO, fontSize: 12, color: D.mid }}>{a.hash}</td>
                  <td style={{ padding: '12px 18px', fontFamily: DMONO, fontSize: 12, color: D.faint }}>{a.prev}</td>
                  <td style={{ padding: '12px 18px', fontFamily: DMONO, fontSize: 12, color: D.mid }}>{a.t}</td>
                  <td style={{ padding: '12px 18px' }}>{a.ok ? <DPill tone="teal" dot>linked</DPill> : <DPill tone="red" dot>break</DPill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DPanel>
      <div style={{ fontSize: 11.5, color: D.mid, lineHeight: 1.5, paddingLeft: 4, maxWidth: 760 }}>
        The chain is tamper-evident even if VitalLink's own database is compromised or pressured. The single <b style={{ color: D.deep }}>break</b> at 09:40 (unit RKS-LDH-47710) auto-raised fraud flag FF-2288 and was escalated to the authority.
      </div>
    </div>
  );
}

const DASH_VIEWS = {
  overview: { label: 'Overview', icon: '◆', render: ViewOverview, sub: 'District command center' },
  emergencies: { label: 'Emergencies', icon: '✚', render: ViewEmergencies, sub: 'Live requests & fallback' },
  inventory: { label: 'Inventory', icon: '▥', render: ViewInventory, sub: 'District blood-bank stock' },
  fraud: { label: 'Fraud & integrity', icon: '⛨', render: ViewFraud, sub: 'Anomaly detection' },
  forecasts: { label: 'Forecasts', icon: '◔', render: ViewForecasts, sub: 'Shortages, deserts, camps' },
  audit: { label: 'Audit trail', icon: '⛓', render: ViewAudit, sub: 'Hash-chain verification' },
};

Object.assign(window, { DASH_VIEWS, KpiStrip, EmergencyFeed });
