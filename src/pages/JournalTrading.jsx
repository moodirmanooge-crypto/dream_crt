import ForexChart from "../components/ForexChart";
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
  FaLink, FaUserCircle, FaReply, FaMoon, FaDollarSign, FaChevronUp,
} from "react-icons/fa";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const CURRENCY_PAIRS = [
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD",
  "GBPJPY","EURJPY","EURGBP","XAUUSD","XAGUSD","US30","NAS100","SPX500","BTCUSD","ETHUSD",
];
// ── RED / BLACK THEME ───────────────────────────────────────────────────────
const RED    = "#e53e3e";
const RED2   = "#fc5c5c";
const RED_DIM= "rgba(229,62,62,0.15)";
const MAIN_BG= "#0d0d0d";
const SIDE_BG= "#111111";
const CARD_BG= "#181818";
const CARD2  = "#1f1f1f";
const BORDER = "1px solid rgba(255,255,255,0.07)";
const BORDER_R="1px solid rgba(229,62,62,0.25)";
const TEXT1  = "#ffffff";
const TEXT2  = "#999999";
const TEXT3  = "#555555";
const GREEN  = "#22c55e";
const GOLD   = "#d4af37";
const GOLD2  = "#f5d060";
// Aliases so existing JSX continues to work
const NAV_BG = SIDE_BG;
const CARD_BORDER = BORDER;
const ICON_CIRCLE = RED_DIM;

// ── STAT CARD ─────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon, sub }) {
  return (
    <div style={{ background:CARD_BG,border:BORDER,borderRadius:16,padding:"20px 18px",display:"flex",alignItems:"flex-start",gap:16,boxShadow:"0 2px 12px rgba(0,0,0,0.5)" }}>
      <div style={{ width:52,height:52,borderRadius:14,background:RED_DIM,border:BORDER_R,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
        <span style={{ color:RED,fontSize:20 }}>{icon}</span>
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ color:TEXT2,fontSize:13,margin:"0 0 6px",fontWeight:500 }}>{label}</p>
        <p style={{ color:color||TEXT1,fontSize:24,fontWeight:900,margin:0,letterSpacing:"-0.5px" }}>{value}</p>
        {sub&&<p style={{ color:RED,fontSize:11,margin:"4px 0 0",display:"flex",alignItems:"center",gap:3 }}><FaChevronUp size={8}/>{sub}</p>}
      </div>
    </div>
  );
}

