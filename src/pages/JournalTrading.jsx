import { useEffect, useState, useRef } from "react";
import {
  addDoc, collection, query, where, doc, updateDoc, getDoc, setDoc,
  onSnapshot, deleteDoc, orderBy, arrayUnion, arrayRemove, getDocs,
} from "firebase/firestore";
import { db, auth, storage } from "../firebase/config";
import {
  FaChartLine, FaHistory, FaBrain, FaChartPie, FaCog, FaSearch, FaBell,
  FaPlus, FaSave, FaCamera, FaRocket, FaImage, FaVideo, FaChartBar,
  FaPaperPlane, FaTimes, FaUpload, FaTrophy, FaFire, FaArrowUp, FaArrowDown,
  FaCalculator, FaBullseye, FaClock, FaTrash, FaCheckCircle, FaHome, FaUsers,
  FaWallet, FaExchangeAlt, FaBalanceScale, FaEdit, FaHeart, FaRegHeart,
  FaComment, FaShare, FaUserPlus, FaUserCheck, FaEye, FaWhatsapp, FaTelegram,
  FaLink, FaUserCircle, FaReply, FaMoon, FaDollarSign, FaChevronUp, FaShieldAlt,
  FaStar, FaGlobe, FaChevronDown, FaBars, FaFilter, FaSortAmountDown, FaSortAmountUp,
  FaExpandAlt, FaCalendarAlt, FaUser, FaEnvelope, FaIdCard, FaExternalLinkAlt,
  FaBoxOpen, FaPercentage,
} from "react-icons/fa";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const CURRENCY_PAIRS = [
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD",
  "GBPJPY","EURJPY","EURGBP","XAUUSD","XAGUSD","US30","NAS100","SPX500","BTCUSD","ETHUSD",
];

// ── GOLD / BLACK THEME ───────────────────────────────────────────────
const GOLD    = "#f5c518";
const GOLD2   = "#ffd84d";
const GOLD3   = "#b8920f";
const GOLD_DIM= "rgba(245,197,24,0.12)";
const GOLD_DIM2="rgba(245,197,24,0.06)";
const MAIN_BG = "#080808";
const SIDE_BG = "#0e0e0e";
const CARD_BG = "#111111";
const CARD2   = "#181818";
const CARD3   = "#1e1e1e";
const BORDER  = "1px solid rgba(255,255,255,0.06)";
const BORDER_G= "1px solid rgba(245,197,24,0.2)";
const TEXT1   = "#ffffff";
const TEXT2   = "#888888";
const TEXT3   = "#444444";
const GREEN   = "#22c55e";
const RED_NEG = "#ef4444";
const BLUE    = "#3b82f6";

