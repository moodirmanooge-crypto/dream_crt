import { useState, useEffect, useRef } from "react";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import {
  db,
  storage,
  auth,
} from "../firebase/config.js";

// ── Icons (inline SVGs) ───────────────────────────────────────────────────────
const Icon = {
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  ),
  AllUploads: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Income: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  Courses: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Students: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Messages: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 1.41 14.14 10 10 0 0 1-14.14 1.41A10 10 0 0 1 2.93 4.93a10 10 0 0 1 14.14-1.41" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  PDF: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  TrendUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 13, height: 13 }}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Dollar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 22, height: 22 }}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Crown: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
      <path d="M2 20h20v2H2v-2zm2-3l3-9 5 5 5-5 3 9H4z" />
    </svg>
  ),
  Lightning: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  UploadCloud: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 48, height: 48 }}>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  ),
  Data: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  Brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <path d="M9.5 2A4.5 4.5 0 0 0 5 6.5c0 1 .3 1.8.8 2.5A4 4 0 0 0 4 12.5 4 4 0 0 0 6 16a3.5 3.5 0 0 0 3.5 3.5c.8 0 1.5-.3 2-.7" />
      <path d="M12 4v15.5" />
      <path d="M14.5 2A4.5 4.5 0 0 1 19 6.5c0 1-.3 1.8-.8 2.5A4 4 0 0 1 20 12.5 4 4 0 0 1 18 16a3.5 3.5 0 0 1-3.5 3.5c-.8 0-1.5-.3-2-.7" />
    </svg>
  ),
  UserOne: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Percent: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  LockOpen: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  // ── Added for UploadContentPage ───────────────────────────────────────────
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 16, height: 16 }}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  ChevronUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
};

// ── Colour tokens — red / black ───────────────────────────────────────────────
const C = {
  bg: "#0a0a0a",
  bgDeep: "#050505",
  surface: "#111111",
  surfaceCard: "#161616",
  surfaceHover: "#1c1c1c",
  border: "#2a2a2a",
  borderRed: "#3d2a05",
  red: "#e0a526",
  redBright: "#f0b93e",
  redLight: "#f5c34a",
  redDim: "rgba(224,165,38,0.15)",
  redFaint: "rgba(224,165,38,0.07)",
  redGlow: "rgba(224,165,38,0.25)",
  text: "#ffffff",
  textMuted: "#888888",
  textSub: "#555555",
  green: "#22c55e",
  greenDim: "rgba(34,197,94,0.15)",
  errorRed: "#ff4757",
  errorDim: "rgba(255,71,87,0.15)",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.15)",
  // ── Added for playlist ──────────────────────────────────────────────────────
  blue: "#3b82f6",
  blueDim: "rgba(59,130,246,0.15)",
};

// ── Shared card style ─────────────────────────────────────────────────────────
const CARD = {
  background: C.surfaceCard,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};

