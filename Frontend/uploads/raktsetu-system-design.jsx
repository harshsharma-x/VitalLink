import { useState } from "react";

const RED = "#C0152A";
const DEEP = "#7A0A18";
const SOFT = "#FFF0F0";
const INK = "#16161A";
const MID = "#55555E";
const FOG = "#F6F4F3";
const LINE = "#E6DEDD";
const W = "#FFFFFF";
const TEAL = "#0D7A5F";
const STEAL = "#E4F4EE";
const BLUE = "#1B4FD8";
const SBLUE = "#ECF1FE";
const AMBER = "#B45309";
const SAMBER = "#FDF2DE";
const PURPLE = "#6D28D9";
const SPURPLE = "#F1EBFE";
const SLATE = "#334155";
const SSLATE = "#EEF2F6";

/* ────────── reusable box ────────── */
const Box = ({ title, items, color, soft, icon, w }) => (
  <div style={{ background: W, border: `1.5px solid ${color}`, borderRadius: 10, overflow: "hidden", width: w || "auto", minWidth: 150 }}>
    <div style={{ background: color, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: W }}>{title}</span>
    </div>
    <div style={{ padding: "8px 12px", background: soft }}>
      {items.map((it, i) => (
        <div key={i} style={{ fontSize: 11, color: INK, padding: "3px 0", borderBottom: i < items.length - 1 ? `1px dashed ${LINE}` : "none" }}>{it}</div>
      ))}
    </div>
  </div>
);

const Arrow = ({ label, down }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2px 0" }}>
    <div style={{ fontSize: 10, color: MID, background: FOG, padding: "1px 8px", borderRadius: 8, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 16, color: RED, lineHeight: 1 }}>↓</div>
  </div>
);

/* ────────── sequence diagram step ────────── */
const SeqStep = ({ n, from, to, msg, note, color }) => (
  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: `1px solid ${LINE}` }}>
    <div style={{ width: 24, height: 24, borderRadius: "50%", background: color || RED, color: W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{n}</div>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: INK, background: FOG, padding: "2px 8px", borderRadius: 4 }}>{from}</span>
        <span style={{ color: RED, fontSize: 12 }}>→</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: INK, background: FOG, padding: "2px 8px", borderRadius: 4 }}>{to}</span>
      </div>
      <div style={{ fontSize: 12, color: INK, fontWeight: 500 }}>{msg}</div>
      {note && <div style={{ fontSize: 11, color: MID, marginTop: 2 }}>{note}</div>}
    </div>
  </div>
);