// ── MINI SPARKLINE ────────────────────────────────────────────────────
function Spark({ data, color, height = 40 }) {
  if (!data || data.length < 2) return <div style={{ height }} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── STAT CARD ──────────────────────────────────────────────────────────
function StatCard({ label, value, color, change, changeUp, sparkData, prefix = "" }) {
  return (
    <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6, position: "relative", overflow: "hidden" }}>
      <p style={{ color: TEXT2, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>{label}</p>
      <p style={{ color: color || TEXT1, fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>{prefix}{value}</p>
      {change !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: changeUp ? GREEN : RED_NEG, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
            {changeUp ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />} {change}
          </span>
          <span style={{ color: TEXT3, fontSize: 10 }}>vs last month</span>
        </div>
      )}
      {sparkData && (
        <div style={{ position: "absolute", bottom: 0, right: 0, width: "45%", opacity: 0.5 }}>
          <Spark data={sparkData} color={color || GOLD} height={50} />
        </div>
      )}
    </div>
  );
}

// ── SETUP MODAL ────────────────────────────────────────────────────────
function SetupModal({ user, onDone }) {
  const [name, setName] = useState(user?.email?.split("@")[0] || "");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const handleFile = (e) => { const f = e.target.files[0]; if (!f) return; setPhoto(f); setPhotoPreview(URL.createObjectURL(f)); };
  const handleSave = async () => {
    if (!name.trim()) { alert("Magacaaga gali"); return; }
    setSaving(true);
    try {
      let photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=f5c518&color=000&bold=true`;
      if (photo) { const sRef = ref(storage, `profiles/${user.uid}/avatar_${Date.now()}`); await uploadBytes(sRef, photo); photoURL = await getDownloadURL(sRef); }
      const data = { displayName: name.trim(), photoURL, nameChangedAt: Date.now(), strategy: "Not Set", createdAt: Date.now(), setupDone: true, followers: [], following: [], postCount: 0, likeCount: 0 };
      await setDoc(doc(db, "profiles", user.uid), data);
      onDone(data);
    } catch (e) { alert(e.message); }
    setSaving(false);
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.97)", backdropFilter: "blur(16px)" }}>
      <div style={{ width: "100%", maxWidth: 420, borderRadius: 24, overflow: "hidden", background: CARD_BG, border: BORDER_G, boxShadow: "0 0 80px rgba(245,197,24,0.15)" }}>
        <div style={{ padding: "28px 28px 0", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: GOLD_DIM, border: BORDER_G, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <FaChartLine style={{ color: GOLD, fontSize: 22 }} />
          </div>
          <h2 style={{ color: TEXT1, fontWeight: 900, fontSize: 20, margin: "0 0 6px" }}>Setup Your Profile</h2>
          <p style={{ color: TEXT2, fontSize: 13, margin: "0 0 24px" }}>Profile-kaaga samee si dadku kuu garan karaan</p>
        </div>
        <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", border: `2px solid ${GOLD}`, overflow: "hidden", background: GOLD_DIM, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {photoPreview ? <img src={photoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <FaCamera style={{ color: GOLD, fontSize: 24 }} />}
            </div>
            <div style={{ position: "absolute", bottom: 2, right: 2, width: 24, height: 24, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}><FaCamera style={{ color: "#000", fontSize: 10 }} /></div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          <div style={{ width: "100%" }}>
            <label style={{ color: TEXT2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ahmed Trader" style={{ width: "100%", background: CARD2, color: TEXT1, padding: "12px 14px", borderRadius: 10, outline: "none", border: BORDER_G, fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: "13px 0", borderRadius: 10, fontWeight: 900, color: "#000", fontSize: 14, cursor: "pointer", border: "none", background: GOLD, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "🚀 Start Trading Journey"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SHARE MODAL ────────────────────────────────────────────────────────
function ShareModal({ post, onClose }) {
  const shareUrl = `${window.location.origin}/post/${post.id}`;
  const text = encodeURIComponent(post.caption || "Check this trade!");
  const url = encodeURIComponent(shareUrl);
  const opts = [
    { label: "WhatsApp", icon: <FaWhatsapp size={20} />, color: "#25D366", href: `https://wa.me/?text=${text}%20${url}` },
    { label: "Telegram", icon: <FaTelegram size={20} />, color: "#229ED9", href: `https://t.me/share/url?url=${url}&text=${text}` },
    { label: "Copy Link", icon: <FaLink size={20} />, color: GOLD, action: () => { navigator.clipboard.writeText(shareUrl); alert("Copied!"); onClose(); } },
  ];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0", padding: "22px 22px 40px", background: CARD_BG, border: BORDER_G }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ color: TEXT1, fontWeight: 900, fontSize: 16, margin: 0 }}>Share Post</h2>
          <button onClick={onClose} style={{ color: TEXT2, background: "none", border: "none", cursor: "pointer", fontSize: 16 }}><FaTimes /></button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {opts.map(o => o.href ? (
            <a key={o.label} href={o.href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: o.color + "20", border: `1px solid ${o.color}44` }}><span style={{ color: o.color }}>{o.icon}</span></div>
              <span style={{ color: TEXT2, fontSize: 11 }}>{o.label}</span>
            </a>
          ) : (
            <button key={o.label} onClick={o.action} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: o.color + "20", border: `1px solid ${o.color}44` }}><span style={{ color: o.color }}>{o.icon}</span></div>
              <span style={{ color: TEXT2, fontSize: 11 }}>{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── COMMENTS ──────────────────────────────────────────────────────────
function CommentsSection({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  useEffect(() => {
    const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
    return onSnapshot(q, snap => setComments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [postId]);
  const submit = async () => { if (!text.trim() || !currentUser) return; await addDoc(collection(db, "posts", postId, "comments"), { userName: currentUser.displayName || "Trader", userPhoto: currentUser.photoURL || null, text: text.trim(), createdAt: Date.now(), userId: currentUser.uid, replies: [] }); setText(""); };
  const submitReply = async (cid) => { if (!replyText.trim() || !currentUser) return; await updateDoc(doc(db, "posts", postId, "comments", cid), { replies: arrayUnion({ userName: currentUser.displayName || "Trader", userPhoto: currentUser.photoURL || null, text: replyText.trim(), createdAt: Date.now(), userId: currentUser.uid }) }); setReplyText(""); setReplyTo(null); };
  const Av = ({ photo, name, sz = 28 }) => (
    <div style={{ width: sz, height: sz, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: GOLD_DIM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: GOLD }}>
      {photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name?.[0]?.toUpperCase()}
    </div>
  );
  return (
    <div style={{ borderTop: `1px solid rgba(255,255,255,0.05)`, paddingTop: 12, marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 14px 12px" }}>
        <Av photo={currentUser?.photoURL} name={currentUser?.displayName || "U"} />
        <div style={{ flex: 1, display: "flex", gap: 7 }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Write a comment..." style={{ flex: 1, background: CARD2, border: BORDER, borderRadius: 16, padding: "7px 13px", color: TEXT1, fontSize: 12, outline: "none" }} />
          <button onClick={submit} style={{ background: GOLD, color: "#000", border: "none", borderRadius: 16, padding: "7px 13px", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>Post</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 14px 12px" }}>
        {comments.map(c => (
          <div key={c.id}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Av photo={c.userPhoto} name={c.userName} sz={24} />
              <div style={{ flex: 1 }}>
                <div style={{ background: CARD2, borderRadius: "0 10px 10px 10px", padding: "7px 11px", display: "inline-block", maxWidth: "100%" }}>
                  <span style={{ color: GOLD, fontWeight: 700, fontSize: 11, marginRight: 6 }}>{c.userName}</span>
                  <span style={{ color: "#bbb", fontSize: 12 }}>{c.text}</span>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 3, paddingLeft: 2 }}>
                  <span style={{ color: TEXT3, fontSize: 9 }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <button onClick={() => setReplyTo(replyTo?.id === c.id ? null : { id: c.id, userName: c.userName })} style={{ background: "none", border: "none", color: TEXT2, fontSize: 9, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}><FaReply size={7} /> Reply</button>
                </div>
                {(c.replies || []).length > 0 && (
                  <div style={{ marginTop: 6, paddingLeft: 9, borderLeft: `2px solid rgba(245,197,24,0.2)`, display: "flex", flexDirection: "column", gap: 5 }}>
                    {(c.replies || []).map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                        <Av photo={r.userPhoto} name={r.userName} sz={18} />
                        <div style={{ background: CARD2, borderRadius: "0 8px 8px 8px", padding: "5px 9px" }}>
                          <span style={{ color: GOLD, fontWeight: 700, fontSize: 10, marginRight: 5 }}>{r.userName}</span>
                          <span style={{ color: "#999", fontSize: 11 }}>{r.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {replyTo?.id === c.id && (
                  <div style={{ display: "flex", gap: 6, marginTop: 6, paddingLeft: 9 }}>
                    <Av photo={currentUser?.photoURL} name={currentUser?.displayName || "U"} sz={20} />
                    <div style={{ flex: 1, display: "flex", gap: 6 }}>
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === "Enter" && submitReply(c.id)} placeholder={`Reply to ${c.userName}...`} style={{ flex: 1, background: CARD2, border: BORDER, borderRadius: 10, padding: "5px 11px", color: TEXT1, fontSize: 11, outline: "none" }} />
                      <button onClick={() => submitReply(c.id)} style={{ background: GOLD, color: "#000", border: "none", borderRadius: 10, padding: "5px 11px", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>↩</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── POST CARD ──────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onViewProfile }) {
  const [showComments, setShowComments] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [localPost, setLocalPost] = useState({ ...post, likes: Array.isArray(post.likes) ? post.likes : [], followers: Array.isArray(post.followers) ? post.followers : [] });
  const isLiked = localPost.likes.includes(currentUser?.uid);
  const isFollowing = localPost.followers.includes(currentUser?.uid);
  const likePost = async () => {
    if (!currentUser) return;
    const r = doc(db, "posts", localPost.id);
    if (isLiked) { await updateDoc(r, { likes: arrayRemove(currentUser.uid) }); setLocalPost(p => ({ ...p, likes: p.likes.filter(id => id !== currentUser.uid) })); }
    else { await updateDoc(r, { likes: arrayUnion(currentUser.uid) }); setLocalPost(p => ({ ...p, likes: [...p.likes, currentUser.uid] })); }
  };
  const followTrader = async () => {
    if (!currentUser || isFollowing) return;
    await updateDoc(doc(db, "posts", localPost.id), { followers: arrayUnion(currentUser.uid) });
    setLocalPost(p => ({ ...p, followers: [...p.followers, currentUser.uid] }));
    try { await updateDoc(doc(db, "profiles", localPost.uid), { followers: arrayUnion(currentUser.uid) }); } catch (e) { }
  };
  const avatarURL = localPost.profileImage || `https://ui-avatars.com/api/?name=${localPost.userName || "T"}&background=f5c518&color=000&bold=true`;
  return (
    <>
      {shareModal && <ShareModal post={localPost} onClose={() => setShareModal(false)} />}
      <article style={{ background: CARD_BG, border: BORDER, borderRadius: 16, overflow: "hidden", transition: "border-color .2s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(245,197,24,0.25)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 15px 9px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onViewProfile(localPost.uid)}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", border: `2px solid ${GOLD}`, overflow: "hidden" }}><img src={avatarURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: GREEN, border: `2px solid ${CARD_BG}` }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: TEXT1, fontWeight: 700, fontSize: 13 }}>{localPost.userName}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={GOLD}><circle cx="12" cy="12" r="12" /><path d="M9 12l2 2 4-4" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
              </div>
              <span style={{ color: TEXT2, fontSize: 10 }}>{new Date(localPost.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {localPost.uid !== currentUser?.uid && (
            <button onClick={followTrader} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 13px", borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: "pointer", border: isFollowing ? BORDER_G : "none", transition: "all .2s", background: isFollowing ? "transparent" : GOLD, color: isFollowing ? GOLD : "#000" }}>
              {isFollowing ? <><FaUserCheck size={10} />Following</> : <><FaUserPlus size={10} />Follow</>}
            </button>
          )}
        </div>
        {localPost.caption && <div style={{ padding: "0 15px 9px" }}><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{localPost.caption}</p></div>}
        {localPost.mediaURL && localPost.mediaType === "image" && <div style={{ padding: "0 10px 9px" }}><img src={localPost.mediaURL} alt="" style={{ width: "100%", borderRadius: 10, objectFit: "cover", maxHeight: 340, display: "block" }} /></div>}
        {localPost.mediaURL && localPost.mediaType === "video" && <div style={{ padding: "0 10px 9px" }}><video src={localPost.mediaURL} controls style={{ width: "100%", borderRadius: 10, maxHeight: 340 }} /></div>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 15px", borderTop: BORDER }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <FaHeart style={{ color: GOLD, fontSize: 10 }} />
            <span style={{ color: TEXT2, fontSize: 11 }}>{localPost.likes.length}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ color: TEXT2, fontSize: 11 }}>{localPost.commentCount || 0} comments</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", borderTop: BORDER }}>
          {[
            { action: likePost, icon: isLiked ? <FaHeart /> : <FaRegHeart />, label: "Like", color: isLiked ? GOLD : TEXT2 },
            { action: () => setShowComments(!showComments), icon: <FaComment />, label: "Comment", color: showComments ? GOLD : TEXT2 },
            { action: () => setShareModal(true), icon: <FaShare />, label: "Share", color: TEXT2 },
          ].map((b, i) => (
            <button key={i} onClick={b.action} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px 0", background: "none", border: "none", cursor: "pointer", color: b.color, fontSize: 12, fontWeight: 700, borderRight: i < 2 ? BORDER : "none" }}>
              {b.icon} {b.label}
            </button>
          ))}
        </div>
        {showComments && <CommentsSection postId={localPost.id} currentUser={currentUser} />}
      </article>
    </>
  );
}

// ── PROFILE VIEW MODAL ─────────────────────────────────────────────────
function ProfileViewModal({ uid, onClose, currentUser }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMe = uid === currentUser?.uid;
  useEffect(() => {
    const load = async () => {
      try {
        const pSnap = await getDoc(doc(db, "profiles", uid));
        if (pSnap.exists()) setProfile(pSnap.data());
        const pq = query(collection(db, "posts"), where("uid", "==", uid), orderBy("createdAt", "desc"));
        onSnapshot(pq, s => setPosts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const tq = query(collection(db, "trades"), where("userId", "==", uid));
        onSnapshot(tq, s => setTrades(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      } catch (e) { }
      setLoading(false);
    };
    load();
  }, [uid]);
  const wins = trades.filter(t => t.status === "Win").length;
  const closed = trades.filter(t => t.status !== "Open").length;
  const winRate = closed ? Math.round((wins / closed) * 100) : 0;
  const totalPnL = trades.reduce((a, b) => a + Number(b.profit_loss || 0), 0);
  const avatarURL = profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName || "T"}&background=f5c518&color=000&bold=true`;
  const followers = profile?.followers || [];
  const following = profile?.following || [];
  const isFollowing = followers.includes(currentUser?.uid);
  const handleFollow = async () => {
    if (!currentUser || isFollowing) return;
    await updateDoc(doc(db, "profiles", uid), { followers: arrayUnion(currentUser.uid) });
    try { await updateDoc(doc(db, "profiles", currentUser.uid), { following: arrayUnion(uid) }); } catch (e) { }
    setProfile(p => ({ ...p, followers: [...(p.followers || []), currentUser.uid] }));
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "88vh", borderRadius: 22, background: CARD_BG, border: BORDER_G, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(245,197,24,0.12)" }}>
        <div style={{ height: 90, background: "linear-gradient(135deg,rgba(245,197,24,0.25),rgba(245,197,24,0.05))", position: "relative", flexShrink: 0 }}>
          <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, color: TEXT1, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><FaTimes /></button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -44, padding: "0 22px 22px" }}>
            <div style={{ width: 88, height: 88, borderRadius: "50%", border: `3px solid ${GOLD}`, overflow: "hidden", marginBottom: 10, boxShadow: "0 0 20px rgba(245,197,24,0.25)" }}>
              {loading ? <div style={{ width: "100%", height: "100%", background: GOLD_DIM }} /> : <img src={avatarURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            {!loading && <>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <h2 style={{ color: TEXT1, fontWeight: 900, fontSize: 18, margin: 0 }}>{profile?.displayName || "Trader"}</h2>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={GOLD}><circle cx="12" cy="12" r="12" /><path d="M9 12l2 2 4-4" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
              </div>
              <p style={{ color: GOLD, fontSize: 11, fontWeight: 600, margin: "0 0 14px" }}>Pro Trader</p>
              <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
                {[{ l: "Posts", v: posts.length }, { l: "Followers", v: followers.length }, { l: "Following", v: following.length }].map(s => (
                  <div key={s.l} style={{ textAlign: "center" }}>
                    <p style={{ color: TEXT1, fontWeight: 900, fontSize: 16, margin: 0 }}>{s.v}</p>
                    <p style={{ color: TEXT2, fontSize: 10, margin: "2px 0 0" }}>{s.l}</p>
                  </div>
                ))}
              </div>
              {!isMe && <button onClick={handleFollow} style={{ marginBottom: 16, padding: "7px 22px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer", border: isFollowing ? BORDER_G : "none", background: isFollowing ? "transparent" : GOLD, color: isFollowing ? GOLD : "#000", display: "flex", alignItems: "center", gap: 6 }}>{isFollowing ? <><FaUserCheck size={10} />Following</> : <><FaUserPlus size={10} />Follow</>}</button>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, width: "100%", marginBottom: 16 }}>
                {[{ l: "Trades", v: trades.length, c: GOLD }, { l: "Win%", v: `${winRate}%`, c: GREEN }, { l: "P&L", v: `${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(0)}`, c: totalPnL >= 0 ? GREEN : RED_NEG }, { l: "Posts", v: posts.length, c: GOLD }].map(s => (
                  <div key={s.l} style={{ background: CARD2, borderRadius: 10, padding: "9px 5px", textAlign: "center", border: BORDER }}>
                    <p style={{ color: s.c, fontWeight: 900, fontSize: 14, margin: 0 }}>{s.v}</p>
                    <p style={{ color: TEXT3, fontSize: 9, margin: "2px 0 0" }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NEW TRADE MODAL ────────────────────────────────────────────────────
function NewTradeModal({ onClose, onSave, profileData }) {
  const [step, setStep] = useState(1);
  const [isDark, setIsDark] = useState(true); // dark/light mode toggle
  const [tradeData, setTradeData] = useState({
    pair: "XAUUSD",
    direction: "BUY",
    lotSize: "",
    entryPrice: "",
    stopLoss: "",
    takeProfit: "",
    exitPrice: "",
    exitTape: "",
    timeframe: "",
    setup: "",
    status: "Win",
    pips: "",
    profit_loss: "",
    profitPercent: "",
    rr: "",
    bullet: "",
    money: "",
    era: "",
    session: "",
    notes_psychology: "",
    emotion: "",
    strategy: "",
    date: "",
  });
  const [setupImage, setSetupImage] = useState(null);
  const [setupImagePreview, setSetupImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef(null);

  // ── THEME TOKENS (dynamic based on isDark) ──────────────────────────
  const T = isDark
    ? {
        bg: "#0d0d0d",
        card: "#141414",
        card2: "#1a1a1a",
        text1: "#f5f5f5",
        text2: "#a0a0a0",
        text3: "#555",
        border: "1px solid rgba(255,255,255,0.07)",
        borderG: "1px solid rgba(245,197,24,0.35)",
        goldDim: "rgba(245,197,24,0.08)",
        goldDim2: "rgba(245,197,24,0.04)",
        shadow: "0 0 60px rgba(245,197,24,0.12)",
        inputBg: "#1a1a1a",
        footerBg: "#0d0d0d",
      }
    : {
        bg: "#ffffff",
        card: "#f8f8f8",
        card2: "#efefef",
        text1: "#111111",
        text2: "#555555",
        text3: "#aaaaaa",
        border: "1px solid rgba(0,0,0,0.10)",
        borderG: "1px solid rgba(180,140,0,0.45)",
        goldDim: "rgba(180,140,0,0.08)",
        goldDim2: "rgba(180,140,0,0.04)",
        shadow: "0 0 60px rgba(180,140,0,0.10)",
        inputBg: "#efefef",
        footerBg: "#f8f8f8",
      };

  const GOLD_C = isDark ? "#f5c518" : "#b48c00";
  const GREEN_C = "#22c55e";
  const RED_C = "#ef4444";

  const calcRRR = () => {
    const e = parseFloat(tradeData.entryPrice),
      sl = parseFloat(tradeData.stopLoss),
      tp = parseFloat(tradeData.takeProfit);
    if (!e || !sl || !tp) return null;
    const risk = Math.abs(e - sl), reward = Math.abs(tp - e);
    if (risk === 0) return null;
    return (reward / risk).toFixed(2);
  };
  const rrr = calcRRR();

  // ── AUTO-CALC PROFIT % when exitPrice or profit_loss changes ────────
  const autoCalcProfitPercent = (updated) => {
    const entry = parseFloat(updated.entryPrice);
    const exit = parseFloat(updated.exitPrice);
    const lots = parseFloat(updated.lotSize);
    if (entry && exit && lots) {
      const pipValue = 10; // standard $10/pip per lot for most pairs
      const pips = updated.direction === "BUY" ? (exit - entry) : (entry - exit);
      const rawPL = pips * lots * pipValue;
      const pct = entry !== 0 ? ((exit - entry) / entry * 100).toFixed(2) : "";
      return {
        ...updated,
        profit_loss: updated.profit_loss || rawPL.toFixed(2),
        profitPercent: pct,
      };
    }
    return updated;
  };

  const handleExitPrice = (val) => {
    const updated = { ...tradeData, exitPrice: val };
    setTradeData(autoCalcProfitPercent(updated));
  };

  const handlePLChange = (val) => {
    // manual override — clear auto
    setTradeData({ ...tradeData, profit_loss: val });
  };

  const handleImageSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setSetupImage(f);
    setSetupImagePreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) { alert("Please Login"); return; }
    if (!tradeData.pair || !tradeData.entryPrice) { alert("Pair iyo Entry Price buuxi"); return; }
    setUploading(true);
    try {
      let setupImageURL = "";
      if (setupImage) {
        const sRef = ref(storage, `trades/${user.uid}/setup_${Date.now()}`);
        await uploadBytes(sRef, setupImage);
        setupImageURL = await getDownloadURL(sRef);
      }
      await onSave({
        ...tradeData,
        setupImageURL,
        rrr: rrr || tradeData.rr || "",
        userId: user.uid,
        userEmail: user.email,
        userName: profileData?.displayName || user.email.split("@")[0],
        createdAt: Date.now(),
      });
      onClose();
    } catch (err) { alert(err.message); } finally { setUploading(false); }
  };

  const iS = {
    width: "100%",
    background: T.inputBg,
    color: T.text1,
    padding: "11px 13px",
    borderRadius: 10,
    outline: "none",
    border: T.border,
    fontSize: 13,
    boxSizing: "border-box",
  };

  const TIMEFRAMES = ["1min", "2min", "3min", "5min", "10min", "15min", "30min", "1H", "2H", "4H", "Daily", "Weekly"];

  // Status options — Open removed, replaced with Pending
  const STATUS_OPTIONS = [
    { value: "Win", label: "Win ✅" },
    { value: "Loss", label: "Loss ❌" },
    { value: "Breakeven", label: "Breakeven ➖" },
    { value: "Pending", label: "Pending ⏳" },
    { value: "Cancelled", label: "Cancelled 🚫" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "4px", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)"
    }}>
      <div style={{
        width: "100%", maxWidth: "98vw", maxHeight: "98vh",
        borderRadius: 22, overflow: "hidden",
        background: T.card, border: T.borderG,
        boxShadow: T.shadow,
        display: "flex", flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 26px 12px", borderBottom: T.border, flexShrink: 0,
          background: T.card,
        }}>
          <div>
            <h2 style={{ color: T.text1, fontWeight: 900, fontSize: 20, margin: 0 }}>New Trade Entry</h2>
            <p style={{ color: T.text2, fontSize: 11, margin: "3px 0 0" }}>
              Step {step} of 2 — {step === 1 ? "Trade Details" : "Psychology & Setup"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* ── DARK / LIGHT TOGGLE ── */}
            <button
              onClick={() => setIsDark(!isDark)}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 20,
                border: T.borderG,
                background: T.card2,
                color: T.text2,
                cursor: "pointer", fontSize: 12, fontWeight: 700,
                transition: "all .2s",
              }}>
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button onClick={onClose} style={{ color: T.text2, background: "none", border: "none", cursor: "pointer", fontSize: 15 }}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", padding: "0 26px", borderBottom: T.border, flexShrink: 0, background: T.card }}>
          {["Trade Details", "Psychology"].map((s, i) => (
            <button key={s} onClick={() => i < step && setStep(i + 1)}
              style={{
                flex: 1, padding: "11px 0", background: "none", border: "none",
                borderBottom: step === i + 1 ? `2px solid ${GOLD_C}` : "2px solid transparent",
                color: step === i + 1 ? GOLD_C : T.text3,
                fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s"
              }}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {/* Body — scrollable */}
        <div style={{ padding: "18px 22px", overflowY: "auto", flex: 1, background: T.bg }}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Row 1: Date | Pair | Direction */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Date</label>
                  <input type="datetime-local" value={tradeData.date} onChange={e => setTradeData({ ...tradeData, date: e.target.value })} style={iS} />
                </div>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pair</label>
                  <select value={tradeData.pair} onChange={e => setTradeData({ ...tradeData, pair: e.target.value })} style={iS}>
                    {CURRENCY_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Direction (Type)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {["BUY", "SELL"].map(d => (
                      <button key={d} onClick={() => setTradeData({ ...tradeData, direction: d })}
                        style={{
                          padding: "11px 0", borderRadius: 10, fontWeight: 900, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                          background: tradeData.direction === d ? (d === "BUY" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)") : T.card2,
                          border: tradeData.direction === d ? (d === "BUY" ? "1px solid #22c55e" : "1px solid #ef4444") : T.border,
                          color: tradeData.direction === d ? (d === "BUY" ? GREEN_C : RED_C) : T.text3
                        }}>
                        {d === "BUY" ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                        {d === "BUY" ? "LONG" : "SHORT"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Lots | Timeframe | Session */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Lots</label>
                  <input type="number" step="any" placeholder="0.10" value={tradeData.lotSize} onChange={e => setTradeData({ ...tradeData, lotSize: e.target.value })} style={iS} />
                </div>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Timeframe</label>
                  <select value={tradeData.timeframe} onChange={e => setTradeData({ ...tradeData, timeframe: e.target.value })} style={iS}>
                    <option value="">Select</option>
                    {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Session</label>
                  <select value={tradeData.session} onChange={e => setTradeData({ ...tradeData, session: e.target.value })} style={iS}>
                    <option value="">Select</option>
                    <option value="Asian"> Asian</option>
                    <option value="London">🇬🇧 London</option>
                    <option value="New York"> New York</option>
                    
                  </select>
                </div>
              </div>

              {/* Row 3: Entry | Stoploss | Take Profit */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { k: "entryPrice", l: "Entry", p: "1928.18" },
                  { k: "stopLoss", l: "Stoploss", p: "1923.18" },
                  { k: "takeProfit", l: "Take Profit", p: "1938.18" }
                ].map(({ k, l, p }) => (
                  <div key={k}>
                    <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</label>
                    <input type="number" step="any" placeholder={p} value={tradeData[k]} onChange={e => setTradeData({ ...tradeData, [k]: e.target.value })} style={iS} />
                  </div>
                ))}
              </div>

              {/* RRR Banner */}
              {rrr && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.goldDim, border: T.borderG, borderRadius: 10, padding: "9px 13px" }}>
                  <FaTrophy style={{ color: GOLD_C }} />
                  <span style={{ color: T.text1, fontWeight: 900 }}>RRR = 1:{rrr}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: parseFloat(rrr) >= 2 ? GREEN_C : parseFloat(rrr) >= 1 ? GOLD_C : RED_C }}>
                    {parseFloat(rrr) >= 2 ? "✅ Great" : parseFloat(rrr) >= 1 ? "⚠️ OK" : "❌ Risky"}
                  </span>
                </div>
              )}

              {/* Row 4: Setup | Strategy */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Setup</label>
                  <input type="text" placeholder="Rejection from 5min, Breakout+Ref..." value={tradeData.setup} onChange={e => setTradeData({ ...tradeData, setup: e.target.value })} style={iS} />
                </div>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Strategy</label>
                  <input type="text" placeholder="ICT, SMC, CRT..." value={tradeData.strategy} onChange={e => setTradeData({ ...tradeData, strategy: e.target.value })} style={iS} />
                </div>
              </div>

              {/* Row 5: Status — Open removed */}
              <div>
                <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</label>
                <select value={tradeData.status} onChange={e => setTradeData({ ...tradeData, status: e.target.value })} style={iS}>
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Row 6: Exit fields — always shown since Open is removed */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Exit Avg</label>
                  <input
                    type="number" step="any" placeholder="1924.57"
                    value={tradeData.exitPrice}
                    onChange={e => handleExitPrice(e.target.value)}
                    style={iS}
                  />
                </div>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Exit Tape/Loge</label>
                  <input type="text" placeholder="TP1, TP2..." value={tradeData.exitTape} onChange={e => setTradeData({ ...tradeData, exitTape: e.target.value })} style={iS} />
                </div>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pips</label>
                  <input type="number" step="any" placeholder="50" value={tradeData.pips} onChange={e => setTradeData({ ...tradeData, pips: e.target.value })} style={iS} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Net P&L ($)</label>
                  <input
                    type="number" step="any" placeholder="150 or -50"
                    value={tradeData.profit_loss}
                    onChange={e => handlePLChange(e.target.value)}
                    style={iS}
                  />
                </div>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Net P&L %
                    {tradeData.profitPercent && (
                      <span style={{
                        marginLeft: 6, fontSize: 10, fontWeight: 800,
                        color: parseFloat(tradeData.profitPercent) >= 0 ? GREEN_C : RED_C,
                        background: parseFloat(tradeData.profitPercent) >= 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                        padding: "1px 6px", borderRadius: 6,
                      }}>
                        Auto
                      </span>
                    )}
                  </label>
                  <input
                    type="number" step="any" placeholder="+1%"
                    value={tradeData.profitPercent}
                    onChange={e => setTradeData({ ...tradeData, profitPercent: e.target.value })}
                    style={{
                      ...iS,
                      color: tradeData.profitPercent
                        ? (parseFloat(tradeData.profitPercent) >= 0 ? GREEN_C : RED_C)
                        : T.text1,
                      fontWeight: tradeData.profitPercent ? 800 : 400,
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>RR</label>
                  <input type="number" step="any" placeholder="1.5" value={tradeData.rr} onChange={e => setTradeData({ ...tradeData, rr: e.target.value })} style={iS} />
                </div>
              </div>

              {/* Bullet | Money | ERA */}
              <div>
                <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Bullet / Money / ERA</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ color: T.text2, fontSize: 11, marginBottom: 5, display: "block" }}>Bullet</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {["YES", "NO"].map(v => (
                        <button key={v} onClick={() => setTradeData({ ...tradeData, bullet: v })}
                          style={{
                            padding: "9px 0", borderRadius: 9, fontWeight: 800, fontSize: 12, cursor: "pointer",
                            background: tradeData.bullet === v ? (v === "YES" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)") : T.card2,
                            border: tradeData.bullet === v ? (v === "YES" ? "1px solid #22c55e" : "1px solid #ef4444") : T.border,
                            color: tradeData.bullet === v ? (v === "YES" ? GREEN_C : RED_C) : T.text3
                          }}>
                          {v === "YES" ? "✓" : "✗"} {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ color: T.text2, fontSize: 11, marginBottom: 5, display: "block" }}>Money</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {["YES", "NO"].map(v => (
                        <button key={v} onClick={() => setTradeData({ ...tradeData, money: v })}
                          style={{
                            padding: "9px 0", borderRadius: 9, fontWeight: 800, fontSize: 12, cursor: "pointer",
                            background: tradeData.money === v ? (v === "YES" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)") : T.card2,
                            border: tradeData.money === v ? (v === "YES" ? "1px solid #22c55e" : "1px solid #ef4444") : T.border,
                            color: tradeData.money === v ? (v === "YES" ? GREEN_C : RED_C) : T.text3
                          }}>
                          {v === "YES" ? "✓" : "✗"} {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ color: T.text2, fontSize: 11, marginBottom: 5, display: "block" }}>ERA</label>
                    <input type="text" placeholder="ERA value..." value={tradeData.era} onChange={e => setTradeData({ ...tradeData, era: e.target.value })} style={iS} />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Emotion</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                  {["Calm 😌", "Confident 💪", "FOMO 😰", "Greedy 🤑", "Revenge 😡", "Tired 😴"].map(e => (
                    <button key={e} onClick={() => setTradeData({ ...tradeData, emotion: e })}
                      style={{
                        padding: "9px 4px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                        cursor: "pointer", transition: "all .2s",
                        background: tradeData.emotion === e ? T.goldDim : T.card2,
                        border: tradeData.emotion === e ? T.borderG : T.border,
                        color: tradeData.emotion === e ? GOLD_C : T.text2
                      }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Psychology Notes</label>
                <textarea
                  placeholder="Maxaad ka fikiraysay?"
                  value={tradeData.notes_psychology}
                  onChange={e => setTradeData({ ...tradeData, notes_psychology: e.target.value })}
                  style={{ ...iS, height: 100, resize: "none" }}
                />
              </div>
              <div>
                <label style={{ color: T.text2, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Chart Screenshot</label>
                <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageSelect} />
                {setupImagePreview
                  ? <div style={{ position: "relative" }}>
                      <img src={setupImagePreview} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10 }} />
                      <button
                        onClick={() => { setSetupImage(null); setSetupImagePreview(null); }}
                        style={{ position: "absolute", top: 6, right: 6, background: RED_C, color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer" }}>
                        <FaTimes size={8} />
                      </button>
                    </div>
                  : <div
                      onClick={() => imgRef.current?.click()}
                      style={{ border: `2px dashed rgba(245,197,24,0.2)`, borderRadius: 10, padding: 22, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", background: T.goldDim2 }}>
                      <FaUpload style={{ color: GOLD_C, fontSize: 18, marginBottom: 5 }} />
                      <p style={{ color: T.text1, fontWeight: 700, fontSize: 13, margin: 0 }}>Upload Screenshot</p>
                      <p style={{ color: T.text3, fontSize: 11, marginTop: 2 }}>PNG, JPG</p>
                    </div>
                }
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px 18px", borderTop: T.border, display: "flex", justifyContent: "space-between", flexShrink: 0, background: T.footerBg }}>
          <button
            onClick={() => step === 1 ? onClose() : setStep(1)}
            style={{ padding: "9px 18px", borderRadius: 10, border: T.border, background: "none", color: T.text2, fontWeight: 700, cursor: "pointer" }}>
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          {step === 1
            ? <button
                onClick={() => setStep(2)}
                style={{ padding: "9px 22px", borderRadius: 10, fontWeight: 900, color: "#000", fontSize: 13, cursor: "pointer", border: "none", background: GOLD_C }}>
                Next: Psychology →
              </button>
            : <button
                onClick={handleSave}
                disabled={uploading}
                style={{ padding: "9px 22px", borderRadius: 10, fontWeight: 900, color: "#000", fontSize: 13, cursor: "pointer", border: "none", display: "flex", alignItems: "center", gap: 6, background: GOLD_C, opacity: uploading ? 0.6 : 1 }}>
                <FaSave />{uploading ? "Saving..." : "Save Trade"}
              </button>
          }
        </div>

      </div>
    </div>
  );
}

// ── JOURNAL LIGHTBOX ──────────────────────────────────────────────────
function JournalLightbox({ url, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 400,
      background: "rgba(0,0,0,0.97)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: 20, right: 20,
        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)",
        color: "#ffffff", borderRadius: 10, width: 40, height: 40,
        cursor: "pointer", fontSize: 16, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}><FaTimes /></button>
      <img src={url} alt="Chart" onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "92vw", maxHeight: "88vh", borderRadius: 16,
          border: "1px solid rgba(245,197,24,0.3)",
          boxShadow: "0 0 80px rgba(245,197,24,0.25)",
          objectFit: "contain",
        }}
      />
    </div>
  );
}

// ── JOURNAL TRADE DETAIL MODAL ────────────────────────────────────────
function JournalTradeDetailModal({ trade, onClose, onDelete }) {
  const [lightbox, setLightbox] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // ── THEME (dark/light) ──────────────────────────────────────────────
  const T = isDark
    ? {
        bg: "#0d0d0d", card: "#0e0e0e", card2: "#141414",
        text1: "#ffffff", text2: "#888888", text3: "#3a3a3a",
        border: "1px solid rgba(255,255,255,0.06)",
        borderG: "1px solid rgba(245,197,24,0.35)",
        goldDim: "rgba(245,197,24,0.13)", goldDim2: "rgba(245,197,24,0.06)",
        shadow: "0 0 0 1px rgba(245,197,24,0.1), 0 50px 100px rgba(0,0,0,0.9)",
        headerGrad: "linear-gradient(180deg, rgba(245,197,24,0.06) 0%, rgba(0,0,0,0) 100%)",
        overlayBg: "rgba(0,0,0,0.9)",
      }
    : {
        bg: "#f5f5f5", card: "#ffffff", card2: "#efefef",
        text1: "#111111", text2: "#555555", text3: "#aaaaaa",
        border: "1px solid rgba(0,0,0,0.09)",
        borderG: "1px solid rgba(180,140,0,0.45)",
        goldDim: "rgba(180,140,0,0.12)", goldDim2: "rgba(180,140,0,0.05)",
        shadow: "0 0 0 1px rgba(180,140,0,0.15), 0 50px 100px rgba(0,0,0,0.15)",
        headerGrad: "linear-gradient(180deg, rgba(180,140,0,0.07) 0%, rgba(0,0,0,0) 100%)",
        overlayBg: "rgba(0,0,0,0.7)",
      };

  const JGOLD   = isDark ? "#f5c518" : "#b48c00";
  const JGREEN  = "#22c55e";
  const JRED    = "#ef4444";
  const JBLUE   = "#3b82f6";
  const JPURPLE = "#a855f7";
  const JORANGE = "#f97316";

  const JSTATUS_CFG = {
    Win:       { color: JGREEN,  bg: "rgba(34,197,94,0.12)",  icon: "✅", label: "WIN" },
    Loss:      { color: JRED,    bg: "rgba(239,68,68,0.12)",  icon: "❌", label: "LOSS" },
    Breakeven: { color: JGOLD,   bg: "rgba(245,197,24,0.12)", icon: "➖", label: "B/E" },
    Open:      { color: JBLUE,   bg: "rgba(59,130,246,0.12)", icon: "●",  label: "OPEN" },
  };
  const JEMO_COLOR = {
    "Calm 😌": "#22c55e", "Confident 💪": "#3b82f6", "FOMO 😰": "#f97316",
    "Greedy 🤑": "#eab308", "Revenge 😡": "#ef4444", "Tired 😴": "#8b5cf6",
  };

  const pl = Number(trade.profit_loss || 0);
  const sc = JSTATUS_CFG[trade.status] || JSTATUS_CFG.Open;
  const emoColor = JEMO_COLOR[trade.emotion] || JGOLD;
  const hasValidPL = trade.profit_loss !== "" && trade.profit_loss !== undefined && trade.profit_loss !== null;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleDelete = async () => {
    if (!window.confirm("Trade permanently delete garaynaa?")) return;
    setDeleting(true);
    try { await onDelete(trade.id); onClose(); }
    catch (e) { alert("Delete failed: " + e.message); setDeleting(false); }
  };

  const StatBox = ({ icon, label, value, color, iconBg }) => (
    <div style={{
      background: T.card2, borderRadius: 12, padding: "13px 14px",
      border: T.border, display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: iconBg || "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{icon}</div>
        <span style={{ color: T.text3, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      </div>
      <span style={{ color: color || T.text1, fontWeight: 900, fontSize: 18, letterSpacing: "-0.5px" }}>{value || "—"}</span>
    </div>
  );

  const InfoRow = ({ icon, label, value, color, link }) => {
    if (!value && value !== 0) return null;
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, marginTop: 1 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ color: T.text3, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>{label}</p>
          {link ? (
            <a href={value} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ color: JBLUE, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
              View Image <FaExternalLinkAlt size={10} />
            </a>
          ) : (
            <p style={{ color: color || T.text1, fontWeight: 700, fontSize: 13, margin: 0 }}>{value}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {lightbox && trade.setupImageURL && <JournalLightbox url={trade.setupImageURL} onClose={() => setLightbox(false)} />}

      {/* ── OVERLAY ── */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: T.overlayBg, backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "4px", animation: "fadeIn .2s ease",
      }}>

        {/* ── MODAL (full screen like NewTradeModal) ── */}
        <div onClick={e => e.stopPropagation()} style={{
          width: "100%", maxWidth: "98vw", maxHeight: "98vh",
          borderRadius: 22, background: T.card,
          border: T.borderG,
          boxShadow: T.shadow,
          display: "flex", flexDirection: "column",
          overflow: "hidden", position: "relative",
        }}>

          {/* Gold top line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #f5c518, transparent)", opacity: 0.6, zIndex: 1 }} />

          {/* ── HEADER ── */}
          <div style={{
            padding: "18px 26px 14px", flexShrink: 0,
            background: T.headerGrad, borderBottom: T.border,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {/* Top row: status + date + toggle + close */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: sc.bg, border: `1px solid ${sc.color}30`, borderRadius: 8, padding: "5px 12px" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: sc.color, boxShadow: `0 0 6px ${sc.color}`, animation: trade.status === "Open" ? "pulse 2s infinite" : "none" }} />
                  <span style={{ color: sc.color, fontWeight: 800, fontSize: 11, letterSpacing: "0.06em" }}>{sc.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FaCalendarAlt style={{ color: T.text3, fontSize: 10 }} />
                  <span style={{ color: T.text2, fontSize: 11 }}>
                    {new Date(trade.createdAt).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Dark/Light toggle */}
                <button
                  onClick={() => setIsDark(!isDark)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 20,
                    border: T.borderG, background: T.card2,
                    color: T.text2, cursor: "pointer", fontSize: 12, fontWeight: 700,
                  }}>
                  {isDark ? "☀️ Light" : "🌙 Dark"}
                </button>
                {/* Close */}
                <button onClick={onClose} style={{
                  background: "rgba(255,255,255,0.06)", border: T.border,
                  color: T.text2, borderRadius: 8, width: 30, height: 30,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                }}>
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Pair + direction + P&L */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h1 style={{ color: T.text1, fontWeight: 900, fontSize: 30, margin: 0, letterSpacing: "-1px" }}>{trade.pair}</h1>
                  {trade.pair === "XAUUSD" && <span style={{ fontSize: 18 }}>⭐</span>}
                </div>
                <p style={{ color: T.text3, fontSize: 11, margin: 0 }}>
                  {trade.pair === "XAUUSD" ? "Gold vs US Dollar"
                    : trade.pair === "NAS100" ? "Nasdaq 100 Index"
                    : trade.pair === "GBPUSD" ? "British Pound vs USD"
                    : trade.pair === "EURUSD" ? "Euro vs US Dollar"
                    : trade.pair}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginBottom: 6 }}>
                  <span style={{ color: trade.direction === "BUY" ? JGREEN : JRED, fontWeight: 900, fontSize: 20 }}>{trade.direction}</span>
                  {trade.direction === "BUY" ? <FaArrowUp style={{ color: JGREEN, fontSize: 16 }} /> : <FaArrowDown style={{ color: JRED, fontSize: 16 }} />}
                </div>
                {hasValidPL && (
                  <p style={{ color: pl >= 0 ? JGREEN : JRED, fontWeight: 900, fontSize: 26, margin: 0, letterSpacing: "-1px", lineHeight: 1 }}>
                    {pl >= 0 ? "+" : ""}${pl}
                  </p>
                )}
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {trade.emotion && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: emoColor + "18", border: `1px solid ${emoColor}35`, borderRadius: 8, padding: "5px 12px" }}>
                  <span style={{ color: emoColor, fontWeight: 700, fontSize: 12 }}>{trade.emotion}</span>
                </div>
              )}
              {trade.notes_psychology && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 8, padding: "5px 12px" }}>
                  <FaBrain style={{ color: JPURPLE, fontSize: 10 }} />
                  <span style={{ color: JPURPLE, fontWeight: 700, fontSize: 11 }}>PSYCHOLOGY</span>
                  <span style={{ color: isDark ? "#ccc" : "#555", fontSize: 11 }}>{trade.notes_psychology}</span>
                </div>
              )}
              {trade.strategy && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.goldDim, border: `1px solid rgba(245,197,24,0.15)`, borderRadius: 8, padding: "5px 12px" }}>
                  <span style={{ color: T.text2, fontSize: 10, fontWeight: 700 }}>STRATEGY</span>
                  <span style={{ color: JGOLD, fontWeight: 900, fontSize: 13 }}>{trade.strategy}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── SCROLLABLE BODY ── */}
          <div style={{ overflowY: "auto", flex: 1, background: T.bg }}>

            {/* Stats 2×4 grid */}
            <div style={{ padding: "16px 22px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 8 }}>
                <StatBox icon={<FaDollarSign style={{ color: JGREEN }} />} label="Entry"       value={trade.entryPrice}  color={T.text1}  iconBg="rgba(34,197,94,0.1)" />
                <StatBox icon={<FaBoxOpen    style={{ color: JBLUE  }} />} label="Lot Size"    value={trade.lotSize}     color={T.text1}  iconBg="rgba(59,130,246,0.1)" />
                <StatBox icon={<FaBullseye   style={{ color: JGREEN }} />} label="Take Profit" value={trade.takeProfit}  color={JGREEN}   iconBg="rgba(34,197,94,0.1)" />
                <StatBox icon={<FaShieldAlt  style={{ color: JRED   }} />} label="Stop Loss"   value={trade.stopLoss}    color={JRED}     iconBg="rgba(239,68,68,0.1)" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
                <StatBox icon={<FaBalanceScale style={{ color: JPURPLE }} />} label="RRR"      value={trade.rrr && trade.rrr !== "0" ? trade.rrr : null} color={JPURPLE} iconBg="rgba(168,85,247,0.1)" />
                <StatBox icon={<FaChartBar    style={{ color: JORANGE }} />} label="Pips"      value={trade.pips || null}  color={JORANGE}  iconBg="rgba(249,115,22,0.1)" />
                <StatBox icon={<FaChartLine   style={{ color: hasValidPL ? pl >= 0 ? JGREEN : JRED : T.text3 }} />} label="P/L"
                  value={hasValidPL ? `${pl >= 0 ? "+" : ""}$${pl}` : null}
                  color={hasValidPL ? pl >= 0 ? JGREEN : JRED : T.text3}
                  iconBg={hasValidPL ? pl >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)"} />
                <StatBox icon={<FaPercentage  style={{ color: JGOLD  }} />} label="Profit %"  value={null}               color={JGOLD}    iconBg="rgba(245,197,24,0.1)" />
              </div>
            </div>

            {/* Details grid */}
            <div style={{ margin: "0 22px 14px", background: T.card2, borderRadius: 14, padding: "14px 16px", border: T.border }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <InfoRow icon={<FaArrowUp  style={{ color: JGREEN  }} />} label="Direction"        value={trade.direction}           color={trade.direction === "BUY" ? JGREEN : JRED} />
                <InfoRow icon={<FaGlobe    style={{ color: JBLUE   }} />} label="Session"           value={trade.session || null} />
                <InfoRow icon={<FaBrain    style={{ color: JPURPLE }} />} label="Emotion"           value={trade.emotion || null}     color={emoColor} />
                <InfoRow icon={<FaImage    style={{ color: JGOLD   }} />} label="Setup Image URL"   value={trade.setupImageURL || null} link={true} />
                <InfoRow icon={<FaBrain    style={{ color: JPURPLE }} />} label="Psychology"        value={trade.notes_psychology || null} color={isDark ? "#d4d4d4" : "#333"} />
                <InfoRow icon={<FaCalendarAlt style={{ color: T.text2 }} />} label="Created At"
                  value={new Date(trade.createdAt).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
              </div>
            </div>

            {/* User info */}
            {(trade.userName || trade.userEmail || trade.userId) && (
              <div style={{ margin: "0 22px 14px", background: T.card2, borderRadius: 14, padding: "12px 16px", border: T.border, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {trade.userName && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaUser style={{ color: JGREEN, fontSize: 11 }} /></div>
                    <div><p style={{ color: T.text3, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>USER</p><p style={{ color: T.text1, fontWeight: 700, fontSize: 12, margin: 0 }}>{trade.userName}</p></div>
                  </div>
                )}
                {trade.userEmail && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaEnvelope style={{ color: JBLUE, fontSize: 11 }} /></div>
                    <div><p style={{ color: T.text3, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>EMAIL</p><p style={{ color: T.text1, fontWeight: 700, fontSize: 11, margin: 0 }}>{trade.userEmail}</p></div>
                  </div>
                )}
                {trade.userId && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(168,85,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaIdCard style={{ color: JPURPLE, fontSize: 11 }} /></div>
                    <div><p style={{ color: T.text3, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>USER ID</p><p style={{ color: T.text1, fontWeight: 700, fontSize: 9, margin: 0, wordBreak: "break-all", lineHeight: 1.4 }}>{trade.userId}</p></div>
                  </div>
                )}
              </div>
            )}

            {/* Chart Image */}
            <div style={{ margin: "0 22px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FaImage style={{ color: JGOLD, fontSize: 12 }} />
                  <span style={{ color: T.text2, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>CHART SETUP IMAGE</span>
                </div>
                {trade.setupImageURL && !imgErr && (
                  <button onClick={() => setLightbox(true)} style={{ display: "flex", alignItems: "center", gap: 4, background: T.goldDim, border: `1px solid rgba(245,197,24,0.15)`, borderRadius: 6, color: JGOLD, fontSize: 10, fontWeight: 700, padding: "4px 9px", cursor: "pointer" }}>
                    <FaExpandAlt size={8} /> Full Screen
                  </button>
                )}
              </div>
              {trade.setupImageURL ? (
                imgErr ? (
                  <div style={{ background: T.card2, borderRadius: 14, border: T.border, padding: "30px 0", textAlign: "center" }}>
                    <FaImage style={{ color: T.text3, fontSize: 28, marginBottom: 8 }} />
                    <p style={{ color: T.text3, fontSize: 12, margin: "0 0 8px" }}>Image could not load</p>
                    <a href={trade.setupImageURL} target="_blank" rel="noopener noreferrer" style={{ color: JBLUE, fontSize: 11, display: "flex", alignItems: "center", gap: 4, justifyContent: "center", textDecoration: "none" }}>
                      Open in browser <FaExternalLinkAlt size={9} />
                    </a>
                  </div>
                ) : (
                  <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid rgba(245,197,24,0.15)`, cursor: "pointer", position: "relative", background: T.card2, minHeight: imgLoaded ? 0 : 120 }} onClick={() => setLightbox(true)}>
                    {!imgLoaded && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${JGOLD}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                      </div>
                    )}
                    <img src={trade.setupImageURL} alt="Chart Setup" referrerPolicy="no-referrer"
                      onLoad={() => setImgLoaded(true)} onError={() => setImgErr(true)}
                      style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 320, opacity: imgLoaded ? 1 : 0, transition: "opacity .3s" }}
                    />
                    {imgLoaded && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background .2s", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14 }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.4)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}>
                        <FaExpandAlt style={{ color: "#fff", fontSize: 24, filter: "drop-shadow(0 2px 6px #000)" }} />
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div style={{ background: T.card2, borderRadius: 14, border: T.border, padding: "24px 0", textAlign: "center" }}>
                  <FaImage style={{ color: T.text3, fontSize: 24, marginBottom: 6 }} />
                  <p style={{ color: T.text3, fontSize: 11, margin: 0 }}>No chart image uploaded</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 22px 22px" }}>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px 0", borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: "pointer", border: "none", letterSpacing: "0.04em", background: JBLUE, color: "#fff", boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}>
                <FaArrowUp size={12} /> OPEN TRADE
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px 0", borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: "pointer", background: "none", letterSpacing: "0.04em", border: `1px solid rgba(245,197,24,0.15)`, color: JGOLD }}>
                <FaEdit size={12} /> EDIT TRADE
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px 0", borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: "pointer", background: "none", letterSpacing: "0.04em", border: `1px solid rgba(239,68,68,0.3)`, color: JRED, opacity: deleting ? 0.6 : 1 }}>
                <FaTrash size={11} /> {deleting ? "DELETING..." : "DELETE TRADE"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ── JOURNAL TRADE CARD ────────────────────────────────────────────────
function JournalTradeCard({ trade, onDelete, onOpen }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const JGOLD = "#f5c518"; const JGOLD_DIM = "rgba(245,197,24,0.13)"; const JGOLD_DIM2 = "rgba(245,197,24,0.06)";
  const JCARD_BG = "#111111"; const JCARD2 = "#181818"; const JBORDER = "1px solid rgba(255,255,255,0.06)";
  const JTEXT1 = "#ffffff"; const JTEXT2 = "#888888"; const JTEXT3 = "#3a3a3a";
  const JGREEN = "#22c55e"; const JRED = "#ef4444"; const JBLUE = "#3b82f6";
  const JSTATUS_CFG = {
    Win: { color: JGREEN, bg: "rgba(34,197,94,0.12)", icon: "✅", label: "WIN" },
    Loss: { color: JRED, bg: "rgba(239,68,68,0.12)", icon: "❌", label: "LOSS" },
    Breakeven: { color: JGOLD, bg: "rgba(245,197,24,0.12)", icon: "➖", label: "B/E" },
    Open: { color: JBLUE, bg: "rgba(59,130,246,0.12)", icon: "●", label: "OPEN" },
  };
  const JEMO_COLOR = { "Calm 😌": "#22c55e", "Confident 💪": "#3b82f6", "FOMO 😰": "#f97316", "Greedy 🤑": "#eab308", "Revenge 😡": "#ef4444", "Tired 😴": "#8b5cf6" };

  const pl = Number(trade.profit_loss || 0);
  const sc = JSTATUS_CFG[trade.status] || JSTATUS_CFG.Open;
  const emoColor = JEMO_COLOR[trade.emotion] || JGOLD;
  const hasValidPL = trade.profit_loss !== "" && trade.profit_loss !== undefined && trade.profit_loss !== null;

  return (
    <div style={{ background: JCARD_BG, border: JBORDER, borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all .2s ease", position: "relative" }}
      onClick={() => onOpen(trade)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,197,24,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(0,0,0,0.7)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: sc.color, opacity: 0.8 }} />
      <div style={{ padding: "15px 18px 14px 21px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: trade.direction === "BUY" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${trade.direction === "BUY" ? JGREEN : JRED}30`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
              {trade.direction === "BUY" ? <FaArrowUp style={{ color: JGREEN, fontSize: 14 }} /> : <FaArrowDown style={{ color: JRED, fontSize: 14 }} />}
              <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.05em", color: trade.direction === "BUY" ? JGREEN : JRED }}>{trade.direction}</span>
            </div>
            <div>
              <span style={{ color: JTEXT1, fontWeight: 900, fontSize: 16 }}>{trade.pair}</span>
              <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                {trade.entryPrice && <span style={{ color: JTEXT3, fontSize: 10 }}>E: <span style={{ color: JTEXT2 }}>{trade.entryPrice}</span></span>}
                {trade.stopLoss && <span style={{ color: JTEXT3, fontSize: 10 }}>SL: <span style={{ color: JRED, opacity: 0.8 }}>{trade.stopLoss}</span></span>}
                {trade.takeProfit && <span style={{ color: JTEXT3, fontSize: 10 }}>TP: <span style={{ color: JGREEN, opacity: 0.8 }}>{trade.takeProfit}</span></span>}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span style={{ color: sc.color, fontSize: 9, fontWeight: 800, background: sc.bg, padding: "3px 10px", borderRadius: 6, border: `1px solid ${sc.color}30`, display: "inline-block" }}>{sc.icon} {sc.label}</span>
            {hasValidPL && <p style={{ color: pl >= 0 ? JGREEN : JRED, fontWeight: 900, fontSize: 20, margin: "5px 0 0", letterSpacing: "-0.5px" }}>{pl >= 0 ? "+" : ""}${pl}</p>}
            {trade.rrr && trade.rrr !== "0" && <p style={{ color: JGOLD, fontSize: 10, fontWeight: 700, margin: "3px 0 0" }}>RR 1:{trade.rrr}</p>}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {trade.strategy && <span style={{ background: JGOLD_DIM, border: "1px solid rgba(245,197,24,0.15)", borderRadius: 6, color: JGOLD, fontSize: 9, fontWeight: 800, padding: "3px 9px" }}>📊 {trade.strategy}</span>}
          {trade.session && trade.session !== "" && <span style={{ background: JCARD2, border: JBORDER, borderRadius: 6, color: JTEXT2, fontSize: 9, padding: "3px 9px" }}>🕐 {trade.session}</span>}
          {trade.lotSize && <span style={{ background: JCARD2, border: JBORDER, borderRadius: 6, color: JTEXT2, fontSize: 9, padding: "3px 9px" }}>📦 {trade.lotSize} lot</span>}
          {trade.pips && trade.pips !== "" && <span style={{ background: JCARD2, border: JBORDER, borderRadius: 6, color: JTEXT2, fontSize: 9, padding: "3px 9px" }}>📏 {trade.pips} pips</span>}
          {trade.emotion && <span style={{ background: emoColor + "15", border: `1px solid ${emoColor}30`, borderRadius: 6, color: emoColor, fontSize: 9, fontWeight: 700, padding: "3px 9px" }}>{trade.emotion}</span>}
        </div>
        {trade.notes_psychology && (
          <div style={{ background: JGOLD_DIM2, borderLeft: `2px solid ${JGOLD}50`, borderRadius: "0 8px 8px 0", padding: "8px 12px", marginBottom: 10 }}>
            <p style={{ color: JTEXT3, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 3px" }}>🧠 Psychology</p>
            <p style={{ color: JTEXT2, fontSize: 11, margin: 0, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{trade.notes_psychology}</p>
          </div>
        )}
        {trade.setupImageURL && !imgErr && (
          <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 10, position: "relative", background: JCARD2, minHeight: imgLoaded ? 0 : 72 }}>
            {!imgLoaded && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: JCARD2 }}><div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${JGOLD}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /></div>}
            <img src={trade.setupImageURL} alt="Chart" referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)} onError={() => setImgErr(true)}
              style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block", opacity: imgLoaded ? 1 : 0, transition: "opacity .3s" }}
            />
            {imgLoaded && <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.65)", borderRadius: 5, padding: "3px 7px", display: "flex", alignItems: "center", gap: 4 }}><FaImage style={{ color: JGOLD, fontSize: 8 }} /><span style={{ color: JTEXT2, fontSize: 9 }}>Chart Setup</span></div>}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 9, borderTop: JBORDER }}>
          <span style={{ color: JTEXT3, fontSize: 10, display: "flex", alignItems: "center", gap: 5 }}>
            <FaCalendarAlt size={8} />
            {new Date(trade.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
          <button onClick={e => { e.stopPropagation(); onDelete(trade.id); }}
            style={{ display: "flex", alignItems: "center", gap: 4, color: JTEXT3, background: "none", border: "none", fontSize: 10, cursor: "pointer", padding: "3px 8px", borderRadius: 6, transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = JRED; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = JTEXT3; e.currentTarget.style.background = "none"; }}>
            <FaTrash size={9} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── JOURNAL SUMMARY BAR ───────────────────────────────────────────────
function JournalSummaryBar({ trades }) {
  const JGOLD = "#f5c518"; const JCARD_BG = "#111111"; const JBORDER = "1px solid rgba(255,255,255,0.06)"; const JTEXT1 = "#ffffff"; const JTEXT3 = "#3a3a3a"; const JGREEN = "#22c55e"; const JRED = "#ef4444";
  const closed = trades.filter(t => t.status !== "Open");
  const wins = trades.filter(t => t.status === "Win").length;
  const losses = trades.filter(t => t.status === "Loss").length;
  const openCnt = trades.filter(t => t.status === "Open").length;
  const winRate = closed.length ? Math.round((wins / closed.length) * 100) : 0;
  const totalPnL = trades.reduce((a, t) => a + Number(t.profit_loss || 0), 0);
  const rrs = trades.filter(t => t.rrr && parseFloat(t.rrr) > 0);
  const avgRR = rrs.length ? (rrs.reduce((a, t) => a + parseFloat(t.rrr), 0) / rrs.length).toFixed(2) : "–";
  const stats = [
    { label: "Trades", value: trades.length, color: JTEXT1, sub: `${openCnt} open` },
    { label: "Win Rate", value: `${winRate}%`, color: winRate >= 60 ? JGREEN : winRate >= 40 ? JGOLD : JRED, sub: `${wins}W / ${losses}L` },
    { label: "Net P&L", value: `${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`, color: totalPnL >= 0 ? JGREEN : JRED, sub: "total" },
    { label: "Avg RR", value: avgRR !== "–" ? `1:${avgRR}` : "–", color: JGOLD, sub: "risk/reward" },
    { label: "Wins", value: wins, color: JGREEN, sub: "closed" },
    { label: "Losses", value: losses, color: JRED, sub: "closed" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 20 }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: JCARD_BG, border: JBORDER, borderRadius: 13, padding: "13px 14px", textAlign: "center", transition: "border-color .2s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(245,197,24,0.2)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
          <p style={{ color: JTEXT3, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>{s.label}</p>
          <p style={{ color: s.color, fontWeight: 900, fontSize: 18, margin: "0 0 3px" }}>{s.value}</p>
          <p style={{ color: JTEXT3, fontSize: 9, margin: 0 }}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}


// ── MAIN COMPONENT ─────────────────────────────────────────────────────
export default function JournalTrading() {
  const [trades, setTrades] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewTradeModal, setShowNewTradeModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const photoInputRef = useRef(null);
  const [postCaption, setPostCaption] = useState("");
  const [postFile, setPostFile] = useState(null);
  const [postFilePreview, setPostFilePreview] = useState(null);
  const [postType, setPostType] = useState("image");
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const [balance, setBalance] = useState(0);
  const [maxDrawdown] = useState(2000);
  const [accountBlown, setAccountBlown] = useState(false);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [profileViewUid, setProfileViewUid] = useState(null);
  const [riskBalance, setRiskBalance] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [riskSLPips, setRiskSLPips] = useState("");
  const [riskPipValue, setRiskPipValue] = useState("10");
  const [riskResult, setRiskResult] = useState(null);
  const [newGoal, setNewGoal] = useState({ title: "", target: "", current: "", type: "monthly", deadline: "" });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [filterPair, setFilterPair] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterStrategy, setFilterStrategy] = useState("");
  const [filterSession, setFilterSession] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const unsubRef = useRef(null);

  // ── JOURNAL STATE (new card UI) ──────────────────────────────────
  const [journalSearch, setJournalSearch] = useState("");
  const [journalFilterPair, setJournalFilterPair] = useState("All");
  const [journalFilterStatus, setJournalFilterStatus] = useState("All");
  const [journalFilterSession, setJournalFilterSession] = useState("All");
  const [journalFilterDir, setJournalFilterDir] = useState("All");
  const [journalSortBy, setJournalSortBy] = useState("date");
  const [journalSortAsc, setJournalSortAsc] = useState(false);
  const [journalShowFilters, setJournalShowFilters] = useState(false);
  const [selectedJournalTrade, setSelectedJournalTrade] = useState(null);


  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.uid) { setCurrentUser(null); setProfileData(null); setTrades([]); setBalance(0); setAuthLoading(false); if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; } return; }
      setCurrentUser(user); setAuthLoading(false);
      if (unsubRef.current) unsubRef.current();
      try {
        const q = query(collection(db, "trades"), where("userId", "==", user.uid));
        unsubRef.current = onSnapshot(q, snap => {
          const f = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setTrades(f);
          const pnl = f.reduce((a, t) => a + Number(t.profit_loss || 0), 0);
          setBalance(10000 + pnl);
          setAccountBlown(Math.abs(Math.min(0, pnl)) >= 2000);
        });
        const docRef = doc(db, "profiles", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) { const data = snap.data(); setProfileData(data); if (!data.setupDone) setShowSetup(true); }
        else setShowSetup(true);
        onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), s => setCommunityPosts(s.docs.map(d => ({ id: d.id, ...d.data(), likes: Array.isArray(d.data().likes) ? d.data().likes : [], followers: Array.isArray(d.data().followers) ? d.data().followers : [] }))));
      } catch (err) { console.log(err); }
    });
    return () => { unsubAuth(); if (unsubRef.current) unsubRef.current(); };
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try { const sRef = ref(storage, `profiles/${currentUser.uid}/avatar_${Date.now()}`); await uploadBytes(sRef, file); const url = await getDownloadURL(sRef); await updateDoc(doc(db, "profiles", currentUser.uid), { photoURL: url }); setProfileData(p => ({ ...p, photoURL: url })); } catch (err) { alert(err.message); }
  };
  const canChangeName = () => { if (!profileData?.nameChangedAt) return true; return (Date.now() - profileData.nameChangedAt) / (1000 * 60 * 60 * 24) >= 7; };
  const daysLeft = () => { if (!profileData?.nameChangedAt) return 0; return Math.ceil(7 - (Date.now() - profileData.nameChangedAt) / (1000 * 60 * 60 * 24)); };
  const saveName = async () => {
    if (!newName.trim()) return;
    if (!canChangeName()) { setNameError(`Waxaad sugaysaa ${daysLeft()} maalmood oo kale`); return; }
    await updateDoc(doc(db, "profiles", currentUser.uid), { displayName: newName.trim(), nameChangedAt: Date.now() });
    setProfileData(p => ({ ...p, displayName: newName.trim(), nameChangedAt: Date.now() }));
    setEditingName(false); setNameError("");
  };
  const handleSaveTrade = async (tradeDoc) => {
    if (!currentUser) { alert("Please Login"); return; }
    if (accountBlown) { alert("🔴 Akoonka waa kaa gubtay sxb!"); return; }
    const newPnL = Number(tradeDoc.profit_loss || 0);
    const projLoss = Math.abs(Math.min(0, (balance - 10000) + newPnL));
    if (tradeDoc.status !== "Open" && projLoss >= maxDrawdown) { alert(`⚠️ Account blown!\nLoss: $${projLoss.toFixed(2)} / Limit: $${maxDrawdown}`); setAccountBlown(true); return; }
    const saved = await addDoc(collection(db, "trades"), tradeDoc);
    await addDoc(collection(db, "adminNotifications"), { type: "new_trade", tradeId: saved.id, userId: currentUser.uid, userEmail: currentUser.email, pair: tradeDoc.pair, direction: tradeDoc.direction, status: tradeDoc.status, createdAt: Date.now(), read: false });
  };
  const handleDeleteTrade = async (id) => { if (!window.confirm("Delete?")) return; await deleteDoc(doc(db, "trades", id)); };
  const calcRisk = () => {
    const b = parseFloat(riskBalance), r = parseFloat(riskPercent), s = parseFloat(riskSLPips), p = parseFloat(riskPipValue);
    if (!b || !r || !s || !p) { alert("Dhammaan fields buuxi"); return; }
    const dr = (b * r) / 100, ls = dr / (s * p);
    setRiskResult({ dollarRisk: dr.toFixed(2), lotSize: ls.toFixed(2), positionSize: (ls * 100000).toFixed(0) });
  };
  const handleSaveGoal = async () => {
    if (!currentUser) return;
    if (!newGoal.title || !newGoal.target) { alert("Title iyo target buuxi"); return; }
    setNewGoal({ title: "", target: "", current: "", type: "monthly", deadline: "" }); setShowGoalForm(false);
  };

  // ── Stats ──────────────────────────────────────────────────────────
  const totalTrades = trades.length, closedTrades = trades.filter(t => t.status !== "Open");
  const wins = trades.filter(t => t.status === "Win").length, losses = trades.filter(t => t.status === "Loss").length;
  const winRate = closedTrades.length ? Math.round((wins / closedTrades.length) * 100) : 0;
  const monthlyProfit = trades.reduce((a, t) => a + Number(t.profit_loss || 0), 0);
  const tradesWithRRR = trades.filter(t => t.rrr && !isNaN(parseFloat(t.rrr)));
  const avgRRR = tradesWithRRR.length ? (tradesWithRRR.reduce((a, b) => a + parseFloat(b.rrr), 0) / tradesWithRRR.length).toFixed(2) : "–";
  const closedPL = closedTrades.filter(t => t.profit_loss !== "" && t.profit_loss !== undefined);
  const winT = closedPL.filter(t => Number(t.profit_loss) > 0), lossT = closedPL.filter(t => Number(t.profit_loss) < 0);
  const avgWin = winT.length ? (winT.reduce((a, b) => a + Number(b.profit_loss), 0) / winT.length).toFixed(2) : "–";
  const avgLoss = lossT.length ? Math.abs(lossT.reduce((a, b) => a + Number(b.profit_loss), 0) / lossT.length).toFixed(2) : "–";
  const gProfit = winT.reduce((a, b) => a + Number(b.profit_loss), 0), gLoss = Math.abs(lossT.reduce((a, b) => a + Number(b.profit_loss), 0));
  const profitFactor = gLoss > 0 ? (gProfit / gLoss).toFixed(2) : "–";
  const expectancy = closedPL.length ? ((winRate / 100) * parseFloat(avgWin || 0) - (1 - winRate / 100) * parseFloat(avgLoss || 0)).toFixed(2) : "–";
  const eqData = (() => { const s = [...trades].filter(t => t.profit_loss !== "" && t.profit_loss !== undefined).sort((a, b) => a.createdAt - b.createdAt); let r = 10000; return s.map((t, i) => { r += Number(t.profit_loss || 0); return { name: `T${i + 1}`, balance: parseFloat(r.toFixed(2)), v: parseFloat(r.toFixed(2)) }; }); })();
  const sessStats = ["Asian", "London", "New York"].map(s => { const st = trades.filter(t => t.session === s), sc = st.filter(t => t.status !== "Open"), sw = st.filter(t => t.status === "Win").length, sp = st.reduce((a, b) => a + Number(b.profit_loss || 0), 0); return { session: s, trades: st.length, winRate: sc.length ? Math.round((sw / sc.length) * 100) : 0, pnl: sp.toFixed(2) }; });
  const pairStats = CURRENCY_PAIRS.map(p => { const pt = trades.filter(t => t.pair === p); return { pair: p, trades: pt.length, pnl: pt.reduce((a, b) => a + Number(b.profit_loss || 0), 0) }; }).filter(p => p.trades > 0).sort((a, b) => b.pnl - a.pnl);
  const maxDD = (() => { let peak = 10000, maxD = 0, r = 10000; for (const t of [...trades].filter(t => t.profit_loss !== "").sort((a, b) => a.createdAt - b.createdAt)) { r += Number(t.profit_loss || 0); if (r > peak) peak = r; const d = peak - r; if (d > maxD) maxD = d; } return maxD.toFixed(2); })();
  const filteredTrades = trades.filter(t => {
    if (filterPair !== "All" && t.pair !== filterPair) return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    if (filterStrategy && !t.strategy?.toLowerCase().includes(filterStrategy.toLowerCase())) return false;
    if (filterSession !== "All" && t.session !== filterSession) return false;
    return true;
  });
  const traderName = profileData?.displayName || currentUser?.email?.split("@")[0] || "Trader";
  const avatarURL = profileData?.photoURL || `https://ui-avatars.com/api/?name=${traderName}&background=f5c518&color=000&bold=true`;
  const handleFileSelect = type => { setPostType(type); if (type === "image") photoRef.current?.click(); else videoRef.current?.click(); };
  const onFileChange = e => { const f = e.target.files[0]; if (!f) return; setPostFile(f); setPostFilePreview(URL.createObjectURL(f)); };
  const createPost = async () => {
    if (!currentUser) { alert("Please Login"); return; } if (!postCaption && !postFile) { alert("Write something or upload media"); return; }
    setUploading(true);
    try {
      let mediaURL = "", mediaType = "";
      if (postFile) { const sRef = ref(storage, `community/${Date.now()}_${postFile.name}`); await uploadBytes(sRef, postFile); mediaURL = await getDownloadURL(sRef); mediaType = postFile.type.startsWith("video") ? "video" : "image"; }
      await addDoc(collection(db, "posts"), { uid: currentUser.uid, userName: traderName, profileImage: avatarURL, caption: postCaption, mediaURL, mediaType, likes: [], followers: [], createdAt: Date.now() });
      setPostCaption(""); setPostFile(null); setPostFilePreview(null);
    } catch (e) { alert(e.message); }
    setUploading(false);
  };

  const iS = { background: CARD2, color: TEXT1, padding: "9px 11px", borderRadius: 9, outline: "none", border: BORDER, fontSize: 12, width: "100%", boxSizing: "border-box" };

  // ── JOURNAL FILTERED + SORTED ─────────────────────────────────────
  const filteredJournal = trades
    .filter(t => {
      if (journalFilterPair !== "All" && t.pair !== journalFilterPair) return false;
      if (journalFilterStatus !== "All" && t.status !== journalFilterStatus) return false;
      if (journalFilterSession !== "All" && t.session !== journalFilterSession) return false;
      if (journalFilterDir !== "All" && t.direction !== journalFilterDir) return false;
      if (journalSearch) {
        const s = journalSearch.toLowerCase();
        return (
          t.pair?.toLowerCase().includes(s) ||
          t.strategy?.toLowerCase().includes(s) ||
          t.notes_psychology?.toLowerCase().includes(s) ||
          t.emotion?.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let va, vb;
      if (journalSortBy === "date") { va = a.createdAt; vb = b.createdAt; }
      else if (journalSortBy === "pnl") { va = Number(a.profit_loss || 0); vb = Number(b.profit_loss || 0); }
      else if (journalSortBy === "pair") { va = a.pair || ""; vb = b.pair || ""; }
      else if (journalSortBy === "rrr") { va = parseFloat(a.rrr || 0); vb = parseFloat(b.rrr || 0); }
      if (typeof va === "string") return journalSortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return journalSortAsc ? va - vb : vb - va;
    });
  const journalHasFilters = journalFilterPair !== "All" || journalFilterStatus !== "All" || journalFilterSession !== "All" || journalFilterDir !== "All";


  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: MAIN_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${GOLD}`, borderTopColor: "transparent", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: GOLD, fontWeight: 900, fontSize: 16, margin: 0 }}>DREAM CRT</p>
        <p style={{ color: TEXT2, fontSize: 12 }}>Loading Journal...</p>
      </div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  if (!currentUser) return (
    <div style={{ minHeight: "100vh", background: MAIN_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: GOLD_DIM, border: BORDER_G, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <FaChartLine style={{ color: GOLD, fontSize: 24 }} />
        </div>
        <p style={{ color: TEXT1, fontWeight: 900, fontSize: 18, marginBottom: 6 }}>Please Login First</p>
        <p style={{ color: TEXT2, marginBottom: 20 }}>Journal Trading waxay u baahan tahay in aad login garayso</p>
        <a href="/login" style={{ background: GOLD, color: "#000", padding: "11px 28px", borderRadius: 10, fontWeight: 900, textDecoration: "none", fontSize: 14 }}>Go to Login</a>
      </div>
    </div>
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "journal", label: "Trade History", icon: "📋" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "psychology", label: "Psychology", icon: "🧠" },
    { id: "risk", label: "Risk Calculator", icon: "🔢" },
    { id: "sessions", label: "Sessions", icon: "🕐" },
    { id: "community", label: "Community", icon: "👥" },
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const tradeScore = Math.min(100, Math.round(
    (winRate * 0.4) +
    (parseFloat(profitFactor) > 0 ? Math.min(40, parseFloat(profitFactor) * 10) : 0) +
    (parseFloat(avgRRR) > 0 ? Math.min(20, parseFloat(avgRRR) * 5) : 0)
  ));
  const scoreColor = tradeScore >= 70 ? GREEN : tradeScore >= 40 ? GOLD : RED_NEG;

  return (
    <div style={{ minHeight: "100vh", background: MAIN_BG, color: TEXT1, display: "flex", overflow: "hidden" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { width: 3px }
        ::-webkit-scrollbar-track { background: ${MAIN_BG} }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px }
        select option { background: ${CARD2}; color: ${TEXT1} }
        input::placeholder { color: #333 }
      `}</style>

      {showSetup && <SetupModal user={currentUser} onDone={(data) => { setProfileData(data); setShowSetup(false); }} />}
      {showNewTradeModal && <NewTradeModal onClose={() => setShowNewTradeModal(false)} onSave={handleSaveTrade} profileData={profileData} />}
      {profileViewUid && <ProfileViewModal uid={profileViewUid} onClose={() => setProfileViewUid(null)} currentUser={currentUser} />}
      {selectedJournalTrade && (
        <JournalTradeDetailModal
          trade={selectedJournalTrade}
          onClose={() => setSelectedJournalTrade(null)}
          onDelete={async (id) => { if (!window.confirm("Trade delete garaynaa?")) return; await deleteDoc(doc(db, "trades", id)); setSelectedJournalTrade(null); }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div style={{ width: sidebarOpen ? 220 : 64, background: SIDE_BG, borderRight: `1px solid rgba(255,255,255,0.05)`, padding: sidebarOpen ? "18px 10px" : "18px 8px", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width .25s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: sidebarOpen ? 4 : 2, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FaChartLine style={{ color: "#000", fontSize: 15 }} />
          </div>
          {sidebarOpen && <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
            <p style={{ color: TEXT1, fontWeight: 900, fontSize: 14, margin: 0 }}>Dream Crt</p>
            <p style={{ color: TEXT3, fontWeight: 400, fontSize: 10, margin: 0 }}>Trading Journal</p>
          </div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              title={!sidebarOpen ? item.label : ""}
              style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: sidebarOpen ? "9px 10px" : "9px 0", justifyContent: sidebarOpen ? "flex-start" : "center", borderRadius: 9, fontWeight: 600, fontSize: 12, cursor: "pointer", border: "none", transition: "all .15s", background: activeTab === item.id ? GOLD_DIM : "transparent", color: activeTab === item.id ? GOLD : TEXT2 }}>
              <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{item.label}</span>}
              {sidebarOpen && activeTab === item.id && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />}
            </button>
          ))}
        </div>
        {sidebarOpen && (
          <div style={{ background: GOLD_DIM2, border: BORDER_G, borderRadius: 11, padding: "12px 11px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <FaStar style={{ color: GOLD, fontSize: 12 }} />
              <span style={{ color: TEXT1, fontWeight: 700, fontSize: 12 }}>Pro Trader</span>
              <span style={{ background: GOLD, color: "#000", fontSize: 8, fontWeight: 900, padding: "1px 5px", borderRadius: 4, marginLeft: "auto" }}>ACTIVE</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: "75%", background: GOLD, borderRadius: 3 }} />
            </div>
            <button style={{ width: "100%", padding: "7px 0", borderRadius: 8, background: GOLD, color: "#000", border: "none", fontWeight: 900, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <FaRocket size={9} /> Upgrade Plan
            </button>
          </div>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ width: "100%", padding: "8px 0", borderRadius: 8, background: "none", border: BORDER, color: TEXT3, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(245,197,24,0.3)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
          {sidebarOpen ? <><FaBars size={10} /> Collapse</> : <FaBars size={12} />}
        </button>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* TOPBAR */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 26px", borderBottom: `1px solid rgba(255,255,255,0.05)`, background: SIDE_BG, position: "sticky", top: 0, zIndex: 20, flexShrink: 0 }}>
          <div>
            <p style={{ color: TEXT2, fontSize: 11, margin: "0 0 1px" }}>Welcome back,</p>
            <h1 style={{ color: TEXT1, fontWeight: 900, fontSize: 18, margin: 0 }}>
              {navItems.find(n => n.id === activeTab)?.label || "Dashboard"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <button onClick={() => setShowNewTradeModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, fontWeight: 700, color: "#000", fontSize: 12, cursor: "pointer", border: "none", background: GOLD }}>
              <FaPlus size={10} /> New Trade
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: CARD_BG, border: BORDER, borderRadius: 9, padding: "7px 12px" }}>
              <FaSearch style={{ color: TEXT3, fontSize: 11 }} />
              <span style={{ color: TEXT3, fontSize: 11 }}>Search...</span>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: CARD_BG, border: BORDER, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <FaBell style={{ color: TEXT2, fontSize: 13 }} />
              <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: GOLD }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => photoInputRef.current?.click()}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${GOLD}`, overflow: "hidden" }}>
                  <img src={avatarURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: GREEN, border: `2px solid ${SIDE_BG}` }} />
              </div>
              {editingName ? (
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <input value={newName} onChange={e => setNewName(e.target.value)} style={{ background: CARD_BG, color: TEXT1, padding: "4px 9px", borderRadius: 7, fontSize: 11, outline: "none", border: BORDER_G, width: 110 }} placeholder="New name..." />
                  <button onClick={saveName} style={{ background: GOLD, color: "#000", border: "none", borderRadius: 6, padding: "4px 9px", fontSize: 10, fontWeight: 900, cursor: "pointer" }}>Save</button>
                  <button onClick={() => { setEditingName(false); setNameError(""); }} style={{ background: "none", color: TEXT2, border: "none", fontSize: 11, cursor: "pointer" }}>✕</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: TEXT1, fontWeight: 700, fontSize: 12 }}>{traderName}</span>
                  <button onClick={() => { if (!canChangeName()) { setNameError(`Waxaad sugaysaa ${daysLeft()} maalmood`); return; } setNewName(traderName); setEditingName(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT3, fontSize: 10 }}><FaEdit /></button>
                </div>
              )}
              {nameError && <p style={{ color: RED_NEG, fontSize: 9, margin: 0 }}>{nameError}</p>}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
          </div>
        </div>

        {accountBlown && <div style={{ margin: "14px 26px 0", padding: "12px 16px", borderRadius: 10, border: `1px solid ${RED_NEG}`, background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 20 }}>🔴</span><div><p style={{ color: RED_NEG, fontWeight: 900, fontSize: 14, margin: 0 }}>Akoonka waa kaa gubtay sxb!</p><p style={{ color: TEXT2, fontSize: 11, margin: "1px 0 0" }}>Waxaad gaartay ugu badan ee aad lumin karto (${maxDrawdown}).</p></div></div>}

        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <div style={{ padding: "20px 26px", animation: "fadeIn .3s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 18 }}>
              <StatCard label="Net P&L" value={`${monthlyProfit >= 0 ? "+" : ""}$${monthlyProfit.toFixed(2)}`} color={monthlyProfit >= 0 ? GREEN : RED_NEG} change={`${Math.abs(monthlyProfit).toFixed(0)}`} changeUp={monthlyProfit >= 0} sparkData={eqData.slice(-8)} />
              <StatCard label="Profit Factor" value={profitFactor} color={parseFloat(profitFactor) >= 1.5 ? GREEN : GOLD} sparkData={eqData.slice(-8).map((d, i) => ({ v: i + 1 }))} />
              <StatCard label="Win %" value={`${winRate}%`} color={winRate >= 60 ? GREEN : winRate >= 40 ? GOLD : RED_NEG} change={`${wins}W / ${losses}L`} changeUp={winRate >= 50} />
              <StatCard label="Avg Win / Loss" value={`${avgWin !== "–" ? `$${avgWin}` : "–"}`} color={GREEN} />
              <StatCard label="Max Drawdown" value={`-$${maxDD}`} color={RED_NEG} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 14, marginBottom: 18 }}>
              <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "20px 22px" }}>
                <p style={{ color: TEXT2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>Trade Score</p>
                <p style={{ color: TEXT2, fontSize: 10, margin: "0 0 14px" }}>Weighted composite of your edge</p>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor} strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - tradeScore / 100)}`}
                      strokeLinecap="round" transform="rotate(-90 60 60)"
                      style={{ transition: "stroke-dashoffset 1s ease" }} />
                    <text x="60" y="56" textAnchor="middle" fill={TEXT1} fontSize="28" fontWeight="900">{tradeScore}</text>
                    <text x="60" y="72" textAnchor="middle" fill={scoreColor} fontSize="11" fontWeight="700">{tradeScore >= 70 ? "Strong" : tradeScore >= 40 ? "Average" : "Weak"}</text>
                  </svg>
                </div>
                {[
                  { l: "Win rate", v: winRate, max: 100 },
                  { l: "Profit factor", v: Math.min(100, parseFloat(profitFactor || 0) * 20), max: 100 },
                  { l: "Win / loss ratio", v: avgLoss !== "–" && avgWin !== "–" ? Math.min(100, (parseFloat(avgWin) / parseFloat(avgLoss)) * 40) : 0, max: 100 },
                  { l: "Consistency", v: Math.min(100, totalTrades * 5), max: 100 },
                ].map(row => (
                  <div key={row.l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ color: TEXT2, fontSize: 11, width: 100, flexShrink: 0 }}>{row.l}</span>
                    <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${row.v}%`, background: GOLD, borderRadius: 4, transition: "width .8s ease" }} />
                    </div>
                    <span style={{ color: TEXT1, fontSize: 11, fontWeight: 700, width: 26, textAlign: "right" }}>{Math.round(row.v)}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <p style={{ color: TEXT2, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>Equity Curve</p>
                    <p style={{ color: TEXT1, fontWeight: 900, fontSize: 26, margin: 0, letterSpacing: "-1px" }}>${balance.toFixed(2)}</p>
                    <p style={{ color: monthlyProfit >= 0 ? GREEN : RED_NEG, fontSize: 12, margin: "2px 0 0", fontWeight: 700 }}>{monthlyProfit >= 0 ? "+" : ""}${monthlyProfit.toFixed(2)} ({winRate}%)</p>
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["R", "Trades", "%"].map(b => <button key={b} style={{ padding: "4px 10px", borderRadius: 6, background: b === "R" ? GOLD_DIM : "none", border: b === "R" ? BORDER_G : BORDER, color: b === "R" ? GOLD : TEXT3, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{b}</button>)}
                  </div>
                </div>
                {eqData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={eqData}>
                      <defs><linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GOLD} stopOpacity={0.2} /><stop offset="95%" stopColor={GOLD} stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" stroke="#222" tick={{ fill: TEXT3, fontSize: 9 }} />
                      <YAxis stroke="#222" tick={{ fill: TEXT3, fontSize: 9 }} />
                      <Tooltip contentStyle={{ background: CARD2, border: BORDER_G, borderRadius: 8, color: TEXT1, fontSize: 11 }} />
                      <Area type="monotone" dataKey="balance" stroke={GOLD} fill="url(#goldGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: TEXT3, fontSize: 12 }}>Add closed trades to see equity curve</p>
                  </div>
                )}
              </div>
            </div>
            <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "18px 20px", marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ color: TEXT1, fontWeight: 900, fontSize: 14, margin: 0 }}>Recent Trades</p>
                <button onClick={() => setActiveTab("journal")} style={{ color: GOLD, background: "none", border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>View All →</button>
              </div>
              {trades.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <p style={{ color: TEXT3, fontSize: 30, margin: "0 0 8px" }}>📋</p>
                  <p style={{ color: TEXT3, fontSize: 12 }}>No trades yet. Add your first trade!</p>
                  <button onClick={() => setShowNewTradeModal(true)} style={{ marginTop: 10, background: GOLD, color: "#000", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 900, fontSize: 12, cursor: "pointer" }}>+ New Trade</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.7fr 0.8fr 0.8fr 0.7fr 0.8fr 0.6fr 1fr", gap: 6, padding: "0 6px 9px", borderBottom: BORDER }}>
                    {["PAIR", "DIR", "ENTRY", "EXIT", "STATUS", "P/L", "RR", "DATE"].map(h => <span key={h} style={{ color: TEXT3, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }}>{h}</span>)}
                  </div>
                  {[...trades].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8).map(t => {
                    const pl = Number(t.profit_loss || 0);
                    const sc = t.status === "Win" ? GREEN : t.status === "Loss" ? RED_NEG : t.status === "Open" ? BLUE : TEXT3;
                    return (
                      <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.7fr 0.8fr 0.8fr 0.7fr 0.8fr 0.6fr 1fr", gap: 6, padding: "9px 6px", borderBottom: `1px solid rgba(255,255,255,0.03)`, alignItems: "center" }}>
                        <div><p style={{ color: TEXT1, fontWeight: 700, fontSize: 12, margin: 0 }}>{t.pair}</p>{t.strategy && <p style={{ color: TEXT3, fontSize: 9, margin: "1px 0 0" }}>{t.strategy}</p>}</div>
                        <span style={{ background: t.direction === "BUY" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: t.direction === "BUY" ? GREEN : RED_NEG, fontWeight: 700, fontSize: 10, padding: "2px 6px", borderRadius: 5, textAlign: "center", display: "inline-block" }}>{t.direction}</span>
                        <span style={{ color: TEXT2, fontSize: 11 }}>{t.entryPrice || "—"}</span>
                        <span style={{ color: TEXT2, fontSize: 11 }}>{t.takeProfit || "—"}</span>
                        <span style={{ color: sc, fontWeight: 700, fontSize: 10, padding: "2px 6px", borderRadius: 5, background: sc + "15", textAlign: "center", display: "inline-block" }}>{t.status}</span>
                        <span style={{ color: pl >= 0 ? GREEN : RED_NEG, fontWeight: 700, fontSize: 11 }}>{t.profit_loss !== "" && t.profit_loss !== undefined ? `${pl >= 0 ? "+" : ""}$${pl}` : "—"}</span>
                        <span style={{ color: TEXT2, fontSize: 10 }}>{t.rrr ? `1:${t.rrr}` : "—"}</span>
                        <span style={{ color: TEXT3, fontSize: 10 }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {/* ── TRADE HISTORY (NEW CARD UI) ── */}
        {activeTab === "journal" && (
          <div style={{ padding: "20px 26px", animation: "fadeIn .3s ease" }}>
            {/* Summary Bar */}
            <JournalSummaryBar trades={filteredJournal} />

            {/* Search + Filter bar */}
            <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "13px 15px", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{
                  flex: 1, minWidth: 200, display: "flex", alignItems: "center",
                  gap: 8, background: CARD2, border: BORDER, borderRadius: 9, padding: "8px 12px",
                }}>
                  <FaSearch style={{ color: TEXT3, fontSize: 11, flexShrink: 0 }} />
                  <input type="text"
                    placeholder="Raadi pair, strategy, notes, emotion..."
                    value={journalSearch} onChange={e => setJournalSearch(e.target.value)}
                    style={{ flex: 1, background: "none", color: TEXT1, border: "none", outline: "none", fontSize: 12 }}
                  />
                  {journalSearch && (
                    <button onClick={() => setJournalSearch("")}
                      style={{ background: "none", border: "none", color: TEXT3, cursor: "pointer", padding: 0 }}>
                      <FaTimes size={10} />
                    </button>
                  )}
                </div>
                <button onClick={() => setJournalShowFilters(p => !p)} style={{
                  background: journalShowFilters || journalHasFilters ? GOLD_DIM : CARD2,
                  color: journalShowFilters || journalHasFilters ? GOLD : TEXT2,
                  border: journalShowFilters || journalHasFilters ? "1px solid rgba(245,197,24,0.3)" : BORDER,
                  padding: "8px 12px", borderRadius: 9, outline: "none", fontSize: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5, fontWeight: 600, position: "relative",
                }}>
                  <FaFilter size={10} /> Filters
                  {journalHasFilters && (
                    <span style={{
                      position: "absolute", top: -4, right: -4,
                      width: 8, height: 8, borderRadius: "50%", background: GOLD,
                    }} />
                  )}
                </button>
                {[{ label: "Date", key: "date" }, { label: "P&L", key: "pnl" }, { label: "Pair", key: "pair" }, { label: "RR", key: "rrr" }].map(({ label, key }) => (
                  <button key={key} onClick={() => {
                    if (journalSortBy === key) setJournalSortAsc(p => !p);
                    else { setJournalSortBy(key); setJournalSortAsc(false); }
                  }} style={{
                    background: journalSortBy === key ? GOLD_DIM : CARD2,
                    color: journalSortBy === key ? GOLD : TEXT2,
                    border: journalSortBy === key ? "1px solid rgba(245,197,24,0.3)" : BORDER,
                    padding: "8px 12px", borderRadius: 9, outline: "none", fontSize: 12, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                    fontWeight: journalSortBy === key ? 700 : 400,
                  }}>
                    {label}
                    {journalSortBy === key
                      ? (journalSortAsc ? <FaSortAmountUp size={9} /> : <FaSortAmountDown size={9} />)
                      : <FaSortAmountDown size={9} style={{ opacity: 0.2 }} />}
                  </button>
                ))}
                <button onClick={() => setShowNewTradeModal(true)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 9, fontWeight: 700,
                  color: "#000", fontSize: 12, cursor: "pointer", border: "none", background: GOLD,
                }}>
                  <FaPlus size={10} /> New Trade
                </button>
                <div style={{
                  background: GOLD_DIM, border: "1px solid rgba(245,197,24,0.15)",
                  borderRadius: 8, padding: "6px 12px", textAlign: "center",
                }}>
                  <span style={{ color: GOLD, fontWeight: 900, fontSize: 14 }}>{filteredJournal.length}</span>
                  <span style={{ color: TEXT3, fontSize: 9, marginLeft: 4 }}>found</span>
                </div>
              </div>

              {journalShowFilters && (
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4,1fr)",
                  gap: 9, marginTop: 12, paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  animation: "fadeIn .2s ease",
                }}>
                  {[
                    { label: "Pair", val: journalFilterPair, set: setJournalFilterPair, opts: [["All", "All Pairs"], ...CURRENCY_PAIRS.map(p => [p, p])] },
                    { label: "Status", val: journalFilterStatus, set: setJournalFilterStatus, opts: [["All", "All Status"], ["Open", "🟢 Open"], ["Win", "✅ Win"], ["Loss", "❌ Loss"], ["Breakeven", "➖ Breakeven"]] },
                    { label: "Session", val: journalFilterSession, set: setJournalFilterSession, opts: [["All", "All Sessions"], ["Asian", " Asian"], ["London", "🇬🇧 London"], ["New York", "🗽 New York"], ["Overlap", "🔄 Overlap"]] },
                    { label: "Direction", val: journalFilterDir, set: setJournalFilterDir, opts: [["All", "BUY & SELL"], ["BUY", "↑ BUY only"], ["SELL", "↓ SELL only"]] },
                  ].map(({ label, val, set, opts }) => (
                    <div key={label}>
                      <label style={{ color: TEXT3, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>{label}</label>
                      <select value={val} onChange={e => set(e.target.value)} style={{ background: CARD2, color: TEXT1, padding: "8px 12px", borderRadius: 9, outline: "none", border: BORDER, fontSize: 12, cursor: "pointer", width: "100%" }}>
                        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                  {journalHasFilters && (
                    <button onClick={() => { setJournalFilterPair("All"); setJournalFilterStatus("All"); setJournalFilterSession("All"); setJournalFilterDir("All"); }}
                      style={{
                        gridColumn: "span 4", padding: "7px 0", borderRadius: 8,
                        background: "none", border: "1px solid rgba(239,68,68,0.2)",
                        color: "#ef4444", fontSize: 11, fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      }}>
                      <FaTimes size={9} /> Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Trade Cards */}
            {filteredJournal.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: CARD_BG, border: BORDER, borderRadius: 16 }}>
                <p style={{ fontSize: 38, margin: "0 0 12px" }}>📭</p>
                <p style={{ color: TEXT1, fontWeight: 900, fontSize: 16, margin: "0 0 5px" }}>
                  {trades.length === 0 ? "Wali trade lama galinin" : "Ma jiro natiijo ku haboon"}
                </p>
                <p style={{ color: TEXT3, fontSize: 12, marginBottom: 16 }}>
                  {trades.length === 0 ? "New Trade si aad u bilowdo" : "Filters beddel ama nadiifi"}
                </p>
                {trades.length === 0 && (
                  <button onClick={() => setShowNewTradeModal(true)} style={{
                    background: GOLD, color: "#000", border: "none", borderRadius: 8,
                    padding: "8px 18px", fontWeight: 900, fontSize: 12, cursor: "pointer",
                  }}>+ New Trade</button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredJournal.map((trade, i) => (
                  <div key={trade.id} style={{ animation: `fadeIn .22s ease ${Math.min(i, 10) * 0.035}s both` }}>
                    <JournalTradeCard trade={trade} onDelete={handleDeleteTrade} onOpen={setSelectedJournalTrade} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === "analytics" && (
          <div style={{ padding: "20px 26px", display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn .3s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 11 }}>
              {[
                { l: "Profit Factor", v: profitFactor, c: parseFloat(profitFactor) >= 1.5 ? GREEN : RED_NEG },
                { l: "Expectancy", v: expectancy !== "–" ? `$${expectancy}` : "–", c: parseFloat(expectancy) >= 0 ? GREEN : RED_NEG },
                { l: "Avg Win", v: avgWin !== "–" ? `$${avgWin}` : "–", c: GREEN },
                { l: "Avg Loss", v: avgLoss !== "–" ? `-$${avgLoss}` : "–", c: RED_NEG },
                { l: "Total Wins", v: wins, c: GREEN },
                { l: "Total Losses", v: losses, c: RED_NEG },
                { l: "Max Drawdown", v: `-$${maxDD}`, c: RED_NEG },
                { l: "Win Rate", v: `${winRate}%`, c: winRate >= 60 ? GREEN : GOLD },
              ].map(s => (
                <div key={s.l} style={{ background: CARD_BG, border: BORDER, borderRadius: 11, padding: "12px 14px" }}>
                  <p style={{ color: TEXT2, fontSize: 10, margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.l}</p>
                  <p style={{ color: s.c, fontWeight: 900, fontSize: 18, margin: 0 }}>{s.v}</p>
                </div>
              ))}
            </div>
            <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ color: TEXT1, fontWeight: 900, fontSize: 14, margin: "0 0 14px" }}>📈 Equity Curve</p>
              {eqData.length > 1 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={eqData}>
                    <defs><linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GOLD} stopOpacity={0.2} /><stop offset="95%" stopColor={GOLD} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" stroke="#222" tick={{ fill: TEXT3, fontSize: 9 }} />
                    <YAxis stroke="#222" tick={{ fill: TEXT3, fontSize: 9 }} />
                    <Tooltip contentStyle={{ background: CARD2, border: BORDER_G, borderRadius: 8, color: TEXT1 }} />
                    <Area type="monotone" dataKey="balance" stroke={GOLD} fill="url(#goldGrad2)" strokeWidth={2} dot={{ fill: GOLD, r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p style={{ color: TEXT3, textAlign: "center", padding: "30px 0" }}>Need at least 2 closed trades</p>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "18px 20px" }}>
                <p style={{ color: TEXT1, fontWeight: 900, fontSize: 14, margin: "0 0 12px" }}>🏆 Win/Loss</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={[{ name: "Wins", value: wins }, { name: "Losses", value: losses }, { name: "BE", value: trades.filter(t => t.status === "Breakeven").length }, { name: "Open", value: trades.filter(t => t.status === "Open").length }].filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={68} dataKey="value" label={({ name, value }) => `${name}:${value}`} labelStyle={{ fill: TEXT1, fontSize: 10 }}>
                      {[GREEN, RED_NEG, GOLD, BLUE].map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: CARD2, border: BORDER_G, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "18px 20px" }}>
                <p style={{ color: TEXT1, fontWeight: 900, fontSize: 14, margin: "0 0 12px" }}>💰 Best Pairs</p>
                {pairStats.length === 0 ? <p style={{ color: TEXT3, textAlign: "center", padding: "30px 0" }}>No data yet</p> : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {pairStats.slice(0, 6).map(p => (
                      <div key={p.pair} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: CARD2, borderRadius: 9, padding: "9px 11px", border: BORDER }}>
                        <div><span style={{ color: TEXT1, fontWeight: 700, fontSize: 12 }}>{p.pair}</span><span style={{ color: TEXT3, fontSize: 10, marginLeft: 6 }}>{p.trades} trades</span></div>
                        <span style={{ color: p.pnl >= 0 ? GREEN : RED_NEG, fontWeight: 700, fontSize: 12 }}>{p.pnl >= 0 ? "+" : ""}${p.pnl.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PSYCHOLOGY ── */}
        {activeTab === "psychology" && (
          <div style={{ padding: "20px 26px", animation: "fadeIn .3s ease" }}>
            <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "20px 22px" }}>
              <h1 style={{ color: TEXT1, fontWeight: 900, fontSize: 18, margin: "0 0 3px" }}>Psychology Journal</h1>
              <p style={{ color: GOLD, fontStyle: "italic", fontWeight: 700, fontSize: 12, margin: "0 0 18px" }}>"Control Your Mind, Control Your Trades"</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 11, marginBottom: 20 }}>
                {["Calm 😌", "Confident 💪", "FOMO 😰", "Greedy 🤑", "Revenge 😡", "Tired 😴"].map(emo => {
                  const cnt = trades.filter(t => t.emotion === emo).length, ew = trades.filter(t => t.emotion === emo && t.status === "Win").length, wr = cnt ? Math.round((ew / cnt) * 100) : 0;
                  return (
                    <div key={emo} style={{ background: CARD2, borderRadius: 11, padding: "13px 15px", border: BORDER }}>
                      <p style={{ color: TEXT1, fontWeight: 700, fontSize: 13, margin: "0 0 3px" }}>{emo}</p>
                      <p style={{ color: TEXT2, fontSize: 10, margin: "0 0 7px" }}>{cnt} trades</p>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}><div style={{ height: "100%", width: `${wr}%`, background: GOLD, borderRadius: 3 }} /></div>
                      <p style={{ color: GREEN, fontSize: 10, margin: 0 }}>{wr}% win rate</p>
                    </div>
                  );
                })}
              </div>
              <p style={{ color: TEXT1, fontWeight: 900, fontSize: 13, marginBottom: 10 }}>Recent Notes</p>
              {trades.filter(t => t.notes_psychology).length === 0 ? <p style={{ color: TEXT3, textAlign: "center", padding: "30px 0" }}>Weli notes lama qorin</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...trades].filter(t => t.notes_psychology).sort((a, b) => b.createdAt - a.createdAt).map(t => (
                    <div key={t.id} style={{ background: CARD2, borderRadius: 10, padding: "11px 14px", border: BORDER }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <span style={{ color: GOLD, fontWeight: 700, fontSize: 12 }}>{t.pair} — {t.direction}</span>
                        <div style={{ display: "flex", gap: 8 }}>{t.emotion && <span style={{ color: TEXT2, fontSize: 11 }}>{t.emotion}</span>}<span style={{ color: TEXT3, fontSize: 10 }}>{new Date(t.createdAt).toLocaleDateString()}</span></div>
                      </div>
                      <p style={{ color: TEXT2, fontSize: 12, margin: 0 }}>{t.notes_psychology}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RISK ── */}
        {activeTab === "risk" && (
          <div style={{ padding: "20px 26px", animation: "fadeIn .3s ease" }}>
            <div style={{ maxWidth: 500, margin: "0 auto", background: CARD_BG, border: BORDER, borderRadius: 14, padding: "24px 26px" }}>
              <h1 style={{ color: TEXT1, fontWeight: 900, fontSize: 18, margin: "0 0 3px" }}>Risk Calculator</h1>
              <p style={{ color: TEXT2, marginBottom: 18, fontSize: 12 }}>Position size-kaaga si sax ah u xisaabi</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {[{ l: "Account Balance ($)", v: riskBalance, s: setRiskBalance, p: "10000" }, { l: "Risk % Per Trade", v: riskPercent, s: setRiskPercent, p: "1" }, { l: "Stop Loss (Pips)", v: riskSLPips, s: setRiskSLPips, p: "20" }].map(({ l, v, s, p }) => (
                  <div key={l}>
                    <label style={{ color: TEXT2, fontSize: 10, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</label>
                    <input type="number" placeholder={p} value={v} onChange={e => s(e.target.value)} style={{ width: "100%", background: CARD2, color: TEXT1, padding: "11px 13px", borderRadius: 10, outline: "none", border: BORDER, fontSize: 13, boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <label style={{ color: TEXT2, fontSize: 10, fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pip Value per 1 Lot</label>
                  <select value={riskPipValue} onChange={e => setRiskPipValue(e.target.value)} style={{ width: "100%", background: CARD2, color: TEXT1, padding: "11px 13px", borderRadius: 10, outline: "none", border: BORDER, fontSize: 12, boxSizing: "border-box" }}>
                    <option value="10">$10 — EURUSD, GBPUSD</option>
                    <option value="9.2">$9.2 — USDCHF</option>
                    <option value="7.6">$7.6 — USDJPY</option>
                    <option value="0.1">$0.1 — XAUUSD (Gold)</option>
                    <option value="1">$1 — Custom</option>
                  </select>
                </div>
                <button onClick={calcRisk} style={{ padding: "12px 0", borderRadius: 10, fontWeight: 900, color: "#000", fontSize: 13, cursor: "pointer", border: "none", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><FaCalculator /> Calculate Risk</button>
              </div>
              {riskResult && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ height: 1, background: "rgba(245,197,24,0.15)", marginBottom: 14 }} />
                  <p style={{ color: TEXT1, fontWeight: 900, fontSize: 14, margin: "0 0 10px" }}>📋 Results</p>
                  {[{ l: "Dollar Risk", v: `$${riskResult.dollarRisk}`, c: RED_NEG }, { l: "Lot Size", v: riskResult.lotSize, c: TEXT1 }, { l: "Position Size", v: riskResult.positionSize, c: BLUE }].map(r => (
                    <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: CARD2, borderRadius: 10, padding: "11px 14px", border: BORDER, marginBottom: 7 }}>
                      <span style={{ color: TEXT2, fontWeight: 700, fontSize: 12 }}>{r.l}</span>
                      <span style={{ color: r.c, fontWeight: 900, fontSize: 16 }}>{r.v}</span>
                    </div>
                  ))}
                  <div style={{ background: GOLD_DIM2, border: BORDER_G, borderRadius: 10, padding: "10px 13px", marginTop: 10 }}>
                    <p style={{ color: GOLD, fontSize: 11, fontWeight: 700, margin: 0 }}>💡 Haddaad {riskResult.lotSize} lot isticmaasho oo SL-kaagu yahay {riskSLPips} pips, waxaad khatarsan tahay ${riskResult.dollarRisk} ({riskPercent}%)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        

        {/* ── SESSIONS ── */}
        {activeTab === "sessions" && (
          <div style={{ padding: "20px 26px", animation: "fadeIn .3s ease" }}>
            <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "20px 22px" }}>
              <h1 style={{ color: TEXT1, fontWeight: 900, fontSize: 18, margin: "0 0 3px" }}>Session Tracker</h1>
              <p style={{ color: TEXT2, marginBottom: 18, fontSize: 12 }}>Session-ka aad ku fiicantahay ogaado</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                {sessStats.map(s => {
                  const em = s.session === "Asian" ? "" : s.session === "London" ? "🇬🇧" : s.session === "New York" ? "" : "", pn = parseFloat(s.pnl);
                  return (
                    <div key={s.session} style={{ background: CARD2, borderRadius: 12, padding: "14px 16px", border: BORDER }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 20 }}>{em}</span>
                        <h2 style={{ color: TEXT1, fontWeight: 900, fontSize: 14, margin: 0 }}>{s.session}</h2>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
                        {[{ l: "Trades", v: s.trades, c: TEXT1 }, { l: "Win%", v: `${s.winRate}%`, c: GREEN }, { l: "P&L", v: `${pn >= 0 ? "+" : ""}$${s.pnl}`, c: pn >= 0 ? GREEN : RED_NEG }].map(({ l, v, c }) => (
                          <div key={l} style={{ background: MAIN_BG, borderRadius: 8, padding: "7px 8px", textAlign: "center" }}>
                            <p style={{ color: TEXT3, fontSize: 8, margin: 0, textTransform: "uppercase" }}>{l}</p>
                            <p style={{ color: c, fontWeight: 900, fontSize: 13, margin: "3px 0 0" }}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {sessStats.some(s => s.trades > 0) && (
                <div style={{ background: CARD2, borderRadius: 12, padding: "14px 16px", border: BORDER }}>
                  <p style={{ color: TEXT1, fontWeight: 900, fontSize: 13, margin: "0 0 10px" }}>P&L by Session</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={sessStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="session" stroke="#222" tick={{ fill: TEXT3, fontSize: 9 }} />
                      <YAxis stroke="#222" tick={{ fill: TEXT3, fontSize: 9 }} />
                      <Tooltip contentStyle={{ background: CARD2, border: BORDER_G, borderRadius: 8 }} />
                      <Bar dataKey="pnl" name="P&L ($)" radius={[4, 4, 0, 0]}>{sessStats.map((s, i) => <Cell key={i} fill={parseFloat(s.pnl) >= 0 ? GREEN : RED_NEG} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COMMUNITY ── */}
        {activeTab === "community" && (
          <div style={{ padding: "20px 26px", display: "flex", gap: 18, animation: "fadeIn .3s ease" }}>
            <div style={{ width: 300, flexShrink: 0 }}>
              <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "16px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${GOLD}`, overflow: "hidden" }}><img src={avatarURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                  <div><p style={{ color: TEXT1, fontWeight: 700, margin: 0, fontSize: 12 }}>{traderName}</p><div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN }} /><span style={{ color: GREEN, fontSize: 10 }}>Active</span></div></div>
                </div>
                <textarea placeholder="Share your trade setup..." value={postCaption} onChange={e => { if (e.target.value.length <= 1000) setPostCaption(e.target.value); }} style={{ width: "100%", height: 90, background: CARD2, color: TEXT1, padding: "9px 11px", borderRadius: 10, outline: "none", border: BORDER, resize: "none", fontSize: 12, boxSizing: "border-box", marginBottom: 9 }} />
                {postFilePreview && (
                  <div style={{ marginBottom: 9, borderRadius: 9, overflow: "hidden", position: "relative" }}>
                    {postType === "video" ? <video src={postFilePreview} style={{ width: "100%", maxHeight: 120, borderRadius: 9 }} controls /> : <img src={postFilePreview} alt="" style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 9 }} />}
                    <button onClick={() => { setPostFile(null); setPostFilePreview(null); }} style={{ position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaTimes size={8} /></button>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[{ icon: <FaImage />, label: "Photo", action: () => handleFileSelect("image") }, { icon: <FaVideo />, label: "Video", action: () => handleFileSelect("video") }].map(b => (
                      <button key={b.label} onClick={b.action} style={{ display: "flex", alignItems: "center", gap: 3, background: CARD2, border: BORDER, borderRadius: 7, padding: "5px 9px", color: TEXT1, fontSize: 11, fontWeight: 600, cursor: "pointer" }}><span style={{ color: GOLD }}>{b.icon}</span>{b.label}</button>
                    ))}
                  </div>
                  <button onClick={createPost} disabled={uploading} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 8, fontWeight: 700, color: "#000", fontSize: 11, cursor: "pointer", border: "none", background: GOLD, opacity: uploading ? 0.6 : 1 }}><FaPaperPlane size={10} />{uploading ? "Posting..." : "Post"}</button>
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />
                <input ref={videoRef} type="file" accept="video/*" style={{ display: "none" }} onChange={onFileChange} />
              </div>
              <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "14px 16px" }}>
                <p style={{ color: TEXT2, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Community</p>
                {[{ l: "Total Posts", v: communityPosts.length }, { l: "Total Traders", v: new Set(communityPosts.map(p => p.uid)).size }, { l: "Your Posts", v: communityPosts.filter(p => p.uid === currentUser?.uid).length }].map(s => (
                  <div key={s.l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: BORDER }}>
                    <span style={{ color: TEXT2, fontSize: 11 }}>{s.l}</span>
                    <span style={{ color: GOLD, fontWeight: 700, fontSize: 11 }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {communityPosts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                  <p style={{ color: TEXT3, fontSize: 28, margin: "0 0 8px" }}>📭</p>
                  <p style={{ color: TEXT3, fontSize: 13 }}>No posts yet. Be the first to share!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {communityPosts.map((post, i) => (
                    <div key={post.id} style={{ animation: `fadeIn .3s ease ${i * 0.04}s both` }}>
                      <PostCard post={post} currentUser={currentUser} onViewProfile={uid => setProfileViewUid(uid)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MY PROFILE ── */}
        {activeTab === "profile" && (
          <div style={{ padding: "20px 26px", animation: "fadeIn .3s ease" }}>
            <div style={{ height: 120, borderRadius: "14px 14px 0 0", background: "linear-gradient(135deg,rgba(245,197,24,0.25),rgba(245,197,24,0.04))", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 25% 50%,rgba(245,197,24,0.15),transparent 60%)", borderRadius: "14px 14px 0 0" }} />
            </div>
            <div style={{ background: CARD_BG, border: BORDER, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderRadius: "0 0 14px 14px", padding: "0 24px 24px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: -40, marginBottom: 14 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${GOLD}`, overflow: "hidden", boxShadow: "0 0 20px rgba(245,197,24,0.2)" }}><img src={avatarURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                  <button onClick={() => photoInputRef.current?.click()} style={{ position: "absolute", bottom: 2, right: 2, background: GOLD, color: "#000", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCamera size={9} /></button>
                </div>
                <button onClick={() => { setNewName(traderName); setEditingName(true); }} style={{ padding: "7px 14px", borderRadius: 9, fontWeight: 700, fontSize: 11, cursor: "pointer", border: BORDER_G, background: GOLD_DIM2, color: GOLD, display: "flex", alignItems: "center", gap: 5 }}><FaEdit size={10} /> Edit Profile</button>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <h1 style={{ color: TEXT1, fontWeight: 900, fontSize: 18, margin: 0 }}>{traderName}</h1>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={GOLD}><circle cx="12" cy="12" r="12" /><path d="M9 12l2 2 4-4" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
                </div>
                <p style={{ color: GOLD, fontWeight: 600, fontSize: 11, margin: "0 0 2px" }}>Pro Trader</p>
                <p style={{ color: TEXT3, fontSize: 11, margin: 0 }}>@{currentUser?.email?.split("@")[0]}</p>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[{ l: "Posts", v: communityPosts.filter(p => p.uid === currentUser?.uid).length }, { l: "Followers", v: (profileData?.followers || []).length }, { l: "Following", v: (profileData?.following || []).length }, { l: "Trades", v: trades.length }, { l: "Win Rate", v: `${winRate}%` }].map(s => (
                  <div key={s.l} style={{ textAlign: "center" }}>
                    <p style={{ color: TEXT1, fontWeight: 900, fontSize: 16, margin: 0 }}>{s.v}</p>
                    <p style={{ color: TEXT2, fontSize: 10, margin: "1px 0 0" }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: CARD_BG, border: BORDER, borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ color: TEXT1, fontWeight: 900, fontSize: 14, margin: "0 0 12px" }}>My Posts</p>
              {communityPosts.filter(p => p.uid === currentUser?.uid).length === 0 ? <p style={{ color: TEXT3, textAlign: "center", padding: "30px 0", fontSize: 12 }}>No posts yet.</p> : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 7 }}>
                  {communityPosts.filter(p => p.uid === currentUser?.uid).map(p => (
                    <div key={p.id} style={{ aspectRatio: "1", borderRadius: 9, overflow: "hidden", background: CARD2, border: BORDER, position: "relative", cursor: "pointer" }}>
                      {p.mediaURL && p.mediaType === "image" ? <img src={p.mediaURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 6, gap: 2 }}><FaPaperPlane style={{ color: GOLD, fontSize: 13 }} /><p style={{ color: TEXT2, fontSize: 7, margin: 0, textAlign: "center" }}>{p.caption?.slice(0, 30)}</p></div>}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.75))", padding: "12px 6px 5px", display: "flex", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}><FaHeart style={{ color: GOLD, fontSize: 7 }} /><span style={{ color: "#fff", fontSize: 7 }}>{(p.likes || []).length}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 40 }}>⚙️</span>
              <p style={{ color: TEXT1, fontWeight: 900, fontSize: 16, marginTop: 12 }}>Settings</p>
              <p style={{ color: TEXT3, fontSize: 13 }}>Coming Soon</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}