// ── Global styles ─────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: ${C.bg}; }
    ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 99px; }
    .nav-btn:hover { background: ${C.surfaceHover} !important; color: ${C.text} !important; }
    .nav-btn.active { background: ${C.red} !important; color: #fff !important; border-radius: 10px; }
    .red-btn:hover:not(:disabled) { background: ${C.redBright} !important; transform: translateY(-1px); box-shadow: 0 6px 24px ${C.redGlow}; }
    .red-btn:active:not(:disabled) { transform: translateY(0); }
    .row-hover:hover { background: ${C.surfaceCard} !important; }
    .action-btn:hover { background: ${C.surfaceCard} !important; }
    .upload-zone:hover { border-color: ${C.redLight} !important; background: ${C.redFaint} !important; }
    .card-hover { transition: box-shadow .2s, transform .2s; }
    .card-hover:hover { box-shadow: 0 8px 32px ${C.redGlow}; transform: translateY(-2px); }
    @keyframes pulse { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
    .pulse { animation: pulse 1.2s ease-in-out infinite; }
    .lesson-row:hover { background: ${C.surfaceHover} !important; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `}</style>
);

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_UPLOADS = [
  { id: "1", name: "Data Structures.pdf", type: "PDF", size: "2.4 MB", date: "May 1, 2026", status: "Published" },
  { id: "2", name: "Web Development.mp4", type: "Video", size: "128 MB", date: "Apr 30, 2026", status: "Published" },
  { id: "3", name: "Database Systems.pdf", type: "PDF", size: "3.1 MB", date: "Apr 29, 2026", status: "Published" },
  { id: "4", name: "Python Tutorial.mp4", type: "Video", size: "245 MB", date: "Apr 28, 2026", status: "Published" },
  { id: "5", name: "AI Basics.pdf", type: "PDF", size: "1.8 MB", date: "Apr 27, 2026", status: "Published" },
];

const NAV = [
  { id: "dashboard", label: "Dashboard", Icon: Icon.Home },
  { id: "upload", label: "Upload Content", Icon: Icon.Upload },
  { id: "uploads", label: "All Uploads", Icon: Icon.AllUploads },
  { id: "income", label: "Income", Icon: Icon.Income },
  { id: "courses", label: "Courses", Icon: Icon.Courses },
  { id: "students", label: "Students", Icon: Icon.Students },
  { id: "traders", label: "Traders", Icon: Icon.UserOne },
  { id: "data", label: "All Data", Icon: Icon.Data },
  { id: "psychology", label: "Psychology", Icon: Icon.Brain },
  { id: "messages", label: "Messages", Icon: Icon.Messages },
  { id: "settings", label: "Settings", Icon: Icon.Settings },
];


// ═══════════════════════════════════════════════════════════════════════════════
// Firestore reading helpers
// ═══════════════════════════════════════════════════════════════════════════════
function useCollectionData(name) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    setError("");
    const unsub = onSnapshot(
      collection(db, name),
      (snap) => {
        setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load data.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [name]);
  return { docs, loading, error };
}

const prettyKey = (k) =>
  String(k).replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (c) => c.toUpperCase()).trim();
const isTimestampKey = (k) => /date|created|updated|time|timestamp/i.test(k);
const isImageUrl = (v) =>
  typeof v === "string" && /^https?:\/\//.test(v) &&
  /(\.png|\.jpe?g|\.webp|\.gif|firebasestorage.*alt=media)/i.test(v);

function fmtValue(key, val) {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "number" && isTimestampKey(key) && val > 1e11) {
    try { return new Date(val).toLocaleString(); } catch { return String(val); }
  }
  if (val && typeof val === "object" && typeof val.toDate === "function") {
    try { return val.toDate().toLocaleString(); } catch { return "—"; }
  }
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (Array.isArray(val)) return `${val.length} item${val.length === 1 ? "" : "s"}`;
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

const statusColor = (s) => {
  const t = String(s).toLowerCase();
  if (/(approv|publish|active|paid|success|done|complete|win|unlock)/.test(t)) return { bg: C.greenDim, fg: C.green };
  if (/(pend|review|wait|process)/.test(t)) return { bg: C.amberDim, fg: C.amber };
  if (/(reject|fail|decline|loss|block|cancel|lock)/.test(t)) return { bg: C.errorDim, fg: C.errorRed };
  return { bg: C.redDim, fg: C.redLight };
};

function LoadingBox() {
  return (
    <div style={{ padding: "54px 0", textAlign: "center", color: C.textMuted, fontSize: 14 }}>
      <span className="pulse" style={{ color: C.red, marginRight: 8 }}>●</span> Loading…
    </div>
  );
}
function EmptyBox({ name }) {
  return (
    <div style={{ padding: "54px 0", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>🗂️</div>
      <div style={{ color: C.textMuted, fontSize: 14 }}>No records found in "{name}".</div>
    </div>
  );
}
function ErrorBox({ msg }) {
  return (
    <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 13, background: "#2a0a0a", border: `1px solid ${C.errorRed}40`, color: C.errorRed }}>
      ⚠️ {msg} — fadlan hubi Firestore rules-ka in admin-ka loo ogol yahay akhrinta.
    </div>
  );
}
function SearchBox({ value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", minWidth: 220 }}>
      <span style={{ color: C.textSub }}><Icon.Search /></span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Search…"}
        style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 13, width: "100%", fontFamily: "inherit" }} />
    </div>
  );
}

function DataCard({ data }) {
  const titleKey = ["fullName", "name", "title", "username", "displayName", "pair", "symbol"].find((k) => data[k]);
  const title = titleKey ? String(data[titleKey]) : data.id;
  const status = data.status ?? data.type ?? data.result ?? data.outcome;
  const sc = (status !== undefined && status !== "") ? statusColor(status) : null;
  const imgKey = Object.keys(data).find((k) => isImageUrl(data[k]));
  const skip = new Set(["id", titleKey, imgKey, "status"]);
  const rows = Object.entries(data).filter(([k]) => !skip.has(k));
  const initial = (title || "?").charAt(0).toUpperCase();
  return (
    <div className="card-hover" style={{ background: C.surfaceCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>{initial}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
          <div style={{ color: C.textSub, fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.id}</div>
        </div>
        {sc && <span style={{ background: sc.bg, color: sc.fg, padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{String(status)}</span>}
      </div>
      {imgKey && <img src={data[imgKey]} alt="" style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />}
      <div>
        {rows.map(([k, v]) => {
          const isLink = typeof v === "string" && /^https?:\/\//.test(v);
          return (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0", borderTop: `1px solid ${C.border}40` }}>
              <span style={{ color: C.textSub, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".4px", flexShrink: 0, paddingTop: 1 }}>{prettyKey(k)}</span>
              {isLink
                ? <a href={v} target="_blank" rel="noreferrer" style={{ color: C.redLight, fontSize: 12, textDecoration: "none", fontWeight: 600 }}>Open ↗</a>
                : <span style={{ color: C.text, fontSize: 12, textAlign: "right", wordBreak: "break-word", maxWidth: 200 }}>{fmtValue(k, v)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CollectionView({ name, docs, loading, error }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const filtered = q ? docs.filter((d) => JSON.stringify(d).toLowerCase().includes(q)) : docs;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <SearchBox value={search} onChange={setSearch} placeholder={`Search ${name}…`} />
        <span style={{ color: C.textMuted, fontSize: 13 }}>{filtered.length} record{filtered.length === 1 ? "" : "s"}</span>
      </div>
      {error && <ErrorBox msg={error} />}
      {loading ? <LoadingBox /> : filtered.length === 0 ? <EmptyBox name={name} /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map((d) => <DataCard key={d.id} data={d} />)}
        </div>
      )}
    </div>
  );
}

function CollectionPanel({ name }) {
  const { docs, loading, error } = useCollectionData(name);
  return (
    <div style={CARD}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 3, height: 18, background: C.red, borderRadius: 2 }} />
        <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{prettyKey(name)}</span>
      </div>
      <CollectionView name={name} docs={docs} loading={loading} error={error} />
    </div>
  );
}

function DataExplorer() {
  const sets = {
    journalRequests: useCollectionData("journalRequests"),
    posts: useCollectionData("posts"),
    profiles: useCollectionData("profiles"),
    psychology: useCollectionData("psychology"),
    trades: useCollectionData("trades"),
    users: useCollectionData("users"),
  };
  const TABS = [
    { id: "journalRequests", label: "Journal Requests" },
    { id: "posts", label: "Posts" },
    { id: "profiles", label: "Profiles" },
    { id: "psychology", label: "Psychology" },
    { id: "trades", label: "Trades" },
    { id: "users", label: "Users" },
  ];
  const [tab, setTab] = useState("journalRequests");
  const active = sets[tab];
  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
        {TABS.map((t) => {
          const s = sets[t.id];
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="card-hover"
              style={{ flex: "1 1 150px", minWidth: 150, textAlign: "left", cursor: "pointer", background: isActive ? C.redDim : C.surfaceCard, border: `1px solid ${isActive ? C.red : C.border}`, borderRadius: 14, padding: "16px 18px", boxShadow: isActive ? `0 6px 24px ${C.redGlow}` : "none" }}>
              <div style={{ color: isActive ? C.redLight : C.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>{t.label}</div>
              <div style={{ color: C.text, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{s.loading ? "…" : s.docs.length}</div>
              <div style={{ color: C.textSub, fontSize: 11, marginTop: 4 }}>records</div>
            </button>
          );
        })}
      </div>
      <div style={CARD}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 3, height: 18, background: C.red, borderRadius: 2 }} />
          <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{prettyKey(tab)}</span>
        </div>
        <CollectionView name={tab} docs={active.docs} loading={active.loading} error={active.error} />
      </div>
    </div>
  );
}

function EnrollmentsPage() {
  const { docs: enrollments, loading, error } = useCollectionData("enrollments");
  const { docs: courses } = useCollectionData("courses");
  const { docs: users } = useCollectionData("users");
  const [busy, setBusy] = useState({});
  const [search, setSearch] = useState("");
  const courseName = (id) => courses.find((c) => c.id === id)?.title || id;
  const userName = (id) => users.find((u) => u.id === id)?.fullName || users.find((u) => u.id === id)?.email || id;
  const approve = async (e, value) => {
    setBusy((b) => ({ ...b, [e.id]: true }));
    try {
      await updateDoc(doc(db, "enrollments", e.id), { approved: value, status: value ? "Approved" : "Pending", approvedAt: value ? Date.now() : null });
    } catch (err) { window.alert(err.message); }
    finally { setBusy((b) => ({ ...b, [e.id]: false })); }
  };
  const q = search.trim().toLowerCase();
  const list = q ? enrollments.filter((e) => JSON.stringify(e).toLowerCase().includes(q)) : enrollments;
  return (
    <div>
      <div style={{ ...CARD, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10, background: C.redFaint, border: `1px solid ${C.borderRed}` }}>
        <span style={{ color: C.redLight }}><Icon.LockOpen /></span>
        <span style={{ color: C.textMuted, fontSize: 13 }}>
          Marka aad "Approve" gujiso, <strong style={{ color: C.redLight }}>enrollments/&#123;id&#125;.approved = true</strong> ayaa la dejinayaa — appka ardaygu wuxuu arki karaa course-ka oo furan.
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <SearchBox value={search} onChange={setSearch} placeholder="Search enrollments…" />
        <span style={{ color: C.textMuted, fontSize: 13 }}>{list.length} record{list.length === 1 ? "" : "s"}</span>
      </div>
      {error && <ErrorBox msg={error} />}
      {loading ? <LoadingBox /> : list.length === 0 ? <EmptyBox name="enrollments" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {list.map((e) => {
            const approved = !!e.approved;
            return (
              <div key={e.id} style={{ ...CARD, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 200 }}>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{userName(e.userId)}</div>
                  <div style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>Course: {courseName(e.courseId)}</div>
                </div>
                <span style={{ background: approved ? C.greenDim : C.amberDim, color: approved ? C.green : C.amber, padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                  {approved ? "Approved" : "Pending"}
                </span>
                <button onClick={() => approve(e, !approved)} disabled={busy[e.id]} className="red-btn"
                  style={{ background: approved ? "transparent" : C.red, color: approved ? C.errorRed : "#fff", border: approved ? `1px solid ${C.errorDim}` : "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: busy[e.id] ? "not-allowed" : "pointer", boxShadow: approved ? "none" : `0 4px 14px ${C.redGlow}` }}>
                  {busy[e.id] ? "…" : approved ? "Unapprove" : "Approve"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CoursesPage() {
  const { docs: courses, loading, error } = useCollectionData("courses");
  const [busy, setBusy] = useState({});
  const [search, setSearch] = useState("");
  const isLocked = (c) => (c.locked !== undefined ? !!c.locked : (Number(c.price) || 0) > 0);
  const toggleLock = async (c) => {
    setBusy((b) => ({ ...b, [c.id]: true }));
    try { await updateDoc(doc(db, "courses", c.id), { locked: !isLocked(c) }); }
    catch (e) { window.alert(e.message); }
    finally { setBusy((b) => ({ ...b, [c.id]: false })); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.title || "this course"}"?`)) return;
    setBusy((b) => ({ ...b, [c.id]: true }));
    try { await deleteDoc(doc(db, "courses", c.id)); }
    catch (e) { window.alert(e.message); }
    finally { setBusy((b) => ({ ...b, [c.id]: false })); }
  };
  const q = search.trim().toLowerCase();
  const list = q ? courses.filter((c) => JSON.stringify(c).toLowerCase().includes(q)) : courses;
  return (
    <div>
      <div style={{ ...CARD, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10, background: C.redFaint, border: `1px solid ${C.borderRed}` }}>
        <span style={{ color: C.redLight }}><Icon.Lock /></span>
        <span style={{ color: C.textMuted, fontSize: 13 }}>
          Course-yada lacagta leh way <strong style={{ color: C.redLight }}>xidhan yihiin</strong> illaa ardaygu bixiyo. Course-ka bilaashka ah (price = 0) waa furan yahay.
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <SearchBox value={search} onChange={setSearch} placeholder="Search courses…" />
        <span style={{ color: C.textMuted, fontSize: 13 }}>{list.length} course{list.length === 1 ? "" : "s"}</span>
      </div>
      {error && <ErrorBox msg={error} />}
      {loading ? <LoadingBox /> : list.length === 0 ? <EmptyBox name="courses" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {list.map((c) => {
            const locked = isLocked(c);
            const price = Number(c.price) || 0;
            return (
              <div key={c.id} className="card-hover" style={{ ...CARD, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", height: 140, background: C.surface }}>
                  {c.thumbnailURL
                    ? <img src={c.thumbnailURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.textSub, fontSize: 36 }}>{c.type === "Video" ? "🎬" : c.type === "Playlist" ? "🎓" : "📄"}</div>}
                  <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 6, background: locked ? C.errorDim : C.greenDim, color: locked ? C.errorRed : C.green, padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }}>
                    {locked ? <><Icon.Lock /> Locked</> : <><Icon.LockOpen /> Free</>}
                  </div>
                  <div style={{ position: "absolute", top: 10, left: 10, background: c.type === "PDF" ? C.errorDim : c.type === "Playlist" ? C.blueDim : C.amberDim, color: c.type === "PDF" ? C.errorRed : c.type === "Playlist" ? C.blue : C.amber, padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                    {c.type || "—"} {c.lessonCount ? `• ${c.lessonCount} lessons` : ""}
                  </div>
                </div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{c.title || "Untitled course"}</div>
                  {c.description && <div style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.description}</div>}
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ color: price > 0 ? C.redLight : C.green, fontWeight: 900, fontSize: 20 }}>{price > 0 ? `$${price.toFixed(2)}` : "FREE"}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => toggleLock(c)} disabled={busy[c.id]} title={locked ? "Unlock course" : "Lock course"}
                        style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: `1px solid ${C.border}`, color: locked ? C.green : C.errorRed, borderRadius: 8, padding: "7px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        {locked ? <><Icon.LockOpen /> Unlock</> : <><Icon.Lock /> Lock</>}
                      </button>
                      <button onClick={() => remove(c)} disabled={busy[c.id]}
                        style={{ background: "transparent", border: `1px solid ${C.errorDim}`, color: C.errorRed, borderRadius: 8, padding: "7px 9px", cursor: "pointer" }}>
                        <Icon.Trash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ── Red Button ────────────────────────────────────────────────────────────────
const RedBtn = ({ children, onClick, disabled, style = {} }) => (
  <button onClick={onClick} disabled={disabled} className="red-btn"
    style={{ background: disabled ? "#1a1a1a" : C.red, color: disabled ? C.textMuted : "#fff", fontWeight: 700, borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer", transition: "all .2s", padding: "11px 24px", fontSize: 14, letterSpacing: ".3px", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: disabled ? "none" : `0 4px 16px ${C.redGlow}`, ...style }}>
    {children}
  </button>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, delta, redFill, sparkData }) => {
  const pts = sparkData || [30, 45, 38, 60, 52, 70, 65, 80, 75, 90];
  const w = 120, h = 36;
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
  const ys = pts.map((v) => h - (v / 100) * h);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = d + ` L${w},${h} L0,${h} Z`;
  const lineColor = redFill ? "rgba(255,100,100,0.6)" : C.red;
  return (
    <div className="card-hover" style={{ background: redFill ? `linear-gradient(135deg, #8b0000 0%, #cc1111 50%, #990000 100%)` : C.surfaceCard, border: redFill ? "none" : `1px solid ${C.border}`, borderRadius: 16, padding: "22px 24px", flex: 1, minWidth: 160, position: "relative", overflow: "hidden", boxShadow: redFill ? `0 8px 32px rgba(150,0,0,0.5), inset 0 1px 0 rgba(255,100,100,0.15)` : `0 4px 20px rgba(0,0,0,0.4)` }}>
      {!redFill && <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${C.redDim} 0%, transparent 70%)`, pointerEvents: "none" }} />}
      <div style={{ width: 46, height: 46, borderRadius: 12, marginBottom: 14, background: redFill ? "rgba(0,0,0,0.25)" : C.redDim, border: redFill ? "1px solid rgba(255,100,100,0.2)" : `1px solid ${C.borderRed}`, display: "flex", alignItems: "center", justifyContent: "center", color: redFill ? "#ffaaaa" : C.redLight }}>
        {icon}
      </div>
      <div style={{ color: redFill ? "rgba(255,200,200,0.7)" : C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ color: redFill ? "#fff" : C.text, fontSize: 32, fontWeight: 900, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: redFill ? "#ffcccc" : C.redLight, fontSize: 12, marginBottom: 12 }}><Icon.TrendUp /> <span>{delta}</span></div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 36 }}>
        <defs><linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lineColor} stopOpacity=".5" /><stop offset="100%" stopColor={lineColor} stopOpacity="0" /></linearGradient></defs>
        <path d={area} fill={`url(#sg-${label})`} /><path d={d} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ pct }) => (
  <div style={{ background: "#1e1e1e", borderRadius: 99, height: 6, marginTop: 8, overflow: "hidden" }}>
    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${C.red}, ${C.redLight})`, transition: "width .3s", boxShadow: `0 0 10px ${C.redGlow}` }} />
  </div>
);

// ── Income sparkline ──────────────────────────────────────────────────────────
const IncomeSparkline = () => {
  const pts = [30, 45, 38, 60, 52, 70, 65, 85, 78, 95, 88, 100];
  const w = 300, h = 90;
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
  const ys = pts.map((v) => h - (v / 100) * h);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = d + ` L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 90, overflow: "visible" }}>
      <defs><linearGradient id="income-sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.red} stopOpacity=".45" /><stop offset="100%" stopColor={C.red} stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill="url(#income-sg)" /><path d={d} fill="none" stroke={C.redLight} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {xs.map((x, i) => i % 3 === 0 && <circle key={i} cx={x} cy={ys[i]} r={3} fill={C.redLight} />)}
    </svg>
  );
};

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, textarea, type = "text" }) {
  const base = { width: "100%", padding: "12px 16px", borderRadius: 10, marginBottom: 4, background: C.bgDeep, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color .2s", fontFamily: "inherit" };
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", color: C.textMuted, fontSize: 12, marginBottom: 7, fontWeight: 600, letterSpacing: ".4px", textTransform: "uppercase" }}>{label}</label>
      {textarea
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} style={{ ...base, resize: "vertical" }} onFocus={(e) => (e.target.style.borderColor = C.red)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
        : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} onFocus={(e) => (e.target.style.borderColor = C.red)} onBlur={(e) => (e.target.style.borderColor = C.border)} />}
    </div>
  );
}