export default function RaktSetuSystemDesign() {
  const [tab, setTab] = useState("hld");

  const tabs = [
    ["hld", "1. High-Level Design"],
    ["flow", "2. Emergency Flow"],
    ["data", "3. Data Design"],
    ["scale", "4. Scaling & Reliability"],
    ["security", "5. Security Design"],
    ["estimate", "6. Capacity Estimation"],
  ];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: FOG, minHeight: "100vh", color: INK }}>

      {/* header */}
      <div style={{ background: `linear-gradient(120deg, ${DEEP}, ${RED})`, padding: "1.75rem 1.5rem 1.25rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>System Design Document · v1.0</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: W }}>🩸 RaktSetu AI — System Design</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            Emergency blood matching · Live tracking · Fraud detection · 10M users scale target
          </p>
        </div>
      </div>

      {/* tabs */}
      <div style={{ background: W, borderBottom: `1px solid ${LINE}`, overflowX: "auto" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", padding: "0 1rem" }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "12px 14px", border: "none", background: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              color: tab === id ? RED : MID,
              borderBottom: `2.5px solid ${tab === id ? RED : "transparent"}`,
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1.5rem 1rem" }}>

        {/* ════════ TAB 1: HLD ════════ */}
        {tab === "hld" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>High-Level Architecture</h2>
            <p style={{ fontSize: 12, color: MID, margin: "0 0 20px" }}>Microservices architecture · Event-driven core · Read-heavy with burst writes during emergencies</p>

            {/* CLIENTS */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 4 }}>
              <Box icon="📱" color={SLATE} soft={SSLATE} title="Mobile App (RN)" items={["Donor + Patient", "Live tracking map", "FCM receiver"]} />
              <Box icon="💬" color={SLATE} soft={SSLATE} title="WhatsApp Bot" items={["Rural primary channel", "NLP message parsing"]} />
              <Box icon="🖥️" color={SLATE} soft={SSLATE} title="Web Dashboard" items={["Govt + Blood banks", "Fraud alerts, forecasts"]} />
              <Box icon="📟" color={SLATE} soft={SSLATE} title="USSD / SMS / Email" items={["*BLOOD# keypad phones", "Missed call trigger"]} />
            </div>

            <Arrow label="HTTPS / WSS / Webhooks" />

            {/* GATEWAY */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
              <Box icon="🚪" color={PURPLE} soft={SPURPLE} w={500} title="API Gateway (Kong / AWS API GW)" items={[
                "Rate limiting: 100 req/min per user · 10 emergency req/day per phone",
                "JWT auth (Firebase) · Request routing · TLS termination",
                "DDoS protection · Webhook signature verification"
              ]} />
            </div>

            <Arrow label="Internal routing" />

            {/* SERVICES */}
            <div style={{ background: W, border: `2px dashed ${RED}`, borderRadius: 12, padding: "14px", marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: RED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, textAlign: "center" }}>Microservices (FastAPI · Docker · K8s)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <Box icon="🚨" color={RED} soft={SOFT} title="Request Service" items={["Create emergency request", "Urgency scoring (XGBoost)", "Status state machine"]} />
                <Box icon="🔗" color={RED} soft={SOFT} title="Matching Service" items={["GNN inference (GAT)", "PostGIS radius query", "Radius expansion 5→15→30km"]} />
                <Box icon="🔔" color={AMBER} soft={SAMBER} title="Notification Service" items={["FCM multicast (500/batch)", "WhatsApp / SMS / Email", "Tier logic + fatigue protection"]} />
                <Box icon="🩸" color={TEAL} soft={STEAL} title="Donor Service" items={["Registration + ABHA KYC", "Availability toggle", "Reliability scoring (GBM)"]} />
                <Box icon="🏥" color={TEAL} soft={STEAL} title="Bank Service" items={["Inventory CRUD", "Unit QR generation", "HFR verification"]} />
                <Box icon="🛡️" color={DEEP} soft={SOFT} title="Fraud Service" items={["Isolation Forest scoring", "Hash chain validator", "Authority alert dispatch"]} />
                <Box icon="📈" color={BLUE} soft={SBLUE} title="Forecast Service" items={["LSTM + Prophet (batch)", "Desert mapper (daily cron)", "Camp recommender"]} />
                <Box icon="⛓️" color={SLATE} soft={SSLATE} title="Audit Service" items={["SHA-256 event hashing", "Hyperledger async writer", "Public /verify endpoint"]} />
              </div>
            </div>

            <Arrow label="Async events via message queue" />

            {/* INFRA */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: 4 }}>
              <Box icon="📨" color={AMBER} soft={SAMBER} title="RabbitMQ / SQS" items={["emergency.created", "donor.accepted", "unit.event", "fraud.flagged"]} />
              <Box icon="🐘" color={BLUE} soft={SBLUE} title="PostgreSQL + PostGIS" items={["Primary + 2 read replicas", "Donors, units, requests", "GIST spatial indexes"]} />
              <Box icon="⚡" color={RED} soft={SOFT} title="Redis Cluster" items={["Live donor locations (TTL 5m)", "Active request cache", "FCM token cache", "Rate limit counters"]} />
              <Box icon="⛓️" color={SLATE} soft={SSLATE} title="Hyperledger Fabric" items={["Unit audit trail", "Consent records", "Async writes only"]} />
              <Box icon="🔌" color={TEAL} soft={STEAL} title="Socket.io Cluster" items={["Live location rooms", "Redis adapter (pub/sub)", "Sticky sessions via LB"]} />
              <Box icon="🧠" color={PURPLE} soft={SPURPLE} title="ML Serving" items={["TorchServe (GNN)", "OpenVINO edge clients", "Model registry (MLflow)"]} />
            </div>

            <div style={{ background: SBLUE, border: `1px solid #C7D7FF`, borderRadius: 10, padding: "12px 16px", marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 6 }}>🔑 Key Design Decisions</div>
              {[
                "Microservices over monolith — Matching and Notification services scale independently during emergencies (10× burst)",
                "Event-driven via RabbitMQ — emergency.created event fans out to Matching + Notification + Audit simultaneously",
                "Redis for live locations, NOT PostgreSQL — location updates every 3s × 1000s of donors would kill Postgres; Redis TTL auto-cleans",
                "Blockchain is async-only — user-facing operations never wait for Hyperledger; PostgreSQL responds first, chain syncs in background",
                "Read replicas for dashboard/analytics — govt dashboard queries never touch the primary serving emergencies",
              ].map((t, i) => <div key={i} style={{ fontSize: 12, color: INK, padding: "3px 0", lineHeight: 1.5 }}>• {t}</div>)}
            </div>
          </div>
        )}

        {/* ════════ TAB 2: EMERGENCY FLOW ════════ */}
        {tab === "flow" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>Emergency Request — End-to-End Sequence</h2>
            <p style={{ fontSize: 12, color: MID, margin: "0 0 16px" }}>Target: request → donor alerted in &lt;90 seconds · donor confirmed in &lt;10 minutes</p>

            <div style={{ background: W, borderRadius: 12, border: `1px solid ${LINE}`, padding: "8px 16px", marginBottom: 16 }}>
              <SeqStep n={1} from="Patient" to="API Gateway" msg='POST /requests — "O+ 2 units Apollo Ludhiana CRITICAL"' note="Via app/WhatsApp/email/USSD — all channels normalize to the same request object" />
              <SeqStep n={2} from="Gateway" to="Request Service" msg="Validate + rate-limit check (10 emergency/day per phone)" note="Prevents tout spam — same number flooding requests gets flagged" />
              <SeqStep n={3} from="Request Service" to="Urgency Scorer" msg="Compute urgency score (XGBoost) → CRITICAL (score 82)" note="Time constraint 40pts + trauma diagnosis 25pts + 2 units 10pts + Hb 7pts" />
              <SeqStep n={4} from="Request Service" to="RabbitMQ" msg="Publish event: emergency.created" note="Response returned to patient HERE (~300ms) — everything below is async" color={AMBER} />
              <SeqStep n={5} from="Matching Service" to="PostGIS" msg="ST_DWithin query: eligible O+/O- donors within 10km" note="GIST index → <50ms even with 1M donors. Filters: available=true, 56-day gap passed" color={TEAL} />
              <SeqStep n={6} from="Matching Service" to="GNN (TorchServe)" msg="Rank candidates: distance + reliability + response_rate" note="GAT inference on candidate subgraph — <2s for 500 candidates" color={TEAL} />
              <SeqStep n={7} from="Matching Service" to="RabbitMQ" msg="Publish: match.candidates_ready (top donors list)" color={AMBER} />
              <SeqStep n={8} from="Notification Service" to="FCM" msg="MulticastMessage to ALL eligible donors (CRITICAL tier)" note="android priority=high → wakes phone in Doze mode, shows on lock screen with alarm" color={AMBER} />
              <SeqStep n={9} from="Donor Phone" to="Donor" msg="🩸 BLOOD NEEDED — emergency card with 5-min countdown" note="Works in foreground/background/killed app states" />
              <SeqStep n={10} from="Donor" to="Request Service" msg="POST /requests/{id}/accept" note="First-accept-wins with Redis distributed lock (SETNX) — no double assignment" />
              <SeqStep n={11} from="Request Service" to="Socket.io" msg="Create room request_{id} · notify patient 'Donor Found!'" color={TEAL} />
              <SeqStep n={12} from="Donor App" to="Socket.io" msg="emit donor:location_update every 3s (lat, lon, heading)" note="Stored in Redis with 5-min TTL — never written to PostgreSQL" color={TEAL} />
              <SeqStep n={13} from="Socket.io" to="Patient App" msg="Broadcast donor:moved to room → animated marker + live ETA" note="Blinkit-style smooth marker animation (AnimatedRegion, 500ms transitions)" color={TEAL} />
              <SeqStep n={14} from="Donor" to="Audit Service" msg="donor:arrived → donation completed → hash chain event logged" note="Async write to Hyperledger · location history purged from Redis" color={SLATE} />
            </div>

            {/* fallback paths */}
            <div style={{ background: SAMBER, border: `1px solid #F0D9A8`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: AMBER, marginBottom: 6 }}>⚠️ Failure & Fallback Paths</div>
              {[
                ["No donor accepts in 3 min (CRITICAL)", "Auto-expand radius 10→20→30km · re-broadcast to new donors · show nearest blood bank stock + phone as manual fallback"],
                ["Zero donors in 30km", "Immediately return blood bank list with live stock from inventory cache · alert district health officer"],
                ["FCM delivery fails", "SMS fallback via Twilio to same donor list within 30 seconds"],
                ["Socket.io disconnects mid-tracking", "Patient sees 'last known location + timestamp' · auto-reconnect with exponential backoff · phone call button always visible"],
                ["Donor accepts then goes silent 10 min", "Auto-release lock · re-broadcast to next candidates · donor reliability score decremented"],
              ].map(([k, v], i) => (
                <div key={i} style={{ padding: "5px 0", borderBottom: i < 4 ? `1px dashed #F0D9A8` : "none" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>{k}: </span>
                  <span style={{ fontSize: 12, color: MID }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════ TAB 3: DATA DESIGN ════════ */}
        {tab === "data" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>Data Design & Storage Strategy</h2>
            <p style={{ fontSize: 12, color: MID, margin: "0 0 16px" }}>Right data in the right store — each storage choice mapped to its access pattern</p>

            <div style={{ display: "grid", gap: 12 }}>
              {[
                {
                  store: "PostgreSQL + PostGIS", color: BLUE, soft: SBLUE, icon: "🐘",
                  holds: "Donors · Blood banks · Blood units · Emergency requests · Fraud flags · Unit events (hash chain)",
                  pattern: "Read-heavy (donor lookups) + burst writes (emergencies). Spatial radius queries via GIST index.",
                  why: "ACID for medical data. PostGIS ST_DWithin handles 'donors within 15km' in <50ms with proper indexing.",
                  keys: ["GIST index on donors.location", "Partial index: WHERE is_available=TRUE", "Row-level security: unit_events INSERT-only", "Partitioning: requests by month after 1M rows"],
                },
                {
                  store: "Redis Cluster", color: RED, soft: SOFT, icon: "⚡",
                  holds: "Live donor locations (TTL 5min) · Active request state · FCM token cache · Distributed locks · Rate limit counters",
                  pattern: "Extreme write frequency: location updates every 3s per active donor. Sub-millisecond reads.",
                  why: "Location streams would destroy PostgreSQL. TTL auto-expires stale data — privacy by design (locations never persisted).",
                  keys: ["donor_location:{id} → TTL 300s", "lock:request:{id} → SETNX first-accept-wins", "ratelimit:{phone}:daily → INCR + EXPIRE", "Redis Pub/Sub adapter for Socket.io scaling"],
                },
                {
                  store: "Hyperledger Fabric", color: SLATE, soft: SSLATE, icon: "⛓️",
                  holds: "Blood unit lifecycle hashes · Donor consent records · Inter-bank transfer contracts · Fraud flags (immutable copy)",
                  pattern: "Append-only, async writes (2–5s latency acceptable). Public read for verification.",
                  why: "Tamper-evidence that survives even RaktSetu's own database being compromised or pressured. Permissioned = no gas fees, controlled writers.",
                  keys: ["Write: async via queue, never blocks UX", "Read: public /verify/{unit_id} endpoint", "Orgs: RaktSetu + NBTC + state health dept as peers"],
                },
                {
                  store: "S3 / Object Storage", color: TEAL, soft: STEAL, icon: "🗂️",
                  holds: "Screening certificates (PDFs) · Donor ID documents · Monthly govt reports · ML model artifacts · DB backups",
                  pattern: "Write-once, read-rarely. Lifecycle: move to cold storage after 90 days.",
                  why: "Cheap durable storage for compliance documents required by DISHA audit trail.",
                  keys: ["AES-256 server-side encryption", "Versioning enabled", "Pre-signed URLs, 15-min expiry"],
                },
              ].map((s, i) => (
                <div key={i} style={{ background: W, border: `1.5px solid ${s.color}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ background: s.color, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{s.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: W }}>{s.store}</span>
                  </div>
                  <div style={{ padding: "12px 16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 6, fontSize: 12 }}>
                      <span style={{ fontWeight: 600, color: MID }}>Holds</span><span style={{ color: INK }}>{s.holds}</span>
                      <span style={{ fontWeight: 600, color: MID }}>Pattern</span><span style={{ color: INK }}>{s.pattern}</span>
                      <span style={{ fontWeight: 600, color: MID }}>Why</span><span style={{ color: INK }}>{s.why}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                      {s.keys.map((k, ki) => (
                        <span key={ki} style={{ fontSize: 10.5, fontFamily: "monospace", background: s.soft, border: `1px solid ${LINE}`, borderRadius: 5, padding: "3px 8px", color: INK }}>{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Entity relationship */}
            <div style={{ marginTop: 16, background: W, border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 10 }}>📐 Core Entity Relationships</div>
              <pre style={{ fontFamily: "monospace", fontSize: 11.5, color: INK, background: FOG, padding: 14, borderRadius: 8, overflow: "auto", lineHeight: 1.7, margin: 0 }}>
{`DONORS ──1:N──▶ EMERGENCY_REQUESTS (matched_donor)
DONORS ──1:N──▶ BLOOD_UNITS (via donor_hash, anonymized)
BLOOD_BANKS ──1:N──▶ BLOOD_UNITS
BLOOD_UNITS ──1:N──▶ BLOOD_UNIT_EVENTS (hash chain, append-only)
EMERGENCY_REQUESTS ──1:1──▶ MATCHES ──N:1──▶ DONORS
FRAUD_FLAGS ──N:1──▶ {BLOOD_UNITS | BLOOD_BANKS | DONORS | PHONE}
SHORTAGE_FORECASTS ──N:1──▶ DISTRICTS (daily batch insert)`}
              </pre>
            </div>
          </div>
        )}

        {/* ════════ TAB 4: SCALING ════════ */}
        {tab === "scale" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>Scaling & Reliability</h2>
            <p style={{ fontSize: 12, color: MID, margin: "0 0 16px" }}>Lives depend on uptime — target 99.95% availability with graceful degradation</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 12, marginBottom: 16 }}>
              {[
                {
                  t: "Horizontal Service Scaling", icon: "↔️", color: RED,
                  pts: ["K8s HPA: Matching + Notification services scale on queue depth, not CPU", "Emergency burst pattern: 10× traffic during disasters (train accident = 50 requests in 5 min from one district)", "Socket.io: Redis pub/sub adapter → N socket servers share room state", "Stateless services — any pod can handle any request"],
                },
                {
                  t: "Database Scaling", icon: "🐘", color: BLUE,
                  pts: ["Primary handles writes only — 2 read replicas for matching queries + dashboards", "PgBouncer connection pooling (FastAPI async workers × pods = connection explosion otherwise)", "Partition emergency_requests by month at 1M rows", "Spatial queries stay <50ms: GIST + partial indexes on hot paths"],
                },
                {
                  t: "Caching Strategy", icon: "⚡", color: AMBER,
                  pts: ["Blood bank inventory: 30s cache (Redis) — dashboard reads never hit DB", "Donor FCM tokens: cached on login, invalidated on token refresh", "GNN candidate subgraphs: cache donor graph per city, rebuild every 5 min", "CDN for dashboard static assets + audit verification pages"],
                },
                {
                  t: "Multi-Region Reliability", icon: "🌏", color: TEAL,
                  pts: ["Primary: AWS Mumbai (ap-south-1) · Failover: GCP Delhi", "PostgreSQL streaming replication cross-cloud, RPO < 30s", "Health check every 10s → DNS failover in <2 min", "Manual fallback ALWAYS shown: nearest blood bank phone numbers cached on device"],
                },
                {
                  t: "Queue Resilience", icon: "📨", color: PURPLE,
                  pts: ["RabbitMQ mirrored queues across 3 nodes", "Dead letter queue: failed notifications retry 3× with exponential backoff", "Blockchain writes: separate low-priority queue, can lag hours without user impact", "Idempotency keys on all consumers — duplicate events are no-ops"],
                },
                {
                  t: "Graceful Degradation Ladder", icon: "🪜", color: DEEP,
                  pts: ["GNN down → fallback to pure PostGIS distance sort (still works, less smart)", "FCM down → SMS broadcast within 30s", "Socket.io down → polling fallback every 10s + phone call button", "Everything down → static page with cached blood bank directory per district"],
                },
              ].map((c, i) => (
                <div key={i} style={{ background: W, border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 16px", borderTop: `3px solid ${c.color}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 8 }}>{c.icon} {c.t}</div>
                  {c.pts.map((p, pi) => <div key={pi} style={{ fontSize: 11.5, color: MID, padding: "3px 0", lineHeight: 1.5 }}>• {p}</div>)}
                </div>
              ))}
            </div>

            <div style={{ background: SOFT, border: `1px solid #F2C4CB`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: RED, marginBottom: 6 }}>🎯 SLOs (Service Level Objectives)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                {[
                  ["Emergency request → response", "p99 < 500ms"],
                  ["Request → donors alerted", "p95 < 90 seconds"],
                  ["Matching query (PostGIS + GNN)", "p95 < 2.5s"],
                  ["Live location update latency", "p95 < 1s end-to-end"],
                  ["Platform availability", "99.95% (≤22 min down/month)"],
                  ["FCM delivery success", "> 97% (SMS covers the rest)"],
                ].map(([k, v], i) => (
                  <div key={i} style={{ background: W, borderRadius: 8, padding: "8px 12px", border: `1px solid ${LINE}` }}>
                    <div style={{ fontSize: 11, color: MID }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: RED, fontFamily: "monospace" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ TAB 5: SECURITY ════════ */}
        {tab === "security" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>Security & Privacy Design</h2>
            <p style={{ fontSize: 12, color: MID, margin: "0 0 16px" }}>Health data + live locations = highest sensitivity class · DISHA + ABDM compliant</p>

            <div style={{ display: "grid", gap: 12 }}>
              {[
                {
                  layer: "Identity & Auth", icon: "🪪", color: BLUE, soft: SBLUE,
                  items: [
                    "Phone OTP via Firebase Auth — no passwords to leak",
                    "ABHA ID (Aadhaar-linked) for donor KYC → kills fake/duplicate donor accounts and blood farms",
                    "JWT with 15-min access + 7-day refresh tokens · device binding",
                    "Blood banks: API keys + HFR registration number cross-verified with NHA registry",
                    "Govt dashboard: role-based access (district officer sees own district only)",
                  ],
                },
                {
                  layer: "Location Privacy", icon: "📍", color: RED, soft: SOFT,
                  items: [
                    "Live location shared ONLY during active confirmed match — never before acceptance",
                    "Locations live in Redis with 5-min TTL — never written to PostgreSQL, auto-purged",
                    "Patient sees donor location; donor sees hospital only (never patient home)",
                    "Donor can kill location sharing anytime → falls back to proxy phone call",
                    "Post-donation: full location history deleted, only 'completed at [hospital], [time]' retained",
                  ],
                },
                {
                  layer: "Contact Privacy", icon: "📞", color: TEAL, soft: STEAL,
                  items: [
                    "Phone numbers masked until both parties confirm — Exotel proxy connects calls without revealing numbers",
                    "Names: first name only shared between matched parties",
                    "Donor blood type + reliability shown; medical history never shared",
                  ],
                },
                {
                  layer: "Data Protection (DISHA)", icon: "🔐", color: PURPLE, soft: SPURPLE,
                  items: [
                    "AES-256 at rest (PostgreSQL TDE + S3 SSE) · TLS 1.3 in transit",
                    "Consent manager: time-bound, purpose-specific consent per ABDM spec — emergency consent expires in 24h",
                    "Right to be forgotten: donor deletion cascades, except anonymized unit hashes (legal requirement)",
                    "All health data stays in India (data sovereignty) — Mumbai + Delhi regions only",
                    "Audit log of every data access — who viewed which donor record, when",
                  ],
                },
                {
                  layer: "Anti-Abuse", icon: "🛡️", color: DEEP, soft: SOFT,
                  items: [
                    "Rate limit: 10 emergency requests/day per phone — tout flooding blocked at gateway",
                    "Tout detection: same phone across multiple unrelated patient requests → Isolation Forest flag",
                    "Request verification: hospital name geocoded + cross-checked against HFR registry",
                    "Fake acceptance penalty: accept-then-ghost drops reliability score → fewer future alerts",
                    "Unit hash chain: INSERT-only table at DB level (row security policy) — even DBA can't silently edit history",
                  ],
                },
              ].map((s, i) => (
                <div key={i} style={{ background: W, border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ background: s.soft, padding: "8px 16px", borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{s.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.layer}</span>
                  </div>
                  <div style={{ padding: "10px 16px" }}>
                    {s.items.map((it, ii) => (
                      <div key={ii} style={{ fontSize: 12, color: INK, padding: "4px 0", lineHeight: 1.55, borderBottom: ii < s.items.length - 1 ? `1px dashed ${LINE}` : "none" }}>• {it}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════ TAB 6: CAPACITY ════════ */}
        {tab === "estimate" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>Capacity Estimation (Back-of-Envelope)</h2>
            <p style={{ fontSize: 12, color: MID, margin: "0 0 16px" }}>Year-2 target: 10M registered donors · 5,000 blood banks · national coverage</p>

            <div style={{ background: W, border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 10 }}>📊 Traffic Estimates</div>
              <pre style={{ fontFamily: "monospace", fontSize: 11.5, color: INK, background: FOG, padding: 14, borderRadius: 8, overflow: "auto", lineHeight: 1.8, margin: 0 }}>
{`USERS
  Registered donors:            10,000,000
  Daily active (availability):     500,000  (5%)
  Blood banks integrated:            5,000

EMERGENCY REQUESTS
  India needs ~14.6M units/year ≈ 40,000 units/day
  Assume 20% flow through RaktSetu year-2:  8,000 requests/day
  Average: 0.09 req/sec · Peak (disaster): 50 req/min = 0.83/sec
  → Request service: trivially small. The HARD part is fan-out:

NOTIFICATION FAN-OUT (the real load)
  8,000 requests × avg 80 donors alerted   = 640,000 FCM pushes/day
  Peak: 50 req/min × 200 donors (CRITICAL) = 10,000 pushes/min
  FCM multicast: 500/batch → 20 batches/min peak ✓ comfortably within limits

LIVE LOCATION STREAM (the write-heavy part)
  Concurrent active matches (peak):  ~400
  Location updates: 400 donors × 1 update/3s = 133 writes/sec to Redis
  Socket.io broadcasts: 133 msg/sec to patient rooms
  → Single Redis node handles 100K ops/sec — 0.1% utilization ✓

DATABASE
  Donor rows: 10M × ~1KB           = 10 GB
  Requests: 8K/day × 365 × 2KB     = 6 GB/year
  Unit events: 40K units/day × 6 events × 0.5KB = 120 MB/day = 44 GB/year
  → Single Postgres primary + replicas fine for years; partition events table

STORAGE GROWTH
  Year 2 total estimate: ~150 GB hot + 500 GB cold (S3)
  
BANDWIDTH
  Peak: 10K FCM/min + 133 socket msg/sec + API traffic ≈ 50 Mbps
  → Modest. CDN handles dashboard assets.`}
              </pre>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 14 }}>
              {[
                ["Monthly Infra Cost (Year 1)", "₹60–90K", "2 K8s nodes + RDS + Redis + Fabric VMs"],
                ["Monthly Infra Cost (Year 2)", "₹2.5–4L", "Multi-region + replicas + ML serving"],
                ["FCM Cost", "₹0", "Free up to 1M/month — we're under"],
                ["WhatsApp API", "₹0.35/conv", "~8K conversations/day = ₹85K/month"],
                ["SMS Fallback", "₹0.15/SMS", "~10% of alerts = ₹3K/day"],
                ["Google Maps APIs", "₹40–80K/mo", "Directions + Distance Matrix for ETA"],
              ].map(([k, v, n], i) => (
                <div key={i} style={{ background: W, border: `1px solid ${LINE}`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: MID }}>{k}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: RED, fontFamily: "monospace", margin: "2px 0" }}>{v}</div>
                  <div style={{ fontSize: 10.5, color: MID }}>{n}</div>
                </div>
              ))}
            </div>

            <div style={{ background: STEAL, border: `1px solid #BFE3D6`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, marginBottom: 6 }}>💡 The Counter-Intuitive Insight</div>
              <div style={{ fontSize: 12.5, color: INK, lineHeight: 1.65 }}>
                RaktSetu is NOT a high-throughput system like Blinkit (millions of orders). It's a <b>low-volume, extreme-criticality</b> system:
                only ~8K requests/day, but each one may be life-or-death. So the engineering budget goes into <b>reliability and fan-out speed</b>,
                not raw throughput — multi-region failover, notification redundancy (FCM→SMS), graceful degradation ladders, and the manual
                fallback (blood bank phone numbers) that must work even when everything else is down.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* footer */}
      <div style={{ borderTop: `1px solid ${LINE}`, background: W, padding: "12px 1.5rem", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: MID }}>RaktSetu AI · System Design v1.0 · FastAPI · PyTorch Geometric · Socket.io · Hyperledger Fabric · Intel OpenVINO</span>
      </div>
    </div>
  );
}
