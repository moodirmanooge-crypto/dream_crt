import { useEffect, useState, useRef } from "react";
import {
  addDoc, collection, query, orderBy, updateDoc, doc,
  arrayUnion, arrayRemove, onSnapshot, getDoc, increment, deleteDoc,
} from "firebase/firestore";
import {
  FaCheckCircle, FaUserPlus, FaUserCheck,
  FaShare, FaWhatsapp, FaTelegram, FaLink, FaComment, FaTimes,
  FaReply, FaChartLine, FaTrophy, FaFire, FaThumbsUp,
} from "react-icons/fa";
import { db, auth, storage } from "../firebase/config.js";
import { onAuthStateChanged } from "firebase/auth";

// ── THEME ────────────────────────────────────────────────────────────
const GOLD       = "#d4af37";
const GOLD2      = "#f5d060";
const MAIN_BG    = "#060d1f";
const CARD_BG    = "linear-gradient(145deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.02) 100%)";
const CARD_BORDER = "1px solid rgba(212,175,55,0.2)";

// ── REACTION TYPES ───────────────────────────────────────────────────
const REACTIONS = [
  { emoji: "👍", label: "Like",     color: "#2078f4" },
  { emoji: "❤️", label: "Love",     color: "#f33e58" },
  { emoji: "😂", label: "Haha",     color: "#f7b125" },
  { emoji: "😮", label: "Wow",      color: "#f7b125" },
  { emoji: "😭", label: "Sad",      color: "#f7b125" },
  { emoji: "😡", label: "Angry",    color: "#e9710f" },
];

function formatCount(n) {
  if (!n || isNaN(n)) return 0;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "k";
  return n;
}

