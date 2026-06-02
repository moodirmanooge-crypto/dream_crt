import { useState, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";

// ── Icons (inline SVGs so no extra deps needed) ──────────────────────────────
const Icon = {
  Book: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  ),
  AllUploads: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Income: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  Courses: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Students: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Messages: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 1.41 14.14 10 10 0 0 1-14.14 1.41A10 10 0 0 1 2.93 4.93a10 10 0 0 1 14.14-1.41" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  PDF: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  TrendUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Dollar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Crown: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M2 20h20v2H2v-2zm2-3l3-9 5 5 5-5 3 9H4z" />
    </svg>
  ),
};

// ── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0a0a",
  surface: "#111111",
  surfaceHover: "#181818",
  border: "#2a2218",
  gold: "#c9952a",
  goldLight: "#e8b84b",
  goldDim: "#8a6420",
  text: "#f0e6d3",
  textMuted: "#8a7a60",
  green: "#2ecc71",
  red: "#e74c3c",
  amber: "#f39c12",
};

// ── Reusable tiny components ──────────────────────────────────────────────────
const GoldBtn = ({ children, onClick, className = "", disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={className}
    style={{
      background: disabled ? "#3a2e1a" : `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
      color: disabled ? C.textMuted : "#0a0a0a",
      fontWeight: 700,
      borderRadius: 10,
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all .2s",
      padding: "10px 22px",
      fontSize: 14,
      letterSpacing: ".3px",
    }}
  >
    {children}
  </button>
);

const StatCard = ({ icon, label, value, delta, gold }) => (
  <div
    style={{
      background: gold ? `linear-gradient(135deg, ${C.gold}, ${C.goldDim})` : C.surface,
      border: `1px solid ${gold ? "transparent" : C.border}`,
      borderRadius: 16,
      padding: "22px 24px",
      flex: 1,
      minWidth: 160,
    }}
  >
    <div style={{ color: gold ? "#0a0a0a" : C.gold, marginBottom: 10, opacity: .9 }}>{icon}</div>
    <div style={{ color: gold ? "#0a0a0a80" : C.textMuted, fontSize: 12, marginBottom: 4 }}>{label}</div>
    <div style={{ color: gold ? "#0a0a0a" : C.text, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
    <div style={{ color: gold ? "#0a0a0a99" : C.green, fontSize: 12, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
      <Icon.TrendUp /> {delta}
    </div>
  </div>
);

// ── Progress bar for uploads ──────────────────────────────────────────────────
const ProgressBar = ({ pct }) => (
  <div style={{ background: C.border, borderRadius: 99, height: 6, marginTop: 8 }}>
    <div
      style={{
        width: `${pct}%`,
        height: "100%",
        borderRadius: 99,
        background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
        transition: "width .3s",
      }}
    />
  </div>
);

// ── Mini income chart (SVG sparkline) ─────────────────────────────────────────
const Sparkline = () => {
  const pts = [30, 45, 38, 60, 52, 70, 65, 85, 78, 95, 88, 100];
  const w = 220, h = 80;
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
  const ys = pts.map((v) => h - (v / 100) * h);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = d + ` L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 80, overflow: "visible" }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.gold} stopOpacity=".45" />
          <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={d} fill="none" stroke={C.goldLight} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ── Mock recent uploads ───────────────────────────────────────────────────────
const MOCK_UPLOADS = [
  { id: "1", name: "Data Structures.pdf", type: "PDF", size: "2.4 MB", date: "May 1, 2026", status: "Published" },
  { id: "2", name: "Web Development.mp4", type: "Video", size: "128 MB", date: "Apr 30, 2026", status: "Published" },
  { id: "3", name: "Database Systems.pdf", type: "PDF", size: "3.1 MB", date: "Apr 29, 2026", status: "Published" },
  { id: "4", name: "Python Tutorial.mp4", type: "Video", size: "245 MB", date: "Apr 28, 2026", status: "Published" },
  { id: "5", name: "AI Basics.pdf", type: "PDF", size: "1.8 MB", date: "Apr 27, 2026", status: "Published" },
];

// ── NAV items ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", Icon: Icon.Home },
  { id: "upload", label: "Upload Content", Icon: Icon.Upload },
  { id: "uploads", label: "All Uploads", Icon: Icon.AllUploads },
  { id: "income", label: "Income", Icon: Icon.Income },
  { id: "courses", label: "Courses", Icon: Icon.Courses },
  { id: "students", label: "Students", Icon: Icon.Students },
  { id: "messages", label: "Messages", Icon: Icon.Messages },
  { id: "settings", label: "Settings", Icon: Icon.Settings },
];

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function Admin() {
  const [activePage, setActivePage] = useState("dashboard");

  // ── Upload form state ──
  const [uploadTab, setUploadTab] = useState("pdf"); // "pdf" | "video"
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

  const pdfDropRef = useRef();
  const videoDropRef = useRef();

  // ── Helpers ──
  const uploadFileWithProgress = (storageRef, file, onProgress) =>
    new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file);
      task.on(
        "state_changed",
        (snap) => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject)
      );
    });

  const handleUpload = async () => {
    if (!title.trim()) return setUploadMsg("⚠️ Course title is required.");
    if (uploadTab === "pdf" && !pdfFile) return setUploadMsg("⚠️ Please select a PDF file.");
    if (uploadTab === "video" && !videoFile) return setUploadMsg("⚠️ Please select a video file.");

    setUploading(true);
    setUploadProgress(0);
    setUploadMsg("Uploading…");

    try {
      let thumbnailURL = "";
      let fileURL = "";

      // Thumbnail (optional)
      if (thumbnail) {
        setUploadMsg("Uploading thumbnail…");
        const tRef = ref(storage, `thumbnails/${Date.now()}_${thumbnail.name}`);
        thumbnailURL = await uploadFileWithProgress(tRef, thumbnail, (p) =>
          setUploadProgress(Math.round(p * 0.2))
        );
      }

      // Main file
      if (uploadTab === "pdf") {
        setUploadMsg("Uploading PDF…");
        const pRef = ref(storage, `pdfs/${Date.now()}_${pdfFile.name}`);
        fileURL = await uploadFileWithProgress(pRef, pdfFile, (p) =>
          setUploadProgress(20 + Math.round(p * 0.7))
        );
      } else {
        setUploadMsg("Uploading video…");
        const vRef = ref(storage, `videos/${Date.now()}_${videoFile.name}`);
        fileURL = await uploadFileWithProgress(vRef, videoFile, (p) =>
          setUploadProgress(20 + Math.round(p * 0.7))
        );
      }

      // Save to Firestore
      setUploadMsg("Saving to database…");
      setUploadProgress(95);
      const docData = {
        title,
        description,
        price: Number(price) || 0,
        thumbnailURL,
        type: uploadTab === "pdf" ? "PDF" : "Video",
        fileURL,
        createdAt: Date.now(),
        status: "Published",
      };
      await addDoc(collection(db, "courses"), docData);

      setUploadProgress(100);
      setUploadMsg("✅ Uploaded successfully!");
      setUploads((prev) => [
        {
          id: Date.now().toString(),
          name: uploadTab === "pdf" ? pdfFile.name : videoFile.name,
          type: uploadTab === "pdf" ? "PDF" : "Video",
          size: uploadTab === "pdf"
            ? (pdfFile.size / 1048576).toFixed(1) + " MB"
            : (videoFile.size / 1048576).toFixed(1) + " MB",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          status: "Published",
        },
        ...prev,
      ]);

      // Reset
      setTitle("");
      setDescription("");
      setPrice("");
      setThumbnail(null);
      setPdfFile(null);
      setVideoFile(null);
    } catch (err) {
      setUploadMsg("❌ " + (err.message || "Upload failed."));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (id) => setUploads((prev) => prev.filter((u) => u.id !== id));

  // ── Drag-drop ──
  const handleDrop = (e, setter) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setter(file);
  };

  // ═══════════════════ RENDER ════════════════════════════════════════════════
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: 220,
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, borderRadius: 8, padding: "6px 8px", color: "#0a0a0a" }}>
              <Icon.Book />
            </div>
            <div>
              <div style={{ color: C.goldLight, fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>DREAM CRT</div>
              <div style={{ color: C.textMuted, fontSize: 10, letterSpacing: 2 }}>LEARN &amp; EARN</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV.map(({ id, label, Icon: I }) => {
            const active = activePage === id;
            return (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: active ? `linear-gradient(135deg, ${C.gold}, ${C.goldDim})` : "transparent",
                  color: active ? "#0a0a0a" : C.textMuted,
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  marginBottom: 2,
                  textAlign: "left",
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = C.surfaceHover; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <I />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0a0a", fontWeight: 800, fontSize: 15 }}>A</div>
            <div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Welcome back,</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Admin</div>
            </div>
          </div>
          <div style={{ background: `${C.gold}22`, border: `1px solid ${C.goldDim}`, borderRadius: 8, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon.Crown />
            <span style={{ fontSize: 12, color: C.goldLight, fontWeight: 600 }}>Premium Instructor</span>
          </div>
          <button
            onClick={() => setActivePage("logout")}
            style={{ width: "100%", marginTop: 10, display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent", color: C.textMuted, cursor: "pointer", fontSize: 14 }}
          >
            <Icon.Logout /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {/* Topbar */}
        <header
          style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.goldLight }}>
              {activePage === "dashboard" && "Dashboard"}
              {activePage === "upload" && "Upload Content"}
              {activePage === "uploads" && "All Uploads"}
              {activePage === "income" && "Income"}
              {activePage === "courses" && "Courses"}
              {activePage === "students" && "Students"}
              {activePage === "messages" && "Messages"}
              {activePage === "settings" && "Settings"}
            </div>
            <div style={{ color: C.textMuted, fontSize: 13 }}>Welcome back, Admin</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button style={{ background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 10px", color: C.textMuted, cursor: "pointer", position: "relative" }}>
              <Icon.Bell />
              <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, background: C.red, borderRadius: "50%" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 14px", cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#0a0a0a" }}>A</div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Admin</span>
              <span style={{ color: C.textMuted, fontSize: 11 }}>▾</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: 32, flex: 1 }}>
          {/* ════ DASHBOARD ════ */}
          {activePage === "dashboard" && (
            <div>
              {/* Stats */}
              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <StatCard icon={<Icon.Courses />} label="Total Courses" value="24" delta="+5 this month" />
                <StatCard icon={<Icon.Upload />} label="Total Uploads" value="87" delta="+12 this month" />
                <StatCard icon={<Icon.Students />} label="Total Students" value="1,245" delta="+98 this month" />
                <StatCard icon={<Icon.Dollar />} label="Total Income" value="$5,680" delta="+18% this month" gold />
              </div>

              {/* Upload + Quick Upload */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
                {/* Upload New Content */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ color: C.goldLight, fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Upload New Content</div>
                  <div style={{ display: "flex", marginBottom: 16, background: C.bg, borderRadius: 10, padding: 4 }}>
                    {["pdf", "video"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setUploadTab(t)}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                          background: uploadTab === t ? `linear-gradient(135deg, ${C.gold}, ${C.goldDim})` : "transparent",
                          color: uploadTab === t ? "#0a0a0a" : C.textMuted,
                          fontWeight: uploadTab === t ? 700 : 500, fontSize: 13, transition: "all .15s",
                        }}
                      >
                        {t === "pdf" ? "📄 Upload PDF" : "🎬 Upload Video"}
                      </button>
                    ))}
                  </div>

                  {/* Drop zone */}
                  <div
                    ref={uploadTab === "pdf" ? pdfDropRef : videoDropRef}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, uploadTab === "pdf" ? setPdfFile : setVideoFile)}
                    onClick={() => document.getElementById(`file-input-${uploadTab}`).click()}
                    style={{
                      border: `2px dashed ${C.goldDim}`, borderRadius: 12, padding: "30px 20px",
                      textAlign: "center", cursor: "pointer", background: `${C.gold}08`, transition: "all .2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.goldLight)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.goldDim)}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{uploadTab === "pdf" ? "📄" : "🎬"}</div>
                    <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 4 }}>
                      {uploadTab === "pdf"
                        ? (pdfFile ? pdfFile.name : "Drag & drop your PDF file here")
                        : (videoFile ? videoFile.name : "Drag & drop your video file here")}
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 11, marginBottom: 12 }}>or click to browse</div>
                    <GoldBtn>Choose {uploadTab === "pdf" ? "PDF" : "Video"} File</GoldBtn>
                    <input
                      id={`file-input-${uploadTab}`}
                      type="file"
                      accept={uploadTab === "pdf" ? ".pdf" : "video/*"}
                      style={{ display: "none" }}
                      onChange={(e) => (uploadTab === "pdf" ? setPdfFile : setVideoFile)(e.target.files[0])}
                    />
                    <div style={{ color: C.textMuted, fontSize: 11, marginTop: 10 }}>
                      {uploadTab === "pdf" ? "Max file size: 50MB | PDF only" : "Supported: mp4, mov, avi | Max 2GB"}
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePage("upload")}
                    style={{ marginTop: 14, width: "100%", padding: "10px 0", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.gold, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                  >
                    Fill in course details →
                  </button>
                </div>

                {/* Quick Upload */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ color: C.goldLight, fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Quick Upload</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[
                      { icon: "📄", title: "Upload PDF", sub: "Upload study materials, notes, books", tab: "pdf" },
                      { icon: "🎬", title: "Upload Video", sub: "Upload video lectures, tutorials, courses", tab: "video" },
                    ].map(({ icon, title, sub, tab }) => (
                      <div
                        key={tab}
                        style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, textAlign: "center" }}
                      >
                        <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
                        <div style={{ color: C.goldLight, fontWeight: 700, marginBottom: 6 }}>{title}</div>
                        <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 14 }}>{sub}</div>
                        <GoldBtn onClick={() => { setUploadTab(tab); setActivePage("upload"); }}>
                          {title}
                        </GoldBtn>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Uploads + Income Overview */}
              <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20 }}>
                <UploadsTable uploads={uploads.slice(0, 5)} onDelete={handleDelete} />
                {/* Income Overview */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ color: C.goldLight, fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Income Overview</div>
                  <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 4 }}>Total Income</div>
                  <div style={{ color: C.text, fontSize: 34, fontWeight: 800, marginBottom: 4 }}>$5,680</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.green, fontSize: 13, marginBottom: 6 }}>
                    <Icon.TrendUp /> 18%
                  </div>
                  <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 14 }}>vs last month</div>
                  <Sparkline />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
                    {[
                      { label: "This Month", val: "$1,240", delta: "+12%" },
                      { label: "Last Month", val: "$1,105", delta: "+8%" },
                      { label: "Total Withdrawn", val: "$2,350", delta: "" },
                    ].map(({ label, val, delta }) => (
                      <div key={label} style={{ background: C.bg, borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
                        <div style={{ color: C.textMuted, fontSize: 11, marginBottom: 4 }}>{label}</div>
                        <div style={{ color: C.text, fontWeight: 800, fontSize: 15 }}>{val}</div>
                        {delta && <div style={{ color: C.green, fontSize: 11, marginTop: 2 }}>{delta}</div>}
                      </div>
                    ))}
                  </div>
                  <button
                    style={{ marginTop: 16, width: "100%", padding: "10px 0", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.gold, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                    onClick={() => setActivePage("income")}
                  >
                    View Income Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ UPLOAD CONTENT ════ */}
          {activePage === "upload" && (
            <div style={{ maxWidth: 720 }}>
              {/* Tabs */}
              <div style={{ display: "flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, marginBottom: 28, width: "fit-content" }}>
                {["pdf", "video"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setUploadTab(t)}
                    style={{
                      padding: "9px 28px", borderRadius: 9, border: "none", cursor: "pointer",
                      background: uploadTab === t ? `linear-gradient(135deg, ${C.gold}, ${C.goldDim})` : "transparent",
                      color: uploadTab === t ? "#0a0a0a" : C.textMuted,
                      fontWeight: uploadTab === t ? 700 : 500, fontSize: 14, transition: "all .15s",
                    }}
                  >
                    {t === "pdf" ? "📄 Upload PDF" : "🎬 Upload Video"}
                  </button>
                ))}
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 32 }}>
                <Field label="Course Title *" value={title} onChange={setTitle} placeholder="e.g. Complete Python Bootcamp" />
                <Field label="Description" value={description} onChange={setDescription} placeholder="What will students learn?" textarea />
                <Field label="Price (USD)" value={price} onChange={setPrice} placeholder="0.00" type="number" />

                {/* Thumbnail */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", color: C.textMuted, fontSize: 13, marginBottom: 8, fontWeight: 600 }}>Thumbnail (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    style={{ color: C.textMuted, fontSize: 13 }}
                  />
                  {thumbnail && <div style={{ marginTop: 6, fontSize: 12, color: C.green }}>✓ {thumbnail.name}</div>}
                </div>

                {/* File drop zone */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", color: C.textMuted, fontSize: 13, marginBottom: 8, fontWeight: 600 }}>
                    {uploadTab === "pdf" ? "PDF File *" : "Video File *"}
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, uploadTab === "pdf" ? setPdfFile : setVideoFile)}
                    onClick={() => document.getElementById("main-file-input").click()}
                    style={{
                      border: `2px dashed ${C.goldDim}`, borderRadius: 12, padding: "28px 20px",
                      textAlign: "center", cursor: "pointer", background: `${C.gold}06`, transition: "all .2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.goldLight)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.goldDim)}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{uploadTab === "pdf" ? "📄" : "🎬"}</div>
                    <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>
                      {uploadTab === "pdf"
                        ? (pdfFile ? `✓ ${pdfFile.name}` : "Drag & drop PDF or click to browse")
                        : (videoFile ? `✓ ${videoFile.name}` : "Drag & drop video or click to browse")}
                    </div>
                    <GoldBtn>Choose File</GoldBtn>
                    <input
                      id="main-file-input"
                      type="file"
                      accept={uploadTab === "pdf" ? ".pdf" : "video/*"}
                      style={{ display: "none" }}
                      onChange={(e) => (uploadTab === "pdf" ? setPdfFile : setVideoFile)(e.target.files[0])}
                    />
                  </div>
                </div>

                {/* Progress */}
                {uploading && (
                  <div style={{ marginBottom: 16 }}>
                    <ProgressBar pct={uploadProgress} />
                    <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>{uploadProgress}%</div>
                  </div>
                )}

                {uploadMsg && (
                  <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: uploadMsg.startsWith("✅") ? "#1a3a2a" : uploadMsg.startsWith("❌") ? "#3a1a1a" : "#2a2a1a", fontSize: 13 }}>
                    {uploadMsg}
                  </div>
                )}

                <GoldBtn onClick={handleUpload} disabled={uploading} className="">
                  {uploading ? "Uploading…" : `Upload ${uploadTab === "pdf" ? "PDF" : "Video"}`}
                </GoldBtn>
              </div>
            </div>
          )}

          {/* ════ ALL UPLOADS ════ */}
          {activePage === "uploads" && (
            <UploadsTable uploads={uploads} onDelete={handleDelete} full />
          )}

          {/* ════ INCOME ════ */}
          {activePage === "income" && (
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <StatCard icon={<Icon.Dollar />} label="Total Income" value="$5,680" delta="+18% this month" gold />
                <StatCard icon={<Icon.Income />} label="This Month" value="$1,240" delta="+12% vs last month" />
                <StatCard icon={<Icon.Income />} label="Last Month" value="$1,105" delta="+8% vs prev month" />
                <StatCard icon={<Icon.Income />} label="Total Withdrawn" value="$2,350" delta="All time" />
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
                <div style={{ color: C.goldLight, fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Income Chart</div>
                <Sparkline />
                <div style={{ color: C.textMuted, fontSize: 12, textAlign: "center", marginTop: 8 }}>Last 12 months</div>
              </div>
            </div>
          )}

          {/* ════ Placeholder pages ════ */}
          {["courses", "students", "messages", "settings"].includes(activePage) && (
            <PlaceholderPage label={activePage} />
          )}
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, textarea, type = "text" }) {
  const base = {
    width: "100%", padding: "12px 14px", borderRadius: 10, marginBottom: 16,
    background: "#0e0e0e", border: `1px solid ${C.border}`, color: C.text,
    fontSize: 14, outline: "none", boxSizing: "border-box",
  };
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{ display: "block", color: C.textMuted, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>{label}</label>
      {textarea
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} style={{ ...base, resize: "vertical" }} />
        : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} />}
    </div>
  );
}