// ── SETUP MODAL ───────────────────────────────────────────────────────
function SetupModal({ user, onDone }) {
  const [name,setName]=useState(user?.email?.split("@")[0]||"");
  const [photo,setPhoto]=useState(null);
  const [photoPreview,setPhotoPreview]=useState(null);
  const [saving,setSaving]=useState(false);
  const fileRef=useRef(null);
  const handleFile=(e)=>{ const f=e.target.files[0]; if(!f) return; setPhoto(f); setPhotoPreview(URL.createObjectURL(f)); };
  const handleSave=async()=>{
    if(!name.trim()){alert("Magacaaga gali");return;}
    setSaving(true);
    try{
      let photoURL=`https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=e53e3e&color=fff&bold=true`;
      if(photo){const sRef=ref(storage,`profiles/${user.uid}/avatar_${Date.now()}`);await uploadBytes(sRef,photo);photoURL=await getDownloadURL(sRef);}
      const data={displayName:name.trim(),photoURL,nameChangedAt:Date.now(),strategy:"Not Set",createdAt:Date.now(),setupDone:true,followers:[],following:[],postCount:0,likeCount:0};
      await setDoc(doc(db,"profiles",user.uid),data);
      onDone(data);
    }catch(e){alert(e.message);}
    setSaving(false);
  };
  return (
    <div style={{ position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(0,0,0,0.97)",backdropFilter:"blur(12px)" }}>
      <div style={{ width:"100%",maxWidth:440,borderRadius:24,overflow:"hidden",background:CARD_BG,border:BORDER_R,boxShadow:`0 0 80px rgba(229,62,62,0.2)` }}>
        <div style={{ height:72,background:"linear-gradient(135deg,rgba(229,62,62,0.3),rgba(229,62,62,0.08))",display:"flex",alignItems:"center",justifyContent:"center",borderBottom:BORDER_R }}>
          <span style={{ color:TEXT1,fontWeight:900,fontSize:20 }}>Dream Crt</span>
        </div>
        <div style={{ padding:"28px 32px 36px",display:"flex",flexDirection:"column",alignItems:"center",gap:20 }}>
          <div style={{ textAlign:"center" }}>
            <h2 style={{ color:TEXT1,fontWeight:900,fontSize:20,margin:0 }}>Setup Your Profile</h2>
            <p style={{ color:TEXT2,fontSize:13,margin:"7px 0 0" }}>Profile-kaaga samee si dadku kuu garan karaan</p>
          </div>
          <div style={{ position:"relative",cursor:"pointer" }} onClick={()=>fileRef.current?.click()}>
            <div style={{ width:90,height:90,borderRadius:"50%",border:`2px solid ${RED}`,overflow:"hidden",background:RED_DIM,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 20px rgba(229,62,62,0.3)` }}>
              {photoPreview?<img src={photoPreview} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt=""/>:<FaCamera style={{ color:RED,fontSize:28 }}/>}
            </div>
            <div style={{ position:"absolute",bottom:2,right:2,width:26,height:26,borderRadius:"50%",background:RED,display:"flex",alignItems:"center",justifyContent:"center" }}><FaCamera style={{ color:"#fff",fontSize:11 }}/></div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
          <p style={{ color:TEXT2,fontSize:11,margin:"-16px 0 0" }}>Profile sawirkaaga soo gali (Optional)</p>
          <div style={{ width:"100%" }}>
            <label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:7 }}>Display Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Ahmed Trader" style={{ width:"100%",background:CARD2,color:TEXT1,padding:"13px 16px",borderRadius:12,outline:"none",border:BORDER,fontSize:14,boxSizing:"border-box" }}/>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ width:"100%",padding:"14px 0",borderRadius:12,fontWeight:900,color:"#fff",fontSize:15,cursor:"pointer",border:"none",background:RED,opacity:saving?0.7:1 }}>
            {saving?"Saving...":"🚀 Start Trading Journey"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SHARE MODAL ───────────────────────────────────────────────────────
function ShareModal({ post, onClose }) {
  const shareUrl=`${window.location.origin}/post/${post.id}`;
  const text=encodeURIComponent(post.caption||"Check this trade!");
  const url=encodeURIComponent(shareUrl);
  const opts=[
    {label:"WhatsApp",icon:<FaWhatsapp size={22}/>,color:"#25D366",href:`https://wa.me/?text=${text}%20${url}`},
    {label:"Telegram",icon:<FaTelegram size={22}/>,color:"#229ED9",href:`https://t.me/share/url?url=${url}&text=${text}`},
    {label:"Copy Link",icon:<FaLink size={22}/>,color:GOLD2,action:()=>{navigator.clipboard.writeText(shareUrl);alert("Copied!");onClose();}},
  ];
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:80,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(0,0,0,0.8)",backdropFilter:"blur(6px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:520,borderRadius:"20px 20px 0 0",padding:"22px 22px 36px",background:CARD_BG,border:BORDER_R }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <h2 style={{ color:TEXT1,fontWeight:900,fontSize:17,margin:0 }}>Share Post</h2>
          <button onClick={onClose} style={{ color:TEXT3,background:"none",border:"none",cursor:"pointer",fontSize:17 }}><FaTimes/></button>
        </div>
        <div style={{ display:"flex",justifyContent:"space-around" }}>
          {opts.map(o=>o.href?(
            <a key={o.label} href={o.href} target="_blank" rel="noopener noreferrer" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:8,textDecoration:"none" }}>
              <div style={{ width:58,height:58,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",background:o.color+"22",border:`1px solid ${o.color}55` }}><span style={{ color:o.color }}>{o.icon}</span></div>
              <span style={{ color:TEXT2,fontSize:12 }}>{o.label}</span>
            </a>
          ):(
            <button key={o.label} onClick={o.action} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer" }}>
              <div style={{ width:58,height:58,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",background:o.color+"22",border:`1px solid ${o.color}55` }}><span style={{ color:o.color }}>{o.icon}</span></div>
              <span style={{ color:TEXT2,fontSize:12 }}>{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── COMMENTS ─────────────────────────────────────────────────────────
function CommentsSection({ postId, currentUser }) {
  const [comments,setComments]=useState([]);
  const [text,setText]=useState("");
  const [replyTo,setReplyTo]=useState(null);
  const [replyText,setReplyText]=useState("");
  useEffect(()=>{
    const q=query(collection(db,"posts",postId,"comments"),orderBy("createdAt","asc"));
    return onSnapshot(q,snap=>setComments(snap.docs.map(d=>({id:d.id,...d.data()}))));
  },[postId]);
  const submit=async()=>{ if(!text.trim()||!currentUser) return; await addDoc(collection(db,"posts",postId,"comments"),{userName:currentUser.displayName||"Trader",userPhoto:currentUser.photoURL||null,text:text.trim(),createdAt:Date.now(),userId:currentUser.uid,replies:[]}); setText(""); };
  const submitReply=async(cid)=>{ if(!replyText.trim()||!currentUser) return; await updateDoc(doc(db,"posts",postId,"comments",cid),{replies:arrayUnion({userName:currentUser.displayName||"Trader",userPhoto:currentUser.photoURL||null,text:replyText.trim(),createdAt:Date.now(),userId:currentUser.uid})}); setReplyText("");setReplyTo(null); };
  const Av=({photo,name,sz=30})=>(
    <div style={{ width:sz,height:sz,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:RED_DIM,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:RED }}>
      {photo?<img src={photo} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:name?.[0]?.toUpperCase()}
    </div>
  );
  return (
    <div style={{ borderTop:`1px solid rgba(255,255,255,0.06)`,paddingTop:13,marginTop:4 }}>
      <div style={{ display:"flex",alignItems:"center",gap:10,padding:"0 16px 13px" }}>
        <Av photo={currentUser?.photoURL} name={currentUser?.displayName||"U"} sz={30}/>
        <div style={{ flex:1,display:"flex",gap:8 }}>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Write a comment..." style={{ flex:1,background:CARD2,border:BORDER,borderRadius:18,padding:"7px 14px",color:TEXT1,fontSize:13,outline:"none" }}/>
          <button onClick={submit} style={{ background:RED,color:"#fff",border:"none",borderRadius:18,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer" }}>Post</button>
        </div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:9,padding:"0 16px 13px" }}>
        {comments.map(c=>(
          <div key={c.id}>
            <div style={{ display:"flex",gap:9,alignItems:"flex-start" }}>
              <Av photo={c.userPhoto} name={c.userName} sz={26}/>
              <div style={{ flex:1 }}>
                <div style={{ background:CARD2,borderRadius:"0 12px 12px 12px",padding:"8px 12px",display:"inline-block",maxWidth:"100%" }}>
                  <span style={{ color:RED2,fontWeight:700,fontSize:12,marginRight:7 }}>{c.userName}</span>
                  <span style={{ color:"#bbb",fontSize:13 }}>{c.text}</span>
                </div>
                <div style={{ display:"flex",gap:10,marginTop:3,paddingLeft:3 }}>
                  <span style={{ color:TEXT3,fontSize:10 }}>{new Date(c.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                  <button onClick={()=>setReplyTo(replyTo?.id===c.id?null:{id:c.id,userName:c.userName})} style={{ background:"none",border:"none",color:TEXT2,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:3 }}><FaReply size={8}/> Reply</button>
                </div>
                {(c.replies||[]).length>0&&(
                  <div style={{ marginTop:7,paddingLeft:10,borderLeft:`2px solid rgba(229,62,62,0.2)`,display:"flex",flexDirection:"column",gap:6 }}>
                    {(c.replies||[]).map((r,i)=>(
                      <div key={i} style={{ display:"flex",gap:7,alignItems:"flex-start" }}>
                        <Av photo={r.userPhoto} name={r.userName} sz={20}/>
                        <div style={{ background:CARD2,borderRadius:"0 9px 9px 9px",padding:"6px 10px" }}>
                          <span style={{ color:RED2,fontWeight:700,fontSize:11,marginRight:5 }}>{r.userName}</span>
                          <span style={{ color:"#999",fontSize:12 }}>{r.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {replyTo?.id===c.id&&(
                  <div style={{ display:"flex",gap:7,marginTop:7,paddingLeft:10 }}>
                    <Av photo={currentUser?.photoURL} name={currentUser?.displayName||"U"} sz={22}/>
                    <div style={{ flex:1,display:"flex",gap:7 }}>
                      <input value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitReply(c.id)} placeholder={`Reply to ${c.userName}...`} style={{ flex:1,background:CARD2,border:BORDER,borderRadius:12,padding:"6px 12px",color:TEXT1,fontSize:12,outline:"none" }}/>
                      <button onClick={()=>submitReply(c.id)} style={{ background:RED,color:"#fff",border:"none",borderRadius:12,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer" }}>↩</button>
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
function PostCard({ post, currentUser, onViewProfile }) {
  const [showComments,setShowComments]=useState(false);
  const [shareModal,setShareModal]=useState(false);
  const [localPost,setLocalPost]=useState({...post,likes:Array.isArray(post.likes)?post.likes:[],followers:Array.isArray(post.followers)?post.followers:[]});
  const isLiked=localPost.likes.includes(currentUser?.uid);
  const isFollowing=localPost.followers.includes(currentUser?.uid);
  const likePost=async()=>{
    if(!currentUser)return;
    const r=doc(db,"posts",localPost.id);
    if(isLiked){await updateDoc(r,{likes:arrayRemove(currentUser.uid)});setLocalPost(p=>({...p,likes:p.likes.filter(id=>id!==currentUser.uid)}));}
    else{await updateDoc(r,{likes:arrayUnion(currentUser.uid)});setLocalPost(p=>({...p,likes:[...p.likes,currentUser.uid]}));}
  };
  const followTrader=async()=>{
    if(!currentUser||isFollowing)return;
    await updateDoc(doc(db,"posts",localPost.id),{followers:arrayUnion(currentUser.uid)});
    setLocalPost(p=>({...p,followers:[...p.followers,currentUser.uid]}));
    try{await updateDoc(doc(db,"profiles",localPost.uid),{followers:arrayUnion(currentUser.uid)});}catch(e){}
  };
  const avatarURL=localPost.profileImage||`https://ui-avatars.com/api/?name=${localPost.userName||"T"}&background=e53e3e&color=fff&bold=true`;
  return (
    <>
      {shareModal&&<ShareModal post={localPost} onClose={()=>setShareModal(false)}/>}
      <article style={{ background:CARD_BG,border:BORDER,borderRadius:18,overflow:"hidden",boxShadow:"0 2px 14px rgba(0,0,0,0.4)",transition:"transform .2s" }}
        onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
        onMouseLeave={e=>e.currentTarget.style.transform="none"}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px 10px" }}>
          <div style={{ display:"flex",alignItems:"center",gap:11,cursor:"pointer" }} onClick={()=>onViewProfile(localPost.uid)}>
            <div style={{ position:"relative" }}>
              <div style={{ width:44,height:44,borderRadius:"50%",border:`2px solid ${RED}`,overflow:"hidden" }}><img src={avatarURL} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/></div>
              <div style={{ position:"absolute",bottom:0,right:0,width:11,height:11,borderRadius:"50%",background:GREEN,border:`2px solid ${CARD_BG}` }}/>
            </div>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                <span style={{ color:TEXT1,fontWeight:900,fontSize:14 }}>{localPost.userName}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={RED}><circle cx="12" cy="12" r="12"/><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:7,marginTop:2 }}>
                <span style={{ color:RED,fontSize:11,fontWeight:600 }}>Pro Trader</span>
                <span style={{ color:TEXT3,fontSize:10 }}>•</span>
                <span style={{ color:TEXT2,fontSize:11 }}>{new Date(localPost.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          {localPost.uid!==currentUser?.uid&&(
            <button onClick={followTrader} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer",border:isFollowing?`1px solid ${RED}`:"none",transition:"all .2s",background:isFollowing?"transparent":RED,color:"#fff" }}>
              {isFollowing?<><FaUserCheck size={11}/>Following</>:<><FaUserPlus size={11}/>Follow</>}
            </button>
          )}
        </div>
        {localPost.caption&&<div style={{ padding:"0 16px 10px" }}><p style={{ color:"#ccc",fontSize:14,lineHeight:1.7,margin:0 }}>{localPost.caption}</p></div>}
        {localPost.mediaURL&&localPost.mediaType==="image"&&<div style={{ padding:"0 12px 10px" }}><img src={localPost.mediaURL} alt="" style={{ width:"100%",borderRadius:12,objectFit:"cover",maxHeight:380,display:"block" }}/></div>}
        {localPost.mediaURL&&localPost.mediaType==="video"&&<div style={{ padding:"0 12px 10px" }}><video src={localPost.mediaURL} controls style={{ width:"100%",borderRadius:12,maxHeight:380 }}/></div>}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 16px",borderTop:BORDER }}>
          <div style={{ display:"flex",alignItems:"center",gap:5 }}>
            <div style={{ width:16,height:16,borderRadius:"50%",background:RED,display:"flex",alignItems:"center",justifyContent:"center" }}><FaHeart style={{ color:"#fff",fontSize:8 }}/></div>
            <span style={{ color:TEXT2,fontSize:12 }}>{localPost.likes.length}</span>
          </div>
          <div style={{ display:"flex",gap:12 }}>
            <span style={{ color:TEXT2,fontSize:12 }}>{localPost.commentCount||0} comments</span>
            <span style={{ color:TEXT2,fontSize:12 }}>{(localPost.followers||[]).length} followers</span>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",borderTop:BORDER }}>
          {[
            {action:likePost,icon:isLiked?<FaHeart/>:<FaRegHeart/>,label:"Like",color:isLiked?RED:TEXT2},
            {action:()=>setShowComments(!showComments),icon:<FaComment/>,label:"Comment",color:showComments?RED:TEXT2},
            {action:()=>setShareModal(true),icon:<FaShare/>,label:"Share",color:TEXT2},
          ].map((b,i)=>(
            <button key={i} onClick={b.action} style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px 0",background:"none",border:"none",cursor:"pointer",color:b.color,fontSize:13,fontWeight:700,borderRight:i<2?BORDER:"none" }}>
              {b.icon} {b.label}
            </button>
          ))}
        </div>
        {showComments&&<CommentsSection postId={localPost.id} currentUser={currentUser}/>}
      </article>
    </>
  );
}

// ── PROFILE VIEW MODAL ────────────────────────────────────────────────
function ProfileViewModal({ uid, onClose, currentUser }) {
  const [profile,setProfile]=useState(null);
  const [posts,setPosts]=useState([]);
  const [trades,setTrades]=useState([]);
  const [loading,setLoading]=useState(true);
  const isMe=uid===currentUser?.uid;
  useEffect(()=>{
    const load=async()=>{
      try{
        const pSnap=await getDoc(doc(db,"profiles",uid));
        if(pSnap.exists())setProfile(pSnap.data());
        const pq=query(collection(db,"posts"),where("uid","==",uid),orderBy("createdAt","desc"));
        onSnapshot(pq,s=>setPosts(s.docs.map(d=>({id:d.id,...d.data()}))));
        const tq=query(collection(db,"trades"),where("userId","==",uid));
        onSnapshot(tq,s=>setTrades(s.docs.map(d=>({id:d.id,...d.data()}))));
      }catch(e){}
      setLoading(false);
    };
    load();
  },[uid]);
  const wins=trades.filter(t=>t.status==="Win").length;
  const closed=trades.filter(t=>t.status!=="Open").length;
  const winRate=closed?Math.round((wins/closed)*100):0;
  const totalPnL=trades.reduce((a,b)=>a+Number(b.profit_loss||0),0);
  const totalLikes=posts.reduce((a,b)=>a+(Array.isArray(b.likes)?b.likes.length:0),0);
  const avatarURL=profile?.photoURL||`https://ui-avatars.com/api/?name=${profile?.displayName||"T"}&background=e53e3e&color=fff&bold=true`;
  const followers=profile?.followers||[];
  const following=profile?.following||[];
  const isFollowing=followers.includes(currentUser?.uid);
  const handleFollow=async()=>{
    if(!currentUser||isFollowing)return;
    await updateDoc(doc(db,"profiles",uid),{followers:arrayUnion(currentUser.uid)});
    try{await updateDoc(doc(db,"profiles",currentUser.uid),{following:arrayUnion(uid)});}catch(e){}
    setProfile(p=>({...p,followers:[...(p.followers||[]),currentUser.uid]}));
  };
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:70,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.9)",backdropFilter:"blur(10px)",padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:460,maxHeight:"88vh",borderRadius:24,background:CARD_BG,border:BORDER_R,overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:`0 0 60px rgba(229,62,62,0.15)` }}>
        <div style={{ height:100,background:"linear-gradient(135deg,rgba(229,62,62,0.3),rgba(229,62,62,0.08))",position:"relative",flexShrink:0 }}>
          <button onClick={onClose} style={{ position:"absolute",top:12,right:12,color:TEXT1,background:"rgba(0,0,0,0.5)",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center" }}><FaTimes/></button>
        </div>
        <div style={{ overflowY:"auto",flex:1 }}>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",marginTop:-48,padding:"0 24px 24px" }}>
            <div style={{ width:96,height:96,borderRadius:"50%",border:`3px solid ${RED}`,overflow:"hidden",marginBottom:12,boxShadow:`0 0 20px rgba(229,62,62,0.3)` }}>
              {loading?<div style={{ width:"100%",height:"100%",background:RED_DIM,display:"flex",alignItems:"center",justifyContent:"center" }}><FaUserCircle style={{ color:RED,fontSize:38 }}/></div>:<img src={avatarURL} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>}
            </div>
            {loading?<div style={{ width:36,height:36,borderRadius:"50%",border:`2px solid ${RED}`,borderTopColor:"transparent",animation:"spin 1s linear infinite" }}/>:(
              <>
                <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:3 }}>
                  <h2 style={{ color:TEXT1,fontWeight:900,fontSize:19,margin:0 }}>{profile?.displayName||"Trader"}</h2>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={RED}><circle cx="12" cy="12" r="12"/><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
                </div>
                <p style={{ color:RED,fontSize:12,fontWeight:600,margin:"0 0 3px" }}>Pro Trader</p>
                <p style={{ color:TEXT3,fontSize:12,margin:"0 0 18px" }}>Since {profile?.createdAt?new Date(profile.createdAt).toLocaleDateString():""}</p>
                <div style={{ display:"flex",gap:20,marginBottom:18 }}>
                  {[{l:"Posts",v:posts.length},{l:"Followers",v:followers.length},{l:"Following",v:following.length}].map(s=>(
                    <div key={s.l} style={{ textAlign:"center" }}>
                      <p style={{ color:TEXT1,fontWeight:900,fontSize:17,margin:0 }}>{s.v}</p>
                      <p style={{ color:TEXT2,fontSize:11,margin:"2px 0 0" }}>{s.l}</p>
                    </div>
                  ))}
                </div>
                {!isMe&&<button onClick={handleFollow} style={{ marginBottom:18,padding:"8px 24px",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer",border:isFollowing?`1px solid ${RED}`:"none",background:isFollowing?"transparent":RED,color:"#fff",display:"flex",alignItems:"center",gap:7 }}>{isFollowing?<><FaUserCheck size={11}/>Following</>:<><FaUserPlus size={11}/>Follow</>}</button>}
                <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,width:"100%",marginBottom:18 }}>
                  {[{l:"Trades",v:trades.length,c:RED},{l:"Win%",v:`${winRate}%`,c:GREEN},{l:"P&L",v:`${totalPnL>=0?"+":""}$${totalPnL.toFixed(0)}`,c:totalPnL>=0?GREEN:RED},{l:"Likes",v:totalLikes,c:RED}].map(s=>(
                    <div key={s.l} style={{ background:CARD2,borderRadius:11,padding:"10px 6px",textAlign:"center",border:BORDER }}>
                      <p style={{ color:s.c,fontWeight:900,fontSize:15,margin:0 }}>{s.v}</p>
                      <p style={{ color:TEXT3,fontSize:10,margin:"3px 0 0" }}>{s.l}</p>
                    </div>
                  ))}
                </div>
                {posts.length>0&&(
                  <div style={{ width:"100%" }}>
                    <p style={{ color:TEXT2,fontSize:11,fontWeight:700,marginBottom:9,textTransform:"uppercase",letterSpacing:1 }}>Posts</p>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3 }}>
                      {posts.slice(0,9).map(p=>(
                        <div key={p.id} style={{ aspectRatio:"1",borderRadius:9,overflow:"hidden",background:CARD2,border:BORDER,position:"relative" }}>
                          {p.mediaURL&&p.mediaType==="image"?<img src={p.mediaURL} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:3,padding:7 }}><FaPaperPlane style={{ color:RED,fontSize:18 }}/><p style={{ color:TEXT2,fontSize:8,margin:0,textAlign:"center" }}>{p.caption?.slice(0,35)}</p></div>}
                          <div style={{ position:"absolute",bottom:3,right:3,display:"flex",alignItems:"center",gap:2,background:"rgba(0,0,0,0.65)",borderRadius:6,padding:"2px 5px" }}>
                            <FaHeart style={{ color:RED,fontSize:8 }}/><span style={{ color:"#fff",fontSize:8 }}>{(p.likes||[]).length}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NEW TRADE MODAL ───────────────────────────────────────────────────
function NewTradeModal({ onClose, onSave, profileData }) {
  const [step,setStep]=useState(1);
  const [tradeData,setTradeData]=useState({pair:"XAUUSD",direction:"BUY",entryPrice:"",stopLoss:"",takeProfit:"",lotSize:"",status:"Open",pips:"",profit_loss:"",notes_psychology:"",emotion:"",strategy:"",session:""});
  const [setupImage,setSetupImage]=useState(null);
  const [setupImagePreview,setSetupImagePreview]=useState(null);
  const [uploading,setUploading]=useState(false);
  const imgRef=useRef(null);
  const calcRRR=()=>{ const e=parseFloat(tradeData.entryPrice),sl=parseFloat(tradeData.stopLoss),tp=parseFloat(tradeData.takeProfit); if(!e||!sl||!tp)return null; const risk=Math.abs(e-sl),reward=Math.abs(tp-e); if(risk===0)return null; return(reward/risk).toFixed(2); };
  const rrr=calcRRR();
  const handleImageSelect=(e)=>{ const f=e.target.files[0]; if(!f)return; setSetupImage(f); setSetupImagePreview(URL.createObjectURL(f)); };
  const handleSave=async()=>{
    const user=auth.currentUser; if(!user){alert("Please Login");return;}
    if(!tradeData.pair||!tradeData.entryPrice){alert("Pair iyo Entry Price buuxi");return;}
    setUploading(true);
    try{
      let setupImageURL="";
      if(setupImage){const sRef=ref(storage,`trades/${user.uid}/setup_${Date.now()}`);await uploadBytes(sRef,setupImage);setupImageURL=await getDownloadURL(sRef);}
      await onSave({...tradeData,setupImageURL,rrr:rrr||"",userId:user.uid,userEmail:user.email,userName:profileData?.displayName||user.email.split("@")[0],createdAt:Date.now()});
      onClose();
    }catch(err){alert(err.message);}finally{setUploading(false);}
  };
  const iS={width:"100%",background:CARD2,color:TEXT1,padding:"12px 14px",borderRadius:11,outline:"none",border:BORDER,fontSize:13,boxSizing:"border-box"};
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(0,0,0,0.9)",backdropFilter:"blur(10px)" }}>
      <div style={{ width:"100%",maxWidth:660,borderRadius:24,overflow:"hidden",background:CARD_BG,border:BORDER_R,boxShadow:`0 0 60px rgba(229,62,62,0.15)` }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"22px 28px 18px",borderBottom:BORDER }}>
          <div><h2 style={{ color:TEXT1,fontWeight:900,fontSize:22,margin:0 }}>New Trade Entry</h2><p style={{ color:TEXT2,fontSize:12,margin:"4px 0 0" }}>Step {step} of 2 — {step===1?"Trade Details":"Psychology & Setup"}</p></div>
          <button onClick={onClose} style={{ color:TEXT2,background:"none",border:"none",cursor:"pointer",fontSize:16 }}><FaTimes/></button>
        </div>
        <div style={{ padding:26,overflowY:"auto",maxHeight:"60vh" }}>
          {step===1&&(
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:13 }}>
                <div><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6 }}>Currency Pair</label><select value={tradeData.pair} onChange={e=>setTradeData({...tradeData,pair:e.target.value})} style={iS}>{CURRENCY_PAIRS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                <div><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6 }}>Direction</label>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7 }}>
                    {["BUY","SELL"].map(d=>(
                      <button key={d} onClick={()=>setTradeData({...tradeData,direction:d})} style={{ padding:"12px 0",borderRadius:11,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,transition:"all .2s",background:tradeData.direction===d?(d==="BUY"?"rgba(34,197,94,0.15)":"rgba(229,62,62,0.15)"):"rgba(255,255,255,0.04)",border:tradeData.direction===d?(d==="BUY"?"1px solid #22c55e":`1px solid ${RED}`):"1px solid rgba(255,255,255,0.08)",color:tradeData.direction===d?(d==="BUY"?GREEN:RED):"#666" }}>
                        {d==="BUY"?<FaArrowUp/>:<FaArrowDown/>} {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11 }}>
                {[{k:"entryPrice",l:"Entry",p:"1.0850"},{k:"stopLoss",l:"Stop Loss",p:"1.0800"},{k:"takeProfit",l:"Take Profit",p:"1.1000"}].map(({k,l,p})=>(
                  <div key={k}><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6 }}>{l}</label><input type="number" step="any" placeholder={p} value={tradeData[k]} onChange={e=>setTradeData({...tradeData,[k]:e.target.value})} style={iS}/></div>
                ))}
              </div>
              {rrr&&<div style={{ display:"flex",alignItems:"center",gap:11,background:RED_DIM,border:BORDER_R,borderRadius:11,padding:"10px 14px" }}><FaTrophy style={{ color:RED }}/><span style={{ color:TEXT1,fontWeight:900 }}>RRR = 1:{rrr}</span><span style={{ marginLeft:"auto",fontSize:12,fontWeight:700,color:parseFloat(rrr)>=2?GREEN:parseFloat(rrr)>=1?GOLD:RED }}>{parseFloat(rrr)>=2?"✅ Great":parseFloat(rrr)>=1?"⚠️ OK":"❌ Risky"}</span></div>}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
                <div><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6 }}>Lot Size</label><input type="number" step="any" placeholder="0.10" value={tradeData.lotSize} onChange={e=>setTradeData({...tradeData,lotSize:e.target.value})} style={iS}/></div>
                <div><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6 }}>Status</label><select value={tradeData.status} onChange={e=>setTradeData({...tradeData,status:e.target.value})} style={iS}><option value="Open">Open 🟢</option><option value="Win">Win ✅</option><option value="Loss">Loss ❌</option><option value="Breakeven">Breakeven ➖</option></select></div>
              </div>
              {tradeData.status!=="Open"&&<div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}><div><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6 }}>Pips</label><input type="number" step="any" placeholder="50" value={tradeData.pips} onChange={e=>setTradeData({...tradeData,pips:e.target.value})} style={iS}/></div><div><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6 }}>P&L ($)</label><input type="number" step="any" placeholder="150 or -50" value={tradeData.profit_loss} onChange={e=>setTradeData({...tradeData,profit_loss:e.target.value})} style={iS}/></div></div>}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
                <div><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6 }}>Strategy</label><input type="text" placeholder="ICT, SMC, Scalping..." value={tradeData.strategy} onChange={e=>setTradeData({...tradeData,strategy:e.target.value})} style={iS}/></div>
                <div><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6 }}>Session</label><select value={tradeData.session} onChange={e=>setTradeData({...tradeData,session:e.target.value})} style={iS}><option value="">Select</option><option value="Asian">🌏 Asian</option><option value="London">🇬🇧 London</option><option value="New York">🗽 New York</option><option value="Overlap">🔄 Overlap</option></select></div>
              </div>
            </div>
          )}
          {step===2&&(
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div style={{ background:RED_DIM,border:BORDER_R,borderRadius:12,padding:"13px 16px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:4 }}><FaBrain style={{ color:RED }}/><span style={{ color:TEXT1,fontWeight:900 }}>Psychology Section</span></div>
                <p style={{ color:TEXT2,fontSize:12,margin:0 }}>Qor dareenkaga iyo nafsaddaada ganacsigaan</p>
              </div>
              <div><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:8 }}>Emotion</label><div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7 }}>{["Calm 😌","Confident 💪","FOMO 😰","Greedy 🤑","Revenge 😡","Tired 😴"].map(e=><button key={e} onClick={()=>setTradeData({...tradeData,emotion:e})} style={{ padding:"10px 5px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .2s",background:tradeData.emotion===e?RED_DIM:"rgba(255,255,255,0.04)",border:tradeData.emotion===e?BORDER_R:BORDER,color:tradeData.emotion===e?RED:TEXT2 }}>{e}</button>)}</div></div>
              <div><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6 }}>Psychology Notes</label><textarea placeholder="Maxaad ka fikiraysay?" value={tradeData.notes_psychology} onChange={e=>setTradeData({...tradeData,notes_psychology:e.target.value})} style={{ ...iS,height:110,resize:"none" }}/></div>
              <div><label style={{ color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6 }}>Chart Screenshot</label>
                <input ref={imgRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleImageSelect}/>
                {setupImagePreview?<div style={{ position:"relative" }}><img src={setupImagePreview} alt="" style={{ width:"100%",maxHeight:160,objectFit:"cover",borderRadius:11 }}/><button onClick={()=>{setSetupImage(null);setSetupImagePreview(null)}} style={{ position:"absolute",top:6,right:6,background:RED,color:"#fff",border:"none",borderRadius:"50%",width:22,height:22,cursor:"pointer" }}><FaTimes size={9}/></button></div>:<div onClick={()=>imgRef.current?.click()} style={{ border:`2px dashed rgba(229,62,62,0.25)`,borderRadius:12,padding:24,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",background:RED_DIM }}><FaUpload style={{ color:RED,fontSize:19,marginBottom:6 }}/><p style={{ color:TEXT1,fontWeight:700,fontSize:13,margin:0 }}>Upload Screenshot</p><p style={{ color:TEXT3,fontSize:11,marginTop:3 }}>PNG, JPG</p></div>}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding:"16px 26px 22px",borderTop:BORDER,display:"flex",justifyContent:"space-between" }}>
          <button onClick={()=>step===1?onClose():setStep(1)} style={{ padding:"10px 20px",borderRadius:11,border:BORDER,background:"none",color:TEXT2,fontWeight:700,cursor:"pointer" }}>{step===1?"Cancel":"← Back"}</button>
          {step===1?<button onClick={()=>setStep(2)} style={{ padding:"10px 26px",borderRadius:11,fontWeight:900,color:"#fff",fontSize:14,cursor:"pointer",border:"none",background:RED }}>Next: Psychology →</button>:<button onClick={handleSave} disabled={uploading} style={{ padding:"10px 26px",borderRadius:11,fontWeight:900,color:"#fff",fontSize:14,cursor:"pointer",border:"none",display:"flex",alignItems:"center",gap:7,background:RED,opacity:uploading?0.6:1 }}><FaSave/>{uploading?"Saving...":"Save Trade"}</button>}
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
export default function JournalTrading() {
  const [trades,setTrades]=useState([]);
  const [activeTab,setActiveTab]=useState("dashboard");
  const [showNewTradeModal,setShowNewTradeModal]=useState(false);
  const [currentUser,setCurrentUser]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [profileData,setProfileData]=useState(null);
  const [showSetup,setShowSetup]=useState(false);
  const [editingName,setEditingName]=useState(false);
  const [newName,setNewName]=useState("");
  const [nameError,setNameError]=useState("");
  const photoInputRef=useRef(null);
  const [postCaption,setPostCaption]=useState("");
  const [postFile,setPostFile]=useState(null);
  const [postFilePreview,setPostFilePreview]=useState(null);
  const [postType,setPostType]=useState("image");
  const [uploading,setUploading]=useState(false);
  const photoRef=useRef(null);
  const videoRef=useRef(null);
  const [balance,setBalance]=useState(0);
  const [maxDrawdown]=useState(2000);
  const [accountBlown,setAccountBlown]=useState(false);
  const [communityPosts,setCommunityPosts]=useState([]);
  const [profileViewUid,setProfileViewUid]=useState(null);
  const [riskBalance,setRiskBalance]=useState("");
  const [riskPercent,setRiskPercent]=useState("");
  const [riskSLPips,setRiskSLPips]=useState("");
  const [riskPipValue,setRiskPipValue]=useState("10");
  const [riskResult,setRiskResult]=useState(null);
  const [goals,setGoals]=useState([]);
  const [newGoal,setNewGoal]=useState({title:"",target:"",current:"",type:"monthly",deadline:""});
  const [showGoalForm,setShowGoalForm]=useState(false);
  const [filterPair,setFilterPair]=useState("All");
  const [filterStatus,setFilterStatus]=useState("All");
  const [filterStrategy,setFilterStrategy]=useState("");
  const [filterSession,setFilterSession]=useState("All");
  const unsubRef=useRef(null);

  useEffect(()=>{
    const unsubAuth=onAuthStateChanged(auth,async(user)=>{
      if(!user||!user.uid){setCurrentUser(null);setProfileData(null);setTrades([]);setBalance(0);setAuthLoading(false);if(unsubRef.current){unsubRef.current();unsubRef.current=null;}return;}
      setCurrentUser(user);setAuthLoading(false);
      if(unsubRef.current)unsubRef.current();
      try{
        const q=query(collection(db,"trades"),where("userId","==",user.uid));
        unsubRef.current=onSnapshot(q,snap=>{
          const f=snap.docs.map(d=>({id:d.id,...d.data()}));
          setTrades(f);
          const pnl=f.reduce((a,t)=>a+Number(t.profit_loss||0),0);
          setBalance(10000+pnl);
          setAccountBlown(Math.abs(Math.min(0,pnl))>=2000);
        });
        const docRef=doc(db,"profiles",user.uid);
        const snap=await getDoc(docRef);
        if(snap.exists()){const data=snap.data();setProfileData(data);if(!data.setupDone)setShowSetup(true);}
        else setShowSetup(true);
        onSnapshot(query(collection(db,"goals"),where("userId","==",user.uid)),s=>setGoals(s.docs.map(d=>({id:d.id,...d.data()}))));
        onSnapshot(query(collection(db,"posts"),orderBy("createdAt","desc")),s=>setCommunityPosts(s.docs.map(d=>({id:d.id,...d.data(),likes:Array.isArray(d.data().likes)?d.data().likes:[],followers:Array.isArray(d.data().followers)?d.data().followers:[]}))));
      }catch(err){console.log(err);}
    });
    return()=>{unsubAuth();if(unsubRef.current)unsubRef.current();};
  },[]);

  const handlePhotoUpload=async(e)=>{
    const file=e.target.files[0];if(!file)return;
    try{const sRef=ref(storage,`profiles/${currentUser.uid}/avatar_${Date.now()}`);await uploadBytes(sRef,file);const url=await getDownloadURL(sRef);await updateDoc(doc(db,"profiles",currentUser.uid),{photoURL:url});setProfileData(p=>({...p,photoURL:url}));}catch(err){alert(err.message);}
  };
  const canChangeName=()=>{if(!profileData?.nameChangedAt)return true;return(Date.now()-profileData.nameChangedAt)/(1000*60*60*24)>=7;};
  const daysLeft=()=>{if(!profileData?.nameChangedAt)return 0;return Math.ceil(7-(Date.now()-profileData.nameChangedAt)/(1000*60*60*24));};
  const saveName=async()=>{
    if(!newName.trim())return;
    if(!canChangeName()){setNameError(`Waxaad sugaysaa ${daysLeft()} maalmood oo kale`);return;}
    await updateDoc(doc(db,"profiles",currentUser.uid),{displayName:newName.trim(),nameChangedAt:Date.now()});
    setProfileData(p=>({...p,displayName:newName.trim(),nameChangedAt:Date.now()}));
    setEditingName(false);setNameError("");
  };
  const handleSaveTrade=async(tradeDoc)=>{
    if(!currentUser){alert("Please Login");return;}
    if(accountBlown){alert("🔴 Akoonka waa kaa gubtay sxb!");return;}
    const newPnL=Number(tradeDoc.profit_loss||0);
    const projLoss=Math.abs(Math.min(0,(balance-10000)+newPnL));
    if(tradeDoc.status!=="Open"&&projLoss>=maxDrawdown){alert(`⚠️ Account blown!\nLoss: $${projLoss.toFixed(2)} / Limit: $${maxDrawdown}`);setAccountBlown(true);return;}
    const saved=await addDoc(collection(db,"trades"),tradeDoc);
    await addDoc(collection(db,"adminNotifications"),{type:"new_trade",tradeId:saved.id,userId:currentUser.uid,userEmail:currentUser.email,pair:tradeDoc.pair,direction:tradeDoc.direction,status:tradeDoc.status,createdAt:Date.now(),read:false});
  };
  const handleDeleteTrade=async(id)=>{if(!window.confirm("Delete?"))return;await deleteDoc(doc(db,"trades",id));};
  const calcRisk=()=>{
    const b=parseFloat(riskBalance),r=parseFloat(riskPercent),s=parseFloat(riskSLPips),p=parseFloat(riskPipValue);
    if(!b||!r||!s||!p){alert("Dhammaan fields buuxi");return;}
    const dr=(b*r)/100,ls=dr/(s*p);
    setRiskResult({dollarRisk:dr.toFixed(2),lotSize:ls.toFixed(2),positionSize:(ls*100000).toFixed(0)});
  };
  const handleSaveGoal=async()=>{
    if(!currentUser)return;
    if(!newGoal.title||!newGoal.target){alert("Title iyo target buuxi");return;}
    await addDoc(collection(db,"goals"),{...newGoal,userId:currentUser.uid,createdAt:Date.now(),completed:false});
    setNewGoal({title:"",target:"",current:"",type:"monthly",deadline:""});setShowGoalForm(false);
  };
  const handleDeleteGoal=async(id)=>{if(!window.confirm("Delete?"))return;await deleteDoc(doc(db,"goals",id));};
  const handleToggleGoal=async(g)=>{await updateDoc(doc(db,"goals",g.id),{completed:!g.completed});};

  // ── Stats (identical to doc3) ──────────────────────────────────────
  const totalTrades=trades.length,closedTrades=trades.filter(t=>t.status!=="Open");
  const wins=trades.filter(t=>t.status==="Win").length,losses=trades.filter(t=>t.status==="Loss").length;
  const winRate=closedTrades.length?Math.round((wins/closedTrades.length)*100):0;
  const monthlyProfit=trades.reduce((a,t)=>a+Number(t.profit_loss||0),0);
  const tradesWithRRR=trades.filter(t=>t.rrr&&!isNaN(parseFloat(t.rrr)));
  const avgRRR=tradesWithRRR.length?(tradesWithRRR.reduce((a,b)=>a+parseFloat(b.rrr),0)/tradesWithRRR.length).toFixed(2):"–";
  const closedPL=closedTrades.filter(t=>t.profit_loss!==""&&t.profit_loss!==undefined);
  const winT=closedPL.filter(t=>Number(t.profit_loss)>0),lossT=closedPL.filter(t=>Number(t.profit_loss)<0);
  const avgWin=winT.length?(winT.reduce((a,b)=>a+Number(b.profit_loss),0)/winT.length).toFixed(2):"–";
  const avgLoss=lossT.length?Math.abs(lossT.reduce((a,b)=>a+Number(b.profit_loss),0)/lossT.length).toFixed(2):"–";
  const gProfit=winT.reduce((a,b)=>a+Number(b.profit_loss),0),gLoss=Math.abs(lossT.reduce((a,b)=>a+Number(b.profit_loss),0));
  const profitFactor=gLoss>0?(gProfit/gLoss).toFixed(2):"–";
  const expectancy=closedPL.length?((winRate/100)*parseFloat(avgWin||0)-(1-winRate/100)*parseFloat(avgLoss||0)).toFixed(2):"–";
  const eqData=(()=>{const s=[...trades].filter(t=>t.profit_loss!==""&&t.profit_loss!==undefined).sort((a,b)=>a.createdAt-b.createdAt);let r=10000;return s.map((t,i)=>{r+=Number(t.profit_loss||0);return{name:`T${i+1}`,balance:parseFloat(r.toFixed(2))};});})();
  const sessStats=["Asian","London","New York","Overlap"].map(s=>{const st=trades.filter(t=>t.session===s),sc=st.filter(t=>t.status!=="Open"),sw=st.filter(t=>t.status==="Win").length,sp=st.reduce((a,b)=>a+Number(b.profit_loss||0),0);return{session:s,trades:st.length,winRate:sc.length?Math.round((sw/sc.length)*100):0,pnl:sp.toFixed(2)};});
  const pairStats=CURRENCY_PAIRS.map(p=>{const pt=trades.filter(t=>t.pair===p);return{pair:p,trades:pt.length,pnl:pt.reduce((a,b)=>a+Number(b.profit_loss||0),0)};}).filter(p=>p.trades>0).sort((a,b)=>b.pnl-a.pnl);
  const maxDD=(()=>{let peak=10000,maxD=0,r=10000;for(const t of[...trades].filter(t=>t.profit_loss!=="").sort((a,b)=>a.createdAt-b.createdAt)){r+=Number(t.profit_loss||0);if(r>peak)peak=r;const d=peak-r;if(d>maxD)maxD=d;}return maxD.toFixed(2);})();
  const filteredTrades=trades.filter(t=>{if(filterPair!=="All"&&t.pair!==filterPair)return false;if(filterStatus!=="All"&&t.status!==filterStatus)return false;if(filterStrategy&&!t.strategy?.toLowerCase().includes(filterStrategy.toLowerCase()))return false;if(filterSession!=="All"&&t.session!==filterSession)return false;return true;});
  const traderName=profileData?.displayName||currentUser?.email?.split("@")[0]||"Trader";
  const avatarURL=profileData?.photoURL||`https://ui-avatars.com/api/?name=${traderName}&background=e53e3e&color=fff&bold=true`;
  const handleFileSelect=type=>{setPostType(type);if(type==="image")photoRef.current?.click();else videoRef.current?.click();};
  const onFileChange=e=>{const f=e.target.files[0];if(!f)return;setPostFile(f);setPostFilePreview(URL.createObjectURL(f));};
  const createPost=async()=>{
    if(!currentUser){alert("Please Login");return;}if(!postCaption&&!postFile){alert("Write something or upload media");return;}
    setUploading(true);
    try{
      let mediaURL="",mediaType="";
      if(postFile){const sRef=ref(storage,`community/${Date.now()}_${postFile.name}`);await uploadBytes(sRef,postFile);mediaURL=await getDownloadURL(sRef);mediaType=postFile.type.startsWith("video")?"video":"image";}
      await addDoc(collection(db,"posts"),{uid:currentUser.uid,userName:traderName,profileImage:avatarURL,caption:postCaption,mediaURL,mediaType,likes:[],followers:[],createdAt:Date.now()});
      setPostCaption("");setPostFile(null);setPostFilePreview(null);
    }catch(e){alert(e.message);}
    setUploading(false);
  };

  const iS={background:CARD2,color:TEXT1,padding:"10px 12px",borderRadius:10,outline:"none",border:BORDER,fontSize:12,width:"100%",boxSizing:"border-box"};

  if(authLoading)return<div style={{minHeight:"100vh",background:MAIN_BG,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{width:54,height:54,borderRadius:"50%",border:`3px solid ${RED}`,borderTopColor:"transparent",animation:"spin 1s linear infinite",margin:"0 auto 12px"}}/><p style={{color:TEXT1,fontWeight:900,fontSize:17}}>Dream Crt</p><p style={{color:TEXT2,fontSize:12}}>Loading...</p></div><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>;
  if(!currentUser)return<div style={{minHeight:"100vh",background:MAIN_BG,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><p style={{color:TEXT1,fontWeight:900,fontSize:19,marginBottom:8}}>Please Login First</p><p style={{color:TEXT2}}>Journal Trading waxay u baahan tahay in aad login garayso</p></div></div>;

  const navItems=[
    {id:"dashboard",label:"Dashboard"},
    {id:"journal",label:"Trade History"},
    {id:"analytics",label:"Analytics"},
    {id:"psychology",label:"Psychology"},
    {id:"risk",label:"Risk Calculator"},
    {id:"goals",label:"Goals"},
    {id:"sessions",label:"Sessions"},
    {id:"community",label:"Community"},
    {id:"profile",label:"My Profile"},
    {id:"settings",label:"Settings"},
  ];
  const navIcons={"dashboard":"🏠","journal":"📋","analytics":"📊","psychology":"🧠","risk":"🔢","goals":"🎯","sessions":"🕐","community":"👥","profile":"👤","settings":"⚙️"};

  return (
    <div style={{minHeight:"100vh",background:MAIN_BG,color:TEXT1,display:"flex",overflow:"hidden"}}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:" + MAIN_BG + "} ::-webkit-scrollbar-thumb{background:#333;border-radius:3px} select option{background:" + CARD2 + ";color:" + TEXT1 + "}"}</style>

      {showSetup&&<SetupModal user={currentUser} onDone={(data)=>{setProfileData(data);setShowSetup(false);}}/>}
      {showNewTradeModal&&<NewTradeModal onClose={()=>setShowNewTradeModal(false)} onSave={handleSaveTrade} profileData={profileData}/>}
      {profileViewUid&&<ProfileViewModal uid={profileViewUid} onClose={()=>setProfileViewUid(null)} currentUser={currentUser}/>}

      {/* ── SIDEBAR matching screenshot ── */}
      <div style={{width:236,background:SIDE_BG,borderRight:`1px solid rgba(255,255,255,0.06)`,padding:"20px 12px 20px",display:"flex",flexDirection:"column",flexShrink:0}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,paddingLeft:6,marginBottom:26}}>
          <div style={{width:36,height:36,borderRadius:10,background:RED,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <FaChartLine style={{color:"#fff",fontSize:16}}/>
          </div>
          <div>
            <p style={{color:TEXT1,fontWeight:900,fontSize:15,margin:0}}>Dream Crt</p>
            <p style={{color:TEXT2,fontWeight:400,fontSize:11,margin:0}}>Trading Journal</p>
          </div>
        </div>

        {/* Nav items */}
        <div style={{display:"flex",flexDirection:"column",gap:2,flex:1}}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setActiveTab(item.id)}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 12px",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer",border:"none",transition:"all .2s",
                background:activeTab===item.id?RED:"transparent",
                color:activeTab===item.id?"#fff":TEXT2}}>
              <span style={{fontSize:13,width:18,textAlign:"center"}}>{navIcons[item.id]}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Pro Trader badge */}
        <div style={{background:RED_DIM,border:BORDER_R,borderRadius:12,padding:"13px 12px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
            <span style={{color:RED,fontSize:15}}>💎</span>
            <span style={{color:TEXT1,fontWeight:700,fontSize:13}}>Pro Trader</span>
            <span style={{background:RED,color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:5,marginLeft:"auto"}}>PREMIUM</span>
          </div>
          <p style={{color:TEXT2,fontSize:11,margin:"0 0 9px"}}>Expires: Dec 31, 2026</p>
          <div style={{height:4,background:"rgba(255,255,255,0.1)",borderRadius:4,overflow:"hidden",marginBottom:10}}>
            <div style={{height:"100%",width:"80%",background:RED,borderRadius:4}}/>
          </div>
          <p style={{color:TEXT3,fontSize:10,margin:"0 0 8px",textAlign:"right"}}>80%</p>
          <button style={{width:"100%",padding:"8px 0",borderRadius:9,background:RED,color:"#fff",border:"none",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <FaRocket size={11}/> Upgrade Plan
          </button>
        </div>

        {/* Dark mode toggle */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 4px"}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <FaMoon style={{color:TEXT2,fontSize:12}}/>
            <span style={{color:TEXT2,fontSize:12}}>Dark Mode</span>
          </div>
          <div style={{width:36,height:20,borderRadius:10,background:RED,position:"relative",cursor:"pointer"}}>
            <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:3,right:3}}/>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>

        {/* TOPBAR matching screenshot */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 30px",borderBottom:`1px solid rgba(255,255,255,0.06)`,background:SIDE_BG,position:"sticky",top:0,zIndex:20}}>
          <div>
            <p style={{color:TEXT2,fontSize:12,margin:"0 0 1px",fontWeight:400}}>Welcome back,</p>
            <h1 style={{color:TEXT1,fontWeight:900,fontSize:22,margin:0,display:"flex",alignItems:"center",gap:8}}>
              Trading Journal <span style={{fontSize:20}}>👋</span>
            </h1>
            <p style={{color:TEXT2,fontSize:11,margin:"2px 0 0"}}>Track. Analyze. Improve. Repeat.</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {/* New Trade */}
            <button onClick={()=>setShowNewTradeModal(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 20px",borderRadius:11,fontWeight:700,color:"#fff",fontSize:13,cursor:"pointer",border:"none",background:RED,whiteSpace:"nowrap"}}>
              <FaPlus size={11}/> New Trade
            </button>
            {/* Search */}
            <div style={{display:"flex",alignItems:"center",gap:8,background:CARD_BG,border:BORDER,borderRadius:10,padding:"8px 14px",minWidth:180}}>
              <FaSearch style={{color:TEXT3,fontSize:12}}/>
              <span style={{color:TEXT3,fontSize:12}}>Search anything...</span>
              <span style={{color:TEXT3,fontSize:10,marginLeft:"auto",border:BORDER,borderRadius:4,padding:"1px 5px"}}>⌘K</span>
            </div>
            {/* Bell */}
            <div style={{width:38,height:38,borderRadius:10,background:CARD_BG,border:BORDER,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative"}}>
              <FaBell style={{color:TEXT2,fontSize:14}}/>
              <div style={{position:"absolute",top:7,right:7,width:7,height:7,borderRadius:"50%",background:RED}}/>
            </div>
            {/* Avatar */}
            <div style={{position:"relative",cursor:"pointer"}} onClick={()=>photoInputRef.current?.click()}>
              <div style={{width:38,height:38,borderRadius:"50%",border:`2px solid ${RED}`,overflow:"hidden"}}>
                <img src={avatarURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
              <div style={{position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:"50%",background:GREEN,border:`2px solid ${SIDE_BG}`}}/>
            </div>
            {/* Name edit */}
            <div>
              {editingName?(
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <input value={newName} onChange={e=>setNewName(e.target.value)} style={{background:CARD_BG,color:TEXT1,padding:"5px 10px",borderRadius:8,fontSize:12,outline:"none",border:BORDER_R,width:120}} placeholder="New name..."/>
                  <button onClick={saveName} style={{background:RED,color:"#fff",border:"none",borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Save</button>
                  <button onClick={()=>{setEditingName(false);setNameError("");}} style={{background:"none",color:TEXT2,border:"none",fontSize:11,cursor:"pointer"}}>✕</button>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{color:TEXT1,fontWeight:700,fontSize:13}}>{traderName}</span>
                  <button onClick={()=>{if(!canChangeName()){setNameError(`Waxaad sugaysaa ${daysLeft()} maalmood`);return;}setNewName(traderName);setEditingName(true);}} style={{background:"none",border:"none",cursor:"pointer",color:TEXT3,fontSize:11}}><FaEdit/></button>
                </div>
              )}
              {nameError&&<p style={{color:RED,fontSize:10,margin:"1px 0 0"}}>{nameError}</p>}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoUpload}/>
          </div>
        </div>

        {accountBlown&&<div style={{margin:"16px 30px 0",padding:"14px 18px",borderRadius:12,border:`1px solid ${RED}`,background:RED_DIM,display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:24}}>🔴</span><div><p style={{color:RED,fontWeight:900,fontSize:15,margin:0}}>Akoonka waa kaa gubtay sxb!</p><p style={{color:TEXT2,fontSize:12,margin:"2px 0 0"}}>Waxaad gaartay ugu badan ee aad lumin karto (${maxDrawdown}).</p></div></div>}

        {/* ── DASHBOARD ── */}
        {activeTab==="dashboard"&&(
          <div style={{padding:"22px 30px"}}>
            {/* 4 stat cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
              <StatCard label="Total Trades" value={totalTrades} icon={<FaChartBar/>} sub={`${wins} wins`}/>
              <StatCard label="Win Rate" value={`${winRate}%`} icon={<FaTrophy/>} color={GREEN} sub={`${wins} of ${closedTrades.length}`}/>
              <StatCard label="Monthly Profit" value={`${monthlyProfit>=0?"+":""}$${monthlyProfit.toFixed(2)}`} icon={<FaDollarSign/>} color={monthlyProfit>=0?GREEN:RED} sub="this month"/>
              <StatCard label="Avg RRR" value={avgRRR!=="–"?avgRRR:"–"} icon={<FaBalanceScale/>} sub="risk:reward"/>
            </div>

            {/* Performance + Win Rate Breakdown row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:16,marginBottom:18}}>
              {/* Performance Overview */}
              <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <h2 style={{color:TEXT1,fontWeight:900,fontSize:15,margin:0}}>Performance Overview</h2>
                  <div style={{background:CARD2,border:BORDER,borderRadius:8,padding:"5px 11px",fontSize:11,color:TEXT2,cursor:"pointer"}}>This Month ▾</div>
                </div>
                {eqData.length>1?(
                  <div style={{display:"flex",gap:16}}>
                    <div style={{flex:1}}>
                      <ResponsiveContainer width="100%" height={185}>
                        <AreaChart data={eqData}>
                          <defs>
                            <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={RED} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={RED} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                          <XAxis dataKey="name" stroke="#333" tick={{fill:TEXT3,fontSize:9}}/>
                          <YAxis stroke="#333" tick={{fill:TEXT3,fontSize:9}}/>
                          <Tooltip contentStyle={{background:CARD2,border:`1px solid ${RED}`,borderRadius:8,color:TEXT1,fontSize:12}}/>
                          <Area type="monotone" dataKey="balance" stroke={RED} fill="url(#rg)" strokeWidth={2} dot={false}/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{width:130,display:"flex",flexDirection:"column",justifyContent:"center",gap:14}}>
                      <div>
                        <p style={{color:TEXT2,fontSize:11,margin:"0 0 3px"}}>Net Profit</p>
                        <p style={{color:monthlyProfit>=0?GREEN:RED,fontWeight:900,fontSize:16,margin:0}}>{monthlyProfit>=0?"+":""}${monthlyProfit.toFixed(2)}</p>
                      </div>
                      <div>
                        <p style={{color:TEXT2,fontSize:11,margin:"0 0 3px"}}>Total Profit</p>
                        <p style={{color:TEXT1,fontWeight:700,fontSize:14,margin:0}}>${gProfit.toFixed(2)}</p>
                      </div>
                      <div>
                        <p style={{color:TEXT2,fontSize:11,margin:"0 0 3px"}}>Total Loss</p>
                        <p style={{color:RED,fontWeight:700,fontSize:14,margin:0}}>-${gLoss.toFixed(2)}</p>
                      </div>
                      <div>
                        <p style={{color:TEXT2,fontSize:11,margin:"0 0 3px"}}>Breakeven</p>
                        <p style={{color:TEXT1,fontWeight:700,fontSize:14,margin:0}}>{trades.filter(t=>t.status==="Breakeven").length}</p>
                      </div>
                    </div>
                  </div>
                ):(
                  <div style={{height:185,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <p style={{color:TEXT3,fontSize:13}}>Add trades to see performance</p>
                  </div>
                )}
              </div>

              {/* Win Rate Breakdown */}
              <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:"18px 20px"}}>
                <h2 style={{color:TEXT1,fontWeight:900,fontSize:15,margin:"0 0 12px"}}>Win Rate Breakdown</h2>
                <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",height:140}}>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={[{name:"Won",value:wins||1},{name:"Lost",value:losses},{name:"BE",value:trades.filter(t=>t.status==="Breakeven").length}].filter((d,i)=>i===0||d.value>0)} cx="50%" cy="50%" innerRadius={46} outerRadius={64} dataKey="value" startAngle={90} endAngle={-270}>
                        {[RED,"#333","#555"].map((c,i)=><Cell key={i} fill={c}/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{position:"absolute",textAlign:"center",pointerEvents:"none"}}>
                    <p style={{color:TEXT1,fontWeight:900,fontSize:20,margin:0}}>{winRate}%</p>
                    <p style={{color:TEXT2,fontSize:10,margin:0}}>Win Rate</p>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:10}}>
                  {[{l:"Won Trades",v:`${wins} (${winRate}%)`,c:RED},{l:"Lost Trades",v:`${losses} (${closedTrades.length?Math.round((losses/closedTrades.length)*100):0}%)`,c:"#444"},{l:"Breakeven",v:`${trades.filter(t=>t.status==="Breakeven").length} (${closedTrades.length?Math.round((trades.filter(t=>t.status==="Breakeven").length/closedTrades.length)*100):0}%)`,c:"#555"}].map(s=>(
                    <div key={s.l} style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:9,height:9,borderRadius:"50%",background:s.c,flexShrink:0}}/>
                      <span style={{color:TEXT2,fontSize:12,flex:1}}>{s.l}</span>
                      <span style={{color:TEXT1,fontWeight:700,fontSize:12}}>{s.v}</span>
                    </div>
                  ))}
                </div>
                {closedTrades.length>0&&<p style={{color:TEXT2,fontSize:11,marginTop:10,paddingTop:10,borderTop:BORDER}}>📊 Win rate higher than <span style={{color:RED,fontWeight:700}}>{Math.min(99,winRate+11)}%</span> of traders</p>}
              </div>
            </div>

            {/* Recent Trades TABLE */}
            <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:"18px 20px",marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <h2 style={{color:TEXT1,fontWeight:900,fontSize:15,margin:0}}>Recent Trades</h2>
                <button onClick={()=>setActiveTab("journal")} style={{color:RED,background:"none",border:"none",fontWeight:700,fontSize:12,cursor:"pointer"}}>View All</button>
              </div>
              {trades.length===0?<p style={{color:TEXT3,textAlign:"center",padding:"28px 0",fontSize:13}}>No Trades Yet</p>:(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1.4fr 0.8fr 0.9fr 0.9fr 0.8fr 0.9fr 0.7fr 1fr",gap:6,padding:"0 6px 10px",borderBottom:BORDER}}>
                    {["PAIR","DIRECTION","ENTRY","EXIT","RESULT","P/L","R:R","DATE"].map(h=><span key={h} style={{color:TEXT3,fontSize:10,fontWeight:700,letterSpacing:0.5}}>{h}</span>)}
                  </div>
                  {[...trades].sort((a,b)=>b.createdAt-a.createdAt).slice(0,8).map(t=>{
                    const pl=Number(t.profit_loss||0);
                    const sc=t.status==="Win"?GREEN:t.status==="Loss"?RED:t.status==="Open"?"#38bdf8":"#666";
                    return(
                      <div key={t.id} style={{display:"grid",gridTemplateColumns:"1.4fr 0.8fr 0.9fr 0.9fr 0.8fr 0.9fr 0.7fr 1fr",gap:6,padding:"11px 6px",borderBottom:`1px solid rgba(255,255,255,0.04)`,alignItems:"center"}}>
                        <div>
                          <p style={{color:TEXT1,fontWeight:700,fontSize:12,margin:0}}>{t.pair}</p>
                          <p style={{color:TEXT3,fontSize:10,margin:"1px 0 0"}}>{t.strategy||"—"}</p>
                        </div>
                        <span style={{background:t.direction==="BUY"?"rgba(34,197,94,0.15)":RED_DIM,color:t.direction==="BUY"?GREEN:RED,fontWeight:700,fontSize:11,padding:"3px 8px",borderRadius:6,textAlign:"center",display:"inline-block"}}>{t.direction}</span>
                        <span style={{color:TEXT2,fontSize:12}}>{t.entryPrice||"—"}</span>
                        <span style={{color:TEXT2,fontSize:12}}>{t.takeProfit||"—"}</span>
                        <span style={{background:t.status==="Win"?"rgba(34,197,94,0.12)":t.status==="Loss"?RED_DIM:t.status==="Open"?"rgba(56,189,248,0.1)":"rgba(255,255,255,0.05)",color:sc,fontWeight:700,fontSize:11,padding:"3px 8px",borderRadius:6,textAlign:"center",display:"inline-block"}}>{t.status.toUpperCase()}</span>
                        <span style={{color:pl>=0?GREEN:RED,fontWeight:700,fontSize:12}}>{t.profit_loss!==""&&t.profit_loss!==undefined?`${pl>=0?"+":""}$${pl}`:"—"}</span>
                        <span style={{color:TEXT2,fontSize:11}}>{t.rrr?`1:${t.rrr}`:"—"}</span>
                        <div>
                          <p style={{color:TEXT2,fontSize:11,margin:0}}>{new Date(t.createdAt).toLocaleDateString()}</p>
                          <p style={{color:TEXT3,fontSize:10,margin:"1px 0 0"}}>{new Date(t.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Forex Chart */}
            <div style={{borderRadius:14,overflow:"hidden",border:BORDER,marginBottom:18}}><ForexChart/></div>
          </div>
        )}

        {/* ── TRADE HISTORY ── */}
        {activeTab==="journal"&&(
          <div style={{padding:"22px 30px"}}>
            <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:"22px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h1 style={{color:TEXT1,fontWeight:900,fontSize:20,margin:0}}>Trade History</h1><button onClick={()=>setShowNewTradeModal(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 20px",borderRadius:11,fontWeight:700,color:"#fff",cursor:"pointer",border:"none",background:RED}}><FaPlus/> New Trade</button></div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:16,padding:"12px 14px",background:CARD2,borderRadius:12,border:BORDER}}>
                {[<select value={filterPair} onChange={e=>setFilterPair(e.target.value)} style={iS}><option value="All">All Pairs</option>{CURRENCY_PAIRS.map(p=><option key={p} value={p}>{p}</option>)}</select>,<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={iS}><option value="All">All Status</option><option value="Open">Open</option><option value="Win">Win</option><option value="Loss">Loss</option><option value="Breakeven">Breakeven</option></select>,<select value={filterSession} onChange={e=>setFilterSession(e.target.value)} style={iS}><option value="All">All Sessions</option><option value="Asian">Asian</option><option value="London">London</option><option value="New York">New York</option><option value="Overlap">Overlap</option></select>,<input type="text" placeholder="Filter strategy..." value={filterStrategy} onChange={e=>setFilterStrategy(e.target.value)} style={iS}/>].map((el,i)=><div key={i}>{el}</div>)}
              </div>
              <p style={{color:TEXT3,fontSize:11,marginBottom:12}}>{filteredTrades.length} trades found</p>
              {filteredTrades.length===0?<p style={{color:TEXT3,textAlign:"center",padding:"44px 0",fontSize:14}}>No Trades Found</p>:(
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {[...filteredTrades].sort((a,b)=>b.createdAt-a.createdAt).map(t=>{
                    const sc=t.status==="Win"?GREEN:t.status==="Loss"?RED:t.status==="Open"?"#38bdf8":"#666";
                    const pl=Number(t.profit_loss||0);
                    return<div key={t.id} style={{background:CARD2,border:BORDER,borderRadius:13,padding:"16px 18px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div style={{display:"flex",alignItems:"center",gap:11}}>
                          <div style={{width:40,height:40,borderRadius:10,background:t.direction==="BUY"?"rgba(34,197,94,0.12)":RED_DIM,display:"flex",alignItems:"center",justifyContent:"center"}}>{t.direction==="BUY"?<FaArrowUp style={{color:GREEN}}/>:<FaArrowDown style={{color:RED}}/>}</div>
                          <div>
                            <p style={{color:TEXT1,fontWeight:900,fontSize:14,margin:0}}>{t.pair}</p>
                            <p style={{color:TEXT2,fontSize:11,margin:"2px 0 0"}}>{t.direction} • Entry:{t.entryPrice} • SL:{t.stopLoss} • TP:{t.takeProfit}</p>
                            {t.strategy&&<p style={{color:TEXT3,fontSize:10,margin:"2px 0 0"}}>📊 {t.strategy}</p>}
                            {t.session&&<p style={{color:TEXT3,fontSize:10,margin:"1px 0 0"}}>🕐 {t.session}</p>}
                            {t.emotion&&<p style={{color:TEXT3,fontSize:10,margin:"1px 0 0"}}>🧠 {t.emotion}</p>}
                            <p style={{color:"#333",fontSize:10,margin:"2px 0 0"}}>{new Date(t.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <span style={{background:t.status==="Win"?"rgba(34,197,94,0.12)":t.status==="Loss"?RED_DIM:t.status==="Open"?"rgba(56,189,248,0.1)":"rgba(255,255,255,0.05)",color:sc,fontWeight:700,fontSize:11,padding:"3px 9px",borderRadius:7,display:"inline-block"}}>{t.status}</span>
                          {t.profit_loss!==""&&t.profit_loss!==undefined&&<p style={{color:pl>=0?GREEN:RED,fontWeight:700,fontSize:13,margin:"5px 0 0"}}>{pl>=0?"+":""}${pl}</p>}
                          {t.rrr&&<p style={{color:TEXT2,fontSize:10,margin:"2px 0 0"}}>RRR 1:{t.rrr}</p>}
                          {t.lotSize&&<p style={{color:TEXT3,fontSize:10,margin:"2px 0 0"}}>Lot:{t.lotSize}</p>}
                          <button onClick={()=>handleDeleteTrade(t.id)} style={{marginTop:6,color:RED,background:"none",border:"none",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",gap:3,marginLeft:"auto"}}><FaTrash size={9}/> Delete</button>
                        </div>
                      </div>
                      {t.notes_psychology&&<div style={{marginTop:10,background:RED_DIM,borderRadius:8,padding:"8px 11px",borderLeft:`2px solid ${RED}`}}><p style={{color:RED,fontSize:9,fontWeight:700,margin:"0 0 3px"}}>🧠 PSYCHOLOGY</p><p style={{color:TEXT2,fontSize:12,margin:0}}>{t.notes_psychology}</p></div>}
                      {t.setupImageURL&&<img src={t.setupImageURL} alt="" style={{marginTop:9,height:100,borderRadius:9,objectFit:"cover"}}/>}
                    </div>;
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab==="analytics"&&(
          <div style={{padding:"22px 30px",display:"flex",flexDirection:"column",gap:18}}>
            <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:22}}>
              <h1 style={{color:TEXT1,fontWeight:900,fontSize:18,margin:"0 0 16px"}}>📊 Advanced Statistics</h1>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                {[{l:"Profit Factor",v:profitFactor,c:parseFloat(profitFactor)>=1.5?GREEN:RED},{l:"Expectancy",v:expectancy!=="–"?`$${expectancy}`:"–",c:parseFloat(expectancy)>=0?GREEN:RED},{l:"Avg Win",v:avgWin!=="–"?`$${avgWin}`:"–",c:GREEN},{l:"Avg Loss",v:avgLoss!=="–"?`$${avgLoss}`:"–",c:RED},{l:"Total Wins",v:wins,c:GREEN},{l:"Total Losses",v:losses,c:RED},{l:"Max Drawdown",v:`$${maxDD}`,c:"#fb923c"},{l:"Win Rate",v:`${winRate}%`,c:RED}].map(s=><div key={s.l} style={{background:CARD2,borderRadius:12,padding:"12px 14px",border:BORDER}}><p style={{color:TEXT2,fontSize:11,margin:0}}>{s.l}</p><p style={{color:s.c,fontWeight:900,fontSize:17,margin:"6px 0 0"}}>{s.v}</p></div>)}
              </div>
            </div>
            <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:22}}>
              <h2 style={{color:TEXT1,fontWeight:900,fontSize:15,margin:"0 0 14px"}}>📈 Equity Curve</h2>
              {eqData.length>1?<ResponsiveContainer width="100%" height={220}><AreaChart data={eqData}><defs><linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={RED} stopOpacity={0.4}/><stop offset="95%" stopColor={RED} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="name" stroke="#333" tick={{fill:TEXT3,fontSize:9}}/><YAxis stroke="#333" tick={{fill:TEXT3,fontSize:9}}/><Tooltip contentStyle={{background:CARD2,border:`1px solid ${RED}`,borderRadius:8,color:TEXT1}}/><Area type="monotone" dataKey="balance" stroke={RED} fill="url(#rg2)" strokeWidth={2} dot={{fill:RED,r:3}}/></AreaChart></ResponsiveContainer>:<p style={{color:TEXT3,textAlign:"center",padding:"32px 0"}}>Need at least 2 closed trades</p>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:22}}>
                <h2 style={{color:TEXT1,fontWeight:900,fontSize:15,margin:"0 0 14px"}}>🏆 Win/Loss</h2>
                <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={[{name:"Wins",value:wins},{name:"Losses",value:losses},{name:"BE",value:trades.filter(t=>t.status==="Breakeven").length},{name:"Open",value:trades.filter(t=>t.status==="Open").length}].filter(d=>d.value>0)} cx="50%" cy="50%" outerRadius={68} dataKey="value" label={({name,value})=>`${name}:${value}`} labelStyle={{fill:TEXT1,fontSize:10}}>{[GREEN,RED,GOLD,"#38bdf8"].map((c,i)=><Cell key={i} fill={c}/>)}</Pie><Tooltip contentStyle={{background:CARD2,border:`1px solid ${RED}`,borderRadius:8}}/></PieChart></ResponsiveContainer>
              </div>
              <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:22}}>
                <h2 style={{color:TEXT1,fontWeight:900,fontSize:15,margin:"0 0 14px"}}>💰 Best Pairs</h2>
                {pairStats.length===0?<p style={{color:TEXT3,textAlign:"center",padding:"32px 0"}}>No data yet</p>:<div style={{display:"flex",flexDirection:"column",gap:8}}>{pairStats.slice(0,6).map(p=><div key={p.pair} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:CARD2,borderRadius:10,padding:"10px 12px",border:BORDER}}><div><span style={{color:TEXT1,fontWeight:700,fontSize:13}}>{p.pair}</span><span style={{color:TEXT3,fontSize:11,marginLeft:6}}>{p.trades} trades</span></div><span style={{color:p.pnl>=0?GREEN:RED,fontWeight:700,fontSize:13}}>{p.pnl>=0?"+":""}${p.pnl.toFixed(2)}</span></div>)}</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── PSYCHOLOGY ── */}
        {activeTab==="psychology"&&(
          <div style={{padding:"22px 30px"}}>
            <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:22}}>
              <h1 style={{color:TEXT1,fontWeight:900,fontSize:20,margin:0}}>Psychology Journal</h1>
              <p style={{color:RED,fontStyle:"italic",fontWeight:700,fontSize:13,margin:"6px 0 3px"}}>"Control Your Mind, Control Your Trades"</p>
              <p style={{color:TEXT2,marginBottom:20,fontSize:12}}>Nafsaddaada iyo dareemtaada ka waran</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
                {["Calm 😌","Confident 💪","FOMO 😰","Greedy 🤑","Revenge 😡","Tired 😴"].map(emo=>{
                  const cnt=trades.filter(t=>t.emotion===emo).length,ew=trades.filter(t=>t.emotion===emo&&t.status==="Win").length,wr=cnt?Math.round((ew/cnt)*100):0;
                  return<div key={emo} style={{background:CARD2,borderRadius:12,padding:"14px 16px",border:BORDER}}><p style={{color:TEXT1,fontWeight:700,fontSize:13,margin:0}}>{emo}</p><p style={{color:TEXT2,fontSize:11,margin:"4px 0 8px"}}>{cnt} trades</p><div style={{height:4,background:"rgba(255,255,255,0.07)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${wr}%`,background:RED,borderRadius:4}}/></div><p style={{color:GREEN,fontSize:11,margin:"4px 0 0"}}>{wr}% win rate</p></div>;
                })}
              </div>
              <h2 style={{color:TEXT1,fontWeight:900,fontSize:14,marginBottom:12}}>Recent Notes</h2>
              {trades.filter(t=>t.notes_psychology).length===0?<p style={{color:TEXT3,textAlign:"center",padding:"32px 0"}}>Weli notes lama qorin</p>:(
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {[...trades].filter(t=>t.notes_psychology).sort((a,b)=>b.createdAt-a.createdAt).map(t=><div key={t.id} style={{background:CARD2,borderRadius:12,padding:"13px 16px",border:BORDER}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{color:RED,fontWeight:700}}>{t.pair} — {t.direction}</span><div style={{display:"flex",gap:9}}>{t.emotion&&<span style={{color:TEXT2,fontSize:12}}>{t.emotion}</span>}<span style={{color:TEXT3,fontSize:11}}>{new Date(t.createdAt).toLocaleDateString()}</span></div></div><p style={{color:TEXT2,fontSize:12,margin:0}}>{t.notes_psychology}</p></div>)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RISK ── */}
        {activeTab==="risk"&&(
          <div style={{padding:"22px 30px"}}>
            <div style={{maxWidth:520,margin:"0 auto",background:CARD_BG,border:BORDER,borderRadius:16,padding:26}}>
              <h1 style={{color:TEXT1,fontWeight:900,fontSize:20,margin:"0 0 4px"}}>Risk Calculator</h1>
              <p style={{color:TEXT2,marginBottom:20,fontSize:12}}>Position size-kaaga si sax ah u xisaabi</p>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[{l:"Account Balance ($)",v:riskBalance,s:setRiskBalance,p:"e.g. 10000"},{l:"Risk % Per Trade",v:riskPercent,s:setRiskPercent,p:"e.g. 1 or 2"},{l:"Stop Loss (Pips)",v:riskSLPips,s:setRiskSLPips,p:"e.g. 20"}].map(({l,v,s,p})=>(
                  <div key={l}><label style={{color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6}}>{l}</label><input type="number" placeholder={p} value={v} onChange={e=>s(e.target.value)} style={{width:"100%",background:CARD2,color:TEXT1,padding:"12px 14px",borderRadius:11,outline:"none",border:BORDER,fontSize:13,boxSizing:"border-box"}}/></div>
                ))}
                <div><label style={{color:TEXT2,fontSize:12,fontWeight:600,display:"block",marginBottom:6}}>Pip Value per 1 Lot</label><select value={riskPipValue} onChange={e=>setRiskPipValue(e.target.value)} style={{width:"100%",background:CARD2,color:TEXT1,padding:"12px 14px",borderRadius:11,outline:"none",border:BORDER,fontSize:12,boxSizing:"border-box"}}><option value="10">$10 — EURUSD, GBPUSD</option><option value="9.2">$9.2 — USDCHF</option><option value="7.6">$7.6 — USDJPY</option><option value="0.1">$0.1 — XAUUSD (Gold)</option><option value="1">$1 — Custom</option></select></div>
                <button onClick={calcRisk} style={{padding:"13px 0",borderRadius:12,fontWeight:900,color:"#fff",fontSize:14,cursor:"pointer",border:"none",background:RED,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><FaCalculator/> Calculate</button>
              </div>
              {riskResult&&<div style={{marginTop:20}}><div style={{height:1,background:`rgba(229,62,62,0.25)`,marginBottom:16}}/><h2 style={{color:TEXT1,fontWeight:900,fontSize:15,margin:"0 0 12px"}}>📋 Results</h2>{[{l:"Dollar Risk",v:`$${riskResult.dollarRisk}`,c:RED},{l:"Lot Size",v:riskResult.lotSize,c:TEXT1},{l:"Position Size",v:riskResult.positionSize,c:"#38bdf8"}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:CARD2,borderRadius:11,padding:"12px 16px",border:BORDER,marginBottom:8}}><span style={{color:TEXT2,fontWeight:700}}>{r.l}</span><span style={{color:r.c,fontWeight:900,fontSize:17}}>{r.v}</span></div>)}<div style={{background:RED_DIM,border:BORDER_R,borderRadius:11,padding:"11px 14px",marginTop:11}}><p style={{color:RED,fontSize:12,fontWeight:700,margin:0}}>💡 Haddaad {riskResult.lotSize} lot isticmaasho oo SL-kaagu yahay {riskSLPips} pips, waxaad khatarsan tahay ${riskResult.dollarRisk} ({riskPercent}% balance-kaaga)</p></div></div>}
            </div>
          </div>
        )}

        {/* ── GOALS ── */}
        {activeTab==="goals"&&(
          <div style={{padding:"22px 30px"}}>
            <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:22}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><div><h1 style={{color:TEXT1,fontWeight:900,fontSize:20,margin:0}}>Trading Goals</h1><p style={{color:TEXT2,margin:"4px 0 0",fontSize:12}}>Targets-kaaga taabo oo raac</p></div><button onClick={()=>setShowGoalForm(!showGoalForm)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:11,fontWeight:700,color:"#fff",cursor:"pointer",border:"none",background:RED}}><FaPlus/> Add Goal</button></div>
              {showGoalForm&&<div style={{background:CARD2,borderRadius:14,padding:18,border:BORDER_R,marginBottom:16}}><h2 style={{color:TEXT1,fontWeight:900,fontSize:14,margin:"0 0 12px"}}>New Goal</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}><input type="text" placeholder="Goal title..." value={newGoal.title} onChange={e=>setNewGoal({...newGoal,title:e.target.value})} style={{...iS,gridColumn:"span 2"}}/><input type="number" placeholder="Target ($)" value={newGoal.target} onChange={e=>setNewGoal({...newGoal,target:e.target.value})} style={iS}/><input type="number" placeholder="Current ($)" value={newGoal.current} onChange={e=>setNewGoal({...newGoal,current:e.target.value})} style={iS}/><select value={newGoal.type} onChange={e=>setNewGoal({...newGoal,type:e.target.value})} style={iS}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="custom">Custom</option></select><input type="date" value={newGoal.deadline} onChange={e=>setNewGoal({...newGoal,deadline:e.target.value})} style={iS}/></div><div style={{display:"flex",gap:9,marginTop:12}}><button onClick={handleSaveGoal} style={{padding:"9px 18px",borderRadius:10,fontWeight:900,color:"#fff",cursor:"pointer",border:"none",background:RED}}>Save</button><button onClick={()=>setShowGoalForm(false)} style={{padding:"9px 18px",borderRadius:10,fontWeight:700,color:TEXT2,cursor:"pointer",background:"none",border:BORDER}}>Cancel</button></div></div>}
              {goals.length===0?<p style={{color:TEXT3,textAlign:"center",padding:"44px 0",fontSize:13}}>No Goals Yet!</p>:(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {goals.map(goal=>{
                    const cur=parseFloat(goal.current||0),tar=parseFloat(goal.target||1),prog=Math.min(100,Math.round((cur/tar)*100));
                    return<div key={goal.id} style={{background:CARD2,borderRadius:14,padding:"16px 18px",border:goal.completed?`1px solid rgba(34,197,94,0.3)`:BORDER}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div><div style={{display:"flex",alignItems:"center",gap:6}}>{goal.completed&&<FaCheckCircle style={{color:GREEN}}/>}<h2 style={{color:goal.completed?GREEN:TEXT1,fontWeight:900,fontSize:14,margin:0,textDecoration:goal.completed?"line-through":"none"}}>{goal.title}</h2></div><p style={{color:TEXT3,fontSize:11,margin:"3px 0 0",textTransform:"capitalize"}}>{goal.type} goal {goal.deadline?`• Deadline: ${goal.deadline}`:""}</p></div><div style={{display:"flex",gap:7}}><button onClick={()=>handleToggleGoal(goal)} style={{color:GREEN,background:"none",border:`1px solid rgba(34,197,94,0.3)`,borderRadius:7,padding:"4px 9px",fontSize:10,cursor:"pointer"}}>{goal.completed?"Undo":"✓ Done"}</button><button onClick={()=>handleDeleteGoal(goal.id)} style={{color:RED,background:"none",border:"none",cursor:"pointer"}}><FaTrash size={11}/></button></div></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{color:TEXT2,fontSize:11}}>Progress: ${cur} / ${tar}</span><span style={{color:prog>=100?GREEN:RED,fontWeight:700,fontSize:11}}>{prog}%</span></div><div style={{height:6,background:"rgba(255,255,255,0.07)",borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:`${prog}%`,borderRadius:6,transition:"width .5s",background:prog>=100?GREEN:RED}}/></div></div>;
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SESSIONS ── */}
        {activeTab==="sessions"&&(
          <div style={{padding:"22px 30px"}}>
            <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:22}}>
              <h1 style={{color:TEXT1,fontWeight:900,fontSize:20,margin:"0 0 4px"}}>Session Tracker</h1>
              <p style={{color:TEXT2,marginBottom:20,fontSize:12}}>Session-ka aad ku fiicantahay ogaado</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
                {sessStats.map(s=>{const em=s.session==="Asian"?"🌏":s.session==="London"?"🇬🇧":s.session==="New York"?"🗽":"🔄",pn=parseFloat(s.pnl);return<div key={s.session} style={{background:CARD2,borderRadius:14,padding:"16px 18px",border:BORDER}}><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12}}><span style={{fontSize:22}}>{em}</span><h2 style={{color:TEXT1,fontWeight:900,fontSize:15,margin:0}}>{s.session}</h2></div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{[{l:"Trades",v:s.trades,c:TEXT1},{l:"Win%",v:`${s.winRate}%`,c:GREEN},{l:"P&L",v:`${pn>=0?"+":""}$${s.pnl}`,c:pn>=0?GREEN:RED}].map(({l,v,c})=><div key={l} style={{background:MAIN_BG,borderRadius:9,padding:"8px 9px",textAlign:"center"}}><p style={{color:TEXT3,fontSize:9,margin:0}}>{l}</p><p style={{color:c,fontWeight:900,fontSize:14,margin:"4px 0 0"}}>{v}</p></div>)}</div></div>;})}
              </div>
              {sessStats.some(s=>s.trades>0)&&<div style={{background:CARD2,borderRadius:14,padding:"16px 18px",border:BORDER}}><h2 style={{color:TEXT1,fontWeight:900,fontSize:13,margin:"0 0 12px"}}>P&L by Session</h2><ResponsiveContainer width="100%" height={155}><BarChart data={sessStats}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="session" stroke="#333" tick={{fill:TEXT3,fontSize:9}}/><YAxis stroke="#333" tick={{fill:TEXT3,fontSize:9}}/><Tooltip contentStyle={{background:CARD2,border:`1px solid ${RED}`,borderRadius:8}}/><Bar dataKey="pnl" name="P&L ($)" radius={[4,4,0,0]}>{sessStats.map((s,i)=><Cell key={i} fill={parseFloat(s.pnl)>=0?GREEN:RED}/>)}</Bar></BarChart></ResponsiveContainer></div>}
            </div>
          </div>
        )}

        {/* ── COMMUNITY ── */}
        {activeTab==="community"&&(
          <div style={{padding:"22px 30px",display:"flex",gap:20}}>
            <div style={{width:320,flexShrink:0}}>
              <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:18,marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <div style={{width:40,height:40,borderRadius:"50%",border:`2px solid ${RED}`,overflow:"hidden"}}><img src={avatarURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                  <div><p style={{color:TEXT1,fontWeight:700,margin:0,fontSize:13}}>{traderName}</p><div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}><div style={{width:6,height:6,borderRadius:"50%",background:GREEN}}/><span style={{color:GREEN,fontSize:11}}>Active</span></div></div>
                </div>
                <textarea placeholder="Share your trade setup..." value={postCaption} onChange={e=>{if(e.target.value.length<=1000)setPostCaption(e.target.value);}} style={{width:"100%",height:100,background:CARD2,color:TEXT1,padding:"11px 13px",borderRadius:12,outline:"none",border:BORDER,resize:"none",fontSize:13,boxSizing:"border-box",marginBottom:10}}/>
                {postFilePreview&&<div style={{marginBottom:10,borderRadius:10,overflow:"hidden",position:"relative"}}>{postType==="video"?<video src={postFilePreview} style={{width:"100%",maxHeight:140,borderRadius:10}} controls/>:<img src={postFilePreview} alt="" style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:10}}/>}<button onClick={()=>{setPostFile(null);setPostFilePreview(null);}} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.6)",color:"#fff",border:"none",borderRadius:"50%",width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><FaTimes size={9}/></button></div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:7}}>
                    {[{icon:<FaImage/>,label:"Photo",action:()=>handleFileSelect("image")},{icon:<FaVideo/>,label:"Video",action:()=>handleFileSelect("video")}].map(b=><button key={b.label} onClick={b.action} style={{display:"flex",alignItems:"center",gap:4,background:CARD2,border:BORDER,borderRadius:8,padding:"6px 10px",color:TEXT1,fontSize:12,fontWeight:600,cursor:"pointer"}}><span style={{color:RED}}>{b.icon}</span>{b.label}</button>)}
                  </div>
                  <button onClick={createPost} disabled={uploading} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,fontWeight:700,color:"#fff",fontSize:12,cursor:"pointer",border:"none",background:RED,opacity:uploading?0.6:1}}><FaPaperPlane size={11}/>{uploading?"Posting...":"Post"}</button>
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={onFileChange}/>
                <input ref={videoRef} type="file" accept="video/*" style={{display:"none"}} onChange={onFileChange}/>
              </div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              {communityPosts.length===0?<div style={{textAlign:"center",padding:"50px 0"}}><p style={{color:TEXT3,fontSize:14}}>📭 No posts yet. Be the first!</p></div>:(
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {communityPosts.map((post,i)=>(
                    <div key={post.id} style={{animation:`fadeIn .3s ease ${i*0.04}s both`}}>
                      <PostCard post={post} currentUser={currentUser} onViewProfile={uid=>setProfileViewUid(uid)}/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MY PROFILE ── */}
        {activeTab==="profile"&&(
          <div style={{padding:"22px 30px"}}>
            <div style={{height:140,borderRadius:"14px 14px 0 0",background:`linear-gradient(135deg,rgba(229,62,62,0.3),rgba(229,62,62,0.06))`,position:"relative"}}>
              <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 30% 50%,rgba(229,62,62,0.2),transparent 60%)",borderRadius:"14px 14px 0 0"}}/>
            </div>
            <div style={{background:CARD_BG,border:BORDER,borderTopLeftRadius:0,borderTopRightRadius:0,borderRadius:"0 0 16px 16px",padding:"0 26px 26px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:-44,marginBottom:16}}>
                <div style={{position:"relative"}}>
                  <div style={{width:88,height:88,borderRadius:"50%",border:`3px solid ${RED}`,overflow:"hidden",boxShadow:`0 0 20px rgba(229,62,62,0.3)`}}><img src={avatarURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                  <button onClick={()=>photoInputRef.current?.click()} style={{position:"absolute",bottom:3,right:3,background:RED,color:"#fff",border:"none",borderRadius:"50%",width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><FaCamera size={10}/></button>
                </div>
                <button onClick={()=>{setNewName(traderName);setEditingName(true);}} style={{padding:"8px 16px",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer",border:`1px solid rgba(229,62,62,0.4)`,background:RED_DIM,color:RED,display:"flex",alignItems:"center",gap:6}}><FaEdit size={11}/> Edit Profile</button>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                  <h1 style={{color:TEXT1,fontWeight:900,fontSize:20,margin:0}}>{traderName}</h1>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={RED}><circle cx="12" cy="12" r="12"/><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
                </div>
                <p style={{color:RED,fontWeight:600,fontSize:12,margin:"0 0 3px"}}>Pro Trader</p>
                <p style={{color:TEXT3,fontSize:12,margin:0}}>@{currentUser?.email?.split("@")[0]}</p>
              </div>
              <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
                {[{l:"Posts",v:communityPosts.filter(p=>p.uid===currentUser?.uid).length},{l:"Followers",v:(profileData?.followers||[]).length},{l:"Following",v:(profileData?.following||[]).length},{l:"Likes",v:communityPosts.filter(p=>p.uid===currentUser?.uid).reduce((a,p)=>a+(Array.isArray(p.likes)?p.likes.length:0),0)},{l:"Trades",v:trades.length},{l:"Win Rate",v:`${winRate}%`}].map(s=><div key={s.l} style={{textAlign:"center"}}><p style={{color:TEXT1,fontWeight:900,fontSize:17,margin:0}}>{s.v}</p><p style={{color:TEXT2,fontSize:11,margin:"2px 0 0"}}>{s.l}</p></div>)}
              </div>
            </div>
            <div style={{background:CARD_BG,border:BORDER,borderRadius:16,padding:20}}>
              <h2 style={{color:TEXT1,fontWeight:900,fontSize:15,margin:"0 0 14px"}}>My Posts</h2>
              {communityPosts.filter(p=>p.uid===currentUser?.uid).length===0?<p style={{color:TEXT3,textAlign:"center",padding:"32px 0",fontSize:13}}>No posts yet.</p>:(
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                  {communityPosts.filter(p=>p.uid===currentUser?.uid).map(p=>(
                    <div key={p.id} style={{aspectRatio:"1",borderRadius:10,overflow:"hidden",background:CARD2,border:BORDER,position:"relative",cursor:"pointer"}}>
                      {p.mediaURL&&p.mediaType==="image"?<img src={p.mediaURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:7,gap:3}}><FaPaperPlane style={{color:RED,fontSize:15}}/><p style={{color:TEXT2,fontSize:8,margin:0,textAlign:"center"}}>{p.caption?.slice(0,36)}</p></div>}
                      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.75))",padding:"14px 7px 6px",display:"flex",gap:7}}>
                        <div style={{display:"flex",alignItems:"center",gap:2}}><FaHeart style={{color:RED,fontSize:8}}/><span style={{color:"#fff",fontSize:8}}>{(p.likes||[]).length}</span></div>
                        <div style={{display:"flex",alignItems:"center",gap:2}}><FaComment style={{color:"#38bdf8",fontSize:8}}/><span style={{color:"#fff",fontSize:8}}>{p.commentCount||0}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab==="settings"&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:400,color:TEXT3,fontSize:16}}>Settings — Coming Soon</div>}
      </div>
    </div>
  );
}