// ── LIKES LIST MODAL (Facebook-style: who liked) ─────────────────────
function LikesModal({ reactions, onClose }) {
  // reactions = { uid: { emoji, name, photo } }
  const entries = Object.values(reactions || {});
  const grouped = REACTIONS.map(r => ({
    ...r,
    users: entries.filter(e => e.emoji === r.emoji),
  })).filter(g => g.users.length > 0);

  const [tab, setTab] = useState("All");
  const tabs = ["All", ...grouped.map(g => g.emoji)];
  const displayed = tab === "All" ? entries : entries.filter(e => e.emoji === tab);

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:70, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:420, borderRadius:20, background:"#0d1b35", border:CARD_BORDER, overflow:"hidden" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <h3 style={{ color:GOLD2, fontWeight:900, fontSize:17, margin:0 }}>Reactions</h3>
          <button onClick={onClose} style={{ color:"#6688aa", background:"none", border:"none", cursor:"pointer", fontSize:18 }}><FaTimes/></button>
        </div>
        {/* Tabs */}
        <div style={{ display:"flex", gap:4, padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.05)", overflowX:"auto" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:"6px 14px", borderRadius:20, fontWeight:700, fontSize:13, cursor:"pointer", border:"none", whiteSpace:"nowrap",
                background: tab === t ? "rgba(212,175,55,0.15)" : "transparent",
                color: tab === t ? GOLD2 : "#6688aa",
              }}>
              {t === "All" ? `All ${entries.length}` : `${t} ${entries.filter(e=>e.emoji===t).length}`}
            </button>
          ))}
        </div>
        {/* List */}
        <div style={{ maxHeight:360, overflowY:"auto", padding:"8px 0" }}>
          {displayed.length === 0 ? (
            <p style={{ color:"#445", textAlign:"center", padding:"32px 0", fontSize:14 }}>No reactions yet</p>
          ) : displayed.map((entry, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 20px" }}>
              <div style={{ position:"relative" }}>
                <div style={{ width:42, height:42, borderRadius:"50%", overflow:"hidden", background:"rgba(212,175,55,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:GOLD2, fontSize:16 }}>
                  {entry.photo
                    ? <img src={entry.photo} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    : entry.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ position:"absolute", bottom:-2, right:-2, fontSize:14, lineHeight:1 }}>{entry.emoji}</span>
              </div>
              <span style={{ color:"#ccd", fontWeight:600, fontSize:14 }}>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── REACTION PICKER (hover popup) ────────────────────────────────────
function ReactionPicker({ onSelect }) {
  return (
    <div style={{
      position:"absolute", bottom:"calc(100% + 8px)", left:0,
      background:"linear-gradient(145deg,#0d1b35,#07111f)", border:CARD_BORDER,
      borderRadius:40, padding:"8px 12px", display:"flex", gap:4, zIndex:50,
      boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
      animation:"popIn .15s ease",
    }}>
      {REACTIONS.map(r => (
        <button key={r.emoji} onClick={() => onSelect(r.emoji)}
          title={r.label}
          style={{ background:"none", border:"none", cursor:"pointer", fontSize:24, lineHeight:1, transition:"transform .1s", padding:"4px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}
          onMouseEnter={e => e.currentTarget.style.transform="scale(1.4) translateY(-4px)"}
          onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
          {r.emoji}
          <span style={{ fontSize:9, color:"#6688aa" }}>{r.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── SHARE MODAL ──────────────────────────────────────────────────────
function ShareModal({ post, onClose }) {
  const shareUrl = `${window.location.origin}/post/${post.id}`;
  const text = encodeURIComponent(post.caption || "Check out this post!");
  const url  = encodeURIComponent(shareUrl);
  const options = [
    { label:"WhatsApp", icon:<FaWhatsapp size={22}/>, color:"#25D366", href:`https://wa.me/?text=${text}%20${url}` },
    { label:"Telegram", icon:<FaTelegram size={22}/>, color:"#229ED9", href:`https://t.me/share/url?url=${url}&text=${text}` },
    { label:"Copy",     icon:<FaLink size={22}/>,     color:GOLD2,
      action:()=>{ navigator.clipboard.writeText(shareUrl); alert("Link copied!"); onClose(); }},
  ];
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60, display:"flex", alignItems:"flex-end", justifyContent:"center", background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:520, borderRadius:"24px 24px 0 0", padding:"24px 24px 40px", background:"linear-gradient(145deg,#0d1b35,#07111f)", border:CARD_BORDER }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h2 style={{ color:GOLD2, fontWeight:900, fontSize:20, margin:0 }}>Share Post</h2>
          <button onClick={onClose} style={{ color:"#445", background:"none", border:"none", cursor:"pointer", fontSize:18 }}><FaTimes/></button>
        </div>
        <div style={{ display:"flex", justifyContent:"space-around" }}>
          {options.map(opt => opt.href ? (
            <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, textDecoration:"none" }}>
              <div style={{ width:60, height:60, borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", background:opt.color+"22", border:`1px solid ${opt.color}55` }}>
                <span style={{ color:opt.color }}>{opt.icon}</span>
              </div>
              <span style={{ color:"#8899aa", fontSize:12 }}>{opt.label}</span>
            </a>
          ) : (
            <button key={opt.label} onClick={opt.action} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer" }}>
              <div style={{ width:60, height:60, borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", background:opt.color+"22", border:`1px solid ${opt.color}55` }}>
                <span style={{ color:opt.color }}>{opt.icon}</span>
              </div>
              <span style={{ color:"#8899aa", fontSize:12 }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PROFILE MODAL ────────────────────────────────────────────────────
function ProfileModal({ uid, onClose }) {
  const [profile, setProfile] = useState(null);
  const [trades,  setTrades]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db,"profiles",uid));
        if (snap.exists()) setProfile(snap.data());
        const tSnap = await new Promise(res => {
          const unsub = onSnapshot(query(collection(db,"trades")), s => { unsub(); res(s); });
        });
        setTrades(tSnap.docs.filter(d=>d.data().userId===uid).map(d=>({id:d.id,...d.data()})));
      } catch(e){}
      setLoading(false);
    };
    load();
  }, [uid]);

  const wins     = trades.filter(t=>t.status==="Win").length;
  const closed   = trades.filter(t=>t.status!=="Open").length;
  const winRate  = closed ? Math.round((wins/closed)*100) : 0;
  const totalPnL = trades.reduce((a,b)=>a+Number(b.profit_loss||0),0);
  const avatarURL = profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName||"T"}&background=d4af37&color=000&bold=true`;

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:420, borderRadius:28, background:"linear-gradient(145deg,#0d1b35,#07111f)", border:CARD_BORDER, overflow:"hidden" }}>
        <div style={{ height:100, background:"linear-gradient(135deg,rgba(212,175,55,0.15),rgba(59,130,246,0.1))", position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute", top:14, right:14, color:"#6688aa", background:"rgba(0,0,0,0.3)", border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><FaTimes/></button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginTop:-44, padding:"0 28px 28px" }}>
          <div style={{ width:88, height:88, borderRadius:"50%", border:`3px solid ${GOLD}`, overflow:"hidden", marginBottom:14 }}>
            <img src={avatarURL} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          </div>
          {loading ? (
            <div style={{ width:32, height:32, borderRadius:"50%", border:`2px solid ${GOLD}`, borderTopColor:"transparent", animation:"spin 1s linear infinite" }}/>
          ) : (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <h2 style={{ color:GOLD2, fontWeight:900, fontSize:20, margin:0 }}>{profile?.displayName||"Trader"}</h2>
                <FaCheckCircle style={{ color:"#3b82f6", fontSize:14 }}/>
              </div>
              <p style={{ color:"#445", fontSize:13, margin:"0 0 20px" }}>Professional Trader</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, width:"100%", marginBottom:20 }}>
                {[
                  { label:"Trades",   value:trades.length,    color:GOLD,      icon:<FaChartLine/> },
                  { label:"Win Rate", value:`${winRate}%`,     color:"#22c55e", icon:<FaTrophy/> },
                  { label:"P&L",      value:`${totalPnL>=0?"+":""}$${totalPnL.toFixed(0)}`, color:totalPnL>=0?"#22c55e":"#ef4444", icon:<FaFire/> },
                ].map(s=>(
                  <div key={s.label} style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"14px 10px", textAlign:"center", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ color:s.color, marginBottom:6, fontSize:14 }}>{s.icon}</div>
                    <p style={{ color:s.color, fontWeight:900, fontSize:17, margin:0 }}>{s.value}</p>
                    <p style={{ color:"#445", fontSize:10, margin:"4px 0 0" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── REPLY REACTION PICKER (small, inline) ────────────────────────────
function ReplyReactionPicker({ onSelect, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position:"absolute", bottom:"calc(100% + 6px)", left:0,
      background:"#0d1b35", border:CARD_BORDER, borderRadius:30,
      padding:"5px 8px", display:"flex", gap:2, zIndex:60,
      boxShadow:"0 6px 24px rgba(0,0,0,0.6)", animation:"popIn .12s ease",
    }}>
      {REACTIONS.map(r => (
        <button key={r.emoji} onClick={() => onSelect(r.emoji)}
          style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, padding:"2px 4px", transition:"transform .1s" }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.4)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          {r.emoji}
        </button>
      ))}
    </div>
  );
}

// ── COMMENTS SECTION ─────────────────────────────────────────────────
function CommentsSection({ postId, currentUser }) {
  const [comments,  setComments]  = useState([]);
  const [text,      setText]      = useState("");
  const [replyTo,   setReplyTo]   = useState(null);   // { commentId, userName }
  const [replyText, setReplyText] = useState("");
  const [pickerFor, setPickerFor] = useState(null);   // commentId | "reply-{commentId}-{idx}"

  useEffect(() => {
    const q = query(collection(db,"posts",postId,"comments"), orderBy("createdAt","asc"));
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return () => unsub();
  }, [postId]);

  // ── Post comment ──
  const submitComment = async () => {
    if (!text.trim() || !currentUser) return;
    await addDoc(collection(db,"posts",postId,"comments"), {
      userName:  currentUser.displayName || "Trader",
      userPhoto: currentUser.photoURL    || null,
      userId:    currentUser.uid,
      text:      text.trim(),
      createdAt: Date.now(),
      reactions: {},  // { uid: { emoji, name, photo } }
      replies:   [],
    });
    await updateDoc(doc(db,"posts",postId),{ commentCount: increment(1) });
    setText("");
  };

  // ── Post reply ──
  const submitReply = async (commentId) => {
    if (!replyText.trim() || !currentUser) return;
    const cRef = doc(db,"posts",postId,"comments",commentId);
    const cSnap = await getDoc(cRef);
    const existingReplies = cSnap.data()?.replies || [];
    const newReply = {
      userName:  currentUser.displayName || "Trader",
      userPhoto: currentUser.photoURL    || null,
      userId:    currentUser.uid,
      text:      replyText.trim(),
      createdAt: Date.now(),
      reactions: {},  // { uid: { emoji, name, photo } }
    };
    await updateDoc(cRef, { replies: [...existingReplies, newReply] });
    setReplyText("");
    setReplyTo(null);
  };

  // ── React to comment ──
  const reactToComment = async (commentId, emoji) => {
    if (!currentUser) return;
    setPickerFor(null);
    const cRef = doc(db,"posts",postId,"comments",commentId);
    const cSnap = await getDoc(cRef);
    const existing = cSnap.data()?.reactions || {};
    const uid = currentUser.uid;
    const updated = { ...existing };
    if (updated[uid]?.emoji === emoji) {
      delete updated[uid];
    } else {
      updated[uid] = { emoji, name: currentUser.displayName || "Trader", photo: currentUser.photoURL || null };
    }
    await updateDoc(cRef, { reactions: updated });
  };

  // ── React to reply ──
  const reactToReply = async (commentId, replyIdx, emoji) => {
    if (!currentUser) return;
    setPickerFor(null);
    const cRef  = doc(db,"posts",postId,"comments",commentId);
    const cSnap = await getDoc(cRef);
    const replies = [...(cSnap.data()?.replies || [])];
    const reply = { ...replies[replyIdx] };
    const existing = reply.reactions || {};
    const uid = currentUser.uid;
    if (existing[uid]?.emoji === emoji) {
      delete existing[uid];
    } else {
      existing[uid] = { emoji, name: currentUser.displayName || "Trader", photo: currentUser.photoURL || null };
    }
    reply.reactions = existing;
    replies[replyIdx] = reply;
    await updateDoc(cRef, { replies });
  };

  const Avatar = ({ photo, name, size=32 }) => (
    <div style={{ width:size, height:size, borderRadius:"50%", overflow:"hidden", flexShrink:0, background:"rgba(212,175,55,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:Math.round(size*0.4), fontWeight:700, color:GOLD2 }}>
      {photo ? <img src={photo} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : name?.[0]?.toUpperCase()}
    </div>
  );

  // Summarize reactions: top 3 emojis + total count
  const ReactSummary = ({ reactions={}, onClick }) => {
    const entries = Object.values(reactions);
    if (entries.length === 0) return null;
    const counts = {};
    entries.forEach(e => { counts[e.emoji] = (counts[e.emoji]||0)+1; });
    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([e])=>e);
    return (
      <button onClick={onClick} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"2px 8px", display:"flex", alignItems:"center", gap:3, cursor:"pointer" }}>
        {top.map((e,i)=><span key={i} style={{ fontSize:13 }}>{e}</span>)}
        <span style={{ color:"#6688aa", fontSize:11, marginLeft:2 }}>{entries.length}</span>
      </button>
    );
  };

  return (
    <div style={{ borderTop:"1px solid rgba(212,175,55,0.1)", paddingTop:8, marginTop:4 }}>
      {/* Comment input */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px 12px" }}>
        <Avatar photo={currentUser?.photoURL} name={currentUser?.displayName||"U"} size={34}/>
        <div style={{ flex:1, display:"flex", gap:8 }}>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitComment()}
            placeholder="Write a comment..."
            style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(212,175,55,0.15)", borderRadius:20, padding:"9px 16px", color:"#fff", fontSize:13, outline:"none" }}/>
          <button onClick={submitComment}
            style={{ background:`linear-gradient(135deg,${GOLD},${GOLD2})`, color:"#000", border:"none", borderRadius:20, padding:"9px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            Post
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div style={{ display:"flex", flexDirection:"column", gap:16, padding:"0 16px 16px" }}>
        {comments.map(c => {
          const myCommentReaction = currentUser ? c.reactions?.[currentUser.uid]?.emoji : null;
          const commentReactionEntries = Object.values(c.reactions||{});
          return (
            <div key={c.id}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <Avatar photo={c.userPhoto} name={c.userName} size={34}/>
                <div style={{ flex:1 }}>
                  {/* Bubble */}
                  <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:"0 18px 18px 18px", padding:"10px 14px", display:"inline-block", maxWidth:"100%", position:"relative" }}>
                    <span style={{ color:GOLD2, fontWeight:700, fontSize:12, marginRight:8 }}>{c.userName}</span>
                    <span style={{ color:"#ccd", fontSize:13 }}>{c.text}</span>
                    {/* Reaction summary badge on bubble */}
                    {commentReactionEntries.length > 0 && (
                      <div style={{ position:"absolute", bottom:-10, right:8 }}>
                        <ReactSummary reactions={c.reactions} onClick={()=>{}}/>
                      </div>
                    )}
                  </div>
                  {/* Meta row */}
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:14, paddingLeft:4 }}>
                    <span style={{ color:"#445", fontSize:11 }}>{new Date(c.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                    {/* Like comment */}
                    <div style={{ position:"relative" }}>
                      {pickerFor === c.id && (
                        <ReplyReactionPicker onSelect={e=>reactToComment(c.id,e)} onClose={()=>setPickerFor(null)}/>
                      )}
                      <button
                        onClick={() => reactToComment(c.id, myCommentReaction ? myCommentReaction : "👍")}
                        onMouseEnter={() => { const t = setTimeout(()=>setPickerFor(c.id),400); return ()=>clearTimeout(t); }}
                        style={{ background:"none", border:"none", color: myCommentReaction ? "#2078f4" : "#6688aa", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                        {myCommentReaction || <FaThumbsUp size={11}/>}
                        {myCommentReaction ? " Like" : " Like"}
                      </button>
                    </div>
                    <button
                      onClick={() => setReplyTo(replyTo?.commentId===c.id ? null : { commentId:c.id, userName:c.userName })}
                      style={{ background:"none", border:"none", color: replyTo?.commentId===c.id ? GOLD2 : "#6688aa", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                      <FaReply size={10}/> Reply
                    </button>
                    {commentReactionEntries.length > 0 && (
                      <span style={{ color:"#445", fontSize:11 }}>{commentReactionEntries.length} reaction{commentReactionEntries.length!==1?"s":""}</span>
                    )}
                  </div>

                  {/* Replies */}
                  {(c.replies||[]).length > 0 && (
                    <div style={{ marginTop:12, paddingLeft:14, borderLeft:"2px solid rgba(212,175,55,0.15)", display:"flex", flexDirection:"column", gap:12 }}>
                      {(c.replies||[]).map((r,i) => {
                        const myReplyReaction = currentUser ? r.reactions?.[currentUser.uid]?.emoji : null;
                        const replyReactionEntries = Object.values(r.reactions||{});
                        const pickerKey = `reply-${c.id}-${i}`;
                        return (
                          <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                            <Avatar photo={r.userPhoto} name={r.userName} size={28}/>
                            <div style={{ flex:1 }}>
                              <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:"0 14px 14px 14px", padding:"8px 12px", display:"inline-block", position:"relative" }}>
                                <span style={{ color:GOLD2, fontWeight:700, fontSize:11, marginRight:6 }}>{r.userName}</span>
                                <span style={{ color:"#aab", fontSize:12 }}>{r.text}</span>
                                {/* Reaction badge on reply bubble */}
                                {replyReactionEntries.length > 0 && (
                                  <div style={{ position:"absolute", bottom:-10, right:8 }}>
                                    <ReactSummary reactions={r.reactions} onClick={()=>{}}/>
                                  </div>
                                )}
                              </div>
                              {/* Reply meta row */}
                              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:14, paddingLeft:4 }}>
                                <span style={{ color:"#334", fontSize:10 }}>{new Date(r.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                                {/* Like reply */}
                                <div style={{ position:"relative" }}>
                                  {pickerFor === pickerKey && (
                                    <ReplyReactionPicker onSelect={e=>reactToReply(c.id,i,e)} onClose={()=>setPickerFor(null)}/>
                                  )}
                                  <button
                                    onClick={() => reactToReply(c.id, i, myReplyReaction ? myReplyReaction : "👍")}
                                    onMouseEnter={() => { const t = setTimeout(()=>setPickerFor(pickerKey),400); return ()=>clearTimeout(t); }}
                                    style={{ background:"none", border:"none", color: myReplyReaction ? "#2078f4" : "#6688aa", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                                    {myReplyReaction || <FaThumbsUp size={10}/>} Like
                                  </button>
                                </div>
                                {replyReactionEntries.length > 0 && (
                                  <span style={{ color:"#334", fontSize:10 }}>{replyReactionEntries.length}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reply input */}
                  {replyTo?.commentId === c.id && (
                    <div style={{ display:"flex", gap:8, marginTop:10, paddingLeft:14 }}>
                      <Avatar photo={currentUser?.photoURL} name={currentUser?.displayName||"U"} size={26}/>
                      <div style={{ flex:1, display:"flex", gap:6 }}>
                        <input value={replyText} onChange={e=>setReplyText(e.target.value)}
                          onKeyDown={e=>e.key==="Enter"&&submitReply(c.id)}
                          placeholder={`Reply to ${c.userName}...`} autoFocus
                          style={{ flex:1, background:"rgba(255,255,255,0.05)", border:`1px solid ${GOLD}44`, borderRadius:16, padding:"7px 14px", color:"#fff", fontSize:12, outline:"none" }}/>
                        <button onClick={()=>submitReply(c.id)}
                          style={{ background:`linear-gradient(135deg,${GOLD},${GOLD2})`, color:"#000", border:"none", borderRadius:16, padding:"7px 14px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                          ↩
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── POST CARD ─────────────────────────────────────────────────────────
function PostCard({ post, currentUser }) {
  const [showComments,  setShowComments]  = useState(false);
  const [shareModal,    setShareModal]    = useState(false);
  const [profileModal,  setProfileModal]  = useState(false);
  const [showPicker,    setShowPicker]    = useState(false);
  const [showLikesModal,setShowLikesModal]= useState(false);
  const pickerRef = useRef(null);
  const hoverTimer = useRef(null);

  const [localPost, setLocalPost] = useState({
    ...post,
    followers:    Array.isArray(post.followers) ? post.followers : [],
    reactions:    post.reactions    || {},   // { uid: { emoji, name, photo } }
    commentCount: post.commentCount || 0,
    shareCount:   post.shareCount   || 0,
  });

  // Close picker on outside click
  useEffect(() => {
    const h = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const myUid      = currentUser?.uid;
  const myReaction = myUid ? localPost.reactions?.[myUid]?.emoji : null;
  const reactionEntries = Object.values(localPost.reactions || {});
  const totalReactions  = reactionEntries.length;

  // Top 3 emoji counts for summary bar
  const reactionCounts = reactionEntries.reduce((acc,r) => { acc[r.emoji]=(acc[r.emoji]||0)+1; return acc; }, {});
  const topEmojis = Object.entries(reactionCounts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([e])=>e);

  const isFollowing = localPost.followers.includes(myUid);

  const handleReact = async (emoji) => {
    if (!currentUser) return;
    setShowPicker(false);
    const pRef = doc(db,"posts",localPost.id);
    const uid  = currentUser.uid;
    const updated = { ...localPost.reactions };

    if (updated[uid]?.emoji === emoji) {
      // Remove
      delete updated[uid];
      await updateDoc(pRef, { [`reactions.${uid}`]: null });
    } else {
      // Add / change
      const entry = { emoji, name: currentUser.displayName||"Trader", photo: currentUser.photoURL||null };
      updated[uid] = entry;
      await updateDoc(pRef, { [`reactions.${uid}`]: entry });
    }
    setLocalPost(p => ({ ...p, reactions: updated }));
  };

  const quickLike = () => {
    clearTimeout(hoverTimer.current);
    handleReact(myReaction || "👍");
  };

  const followTrader = async () => {
    if (!currentUser || isFollowing) return;
    await updateDoc(doc(db,"posts",localPost.id),{ followers: arrayUnion(myUid) });
    setLocalPost(p=>({...p, followers:[...p.followers,myUid]}));
  };

  const handleShare = async () => {
    setShareModal(true);
    try {
      await updateDoc(doc(db,"posts",localPost.id),{ shareCount: increment(1) });
      setLocalPost(p=>({...p, shareCount:(p.shareCount||0)+1}));
    } catch(_){}
  };

  const avatarURL = localPost.profileImage || `https://ui-avatars.com/api/?name=${localPost.userName||"T"}&background=d4af37&color=000&bold=true`;

  // Like button label & color
  const likeLabel = myReaction
    ? REACTIONS.find(r=>r.emoji===myReaction)?.label || "Like"
    : "Like";
  const likeColor = myReaction
    ? (REACTIONS.find(r=>r.emoji===myReaction)?.color || "#6688aa")
    : "#6688aa";

  return (
    <>
      {shareModal    && <ShareModal post={localPost} onClose={()=>setShareModal(false)}/>}
      {profileModal  && <ProfileModal uid={localPost.uid} onClose={()=>setProfileModal(false)}/>}
      {showLikesModal && <LikesModal reactions={localPost.reactions} onClose={()=>setShowLikesModal(false)}/>}

      <article style={{ background:CARD_BG, border:CARD_BORDER, borderRadius:24, overflow:"hidden", backdropFilter:"blur(12px)", boxShadow:"0 4px 32px rgba(0,0,0,0.35)", transition:"transform .2s" }}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.005)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setProfileModal(true)}>
            <div style={{ position:"relative" }}>
              <div style={{ width:50, height:50, borderRadius:"50%", border:`2px solid ${GOLD}`, overflow:"hidden" }}>
                <img src={avatarURL} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              </div>
              <div style={{ position:"absolute", bottom:0, right:0, width:14, height:14, borderRadius:"50%", background:"#22c55e", border:"2px solid #060d1f" }}/>
            </div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:"#fff", fontWeight:900, fontSize:15 }}>{localPost.userName}</span>
                <FaCheckCircle style={{ color:"#3b82f6", fontSize:13 }}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3, flexWrap:"wrap" }}>
                <span style={{ color:GOLD, fontSize:11, fontWeight:600 }}>Professional Trader</span>
                <span style={{ color:"#334", fontSize:10 }}>•</span>
                <span style={{ color:"#445", fontSize:11 }}>{new Date(localPost.createdAt).toLocaleDateString()}</span>
                <span style={{ color:"#334", fontSize:10 }}>•</span>
                <span style={{ color:"#6688aa", fontSize:11 }}>{formatCount((localPost.followers||[]).length)} followers</span>
              </div>
            </div>
          </div>
          <button onClick={followTrader}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:12, fontWeight:700, fontSize:12, cursor:"pointer", border:"none", transition:"all .2s",
              background: isFollowing ? "rgba(212,175,55,0.1)" : `linear-gradient(135deg,${GOLD},${GOLD2})`,
              color: isFollowing ? GOLD2 : "#000",
            }}>
            {isFollowing ? <><FaUserCheck size={12}/> Following</> : <><FaUserPlus size={12}/> Follow</>}
          </button>
        </div>

        {/* Caption */}
        {localPost.caption && (
          <div style={{ padding:"0 20px 14px" }}>
            <p style={{ color:"#aab", fontSize:14, lineHeight:1.6, margin:0 }}>{localPost.caption}</p>
          </div>
        )}

        {/* Media */}
        {localPost.mediaURL && localPost.mediaType==="image" && (
          <div style={{ padding:"0 16px 14px" }}>
            <img src={localPost.mediaURL} alt="" style={{ width:"100%", borderRadius:18, objectFit:"cover", maxHeight:400 }}/>
          </div>
        )}
        {localPost.mediaURL && localPost.mediaType==="video" && (
          <div style={{ padding:"0 16px 14px" }}>
            <video src={localPost.mediaURL} controls style={{ width:"100%", borderRadius:18, maxHeight:400 }}/>
          </div>
        )}

        {/* ── Reaction summary bar (Facebook-style) ── */}
        {totalReactions > 0 && (
          <button onClick={()=>setShowLikesModal(true)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"0 20px 10px", background:"none", border:"none", cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"center" }}>
              {topEmojis.map((e,i)=>(
                <span key={i} style={{ fontSize:16, marginRight:-3, filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>{e}</span>
              ))}
            </div>
            <span style={{ color:"#6688aa", fontSize:13, marginLeft:4 }}>{formatCount(totalReactions)}</span>
          </button>
        )}

        {/* Divider */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", margin:"0 16px" }}/>

        {/* ── Action bar ── */}
        <div style={{ display:"flex", alignItems:"center", padding:"2px 0" }}>

          {/* Like button with hover-to-expand picker */}
          <div ref={pickerRef} style={{ flex:1, position:"relative" }}>
            {showPicker && (
              <ReactionPicker onSelect={handleReact}/>
            )}
            <button
              onClick={quickLike}
              onMouseEnter={() => { hoverTimer.current = setTimeout(()=>setShowPicker(true), 500); }}
              onMouseLeave={() => clearTimeout(hoverTimer.current)}
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"12px 0", background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:700, color:likeColor, transition:"color .2s" }}>
              <span style={{ fontSize: myReaction ? 17 : 15 }}>{myReaction || "👍"}</span>
              <span>{likeLabel}</span>
            </button>
          </div>

          {/* Comment */}
          <button onClick={()=>setShowComments(!showComments)}
            style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0", background:"none", border:"none", cursor:"pointer", color: showComments?GOLD2:"#6688aa", fontSize:13, fontWeight:700 }}>
            <FaComment style={{ fontSize:15 }}/>
            <span>{formatCount(localPost.commentCount||0)}</span>
          </button>

          {/* Share */}
          <button onClick={handleShare}
            style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0", background:"none", border:"none", cursor:"pointer", color:"#6688aa", fontSize:13, fontWeight:700 }}>
            <FaShare style={{ fontSize:15 }}/>
            <span>{formatCount(localPost.shareCount||0)}</span>
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <CommentsSection postId={localPost.id} currentUser={currentUser}/>
        )}
      </article>
    </>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────
export default function Community() {
  const [posts,       setPosts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [filter,      setFilter]      = useState("all");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setCurrentUser(u); setAuthLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db,"posts"), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => {
        const item = d.data();
        return {
          id:d.id, ...item,
          followers:    Array.isArray(item.followers) ? item.followers : [],
          reactions:    item.reactions    || {},
          commentCount: item.commentCount || 0,
          shareCount:   item.shareCount   || 0,
        };
      }));
      setLoading(false);
    }, err => { console.log(err); setLoading(false); });
    return () => unsub();
  }, []);

  const displayPosts = filter==="following"
    ? posts.filter(p=>(p.followers||[]).includes(currentUser?.uid))
    : posts;

  if (authLoading) return (
    <div style={{ minHeight:"100vh", background:MAIN_BG, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:40, height:40, borderRadius:"50%", border:`2px solid ${GOLD}`, borderTopColor:"transparent", animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:MAIN_BG, color:"#fff" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes popIn{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#060d1f}
        ::-webkit-scrollbar-thumb{background:#1a2a4a;border-radius:4px}
      `}</style>

      {/* TOP BANNER */}
      <div style={{ background:"linear-gradient(135deg,rgba(212,175,55,0.08),rgba(59,130,246,0.06))", borderBottom:"1px solid rgba(212,175,55,0.12)", padding:"28px 0 0" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px 28px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${GOLD},${GOLD2})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <FaChartLine style={{ color:"#000", fontSize:16 }}/>
                </div>
                <h1 style={{ color:GOLD2, fontWeight:900, fontSize:28, margin:0 }}>Community Feed</h1>
              </div>
              <p style={{ color:"#445", fontSize:12, letterSpacing:3, textTransform:"uppercase", margin:0 }}>Trade · Learn · Connect</p>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              {["all","following"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)}
                  style={{ padding:"8px 16px", borderRadius:12, fontWeight:700, fontSize:12, cursor:"pointer", border:"none", textTransform:"capitalize", transition:"all .2s",
                    background: filter===f ? `linear-gradient(135deg,${GOLD},${GOLD2})` : "rgba(255,255,255,0.05)",
                    color: filter===f ? "#000" : "#6688aa",
                  }}>
                  {f==="all"?"🌍 All":"👥 Following"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:18, background:"rgba(0,0,0,0.2)", borderRadius:12, padding:"10px 16px", border:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e" }}/>
            <span style={{ color:"#22c55e", fontSize:12, fontWeight:700 }}>LIVE</span>
            <span style={{ color:"#445", fontSize:12, marginLeft:4 }}>{formatCount(posts.length)} posts from the community</span>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:GOLD }}/>
              <span style={{ color:GOLD, fontSize:11, fontWeight:600 }}>Real-time updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* FEED */}
      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 20px 80px" }}>
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"80px 0" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", border:`2px solid ${GOLD}`, borderTopColor:"transparent", animation:"spin 1s linear infinite" }}/>
          </div>
        ) : displayPosts.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📭</div>
            <p style={{ color:"#334", fontSize:16, fontWeight:700 }}>{filter==="following"?"No posts from traders you follow yet":"No posts yet"}</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {displayPosts.map((post,i)=>(
              <div key={post.id} style={{ animation:`fadeIn .4s ease ${i*0.05}s both` }}>
                <PostCard post={post} currentUser={currentUser}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}