function UploadsTable({ uploads, onDelete, full }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
      <div style={{ color: C.goldLight, fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
        {full ? "All Uploads" : "Recent Uploads"}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {["File Name", "Type", "Size", "Date", "Status", "Actions"].map((h) => (
              <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.gold, fontWeight: 600, fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uploads.map((u) => (
            <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}22` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "10px 10px", display: "flex", alignItems: "center", gap: 8, color: C.text }}>
                <span style={{ color: u.type === "PDF" ? C.red : C.amber }}>{u.type === "PDF" ? <Icon.PDF /> : <Icon.Video />}</span>
                {u.name}
              </td>
              <td style={{ padding: "10px 10px" }}>
                <span style={{ background: u.type === "PDF" ? "#3a1a1a" : "#2a2210", color: u.type === "PDF" ? C.red : C.amber, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                  {u.type}
                </span>
              </td>
              <td style={{ padding: "10px 10px", color: C.textMuted }}>{u.size}</td>
              <td style={{ padding: "10px 10px", color: C.textMuted }}>{u.date}</td>
              <td style={{ padding: "10px 10px" }}>
                <span style={{ background: "#1a3a1a", color: C.green, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                  {u.status}
                </span>
              </td>
              <td style={{ padding: "10px 10px" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", padding: 4 }}><Icon.Eye /></button>
                  <button onClick={() => onDelete(u.id)} style={{ background: "transparent", border: "none", color: C.red, cursor: "pointer", padding: 4 }}><Icon.Trash /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlaceholderPage({ label }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🚧</div>
      <div style={{ color: C.goldLight, fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
        {label.charAt(0).toUpperCase() + label.slice(1)} Page
      </div>
      <div style={{ color: C.textMuted, fontSize: 14 }}>Coming soon — connect your Firestore data here.</div>
    </div>
  );
}