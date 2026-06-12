import { useEffect, useState } from "react";
import {
  addDoc, collection, query, orderBy, updateDoc, doc,
  arrayUnion, arrayRemove, onSnapshot, getDoc,
} from "firebase/firestore";
import {
  FaCheckCircle, FaHeart, FaRegHeart, FaUserPlus, FaUserCheck,
  FaShare, FaWhatsapp, FaTelegram, FaLink, FaComment, FaTimes,
  FaFilter, FaReply, FaChartLine, FaTrophy, FaFire,
} from "react-icons/fa";
import { db, auth, storage } from "../firebase/config.js";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

// ── THEME ────────────────────────────────────────────────────────────
const GOLD    = "#d4af37";
const GOLD2   = "#f5d060";
const NAV_BG  = "linear-gradient(180deg,#0a1628 0%,#060d1f 100%)";
const MAIN_BG = "#060d1f";
const CARD_BG = "linear-gradient(145deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.02) 100%)";
const CARD_BORDER = "1px solid rgba(212,175,55,0.2)";

// ── SHARE MODAL ──────────────────────────────────────────────────────
function ShareModal({ post, onClose }) {
  const shareUrl = `${window.location.origin}/post/${post.id}`;
  const text = encodeURIComponent(post.caption || "Check out this post!");
  const url  = encodeURIComponent(shareUrl);
  const options = [
    { label:"WhatsApp",  icon:<FaWhatsapp size={22}/>, color:"#25D366", href:`https://wa.me/?text=${text}%20${url}` },
    { label:"Telegram",  icon:<FaTelegram size={22}/>, color:"#229ED9", href:`https://t.me/share/url?url=${url}&text=${text}` },
    { label:"Copy Link", icon:<FaLink size={22}/>,     color:GOLD2,
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
  const [trades, setTrades]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profSnap = await getDoc(doc(db, "profiles", uid));
        if (profSnap.exists()) setProfile(profSnap.data());
        const q = query(collection(db, "trades"));
        const snap = await new Promise(res => {
          const unsub = onSnapshot(query(collection(db,"trades")), s => { unsub(); res(s); });
        });
        const userTrades = snap.docs.filter(d => d.data().userId === uid).map(d => ({ id:d.id, ...d.data() }));
        setTrades(userTrades);
      } catch(e) { console.log(e); }
      setLoading(false);
    };
    loadData();
  }, [uid]);

  const wins = trades.filter(t => t.status==="Win").length;
  const closed = trades.filter(t => t.status!=="Open").length;
  const winRate = closed ? Math.round((wins/closed)*100) : 0;
  const totalPnL = trades.reduce((a,b) => a + Number(b.profit_loss||0), 0);
  const avatarURL = profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName||"T"}&background=d4af37&color=000&bold=true`;

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:420, borderRadius:28, background:"linear-gradient(145deg,#0d1b35,#07111f)", border:CARD_BORDER, overflow:"hidden", boxShadow:"0 0 60px rgba(212,175,55,0.12)" }}>
        {/* Header gradient */}
        <div style={{ height:100, background:"linear-gradient(135deg,rgba(212,175,55,0.15),rgba(59,130,246,0.1))", position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute", top:14, right:14, color:"#6688aa", background:"rgba(0,0,0,0.3)", border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}><FaTimes/></button>
        </div>
        {/* Avatar */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginTop:-44, padding:"0 28px 28px" }}>
          <div style={{ width:88, height:88, borderRadius:"50%", border:`3px solid ${GOLD}`, overflow:"hidden", marginBottom:14, boxShadow:"0 0 20px rgba(212,175,55,0.3)" }}>
            <img src={avatarURL} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
          {loading ? (
            <div style={{ width:32, height:32, borderRadius:"50%", border:`2px solid ${GOLD}`, borderTopColor:"transparent", animation:"spin 1s linear infinite" }} />
          ) : (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <h2 style={{ color:GOLD2, fontWeight:900, fontSize:20, margin:0 }}>{profile?.displayName || "Trader"}</h2>
                <FaCheckCircle style={{ color:"#3b82f6", fontSize:14 }} />
              </div>
              <p style={{ color:"#445", fontSize:13, margin:"0 0 20px" }}>Professional Trader</p>
              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, width:"100%", marginBottom:20 }}>
                {[
                  { label:"Total Trades", value:trades.length, color:GOLD, icon:<FaChartLine/> },
                  { label:"Win Rate",     value:`${winRate}%`,  color:"#22c55e", icon:<FaTrophy/> },
                  { label:"Total P&L",    value:`${totalPnL>=0?"+":""}$${totalPnL.toFixed(0)}`, color:totalPnL>=0?"#22c55e":"#ef4444", icon:<FaFire/> },
                ].map(s => (
                  <div key={s.label} style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"14px 10px", textAlign:"center", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ color:s.color, marginBottom:6, fontSize:14 }}>{s.icon}</div>
                    <p style={{ color:s.color, fontWeight:900, fontSize:17, margin:0 }}>{s.value}</p>
                    <p style={{ color:"#445", fontSize:10, margin:"4px 0 0" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Recent trades */}
              {trades.length > 0 && (
                <div style={{ width:"100%" }}>
                  <p style={{ color:"#6688aa", fontSize:12, fontWeight:700, marginBottom:10 }}>RECENT TRADES</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {[...trades].sort((a,b)=>b.createdAt-a.createdAt).slice(0,4).map(t => {
                      const pl = Number(t.profit_loss||0);
                      const sc = t.status==="Win"?"#22c55e":t.status==="Loss"?"#ef4444":t.status==="Open"?"#38bdf8":"#667";
                      return (
                        <div key={t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"10px 14px", border:"1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ color:GOLD2, fontWeight:900, fontSize:13 }}>{t.pair}</span>
                            <span style={{ color: t.direction==="BUY"?"#22c55e":"#ef4444", fontSize:11, fontWeight:700 }}>{t.direction}</span>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <span style={{ color:sc, fontWeight:700, fontSize:12 }}>{t.status}</span>
                            {t.profit_loss !== "" && t.profit_loss !== undefined && (
                              <span style={{ color:pl>=0?"#22c55e":"#ef4444", fontSize:12, marginLeft:8 }}>{pl>=0?"+":""}${pl}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── COMMENTS SECTION ─────────────────────────────────────────────────
function CommentsSection({ postId, currentUser }) {
  const [comments, setComments]   = useState([]);
  const [text, setText]           = useState("");
  const [replyTo, setReplyTo]     = useState(null); // { id, userName }
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const q = query(collection(db,"posts",postId,"comments"), orderBy("createdAt","asc"));
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
    return () => unsub();
  }, [postId]);

  const submitComment = async () => {
    if (!text.trim() || !currentUser) return;
    await addDoc(collection(db,"posts",postId,"comments"), {
      userName:  currentUser.displayName || "Trader",
      userPhoto: currentUser.photoURL    || null,
      text:      text.trim(),
      createdAt: Date.now(),
      userId:    currentUser.uid,
      replies:   [],
    });
    setText("");
  };

  const submitReply = async (commentId) => {
    if (!replyText.trim() || !currentUser) return;
    const commentRef = doc(db,"posts",postId,"comments",commentId);
    await updateDoc(commentRef, {
      replies: arrayUnion({
        userName:  currentUser.displayName || "Trader",
        userPhoto: currentUser.photoURL    || null,
        text:      replyText.trim(),
        createdAt: Date.now(),
        userId:    currentUser.uid,
      }),
    });
    setReplyText("");
    setReplyTo(null);
  };

  const Avatar = ({ photo, name, size=32 }) => (
    <div style={{ width:size, height:size, borderRadius:"50%", overflow:"hidden", flexShrink:0, background:"rgba(212,175,55,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:GOLD2 }}>
      {photo ? <img src={photo} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : name?.[0]?.toUpperCase()}
    </div>
  );

  return (
    <div style={{ borderTop:"1px solid rgba(212,175,55,0.1)", paddingTop:16, marginTop:4 }}>
      {/* Input */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 16px 16px" }}>
        <Avatar photo={currentUser?.photoURL} name={currentUser?.displayName||"U"} size={34} />
        <div style={{ flex:1, display:"flex", gap:8 }}>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitComment()}
            placeholder="Write a comment..." style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(212,175,55,0.15)", borderRadius:20, padding:"8px 16px", color:"#fff", fontSize:13, outline:"none" }} />
          <button onClick={submitComment} style={{ background:`linear-gradient(135deg,${GOLD},${GOLD2})`, color:"#000", border:"none", borderRadius:20, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Post</button>
        </div>
      </div>

      {/* Comments */}
      <div style={{ display:"flex", flexDirection:"column", gap:12, padding:"0 16px 16px" }}>
        {comments.map(c => (
          <div key={c.id}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <Avatar photo={c.userPhoto} name={c.userName} size={30} />
              <div style={{ flex:1 }}>
                <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:"0 16px 16px 16px", padding:"10px 14px", display:"inline-block", maxWidth:"100%" }}>
                  <span style={{ color:GOLD2, fontWeight:700, fontSize:12, marginRight:8 }}>{c.userName}</span>
                  <span style={{ color:"#aab", fontSize:13 }}>{c.text}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:5, paddingLeft:4 }}>
                  <span style={{ color:"#334", fontSize:11 }}>{new Date(c.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>
                  <button onClick={() => setReplyTo(replyTo?.id===c.id ? null : { id:c.id, userName:c.userName })}
                    style={{ background:"none", border:"none", color:"#6688aa", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                    <FaReply size={10}/> Reply
                  </button>
                </div>
                {/* Replies */}
                {(c.replies||[]).length > 0 && (
                  <div style={{ marginTop:10, paddingLeft:12, borderLeft:"2px solid rgba(212,175,55,0.15)", display:"flex", flexDirection:"column", gap:8 }}>
                    {(c.replies||[]).map((r,i) => (
                      <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                        <Avatar photo={r.userPhoto} name={r.userName} size={24} />
                        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:"0 12px 12px 12px", padding:"8px 12px" }}>
                          <span style={{ color:GOLD2, fontWeight:700, fontSize:11, marginRight:6 }}>{r.userName}</span>
                          <span style={{ color:"#8899aa", fontSize:12 }}>{r.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Reply input */}
                {replyTo?.id === c.id && (
                  <div style={{ display:"flex", gap:8, marginTop:10, paddingLeft:12 }}>
                    <Avatar photo={currentUser?.photoURL} name={currentUser?.displayName||"U"} size={26} />
                    <div style={{ flex:1, display:"flex", gap:8 }}>
                      <input value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitReply(c.id)}
                        placeholder={`Reply to ${c.userName}...`} style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(212,175,55,0.15)", borderRadius:16, padding:"7px 14px", color:"#fff", fontSize:12, outline:"none" }} />
                      <button onClick={()=>submitReply(c.id)} style={{ background:`linear-gradient(135deg,${GOLD},${GOLD2})`, color:"#000", border:"none", borderRadius:16, padding:"7px 14px", fontSize:11, fontWeight:700, cursor:"pointer" }}>↩</button>
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

// ── POST CARD ─────────────────────────────────────────────────────────
function PostCard({ post, currentUser }) {
  const [showComments,  setShowComments]  = useState(false);
  const [shareModal,    setShareModal]    = useState(false);
  const [profileModal,  setProfileModal]  = useState(false);
  const [localPost, setLocalPost] = useState({
    ...post,
    likes:     Array.isArray(post.likes)     ? post.likes     : [],
    followers: Array.isArray(post.followers) ? post.followers : [],
  });

  const isLiked     = localPost.likes.includes(currentUser?.uid);
  const isFollowing = localPost.followers.includes(currentUser?.uid);

  const likePost = async () => {
    if (!currentUser) return;
    const ref = doc(db,"posts",localPost.id);
    if (isLiked) {
      await updateDoc(ref, { likes: arrayRemove(currentUser.uid) });
      setLocalPost(p => ({ ...p, likes: p.likes.filter(id=>id!==currentUser.uid) }));
    } else {
      await updateDoc(ref, { likes: arrayUnion(currentUser.uid) });
      setLocalPost(p => ({ ...p, likes: [...p.likes, currentUser.uid] }));
    }
  };

  const followTrader = async () => {
    if (!currentUser || isFollowing) return;
    await updateDoc(doc(db,"posts",localPost.id), { followers: arrayUnion(currentUser.uid) });
    setLocalPost(p => ({ ...p, followers: [...p.followers, currentUser.uid] }));
  };

  const avatarURL = localPost.profileImage || `https://ui-avatars.com/api/?name=${localPost.userName||"T"}&background=d4af37&color=000&bold=true`;

  return (
    <>
      {shareModal   && <ShareModal  post={localPost} onClose={()=>setShareModal(false)} />}
      {profileModal && <ProfileModal uid={localPost.uid} onClose={()=>setProfileModal(false)} />}

      <article style={{ background:CARD_BG, border:CARD_BORDER, borderRadius:24, overflow:"hidden", backdropFilter:"blur(12px)", boxShadow:"0 4px 32px rgba(0,0,0,0.35)", transition:"transform .2s" }}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.005)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setProfileModal(true)}>
            <div style={{ position:"relative" }}>
              <div style={{ width:50, height:50, borderRadius:"50%", border:`2px solid ${GOLD}`, overflow:"hidden", boxShadow:`0 0 12px rgba(212,175,55,0.25)` }}>
                <img src={avatarURL} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
              <div style={{ position:"absolute", bottom:0, right:0, width:14, height:14, borderRadius:"50%", background:"#22c55e", border:"2px solid #060d1f" }} />
            </div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:"#fff", fontWeight:900, fontSize:15 }}>{localPost.userName}</span>
                <FaCheckCircle style={{ color:"#3b82f6", fontSize:13 }} />
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:3 }}>
                <span style={{ color:GOLD, fontSize:11, fontWeight:600 }}>Professional Trader</span>
                <span style={{ color:"#334", fontSize:10 }}>•</span>
                <span style={{ color:"#445", fontSize:11 }}>{new Date(localPost.createdAt).toLocaleDateString()}</span>
                <span style={{ color:"#334", fontSize:10 }}>•</span>
                <span style={{ color:"#6688aa", fontSize:11 }}>{(localPost.followers||[]).length} followers</span>
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
            <img src={localPost.mediaURL} alt="" style={{ width:"100%", borderRadius:18, objectFit:"cover", maxHeight:400, display:"block" }} />
          </div>
        )}
        {localPost.mediaURL && localPost.mediaType==="video" && (
          <div style={{ padding:"0 16px 14px" }}>
            <video src={localPost.mediaURL} controls style={{ width:"100%", borderRadius:18, maxHeight:400 }} />
          </div>
        )}

        {/* Actions */}
        <div style={{ display:"flex", alignItems:"center", borderTop:"1px solid rgba(212,175,55,0.08)", padding:"4px 0" }}>
          {/* Like */}
          <button onClick={likePost}
            style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0", background:"none", border:"none", cursor:"pointer", color: isLiked?"#ef4444":"#6688aa", fontSize:13, fontWeight:700, transition:"color .2s" }}>
            {isLiked ? <FaHeart style={{ fontSize:16 }}/> : <FaRegHeart style={{ fontSize:16 }}/>}
            <span>{localPost.likes.length}</span>
          </button>

          {/* Comment */}
          <button onClick={()=>setShowComments(!showComments)}
            style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0", background:"none", border:"none", cursor:"pointer", color: showComments?GOLD2:"#6688aa", fontSize:13, fontWeight:700, transition:"color .2s" }}>
            <FaComment style={{ fontSize:16 }}/>
            <span>{localPost.commentCount || 0}</span>
          </button>

          {/* Share */}
          <button onClick={()=>setShareModal(true)}
            style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0", background:"none", border:"none", cursor:"pointer", color:"#6688aa", fontSize:13, fontWeight:700 }}>
            <FaShare style={{ fontSize:16 }}/>
            <span>{localPost.shareCount || 0}</span>
          </button>
        </div>

        {/* Comments section */}
        {showComments && <CommentsSection postId={localPost.id} currentUser={currentUser} />}
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
  const [filter,      setFilter]      = useState("all"); // all | following

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => { setCurrentUser(user); setAuthLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db,"posts"), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => {
        const item = d.data();
        return { id:d.id, ...item, likes: Array.isArray(item.likes)?item.likes:[], followers: Array.isArray(item.followers)?item.followers:[] };
      });
      setPosts(data);
      setLoading(false);
    }, err => { console.log(err); setLoading(false); });
    return () => unsub();
  }, []);

  const displayPosts = filter==="following"
    ? posts.filter(p => (p.followers||[]).includes(currentUser?.uid))
    : posts;

  if (authLoading) {
    return (
      <div style={{ minHeight:"100vh", background:MAIN_BG, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:40, height:40, borderRadius:"50%", border:`2px solid ${GOLD}`, borderTopColor:"transparent", animation:"spin 1s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:MAIN_BG, color:"#fff" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#060d1f} ::-webkit-scrollbar-thumb{background:#1a2a4a;border-radius:4px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      `}</style>

      {/* TOP BANNER */}
      <div style={{ background:"linear-gradient(135deg,rgba(212,175,55,0.08),rgba(59,130,246,0.06))", borderBottom:"1px solid rgba(212,175,55,0.12)", padding:"28px 0 0" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px 28px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${GOLD},${GOLD2})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <FaChartLine style={{ color:"#000", fontSize:16 }} />
                </div>
                <h1 style={{ color:GOLD2, fontWeight:900, fontSize:28, margin:0 }}>Community Feed</h1>
              </div>
              <p style={{ color:"#445", fontSize:12, letterSpacing:3, textTransform:"uppercase", margin:0 }}>Trade · Learn · Connect</p>
            </div>

            {/* Filter tabs */}
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              {["all","following"].map(f => (
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

          {/* Live bar */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:18, background:"rgba(0,0,0,0.2)", borderRadius:12, padding:"10px 16px", border:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", animation:"pulse 2s infinite" }} />
            <span style={{ color:"#22c55e", fontSize:12, fontWeight:700 }}>LIVE</span>
            <span style={{ color:"#445", fontSize:12, marginLeft:4 }}>{posts.length} posts from the community</span>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:GOLD }} />
              <span style={{ color:GOLD, fontSize:11, fontWeight:600 }}>Real-time updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* FEED */}
      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 20px 80px" }}>
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"80px 0" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", border:`2px solid ${GOLD}`, borderTopColor:"transparent", animation:"spin 1s linear infinite" }} />
          </div>
        ) : displayPosts.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📭</div>
            <p style={{ color:"#334", fontSize:16, fontWeight:700 }}>{filter==="following"?"No posts from traders you follow yet":"No posts yet"}</p>
            <p style={{ color:"#223", fontSize:13, marginTop:6 }}>Be the first to share a trade setup!</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {displayPosts.map((post, i) => (
              <div key={post.id} style={{ animation:`fadeIn .4s ease ${i*0.05}s both` }}>
                <PostCard post={post} currentUser={currentUser} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}