// ── Uploads Table ─────────────────────────────────────────────────────────────
function UploadsTable({ uploads, onDelete, full }) {
  return (
    <div style={{ background: C.surfaceCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 18, background: C.red, borderRadius: 2 }} />
          <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{full ? "All Uploads" : "Recent Uploads"}</span>
        </div>
        {!full && <span style={{ fontSize: 12, color: C.textMuted, cursor: "pointer", padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}` }}>View All →</span>}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>{["File Name", "Type", "Size", "Date", "Status", "Actions"].map((h) => (<th key={h} style={{ padding: "10px 12px", textAlign: "left", color: C.textSub, fontWeight: 600, fontSize: 11, letterSpacing: ".5px", textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>))}</tr>
        </thead>
        <tbody>
          {uploads.map((u) => (
            <tr key={u.id} className="row-hover" style={{ transition: "background .15s" }}>
              <td style={{ padding: "13px 12px", borderBottom: `1px solid ${C.border}20` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.text }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: u.type === "PDF" ? C.errorDim : C.amberDim, color: u.type === "PDF" ? C.errorRed : C.amber }}>
                    {u.type === "PDF" ? <Icon.PDF /> : <Icon.Video />}
                  </div>
                  <span style={{ fontWeight: 500 }}>{u.name}</span>
                </div>
              </td>
              <td style={{ padding: "13px 12px", borderBottom: `1px solid ${C.border}20` }}><span style={{ background: u.type === "PDF" ? C.errorDim : C.amberDim, color: u.type === "PDF" ? C.errorRed : C.amber, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{u.type}</span></td>
              <td style={{ padding: "13px 12px", color: C.textMuted, borderBottom: `1px solid ${C.border}20` }}>{u.size}</td>
              <td style={{ padding: "13px 12px", color: C.textMuted, borderBottom: `1px solid ${C.border}20` }}>{u.date}</td>
              <td style={{ padding: "13px 12px", borderBottom: `1px solid ${C.border}20` }}><span style={{ background: C.greenDim, color: C.green, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{u.status}</span></td>
              <td style={{ padding: "13px 12px", borderBottom: `1px solid ${C.border}20` }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="action-btn" style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted, cursor: "pointer", padding: "6px 8px", borderRadius: 8, transition: "all .15s" }}><Icon.Eye /></button>
                  <button onClick={() => onDelete(u.id)} className="action-btn" style={{ background: "transparent", border: `1px solid ${C.errorDim}`, color: C.errorRed, cursor: "pointer", padding: "6px 8px", borderRadius: 8, transition: "all .15s" }}><Icon.Trash /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Placeholder ───────────────────────────────────────────────────────────────
function PlaceholderPage({ label }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🚧</div>
      <div style={{ color: C.redLight, fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{label.charAt(0).toUpperCase() + label.slice(1)} Page</div>
      <div style={{ color: C.textMuted, fontSize: 14 }}>Coming soon — connect your Firestore data here.</div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD CONTENT PAGE — Category selector + Playlist/Single builder
// ═══════════════════════════════════════════════════════════════════════════════
function UploadContentPage() {
  const [category, setCategory] = useState(""); // "single_video"|"single_pdf"|"playlist"
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [singleFile, setSingleFile] = useState(null);
  // Playlist lessons: { id, title, file, fileType, order }
  const [lessons, setLessons] = useState([]);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonFile, setLessonFile] = useState(null);
  const [lessonFileType, setLessonFileType] = useState("video");
  const [addingLesson, setAddingLesson] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [msg, setMsg] = useState("");

  const thumbRef = useRef(null);
  const singleFileRef = useRef(null);
  const lessonFileRef = useRef(null);

  const uploadWithProgress = (storageRef, file, onProg) =>
    new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file);
      task.on("state_changed", (snap) => onProg(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)), reject,
        () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject));
    });

  const addLesson = () => {
    if (!lessonTitle.trim()) { alert("Lesson-ka cinwaankiisa gali"); return; }
    if (!lessonFile) { alert("Lesson-ka file-kiisa dooro"); return; }
    setLessons(prev => [...prev, { id: Date.now().toString(), title: lessonTitle.trim(), file: lessonFile, fileType: lessonFileType, order: prev.length + 1 }]);
    setLessonTitle(""); setLessonFile(null); setAddingLesson(false);
  };
  const removeLesson = (id) => setLessons(prev => prev.filter(l => l.id !== id).map((l, i) => ({ ...l, order: i + 1 })));
  const moveLessonUp = (idx) => {
    if (idx === 0) return;
    setLessons(prev => { const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a.map((l, i) => ({ ...l, order: i + 1 })); });
  };
  const moveLessonDown = (idx) => {
    setLessons(prev => { if (idx >= prev.length - 1) return prev; const a = [...prev]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a.map((l, i) => ({ ...l, order: i + 1 })); });
  };

  const handleUpload = async () => {
    if (!title.trim()) { setMsg("⚠️ Course title buuxi"); return; }
    if (category === "playlist" && lessons.length === 0) { setMsg("⚠️ Ugu yaraan 1 lesson ku dar"); return; }
    if ((category === "single_video" || category === "single_pdf") && !singleFile) { setMsg("⚠️ File-ka dooro"); return; }
    setUploading(true); setProgress(0); setMsg("");
    const coursePrice = Number(price) || 0;
    try {
      setProgressLabel("🖼️ Thumbnail uploading…");
      let thumbnailURL = "";
      if (thumbnail) {
        const tRef = ref(storage, `thumbnails/${Date.now()}_${thumbnail.name}`);
        thumbnailURL = await uploadWithProgress(tRef, thumbnail, () => {});
      }
      if (category === "playlist") {
        const uploadedLessons = [];
        for (let i = 0; i < lessons.length; i++) {
          const lesson = lessons[i];
          setProgressLabel(`📁 Lesson ${i + 1}/${lessons.length}: ${lesson.title}`);
          setProgress(Math.round((i / lessons.length) * 80));
          const folder = lesson.fileType === "pdf" ? "pdfs" : "videos";
          const lRef = ref(storage, `${folder}/lessons/${Date.now()}_${lesson.file.name}`);
          const fileURL = await uploadWithProgress(lRef, lesson.file, () => {});
          uploadedLessons.push({ title: lesson.title, fileURL, fileType: lesson.fileType === "pdf" ? "PDF" : "Video", order: lesson.order });
        }
        setProgressLabel("💾 Saving playlist…"); setProgress(90);
        await addDoc(collection(db, "courses"), {
          title: title.trim(), description: description.trim(), price: coursePrice, thumbnailURL,
          category: "playlist", type: "Playlist", lessons: uploadedLessons, lessonCount: uploadedLessons.length,
          createdAt: Date.now(), status: "Published", locked: coursePrice > 0, isPaid: false,
        });
      } else {
        const folder = category === "single_pdf" ? "pdfs" : "videos";
        setProgressLabel(`📤 ${category === "single_pdf" ? "PDF" : "Video"} uploading…`);
        const fRef = ref(storage, `${folder}/${Date.now()}_${singleFile.name}`);
        const fileURL = await uploadWithProgress(fRef, singleFile, (p) => setProgress(Math.round(p * 0.85)));
        setProgressLabel("💾 Saving…"); setProgress(90);
        await addDoc(collection(db, "courses"), {
          title: title.trim(), description: description.trim(), price: coursePrice, thumbnailURL, fileURL,
          category: category === "single_pdf" ? "single_pdf" : "single_video",
          type: category === "single_pdf" ? "PDF" : "Video",
          createdAt: Date.now(), status: "Published", locked: coursePrice > 0, isPaid: false,
        });
      }
      setProgress(100); setProgressLabel("✅ Done!");
      setMsg("✅ Course si guul leh ayaa loo upload garey!");
      setTimeout(() => {
        setTitle(""); setDescription(""); setPrice(""); setThumbnail(null); setThumbnailPreview(null);
        setSingleFile(null); setLessons([]); setStep(1); setCategory(""); setProgress(0); setProgressLabel("");
      }, 2000);
    } catch (err) {
      setMsg("❌ " + (err.message || "Upload failed."));
    } finally { setUploading(false); }
  };

  const iS = { width: "100%", padding: "11px 14px", borderRadius: 10, background: C.bgDeep, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  // ── STEP 1: Category chooser ──────────────────────────────────────────────
  if (step === 1) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: C.text, fontWeight: 900, fontSize: 22, margin: "0 0 6px" }}>Upload New Course</h2>
          <p style={{ color: C.textMuted, fontSize: 14 }}>Nooca course-ka dooro si ugu habboon</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {[
            { id: "single_video", icon: "🎬", label: "Single Video Lesson", sub: "Cashar keliya oo muuqaal ah — hal video ayaa la soo geliyaa", color: C.amber, colorDim: C.amberDim },
            { id: "single_pdf",   icon: "📄", label: "Single PDF Lesson",   sub: "Cashar keliya oo PDF ah — hal buug ama warqad ayaa la soo geliyaa", color: C.errorRed, colorDim: C.errorDim },
            { id: "playlist",     icon: "🎓", label: "Full Course (Playlist)", sub: "Cashar badan oo is-xiga — lessons ka kooban video iyo PDF labadaba", color: C.blue, colorDim: C.blueDim },
          ].map(opt => (
            <button key={opt.id} onClick={() => { setCategory(opt.id); setStep(2); }}
              style={{ textAlign: "left", cursor: "pointer", background: C.surfaceCard, border: `2px solid ${category === opt.id ? opt.color : C.border}`, borderRadius: 18, padding: 24, transition: "all .2s", display: "flex", flexDirection: "column", gap: 14 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.boxShadow = `0 8px 24px ${opt.colorDim}`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 40 }}>{opt.icon}</div>
              <div>
                <p style={{ color: C.text, fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{opt.label}</p>
                <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.6 }}>{opt.sub}</p>
              </div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: opt.color, fontWeight: 700, fontSize: 13 }}>Dooro <span style={{ fontSize: 16 }}>→</span></div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── STEP 2: Upload form ───────────────────────────────────────────────────
  const catInfo = {
    single_video: { icon: "🎬", label: "Single Video Lesson", color: C.amber },
    single_pdf:   { icon: "📄", label: "Single PDF Lesson",   color: C.errorRed },
    playlist:     { icon: "🎓", label: "Full Course (Playlist)", color: C.blue },
  }[category];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => { setStep(1); setMsg(""); }} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
        <div style={{ width: 1, height: 16, background: C.border }} />
        <span style={{ fontSize: 20 }}>{catInfo.icon}</span>
        <span style={{ color: catInfo.color, fontWeight: 700, fontSize: 15 }}>{catInfo.label}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: category === "playlist" ? "1fr" : "1fr 1fr", gap: 22 }}>
        {/* Course details card */}
        <div style={{ ...CARD }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 18, background: catInfo.color, borderRadius: 2 }} />
            <span style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>Course Details</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: C.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 7 }}>Course Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Basic Forex Somali" style={iS}
              onFocus={e => (e.target.style.borderColor = catInfo.color)} onBlur={e => (e.target.style.borderColor = C.border)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: C.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 7 }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Maxaa ardaygu ka baran doonaa course-kan?…" rows={3} style={{ ...iS, resize: "vertical" }}
              onFocus={e => (e.target.style.borderColor = catInfo.color)} onBlur={e => (e.target.style.borderColor = C.border)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: C.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 7 }}>Price (USD) — 0 = bilaash</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" style={iS}
              onFocus={e => (e.target.style.borderColor = catInfo.color)} onBlur={e => (e.target.style.borderColor = C.border)} />
          </div>
          {/* Thumbnail */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: C.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 7 }}>Thumbnail (optional)</label>
            <div onClick={() => thumbRef.current?.click()}
              style={{ border: `2px dashed ${thumbnail ? C.green : C.border}`, borderRadius: 12, padding: 16, cursor: "pointer", background: C.bgDeep, display: "flex", alignItems: "center", gap: 12, transition: "all .2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = catInfo.color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = thumbnail ? C.green : C.border)}>
              {thumbnailPreview
                ? <><img src={thumbnailPreview} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} /><div><p style={{ color: C.green, fontWeight: 600, fontSize: 13 }}>✓ {thumbnail.name}</p><p style={{ color: C.textMuted, fontSize: 11 }}>{(thumbnail.size / 1048576).toFixed(1)} MB</p></div></>
                : <><div style={{ fontSize: 28 }}>🖼️</div><span style={{ color: C.textMuted, fontSize: 13 }}>Click to upload thumbnail image</span></>}
            </div>
            <input ref={thumbRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => { const f = e.target.files[0]; if (f) { setThumbnail(f); setThumbnailPreview(URL.createObjectURL(f)); } }} />
          </div>
          {/* Single file zone (non-playlist) */}
          {category !== "playlist" && (
            <div>
              <label style={{ display: "block", color: C.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 7 }}>
                {category === "single_pdf" ? "PDF File *" : "Video File *"}
              </label>
              <div onClick={() => singleFileRef.current?.click()}
                style={{ border: `2px dashed ${singleFile ? C.green : C.borderRed}`, borderRadius: 12, padding: "24px 20px", cursor: "pointer", background: C.redFaint, textAlign: "center", transition: "all .2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = catInfo.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = singleFile ? C.green : C.borderRed)}>
                {singleFile ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                    <div style={{ fontSize: 28 }}>{category === "single_pdf" ? "📄" : "🎬"}</div>
                    <div>
                      <p style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>✓ {singleFile.name}</p>
                      <p style={{ color: C.textMuted, fontSize: 11 }}>{(singleFile.size / 1048576).toFixed(1)} MB</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setSingleFile(null); }} style={{ marginLeft: "auto", background: C.errorDim, color: C.errorRed, border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}><Icon.Trash /></button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{category === "single_pdf" ? "📄" : "🎬"}</div>
                    <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 4 }}>{category === "single_pdf" ? "Drag & drop PDF file here" : "Drag & drop Video file here"}</p>
                    <p style={{ color: C.textSub, fontSize: 11 }}>{category === "single_pdf" ? "PDF only • Max 50MB" : "MP4, MOV, AVI • Max 2GB"}</p>
                  </>
                )}
              </div>
              <input ref={singleFileRef} type="file" accept={category === "single_pdf" ? ".pdf" : "video/*"} style={{ display: "none" }}
                onChange={e => { if (e.target.files[0]) setSingleFile(e.target.files[0]); }} />
            </div>
          )}
        </div>

        {/* ── PLAYLIST LESSONS BUILDER ── */}
        {category === "playlist" && (
          <div style={{ ...CARD }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 3, height: 18, background: C.blue, borderRadius: 2 }} />
                <span style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>Course Lessons</span>
                <span style={{ background: C.blueDim, color: C.blue, padding: "3px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                  {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                </span>
              </div>
              <button onClick={() => setAddingLesson(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: C.blue, color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                <Icon.Plus /> Add Lesson
              </button>
            </div>

            {/* Add lesson form */}
            {addingLesson && (
              <div style={{ background: C.bgDeep, border: `1px solid ${C.blue}40`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
                <p style={{ color: C.blue, fontWeight: 700, fontSize: 13, marginBottom: 14 }}>✚ New Lesson</p>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", color: C.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Lesson Title *</label>
                  <input value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="e.g. Introduction to Forex"
                    style={iS} onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} />
                </div>
                {/* File type toggle */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {["video", "pdf"].map(t => (
                    <button key={t} onClick={() => { setLessonFileType(t); setLessonFile(null); }}
                      style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer", background: lessonFileType === t ? C.blue : C.surfaceCard, color: lessonFileType === t ? "#fff" : C.textMuted, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {t === "video" ? "🎬 Video" : "📄 PDF"}
                    </button>
                  ))}
                </div>
                {/* File picker */}
                <div onClick={() => lessonFileRef.current?.click()}
                  style={{ border: `2px dashed ${lessonFile ? C.green : C.border}`, borderRadius: 10, padding: 14, cursor: "pointer", textAlign: "center", background: C.surface, marginBottom: 14, transition: "all .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.blue)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = lessonFile ? C.green : C.border)}>
                  {lessonFile
                    ? <p style={{ color: C.green, fontWeight: 600, fontSize: 13 }}>✓ {lessonFile.name} ({(lessonFile.size / 1048576).toFixed(1)} MB)</p>
                    : <p style={{ color: C.textMuted, fontSize: 13 }}>{lessonFileType === "video" ? "Click to select video file" : "Click to select PDF file"}</p>}
                </div>
                <input ref={lessonFileRef} type="file" accept={lessonFileType === "pdf" ? ".pdf" : "video/*"} style={{ display: "none" }}
                  onChange={e => { if (e.target.files[0]) setLessonFile(e.target.files[0]); }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addLesson}
                    style={{ flex: 1, padding: "10px 0", background: C.blue, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    ✓ Add Lesson
                  </button>
                  <button onClick={() => { setAddingLesson(false); setLessonTitle(""); setLessonFile(null); }}
                    style={{ padding: "10px 16px", background: "none", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Lessons list */}
            {lessons.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.textSub }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <p style={{ fontSize: 14 }}>Weli lesson lama darin — "Add Lesson" ku dhufo</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="lesson-row"
                    style={{ background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, transition: "background .15s" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: C.blueDim, color: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>
                      {lesson.order}
                    </div>
                    <div style={{ fontSize: 18, flexShrink: 0 }}>{lesson.fileType === "pdf" ? "📄" : "🎬"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: C.text, fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{lesson.title}</p>
                      <p style={{ color: C.textSub, fontSize: 11, marginTop: 2 }}>{lesson.file.name} • {(lesson.file.size / 1048576).toFixed(1)} MB</p>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => moveLessonUp(idx)} disabled={idx === 0}
                        style={{ background: "none", border: `1px solid ${C.border}`, color: idx === 0 ? C.textSub : C.textMuted, borderRadius: 7, padding: "5px 7px", cursor: idx === 0 ? "not-allowed" : "pointer", opacity: idx === 0 ? 0.4 : 1 }}>
                        <Icon.ChevronUp />
                      </button>
                      <button onClick={() => moveLessonDown(idx)} disabled={idx === lessons.length - 1}
                        style={{ background: "none", border: `1px solid ${C.border}`, color: idx === lessons.length - 1 ? C.textSub : C.textMuted, borderRadius: 7, padding: "5px 7px", cursor: idx === lessons.length - 1 ? "not-allowed" : "pointer", opacity: idx === lessons.length - 1 ? 0.4 : 1 }}>
                        <Icon.ChevronDown />
                      </button>
                      <button onClick={() => removeLesson(lesson.id)}
                        style={{ background: C.errorDim, border: "none", color: C.errorRed, borderRadius: 7, padding: "5px 7px", cursor: "pointer" }}>
                        <Icon.Trash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload progress + button */}
      <div style={{ ...CARD, marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: C.redFaint, border: `1px solid ${C.borderRed}`, fontSize: 12, color: C.textMuted }}>
          <span style={{ color: C.redLight }}><Icon.Lock /></span>
          Haddii price-ku ka weyn yahay 0, course-ku wuxuu noqonayaa <strong style={{ color: C.redLight }}>locked</strong> illaa ardaygu lacagta bixiyo. Hadduu 0 yahay → instantly furan.
        </div>
        {uploading && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: "#1e1e1e", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg, ${catInfo.color}, ${catInfo.color}cc)`, borderRadius: 99, transition: "width .3s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted }}>
              <span>{progressLabel}</span><span>{progress}%</span>
            </div>
          </div>
        )}
        {msg && (
          <div style={{ marginBottom: 16, padding: "11px 16px", borderRadius: 10, fontSize: 13, background: msg.startsWith("✅") ? "#0a2a18" : "#2a0a0a", border: `1px solid ${msg.startsWith("✅") ? C.green + "40" : C.errorRed + "40"}`, color: msg.startsWith("✅") ? C.green : C.errorRed }}>
            {msg}
          </div>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleUpload} disabled={uploading}
            style={{ flex: 1, padding: "14px 0", background: catInfo.color, color: category === "playlist" ? "#fff" : "#000", border: "none", borderRadius: 12, fontWeight: 900, fontSize: 15, cursor: uploading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, opacity: uploading ? 0.65 : 1 }}>
            {uploading
              ? <><div style={{ width: 20, height: 20, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 1s linear infinite" }} />{progressLabel || "Uploading…"}</>
              : <><Icon.Upload /> {catInfo.icon} Upload {catInfo.label}</>}
          </button>
          {!uploading && (
            <button onClick={() => { setStep(1); setCategory(""); setMsg(""); }}
              style={{ padding: "14px 20px", background: "none", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Admin() {
  const [activePage, setActivePage] = useState("dashboard");
  const [uploadTab, setUploadTab] = useState("pdf");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploads, setUploads] = useState(MOCK_UPLOADS);

  const uploadFileWithProgress = (storageRef, file, onProgress) =>
    new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file);
      task.on("state_changed",
        (snap) => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject)
      );
    });

  const handleDelete = (id) => setUploads((prev) => prev.filter((u) => u.id !== id));

  const handleDrop = (e, setter) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setter(file);
  };

  const PAGE_TITLES = {
    enrollments: "Enrollments",
    dashboard: "Dashboard",
    upload: "Upload Content",
    uploads: "All Uploads",
    income: "Income",
    courses: "Courses",
    students: "Students",
    traders: "Traders",
    data: "All Data",
    psychology: "Psychology",
    messages: "Messages",
    settings: "Settings",
  };

  const card = {
    background: C.surfaceCard,
    border: `1px solid ${C.border}`,
    borderRadius: 16, padding: 24,
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  };

  // ── Upload Zone (dashboard widget only) ──
  const UploadZone = ({ tab, pdfFile, videoFile, setPdfFile, setVideoFile, inputId }) => {
    const file = tab === "pdf" ? pdfFile : videoFile;
    const setter = tab === "pdf" ? setPdfFile : setVideoFile;
    return (
      <div className="upload-zone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, setter)}
        onClick={() => document.getElementById(inputId).click()}
        style={{ border: `2px dashed ${C.borderRed}`, borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: C.redFaint, transition: "all .2s" }}>
        <div style={{ color: file ? C.green : C.red, marginBottom: 10 }}><Icon.UploadCloud /></div>
        <div style={{ color: file ? C.green : C.textMuted, fontSize: 13, marginBottom: 6, fontWeight: file ? 600 : 400 }}>
          {file ? `✓ ${file.name}` : (tab === "pdf" ? "Drag & drop your PDF file here" : "Drag & drop your video file here")}
        </div>
        <div style={{ color: C.textSub, fontSize: 12, marginBottom: 14 }}>or</div>
        <RedBtn><Icon.Upload /> Browse File</RedBtn>
        <input id={inputId} type="file" accept={tab === "pdf" ? ".pdf" : "video/*"} style={{ display: "none" }}
          onChange={(e) => setter(e.target.files[0])} />
        <div style={{ color: C.textSub, fontSize: 11, marginTop: 12 }}>
          {tab === "pdf" ? "Supported formats: PDF only (Max 50MB)" : "Supported: mp4, mov, avi | Max 2GB"}
        </div>
      </div>
    );
  };

  const TabSwitcher = ({ value, onChange, compact }) => (
    <div style={{ display: "flex", background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, marginBottom: compact ? 16 : 24, width: compact ? "100%" : "fit-content" }}>
      {["pdf", "video"].map((t) => (
        <button key={t} onClick={() => onChange(t)}
          style={{ flex: compact ? 1 : undefined, padding: compact ? "9px 0" : "10px 30px", borderRadius: 8, border: "none", cursor: "pointer", background: value === t ? C.red : "transparent", color: value === t ? "#fff" : C.textMuted, fontWeight: value === t ? 700 : 500, fontSize: 13, transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: value === t ? `0 2px 10px ${C.redGlow}` : "none" }}>
          {t === "pdf"
            ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><polyline points="14 2 14 8 20 8" /></svg> Upload PDF</>
            : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg> Upload Video</>}
        </button>
      ))}
    </div>
  );

  // ═══════════════════════ RENDER ═══════════════════════════════════════════
  return (
    <>
      <GlobalStyle />
      <div style={{ display: "flex", minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* ════ SIDEBAR ════ */}
        <aside style={{ width: 240, flexShrink: 0, background: C.bgDeep, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${C.redGlow}`, flexShrink: 0 }}>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 22, lineHeight: 1 }}>H</span>
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>DREAM CRT</div>
                <div style={{ color: C.red, fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>TRADING</div>
                <div style={{ color: C.textSub, fontSize: 9, letterSpacing: 2, marginTop: 1 }}>LEARN · TRADE · EARN</div>
              </div>
            </div>
          </div>
          <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
            {NAV.map(({ id, label, Icon: I }) => {
              const active = activePage === id;
              return (
                <button key={id} onClick={() => setActivePage(id)} className={`nav-btn ${active ? "active" : ""}`}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "none", background: active ? C.red : "transparent", color: active ? "#fff" : C.textMuted, fontWeight: active ? 700 : 500, fontSize: 14, cursor: "pointer", marginBottom: 2, textAlign: "left", transition: "all .15s", boxShadow: active ? `0 4px 14px ${C.redGlow}` : "none" }}>
                  <I />{label}
                </button>
              );
            })}
          </nav>
          <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, boxShadow: `0 2px 10px ${C.redGlow}`, flexShrink: 0 }}>A</div>
              <div><div style={{ fontSize: 11, color: C.textMuted }}>Welcome back,</div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Admin</div></div>
            </div>
            <div style={{ background: C.redDim, border: `1px solid ${C.borderRed}`, borderRadius: 8, padding: "7px 12px", display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ color: C.redLight }}><Icon.Crown /></span>
              <span style={{ fontSize: 12, color: C.redLight, fontWeight: 600 }}>Premium Instructor</span>
            </div>
            <button style={{ width: "100%", marginTop: 10, display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", color: C.textMuted, cursor: "pointer", fontSize: 14, transition: "color .15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}>
              <Icon.Logout /> Logout
            </button>
          </div>
        </aside>

        {/* ════ MAIN ════ */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minWidth: 0 }}>
          <header style={{ background: `${C.bgDeep}ee`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{PAGE_TITLES[activePage] || "Dashboard"}</div>
              <div style={{ color: C.textMuted, fontSize: 13, marginTop: 1 }}>Welcome back, <span style={{ color: C.redLight }}>Admin</span></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button style={{ background: C.surfaceCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 11px", color: C.textMuted, cursor: "pointer", position: "relative" }}>
                <Icon.Bell />
                <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: C.red, borderRadius: "50%", border: `2px solid ${C.bgDeep}` }} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surfaceCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", cursor: "pointer" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff" }}>A</div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Admin</span>
                <Icon.ChevronDown />
              </div>
            </div>
          </header>

          <div style={{ padding: 28, flex: 1 }}>

            {/* ════ DASHBOARD ════ */}
            {activePage === "dashboard" && (
              <div>
                <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
                  <StatCard icon={<Icon.Courses />} label="Total Courses" value={1} delta="15% this month" sparkData={[20, 30, 25, 40, 35, 55, 50, 60, 58, 70]} />
                  <StatCard icon={<Icon.Upload />} label="Total Uploads" value={1} delta="12% this month" sparkData={[40, 50, 45, 65, 55, 75, 70, 82, 78, 90]} />
                  <StatCard icon={<Icon.Students />} label="Total Students" value={1} delta="36% this month" sparkData={[50, 55, 60, 58, 70, 72, 78, 82, 88, 95]} />
                  <StatCard icon={<Icon.Dollar />} label="Total Income" value="$0.00" delta="18% this month" redFill sparkData={[30, 45, 38, 60, 52, 70, 65, 85, 78, 100]} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24 }}>
                  <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                      <div style={{ width: 3, height: 18, background: C.red, borderRadius: 2 }} />
                      <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>Upload New Content</span>
                    </div>
                    <TabSwitcher value={uploadTab} onChange={setUploadTab} compact />
                    <UploadZone tab={uploadTab} pdfFile={pdfFile} videoFile={videoFile} setPdfFile={setPdfFile} setVideoFile={setVideoFile} inputId={`dash-file-${uploadTab}`} />
                    <button onClick={() => setActivePage("upload")}
                      style={{ marginTop: 12, width: "100%", padding: "10px 0", borderRadius: 10, border: `1px solid ${C.borderRed}`, background: "transparent", color: C.redLight, cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.redFaint)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      Fill in course details →
                    </button>
                  </div>
                  <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 3, height: 18, background: C.red, borderRadius: 2 }} />
                        <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>Quick Upload</span>
                      </div>
                      <span style={{ color: C.red }}><Icon.Lightning /></span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {[
                        { icon: "📄", title: "PDF", sub: "Single PDF lesson", color: C.errorRed },
                        { icon: "🎬", title: "Video", sub: "Single video lesson", color: C.amber },
                        { icon: "🎓", title: "Playlist", sub: "Full course", color: C.blue },
                      ].map(({ icon, title, sub, color }) => (
                        <div key={title} onClick={() => setActivePage("upload")}
                          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, textAlign: "center", cursor: "pointer", transition: "border-color .2s, box-shadow .2s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 20px ${color}40`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
                          <div style={{ color: C.text, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{title}</div>
                          <div style={{ color: C.textMuted, fontSize: 11, lineHeight: 1.4 }}>{sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 18 }}>
                  <UploadsTable uploads={uploads.slice(0, 5)} onDelete={handleDelete} />
                  <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <div style={{ width: 3, height: 18, background: C.red, borderRadius: 2 }} />
                      <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>Income Overview</span>
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>Total Income</div>
                    <div style={{ color: C.text, fontSize: 36, fontWeight: 900, marginBottom: 4 }}>$0.00</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: C.green, fontSize: 13, marginBottom: 2 }}><Icon.TrendUp /> <strong>+18%</strong></div>
                    <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 14 }}>vs last month</div>
                    <IncomeSparkline />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
                      {[{ label: "This Month", val: "$1,240", delta: "+12%" }, { label: "Last Month", val: "$1,105", delta: "+8%" }, { label: "Withdrawn", val: "$2,350", delta: null }].map(({ label, val, delta }) => (
                        <div key={label} style={{ background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
                          <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: ".4px", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
                          <div style={{ color: C.text, fontWeight: 800, fontSize: 14 }}>{val}</div>
                          {delta && <div style={{ color: C.green, fontSize: 11, marginTop: 3 }}>{delta}</div>}
                        </div>
                      ))}
                    </div>
                    <button style={{ marginTop: 16, width: "100%", padding: "10px 0", borderRadius: 10, border: `1px solid ${C.borderRed}`, background: "transparent", color: C.redLight, cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s" }}
                      onClick={() => setActivePage("income")}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.redFaint)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      View Income Details →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ════ UPLOAD CONTENT — 3-step category + playlist builder ════ */}
            {activePage === "upload" && <UploadContentPage />}

            {/* ════ ALL UPLOADS ════ */}
            {activePage === "uploads" && <UploadsTable uploads={uploads} onDelete={handleDelete} full />}

            {/* ════ INCOME ════ */}
            {activePage === "income" && (
              <div>
                <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
                  <StatCard icon={<Icon.Dollar />} label="Total Income" value="$0.00" delta="18% this month" redFill />
                  <StatCard icon={<Icon.Income />} label="This Month" value="$0.00" delta="+12% vs last month" />
                  <StatCard icon={<Icon.Income />} label="Last Month" value="$0.00" delta="+8% vs prev month" />
                  <StatCard icon={<Icon.Income />} label="Total Withdrawn" value="$0.00" delta="All time" />
                </div>
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 3, height: 18, background: C.red, borderRadius: 2 }} />
                    <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>Income Chart</span>
                  </div>
                  <IncomeSparkline />
                  <div style={{ color: C.textMuted, fontSize: 12, textAlign: "center", marginTop: 8 }}>Last 12 months</div>
                </div>
              </div>
            )}

            {/* ════ COURSES ════ */}
            {activePage === "courses" && <CoursesPage />}

            {/* ════ TRADERS ════ */}
            {activePage === "traders" && <PlaceholderPage label="traders" />}

            {/* ════ ALL DATA ════ */}
            {activePage === "data" && <DataExplorer />}

            {/* ════ PSYCHOLOGY ════ */}
            {activePage === "psychology" && <CollectionPanel name="psychology" />}

            {/* ════ ENROLLMENTS ════ */}
            {activePage === "enrollments" && <EnrollmentsPage />}

            {/* ════ PLACEHOLDERS ════ */}
            {["students", "messages", "settings"].includes(activePage) && (
              <PlaceholderPage label={activePage} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}