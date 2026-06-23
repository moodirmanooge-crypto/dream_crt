import { useEffect, useState, useRef } from "react";
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, updateDoc, increment,
} from "firebase/firestore";
import { db, auth } from "../firebase/config.js";
import { onAuthStateChanged } from "firebase/auth";

export default function Archives() {
  const [user, setUser]           = useState(null);
  const [tab, setTab]             = useState("gallery");
  const [archives, setArchives]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [deleting, setDeleting]   = useState(null); // id being deleted

  const [upCaption, setUpCaption] = useState("");
  const [upType, setUpType]       = useState("Shahaado");
  const [upFile, setUpFile]       = useState(null);
  const [upPreview, setUpPreview] = useState(null);
  const [upError, setUpError]     = useState("");
  const [lightbox, setLightbox]   = useState(null);
  const fileRef = useRef();

  // ── Auth ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => { fetchArchives(); }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetchArchives = async () => {
    setLoading(true);
    try {
      const q    = query(collection(db, "archives"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setArchives(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // ── File pick ─────────────────────────────────────────────────────────
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUpError("Fadlan sawir kaliya soo geli (JPG, PNG, WEBP)."); return; }
    if (file.size > 5 * 1024 * 1024)    { setUpError("Faylku waa inuu ka yar yahay 5MB."); return; }
    setUpError("");
    setUpFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setUpPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Upload ────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!user)    { setUpError("Fadlan login samee."); return; }
    if (!upFile)  { setUpError("Sawir soo dooro."); return; }
    setUpError("");
    setUploading(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload  = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(upFile);
      });
      await addDoc(collection(db, "archives"), {
        name:        user.displayName || user.email.split("@")[0],
        email:       user.email,
        uid:         user.uid,
        caption:     upCaption.trim(),
        type:        upType,
        imageBase64: base64,
        approved:    true,
        views:       0,
        createdAt:   Date.now(),
      });
      setUploadDone(true);
      setUpCaption(""); setUpFile(null); setUpPreview(null); setUpType("Shahaado");
      if (fileRef.current) fileRef.current.value = "";
      fetchArchives();
    } catch (err) { setUpError("Khalad: " + err.message); }
    setUploading(false);
  };

  // ── Delete (owner only) ───────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Sawirkaan tirtiraysaa?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "archives", id));
      setArchives((prev) => prev.filter((a) => a.id !== id));
      if (lightbox?.id === id) setLightbox(null);
    } catch (err) { alert("Khalad: " + err.message); }
    setDeleting(null);
  };

  // ── Open lightbox + increment views ──────────────────────────────────
  const openLightbox = async (item) => {
    setLightbox(item);
    try {
      await updateDoc(doc(db, "archives", item.id), { views: increment(1) });
      setArchives((prev) =>
        prev.map((a) => a.id === item.id ? { ...a, views: (a.views || 0) + 1 } : a)
      );
    } catch (_) {}
  };

  const shahaadoList = archives.filter((a) => a.type === "Shahaado");
  const sawirList    = archives.filter((a) => a.type === "Sawir");

  return (
    <div className="min-h-screen text-white" style={{ background: "#0d0d0d" }}>

      {/* NAV */}
      <nav className="flex items-center justify-between px-5 md:px-10 py-4 sticky top-0 z-50"
        style={{ background: "rgba(13,13,13,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <a href="/" className="font-black text-xl md:text-2xl tracking-tight" style={{ color: "#f5c518", textDecoration: "none" }}>
          DREAM CRT
        </a>
        <a href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm"
          style={{ border: "1px solid rgba(245,197,24,0.3)", color: "#f5c518", textDecoration: "none" }}>
          ← Home
        </a>
      </nav>

      {/* HERO */}
      <div className="text-center px-5 py-14 md:py-20"
        style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #1a1200 50%, #0d0d0d 100%)", borderBottom: "1px solid rgba(245,197,24,0.1)" }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
          style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", color: "#f5c518" }}>
          🏆 Achievements
        </div>
        <h1 className="font-black text-3xl md:text-5xl mb-3">
          Shahaadooyinka &amp; <span style={{ color: "#f5c518" }}>Sawirrada</span>
        </h1>
        <p className="text-sm md:text-base" style={{ color: "#64748b", maxWidth: 500, margin: "0 auto" }}>
          Ardayda DREAM CRT ee shahaadooyinka iyo sawirrada guusha ka wadaaga bulshada.
        </p>
      </div>

      {/* TABS */}
      <div className="flex justify-center gap-3 px-5 py-6">
        {[{ key: "gallery", label: "🖼️ Gallery" }, { key: "upload", label: "⬆️ Soo Geli" }].map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setUploadDone(false); }}
            style={{
              padding: "10px 24px", borderRadius: "12px", fontWeight: 700, fontSize: "14px",
              cursor: "pointer", transition: "all 0.2s",
              border: tab === t.key ? "1px solid #f5c518" : "1px solid rgba(255,255,255,0.08)",
              background: tab === t.key ? "rgba(245,197,24,0.12)" : "transparent",
              color: tab === t.key ? "#f5c518" : "#64748b",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GALLERY TAB ── */}
      {tab === "gallery" && (
        <div className="px-5 md:px-14 pb-20">
          {loading ? (
            <div className="text-center py-20" style={{ color: "#64748b" }}>
              <div className="text-4xl mb-3">⏳</div><p>Loading...</p>
            </div>
          ) : (
            <>
              <Section
                title="🎓 Shahaadooyinka" color="#f5c518"
                items={shahaadoList} onOpen={openLightbox}
                currentUid={user?.uid} onDelete={handleDelete} deleting={deleting}
              />
              <Section
                title="📸 Sawirrada Guusha" color="#a78bfa"
                items={sawirList} onOpen={openLightbox}
                currentUid={user?.uid} onDelete={handleDelete} deleting={deleting}
              />
              {shahaadoList.length === 0 && sawirList.length === 0 && (
                <div className="text-center py-20" style={{ color: "#64748b" }}>
                  <div className="text-5xl mb-3">🗂️</div>
                  <p>Weli waxba lama soo gelin. Adigu ku bilow!</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── UPLOAD TAB ── */}
      {tab === "upload" && (
        <div className="px-5 pb-20 flex justify-center">
          <div className="w-full max-w-lg rounded-3xl p-7 md:p-10"
            style={{ background: "#0f0f0f", border: "1px solid rgba(245,197,24,0.2)" }}>

            {/* Not logged in */}
            {!user ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">🔐</div>
                <p style={{ color: "#64748b", marginBottom: 16 }}>Sawir soo geliso, marka hore login samee.</p>
                <a href="/login"
                  style={{ padding: "12px 32px", borderRadius: 12, background: "#f5c518", color: "#000", fontWeight: 900, textDecoration: "none", display: "inline-block" }}>
                  Login
                </a>
              </div>
            ) : uploadDone ? (
              /* Success */
              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl"
                  style={{ background: "rgba(245,197,24,0.08)", border: "2px solid #f5c518" }}>✅</div>
                <h3 className="text-2xl font-black mb-2">La <span style={{ color: "#f5c518" }}>Gudbiyay!</span></h3>
                <p className="text-sm mb-6" style={{ color: "#64748b" }}>
                  Sawirkaaagu waa la dhejiyay gallery-ga. Si toos ah ayuu u muuqanayaa!
                </p>
                <button onClick={() => setUploadDone(false)}
                  style={{ padding: "12px 32px", borderRadius: "12px", background: "#f5c518", color: "#000", fontWeight: 900, border: "none", cursor: "pointer" }}>
                  Mar Kale Soo Geli
                </button>
              </div>
            ) : (
              /* Upload form */
              <>
                <h2 className="text-2xl font-black mb-2" style={{ color: "#f5c518" }}>⬆️ Soo Geli Sawirgaaga</h2>

                {/* Auto name badge */}
                <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.15)" }}>
                  <span style={{ fontSize: 18 }}>👤</span>
                  <div>
                    <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>MAGACAAGA</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#f5c518", margin: 0 }}>
                      {user.displayName || user.email.split("@")[0]}
                    </p>
                  </div>
                </div>

                {/* Type */}
                <div className="flex gap-3 mb-5">
                  {["Shahaado", "Sawir"].map((t) => (
                    <button key={t} onClick={() => setUpType(t)}
                      style={{
                        flex: 1, padding: "10px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer",
                        border: upType === t ? "1px solid #f5c518" : "1px solid rgba(255,255,255,0.08)",
                        background: upType === t ? "rgba(245,197,24,0.1)" : "transparent",
                        color: upType === t ? "#f5c518" : "#64748b",
                      }}>
                      {t === "Shahaado" ? "🎓 Shahaado" : "📸 Sawir"}
                    </button>
                  ))}
                </div>

                <label style={labelStyle}>Faallo / Caption</label>
                <textarea
                  value={upCaption} onChange={(e) => setUpCaption(e.target.value)}
                  placeholder="Sharax yar ama faallo..." rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />

                <label style={labelStyle}>Sawirka / Shahaadada</label>
                <div onClick={() => fileRef.current?.click()}
                  style={{
                    border: "2px dashed rgba(245,197,24,0.3)", borderRadius: "14px", padding: "24px",
                    textAlign: "center", cursor: "pointer",
                    background: upPreview ? "transparent" : "rgba(245,197,24,0.03)",
                    marginBottom: "10px", position: "relative", overflow: "hidden",
                  }}>
                  {upPreview
                    ? <img src={upPreview} alt="preview" style={{ maxHeight: 220, borderRadius: 10, objectFit: "contain", margin: "0 auto", display: "block" }} />
                    : (<><div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
                        <p style={{ color: "#f5c518", fontWeight: 700, fontSize: 14 }}>Sawirka halkaan ku riix si aad u soo geliso</p>
                        <p style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>JPG, PNG, WEBP · Max 5MB</p></>)}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                {upPreview && (
                  <button onClick={() => { setUpFile(null); setUpPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    style={{ fontSize: 12, color: "#ff4757", background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}>
                    ✕ Sawirka Tirtir
                  </button>
                )}

                {upError && (
                  <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.3)", color: "#ff4757", fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
                    ⚠️ {upError}
                  </div>
                )}

                <button onClick={handleUpload} disabled={uploading}
                  style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "#f5c518", color: "#000", fontWeight: 900, fontSize: 15, border: "none", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>
                  {uploading ? "⏳ Uploading..." : "⬆️ Soo Geli / Submit"}
                </button>
                <p style={{ textAlign: "center", color: "#2d3748", fontSize: 11, marginTop: 12 }}>
                  Sawirkaagu si toos ah ayuu gallery-ga ugu muuqan doonaa.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: "rgba(0,0,0,0.93)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightbox(null)}>
          <div
            style={{ maxWidth: 680, width: "100%", borderRadius: 20, overflow: "hidden", background: "#111", border: "1px solid rgba(245,197,24,0.2)", position: "relative" }}
            onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.imageBase64} alt={lightbox.name} style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", display: "block" }} />
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <p style={{ fontWeight: 800, fontSize: 16, color: "#fff", margin: 0 }}>{lightbox.name}</p>
                {/* Views */}
                <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                  👁️ {(lightbox.views || 0) + 1}
                </span>
              </div>
              {lightbox.caption && <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>{lightbox.caption}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: lightbox.type === "Shahaado" ? "rgba(245,197,24,0.12)" : "rgba(167,139,250,0.12)",
                  color: lightbox.type === "Shahaado" ? "#f5c518" : "#a78bfa",
                }}>
                  {lightbox.type === "Shahaado" ? "🎓 Shahaado" : "📸 Sawir"}
                </span>
                {/* Delete in lightbox — owner only */}
                {user?.uid === lightbox.uid && (
                  <button
                    onClick={() => handleDelete(lightbox.id)}
                    disabled={deleting === lightbox.id}
                    style={{ fontSize: 12, color: "#ff4757", background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontWeight: 700 }}>
                    {deleting === lightbox.id ? "⏳" : "🗑️ Tirtir"}
                  </button>
                )}
              </div>
            </div>
            <button onClick={() => setLightbox(null)}
              style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section component ─────────────────────────────────────────────────
function Section({ title, color, items, onOpen, currentUid, onDelete, deleting }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-14">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-black" style={{ color }}>{title}</h2>
        <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}33` }}>
          {items.length}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id}
            style={{ borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", transition: "all 0.2s", position: "relative" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${color}55`; e.currentTarget.style.boxShadow = `0 12px 32px ${color}18`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}>

            {/* Delete button — owner only, top-right corner */}
            {currentUid === item.uid && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                disabled={deleting === item.id}
                title="Tirtir"
                style={{
                  position: "absolute", top: 8, right: 8, zIndex: 2,
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(0,0,0,0.75)", border: "1px solid rgba(255,71,87,0.5)",
                  color: "#ff4757", fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                {deleting === item.id ? "⏳" : "🗑️"}
              </button>
            )}

            <div onClick={() => onOpen(item)}>
              <img src={item.imageBase64} alt={item.name} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
              <div style={{ padding: "10px 12px" }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 2 }}>{item.name}</p>
                {item.caption && (
                  <p style={{ fontSize: 11, color: "#64748b", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {item.caption}
                  </p>
                )}
                {/* Views */}
                <p style={{ fontSize: 10, color: "#374151", marginTop: 4 }}>👁️ {item.views || 0} views</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────
const labelStyle = {
  display: "block", color: "#94a3b8", fontSize: 11, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8,
};
const inputStyle = {
  width: "100%", padding: "13px 15px", borderRadius: 12, background: "#000",
  border: "1px solid rgba(245,197,24,0.2)", color: "#fff", fontSize: 14,
  outline: "none", marginBottom: 16, boxSizing: "border-box", fontFamily: "inherit",
};