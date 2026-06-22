import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, deleteDoc, doc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaArrowUp, FaArrowDown, FaTrash, FaSearch, FaFilter,
  FaTimes, FaChartLine, FaSortAmountDown, FaSortAmountUp,
  FaExpandAlt, FaImage, FaBrain, FaHome, FaCalendarAlt,
} from "react-icons/fa";

const GOLD      = "#f5c518";
const GOLD_DIM  = "rgba(245,197,24,0.13)";
const GOLD_DIM2 = "rgba(245,197,24,0.06)";
const GOLD_BOR  = "1px solid rgba(245,197,24,0.25)";
const MAIN_BG   = "#060606";
const CARD_BG   = "#101010";
const CARD2     = "#161616";
const BORDER    = "1px solid rgba(255,255,255,0.06)";
const TEXT1     = "#ffffff";
const TEXT2     = "#888888";
const TEXT3     = "#3a3a3a";
const GREEN     = "#22c55e";
const RED       = "#ef4444";
const BLUE      = "#3b82f6";

const CURRENCY_PAIRS = [
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD",
  "GBPJPY","EURJPY","EURGBP","XAUUSD","XAGUSD","US30","NAS100",
  "SPX500","BTCUSD","ETHUSD",
];

const STATUS_CFG = {
  Win:       { color: GREEN, bg:"rgba(34,197,94,0.1)",  glow:"rgba(34,197,94,0.15)",  icon:"✅", label:"WIN" },
  Loss:      { color: RED,   bg:"rgba(239,68,68,0.1)",  glow:"rgba(239,68,68,0.15)",  icon:"❌", label:"LOSS" },
  Breakeven: { color: GOLD,  bg:"rgba(245,197,24,0.1)", glow:"rgba(245,197,24,0.15)", icon:"➖", label:"B/E" },
  Open:      { color: BLUE,  bg:"rgba(59,130,246,0.1)", glow:"rgba(59,130,246,0.15)", icon:"🔵", label:"OPEN" },
};

const EMO_COLOR = {
  "Calm 😌":"#22c55e","Confident 💪":"#3b82f6","FOMO 😰":"#f97316",
  "Greedy 🤑":"#eab308","Revenge 😡":"#ef4444","Tired 😴":"#8b5cf6",
};

// ── LIGHTBOX ──────────────────────────────────────────────────────────
function Lightbox({ url, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,zIndex:300,
      background:"rgba(0,0,0,0.97)",display:"flex",
      alignItems:"center",justifyContent:"center",padding:24,
    }}>
      <button onClick={onClose} style={{
        position:"absolute",top:20,right:20,
        background:"rgba(255,255,255,0.08)",border:BORDER,
        color:TEXT1,borderRadius:10,width:40,height:40,
        cursor:"pointer",fontSize:16,display:"flex",
        alignItems:"center",justifyContent:"center",
      }}><FaTimes /></button>
      <img src={url} alt="Chart" onClick={e=>e.stopPropagation()}
        style={{ maxWidth:"90vw",maxHeight:"85vh",borderRadius:16,
          border:GOLD_BOR,boxShadow:"0 0 80px rgba(245,197,24,0.2)",
          objectFit:"contain" }}
      />
    </div>
  );
}

// ── TRADE DETAIL MODAL ─────────────────────────────────────────────────
function TradeDetailModal({ trade, onClose }) {
  const [lightbox, setLightbox] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const pl  = Number(trade.profit_loss || 0);
  const sc  = STATUS_CFG[trade.status] || STATUS_CFG.Open;
  const emoColor = EMO_COLOR[trade.emotion] || GOLD;
  const hasValidPL = trade.profit_loss !== "" && trade.profit_loss !== undefined;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const Field = ({ label, value, color }) => {
    if (value === "" || value === null || value === undefined) return null;
    return (
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <span style={{ color:TEXT2, fontSize:12 }}>{label}</span>
        <span style={{ color:color||TEXT1, fontWeight:700, fontSize:13 }}>{value}</span>
      </div>
    );
  };

  return (
    <>
      {lightbox && <Lightbox url={trade.setupImageURL} onClose={() => setLightbox(false)} />}
      <div onClick={onClose} style={{
        position:"fixed",inset:0,zIndex:200,
        background:"rgba(0,0,0,0.88)",backdropFilter:"blur(18px)",
        display:"flex",alignItems:"center",justifyContent:"center",
        padding:16,animation:"fadeIn .2s ease",
      }}>
        <div onClick={e=>e.stopPropagation()} style={{
          width:"100%",maxWidth:500,maxHeight:"90vh",
          borderRadius:22,background:CARD_BG,border:GOLD_BOR,
          overflow:"hidden",display:"flex",flexDirection:"column",
          boxShadow:"0 0 0 1px rgba(245,197,24,0.08),0 40px 80px rgba(0,0,0,0.8)",
        }}>
          {/* Header */}
          <div style={{
            background:`linear-gradient(135deg,${sc.glow},rgba(0,0,0,0))`,
            padding:"20px 22px 16px",borderBottom:BORDER,position:"relative",
          }}>
            <button onClick={onClose} style={{
              position:"absolute",top:14,right:14,
              background:"rgba(255,255,255,0.06)",border:BORDER,
              color:TEXT2,borderRadius:8,width:28,height:28,
              cursor:"pointer",display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:11,
            }}><FaTimes /></button>
            <div style={{ display:"flex",alignItems:"flex-start",gap:14 }}>
              <div style={{
                width:52,height:52,borderRadius:14,flexShrink:0,
                background:trade.direction==="BUY"?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)",
                border:`1.5px solid ${trade.direction==="BUY"?GREEN:RED}40`,
                display:"flex",alignItems:"center",justifyContent:"center",
                flexDirection:"column",gap:2,
              }}>
                {trade.direction==="BUY"
                  ? <FaArrowUp style={{color:GREEN,fontSize:18}}/>
                  : <FaArrowDown style={{color:RED,fontSize:18}}/>}
                <span style={{fontSize:7,fontWeight:900,
                  color:trade.direction==="BUY"?GREEN:RED,
                  letterSpacing:"0.06em"}}>{trade.direction}</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                  <h2 style={{color:TEXT1,fontWeight:900,fontSize:22,margin:0}}>{trade.pair}</h2>
                  <span style={{
                    color:sc.color,fontSize:9,fontWeight:800,
                    background:sc.bg,padding:"3px 9px",borderRadius:6,
                    border:`1px solid ${sc.color}30`,
                  }}>{sc.icon} {sc.label}</span>
                </div>
                <span style={{color:TEXT3,fontSize:10}}>
                  {new Date(trade.createdAt).toLocaleString("en-US",{
                    weekday:"short",month:"short",day:"numeric",
                    year:"numeric",hour:"2-digit",minute:"2-digit",
                  })}
                </span>
              </div>
              <div style={{ textAlign:"right",flexShrink:0 }}>
                {hasValidPL && (
                  <p style={{
                    color:pl>=0?GREEN:RED,fontWeight:900,
                    fontSize:26,margin:0,letterSpacing:"-1px",lineHeight:1,
                  }}>{pl>=0?"+":""}${pl}</p>
                )}
                {trade.rrr && trade.rrr!=="0" && (
                  <span style={{color:GOLD,fontSize:11,fontWeight:700,display:"block",marginTop:3}}>
                    RR 1:{trade.rrr}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ overflowY:"auto",flex:1 }}>
            <div style={{ padding:"14px 22px 0" }}>
              <p style={{color:TEXT3,fontSize:9,fontWeight:800,
                textTransform:"uppercase",letterSpacing:"0.12em",margin:"0 0 2px"}}>
                📊 Trade Details
              </p>
              <Field label="Entry Price" value={trade.entryPrice} color={TEXT1} />
              <Field label="Stop Loss"   value={trade.stopLoss}   color={RED} />
              <Field label="Take Profit" value={trade.takeProfit} color={GREEN} />
              <Field label="Lot Size"    value={trade.lotSize} />
              <Field label="Pips"        value={trade.pips?`${trade.pips} pips`:null} />
              <Field label="Strategy"    value={trade.strategy}   color={GOLD} />
              <Field label="Session"     value={trade.session||null} />
            </div>

            {trade.emotion && (
              <div style={{ padding:"14px 22px 0" }}>
                <p style={{color:TEXT3,fontSize:9,fontWeight:800,
                  textTransform:"uppercase",letterSpacing:"0.12em",margin:"0 0 8px"}}>
                  🧘 Xaalad Maskaxeed
                </p>
                <div style={{
                  display:"inline-flex",alignItems:"center",gap:8,
                  background:emoColor+"18",border:`1px solid ${emoColor}35`,
                  borderRadius:10,padding:"8px 16px",
                }}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:emoColor}} />
                  <span style={{color:emoColor,fontSize:14,fontWeight:700}}>{trade.emotion}</span>
                </div>
              </div>
            )}

            {trade.notes_psychology && (
              <div style={{ padding:"14px 22px 0" }}>
                <p style={{color:TEXT3,fontSize:9,fontWeight:800,
                  textTransform:"uppercase",letterSpacing:"0.12em",margin:"0 0 8px"}}>
                  🧠 Psychology Notes
                </p>
                <div style={{
                  background:GOLD_DIM2,borderLeft:`3px solid ${GOLD}`,
                  borderRadius:"0 12px 12px 0",padding:"13px 16px",
                }}>
                  <p style={{color:"#d4d4d4",fontSize:13,margin:0,lineHeight:1.7,fontStyle:"italic"}}>
                    "{trade.notes_psychology}"
                  </p>
                </div>
              </div>
            )}

            {trade.setupImageURL && (
              <div style={{ padding:"14px 22px 22px" }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <p style={{color:TEXT3,fontSize:9,fontWeight:800,
                    textTransform:"uppercase",letterSpacing:"0.12em",margin:0}}>
                    📸 Chart Setup
                  </p>
                  {!imgErr && (
                    <button onClick={() => setLightbox(true)} style={{
                      display:"flex",alignItems:"center",gap:4,
                      background:GOLD_DIM,border:GOLD_BOR,borderRadius:6,
                      color:GOLD,fontSize:10,fontWeight:700,
                      padding:"4px 9px",cursor:"pointer",
                    }}><FaExpandAlt size={8}/> Full Screen</button>
                  )}
                </div>
                {imgErr ? (
                  <div style={{background:CARD2,borderRadius:12,border:BORDER,padding:"24px 0",textAlign:"center"}}>
                    <FaImage style={{color:TEXT3,fontSize:24,marginBottom:8}}/>
                    <p style={{color:TEXT3,fontSize:11,margin:0}}>Image could not load</p>
                  </div>
                ) : (
                  <div style={{position:"relative",cursor:"pointer",borderRadius:12,overflow:"hidden"}}
                    onClick={() => setLightbox(true)}>
                    <img src={trade.setupImageURL} alt="Chart Setup"
                      crossOrigin="anonymous"
                      onError={() => setImgErr(true)}
                      style={{
                        width:"100%",maxHeight:220,objectFit:"cover",
                        display:"block",border:GOLD_BOR,borderRadius:12,
                      }}
                    />
                    <div style={{
                      position:"absolute",inset:0,
                      background:"rgba(0,0,0,0)",transition:"background .2s",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      borderRadius:12,
                    }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.45)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0)"}
                    >
                      <FaExpandAlt style={{color:"#fff",fontSize:22,filter:"drop-shadow(0 2px 4px #000)"}}/>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── TRADE CARD ─────────────────────────────────────────────────────────
function TradeCard({ trade, onDelete, onOpen }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErr, setImgErr]       = useState(false);
  const pl = Number(trade.profit_loss || 0);
  const sc = STATUS_CFG[trade.status] || STATUS_CFG.Open;
  const emoColor = EMO_COLOR[trade.emotion] || GOLD;
  const hasValidPL = trade.profit_loss !== "" && trade.profit_loss !== undefined && trade.profit_loss !== null;

  return (
    <div
      style={{
        background:CARD_BG,border:BORDER,borderRadius:16,
        overflow:"hidden",cursor:"pointer",
        transition:"all .2s ease",position:"relative",
      }}
      onClick={() => onOpen(trade)}
      onMouseEnter={e=>{
        e.currentTarget.style.borderColor="rgba(245,197,24,0.3)";
        e.currentTarget.style.transform="translateY(-2px)";
        e.currentTarget.style.boxShadow="0 10px 36px rgba(0,0,0,0.6)";
      }}
      onMouseLeave={e=>{
        e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";
        e.currentTarget.style.transform="none";
        e.currentTarget.style.boxShadow="none";
      }}
    >
      {/* Status left stripe */}
      <div style={{
        position:"absolute",left:0,top:0,bottom:0,
        width:3,background:sc.color,opacity:0.7,
      }}/>

      <div style={{ padding:"15px 18px 14px 21px" }}>
        {/* Row 1: Pair + direction | Status + P&L */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
          <div style={{ display:"flex",alignItems:"center",gap:11 }}>
            <div style={{
              width:42,height:42,borderRadius:12,flexShrink:0,
              background:trade.direction==="BUY"?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",
              border:`1px solid ${trade.direction==="BUY"?GREEN:RED}30`,
              display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",gap:1,
            }}>
              {trade.direction==="BUY"
                ? <FaArrowUp style={{color:GREEN,fontSize:14}}/>
                : <FaArrowDown style={{color:RED,fontSize:14}}/>}
              <span style={{
                fontSize:7,fontWeight:900,letterSpacing:"0.05em",
                color:trade.direction==="BUY"?GREEN:RED,
              }}>{trade.direction}</span>
            </div>
            <div>
              <span style={{color:TEXT1,fontWeight:900,fontSize:16}}>{trade.pair}</span>
              <div style={{ display:"flex",gap:10,marginTop:5,flexWrap:"wrap" }}>
                {trade.entryPrice && (
                  <span style={{color:TEXT3,fontSize:10}}>
                    E: <span style={{color:TEXT2}}>{trade.entryPrice}</span>
                  </span>
                )}
                {trade.stopLoss && (
                  <span style={{color:TEXT3,fontSize:10}}>
                    SL: <span style={{color:RED,opacity:0.8}}>{trade.stopLoss}</span>
                  </span>
                )}
                {trade.takeProfit && (
                  <span style={{color:TEXT3,fontSize:10}}>
                    TP: <span style={{color:GREEN,opacity:0.8}}>{trade.takeProfit}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ textAlign:"right",flexShrink:0 }}>
            <span style={{
              color:sc.color,fontSize:9,fontWeight:800,
              background:sc.bg,padding:"3px 10px",borderRadius:6,
              border:`1px solid ${sc.color}30`,display:"inline-block",
            }}>{sc.icon} {sc.label}</span>
            {hasValidPL && (
              <p style={{
                color:pl>=0?GREEN:RED,fontWeight:900,
                fontSize:20,margin:"5px 0 0",letterSpacing:"-0.5px",
              }}>{pl>=0?"+":""}${pl}</p>
            )}
            {trade.rrr && trade.rrr!=="0" && (
              <p style={{color:GOLD,fontSize:10,fontWeight:700,margin:"3px 0 0"}}>
                RR 1:{trade.rrr}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Tags */}
        <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:10 }}>
          {trade.strategy && (
            <span style={{
              background:GOLD_DIM,border:GOLD_BOR,borderRadius:6,
              color:GOLD,fontSize:9,fontWeight:800,padding:"3px 9px",
            }}>📊 {trade.strategy}</span>
          )}
          {trade.session && trade.session!=="" && (
            <span style={{
              background:CARD2,border:BORDER,borderRadius:6,
              color:TEXT2,fontSize:9,padding:"3px 9px",
            }}>🕐 {trade.session}</span>
          )}
          {trade.lotSize && (
            <span style={{
              background:CARD2,border:BORDER,borderRadius:6,
              color:TEXT2,fontSize:9,padding:"3px 9px",
            }}>📦 {trade.lotSize} lot</span>
          )}
          {trade.pips && trade.pips!=="" && (
            <span style={{
              background:CARD2,border:BORDER,borderRadius:6,
              color:TEXT2,fontSize:9,padding:"3px 9px",
            }}>📏 {trade.pips} pips</span>
          )}
          {trade.emotion && (
            <span style={{
              background:emoColor+"15",border:`1px solid ${emoColor}30`,
              borderRadius:6,color:emoColor,fontSize:9,fontWeight:700,padding:"3px 9px",
            }}>{trade.emotion}</span>
          )}
        </div>

        {/* Row 3: Psychology preview */}
        {trade.notes_psychology && (
          <div style={{
            background:GOLD_DIM2,borderLeft:`2px solid ${GOLD}50`,
            borderRadius:"0 8px 8px 0",padding:"8px 12px",marginBottom:10,
          }}>
            <p style={{color:TEXT3,fontSize:8,fontWeight:800,
              textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 3px"}}>
              🧠 Psychology
            </p>
            <p style={{
              color:TEXT2,fontSize:11,margin:0,lineHeight:1.55,
              display:"-webkit-box",WebkitLineClamp:2,
              WebkitBoxOrient:"vertical",overflow:"hidden",
            }}>{trade.notes_psychology}</p>
          </div>
        )}

        {/* Row 4: Chart image (FIXED - proper img loading) */}
        {trade.setupImageURL && !imgErr && (
          <div style={{
            borderRadius:10,overflow:"hidden",marginBottom:10,
            position:"relative",background:CARD2,
            minHeight:imgLoaded?0:72,
          }}>
            {!imgLoaded && (
              <div style={{
                position:"absolute",inset:0,display:"flex",
                alignItems:"center",justifyContent:"center",background:CARD2,
              }}>
                <div style={{
                  width:18,height:18,borderRadius:"50%",
                  border:`2px solid ${GOLD}`,borderTopColor:"transparent",
                  animation:"spin 0.8s linear infinite",
                }}/>
              </div>
            )}
            <img
              src={trade.setupImageURL}
              alt="Chart"
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgErr(true)}
              style={{
                width:"100%",maxHeight:160,objectFit:"cover",
                display:"block",opacity:imgLoaded?1:0,
                transition:"opacity .3s",
              }}
            />
            {imgLoaded && (
              <div style={{
                position:"absolute",bottom:6,right:6,
                background:"rgba(0,0,0,0.65)",borderRadius:5,
                padding:"3px 7px",display:"flex",alignItems:"center",gap:4,
              }}>
                <FaImage style={{color:GOLD,fontSize:8}}/>
                <span style={{color:TEXT2,fontSize:9}}>Chart Setup</span>
              </div>
            )}
          </div>
        )}

        {/* Row 5: Date + Delete */}
        <div style={{
          display:"flex",justifyContent:"space-between",alignItems:"center",
          paddingTop:9,borderTop:BORDER,
        }}>
          <span style={{color:TEXT3,fontSize:10,display:"flex",alignItems:"center",gap:5}}>
            <FaCalendarAlt size={8}/>
            {new Date(trade.createdAt).toLocaleString("en-US",{
              month:"short",day:"numeric",year:"numeric",
              hour:"2-digit",minute:"2-digit",
            })}
          </span>
          <button
            onClick={e=>{ e.stopPropagation(); onDelete(trade.id); }}
            style={{
              display:"flex",alignItems:"center",gap:4,
              color:TEXT3,background:"none",border:"none",
              fontSize:10,cursor:"pointer",padding:"3px 8px",
              borderRadius:6,transition:"all .15s",
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.color=RED;
              e.currentTarget.style.background="rgba(239,68,68,0.08)";
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.color=TEXT3;
              e.currentTarget.style.background="none";
            }}
          ><FaTrash size={9}/> Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── SUMMARY BAR ───────────────────────────────────────────────────────
function SummaryBar({ trades }) {
  const closed   = trades.filter(t=>t.status!=="Open");
  const wins     = trades.filter(t=>t.status==="Win").length;
  const losses   = trades.filter(t=>t.status==="Loss").length;
  const openCnt  = trades.filter(t=>t.status==="Open").length;
  const winRate  = closed.length ? Math.round((wins/closed.length)*100) : 0;
  const totalPnL = trades.reduce((a,t)=>a+Number(t.profit_loss||0),0);
  const rrs      = trades.filter(t=>t.rrr&&parseFloat(t.rrr)>0);
  const avgRR    = rrs.length
    ? (rrs.reduce((a,t)=>a+parseFloat(t.rrr),0)/rrs.length).toFixed(2)
    : "–";

  const stats = [
    { label:"Trades",     value:trades.length,  color:TEXT1,  sub:`${openCnt} open` },
    { label:"Win Rate",   value:`${winRate}%`,  color:winRate>=60?GREEN:winRate>=40?GOLD:RED, sub:`${wins}W / ${losses}L` },
    { label:"Net P&L",    value:`${totalPnL>=0?"+":""}$${totalPnL.toFixed(2)}`, color:totalPnL>=0?GREEN:RED, sub:"total" },
    { label:"Avg RR",     value:avgRR!=="–"?`1:${avgRR}`:"–", color:GOLD, sub:"risk/reward" },
    { label:"Wins",       value:wins,   color:GREEN, sub:"closed" },
    { label:"Losses",     value:losses, color:RED,   sub:"closed" },
  ];

  return (
    <div style={{ display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:20 }}>
      {stats.map(s=>(
        <div key={s.label} style={{
          background:CARD_BG,border:BORDER,borderRadius:13,
          padding:"13px 14px",textAlign:"center",transition:"border-color .2s",
        }}
          onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(245,197,24,0.2)"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}
        >
          <p style={{color:TEXT3,fontSize:8,fontWeight:800,
            textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 6px"}}>{s.label}</p>
          <p style={{color:s.color,fontWeight:900,fontSize:18,margin:"0 0 3px"}}>{s.value}</p>
          <p style={{color:TEXT3,fontSize:9,margin:0}}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
export default function TradeHistory() {
  const [trades, setTrades]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [search, setSearch]           = useState("");
  const [filterPair, setFilterPair]   = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSession, setFilterSession] = useState("All");
  const [filterDir, setFilterDir]     = useState("All");
  const [sortBy, setSortBy]           = useState("date");
  const [sortAsc, setSortAsc]         = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      if (!user) { setTrades([]); setLoading(false); return; }
      const q = query(collection(db,"trades"), where("userId","==",user.uid));
      const unsubSnap = onSnapshot(q, snap => {
        setTrades(snap.docs.map(d=>({id:d.id,...d.data()})));
        setLoading(false);
      });
      return unsubSnap;
    });
    return unsub;
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Trade delete garaynaa?")) return;
    try { await deleteDoc(doc(db,"trades",id)); }
    catch(e) { alert("Delete failed: "+e.message); }
  };

  const toggleSort = (key) => {
    if (sortBy===key) setSortAsc(p=>!p);
    else { setSortBy(key); setSortAsc(false); }
  };

  const filtered = trades
    .filter(t => {
      if (filterPair!=="All"    && t.pair!==filterPair)       return false;
      if (filterStatus!=="All"  && t.status!==filterStatus)   return false;
      if (filterSession!=="All" && t.session!==filterSession) return false;
      if (filterDir!=="All"     && t.direction!==filterDir)   return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          t.pair?.toLowerCase().includes(s)||
          t.strategy?.toLowerCase().includes(s)||
          t.notes_psychology?.toLowerCase().includes(s)||
          t.emotion?.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .sort((a,b) => {
      let va,vb;
      if      (sortBy==="date") { va=a.createdAt; vb=b.createdAt; }
      else if (sortBy==="pnl")  { va=Number(a.profit_loss||0); vb=Number(b.profit_loss||0); }
      else if (sortBy==="pair") { va=a.pair||""; vb=b.pair||""; }
      else if (sortBy==="rrr")  { va=parseFloat(a.rrr||0); vb=parseFloat(b.rrr||0); }
      if (typeof va==="string") return sortAsc?va.localeCompare(vb):vb.localeCompare(va);
      return sortAsc?va-vb:vb-va;
    });

  const hasFilters = filterPair!=="All"||filterStatus!=="All"||filterSession!=="All"||filterDir!=="All";

  const iS = {
    background:CARD2,color:TEXT1,padding:"8px 12px",
    borderRadius:9,outline:"none",border:BORDER,fontSize:12,cursor:"pointer",
  };

  if (!currentUser) return (
    <div style={{minHeight:"100vh",background:MAIN_BG,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:16,background:GOLD_DIM,border:GOLD_BOR,
          display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <FaChartLine style={{color:GOLD,fontSize:22}}/>
        </div>
        <p style={{color:TEXT1,fontWeight:900,fontSize:16,margin:"0 0 6px"}}>Please Login</p>
        <p style={{color:TEXT2,fontSize:12,marginBottom:20}}>Trade history-ga si aad u aragto waa inaad login gasho</p>
        <a href="/login" style={{background:GOLD,color:"#000",padding:"10px 24px",
          borderRadius:10,fontWeight:900,textDecoration:"none",fontSize:13}}>
          Go to Login
        </a>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:MAIN_BG,color:TEXT1}}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:${MAIN_BG}}
        ::-webkit-scrollbar-thumb{background:#252525;border-radius:3px}
        select option{background:${CARD2};color:${TEXT1}}
        input::placeholder{color:#333}
      `}</style>

      {selectedTrade && (
        <TradeDetailModal trade={selectedTrade} onClose={()=>setSelectedTrade(null)}/>
      )}

      <div style={{maxWidth:1060,margin:"0 auto",padding:"26px 22px"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:5}}>
              <div style={{
                width:38,height:38,borderRadius:11,
                background:GOLD_DIM,border:GOLD_BOR,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
                <FaChartLine style={{color:GOLD,fontSize:16}}/>
              </div>
              <div>
                <h1 style={{color:TEXT1,fontWeight:900,fontSize:24,margin:0}}>Trade History</h1>
                <p style={{color:TEXT3,fontSize:10,margin:0}}>dreamcrtacademy.com/history</p>
              </div>
            </div>
            <p style={{color:TEXT2,fontSize:12,margin:0}}>
              Trade-yaadii aad galisay oo dhan — click card si aad faahfaahin u aragto
            </p>
          </div>
          <div style={{display:"flex",gap:9}}>
            <a href="/journal" style={{
              display:"flex",alignItems:"center",gap:6,
              padding:"9px 16px",borderRadius:10,fontWeight:700,
              color:"#000",fontSize:12,cursor:"pointer",
              border:"none",background:GOLD,textDecoration:"none",
            }}>+ New Trade</a>
            <a href="/journal" style={{
              display:"flex",alignItems:"center",gap:6,
              padding:"9px 14px",borderRadius:10,fontWeight:700,
              color:TEXT2,fontSize:12,cursor:"pointer",
              border:BORDER,background:CARD_BG,textDecoration:"none",
            }}><FaHome size={11}/> Dashboard</a>
          </div>
        </div>

        {/* Summary */}
        <SummaryBar trades={filtered}/>

        {/* Search + Filters bar */}
        <div style={{background:CARD_BG,border:BORDER,borderRadius:14,padding:"13px 15px",marginBottom:14}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{
              flex:1,minWidth:200,display:"flex",alignItems:"center",
              gap:8,background:CARD2,border:BORDER,borderRadius:9,padding:"8px 12px",
            }}>
              <FaSearch style={{color:TEXT3,fontSize:11,flexShrink:0}}/>
              <input type="text"
                placeholder="Raadi pair, strategy, notes, emotion..."
                value={search} onChange={e=>setSearch(e.target.value)}
                style={{flex:1,background:"none",color:TEXT1,border:"none",outline:"none",fontSize:12}}
              />
              {search && (
                <button onClick={()=>setSearch("")}
                  style={{background:"none",border:"none",color:TEXT3,cursor:"pointer",padding:0}}>
                  <FaTimes size={10}/>
                </button>
              )}
            </div>
            <button onClick={()=>setShowFilters(p=>!p)} style={{
              ...iS,display:"flex",alignItems:"center",gap:5,
              color:showFilters||hasFilters?GOLD:TEXT2,
              border:showFilters||hasFilters?GOLD_BOR:BORDER,
              background:showFilters||hasFilters?GOLD_DIM:CARD2,
              fontWeight:600,position:"relative",
            }}>
              <FaFilter size={10}/> Filters
              {hasFilters && (
                <span style={{
                  position:"absolute",top:-4,right:-4,
                  width:8,height:8,borderRadius:"50%",background:GOLD,
                }}/>
              )}
            </button>
            {[{label:"Date",key:"date"},{label:"P&L",key:"pnl"},{label:"Pair",key:"pair"},{label:"RR",key:"rrr"}].map(({label,key})=>(
              <button key={key} onClick={()=>toggleSort(key)} style={{
                ...iS,display:"flex",alignItems:"center",gap:5,
                color:sortBy===key?GOLD:TEXT2,
                border:sortBy===key?GOLD_BOR:BORDER,
                background:sortBy===key?GOLD_DIM:CARD2,
                fontWeight:sortBy===key?700:400,
              }}>
                {label}
                {sortBy===key
                  ? (sortAsc?<FaSortAmountUp size={9}/>:<FaSortAmountDown size={9}/>)
                  : <FaSortAmountDown size={9} style={{opacity:0.2}}/>}
              </button>
            ))}
            <div style={{
              background:GOLD_DIM,border:GOLD_BOR,
              borderRadius:8,padding:"6px 12px",textAlign:"center",
            }}>
              <span style={{color:GOLD,fontWeight:900,fontSize:14}}>{filtered.length}</span>
              <span style={{color:TEXT3,fontSize:9,marginLeft:4}}>found</span>
            </div>
          </div>

          {showFilters && (
            <div style={{
              display:"grid",gridTemplateColumns:"repeat(4,1fr)",
              gap:9,marginTop:12,paddingTop:12,
              borderTop:"1px solid rgba(255,255,255,0.04)",
              animation:"fadeIn .2s ease",
            }}>
              {[
                { label:"Pair", val:filterPair, set:setFilterPair,
                  opts:[["All","All Pairs"],...CURRENCY_PAIRS.map(p=>[p,p])] },
                { label:"Status", val:filterStatus, set:setFilterStatus,
                  opts:[["All","All Status"],["Open","🟢 Open"],["Win","✅ Win"],["Loss","❌ Loss"],["Breakeven","➖ Breakeven"]] },
                { label:"Session", val:filterSession, set:setFilterSession,
                  opts:[["All","All Sessions"],["Asian","🌏 Asian"],["London","🇬🇧 London"],["New York","🗽 New York"],["Overlap","🔄 Overlap"]] },
                { label:"Direction", val:filterDir, set:setFilterDir,
                  opts:[["All","BUY & SELL"],["BUY","↑ BUY only"],["SELL","↓ SELL only"]] },
              ].map(({label,val,set,opts})=>(
                <div key={label}>
                  <label style={{color:TEXT3,fontSize:8,fontWeight:800,
                    textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:5}}>
                    {label}
                  </label>
                  <select value={val} onChange={e=>set(e.target.value)} style={{...iS,width:"100%"}}>
                    {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
              {hasFilters && (
                <button
                  onClick={()=>{setFilterPair("All");setFilterStatus("All");setFilterSession("All");setFilterDir("All");}}
                  style={{
                    gridColumn:"span 4",padding:"7px 0",borderRadius:8,
                    background:"none",border:"1px solid rgba(239,68,68,0.2)",
                    color:RED,fontSize:11,fontWeight:700,cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                  }}>
                  <FaTimes size={9}/> Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Trade list */}
        {loading ? (
          <div style={{textAlign:"center",padding:"70px 0"}}>
            <div style={{
              width:36,height:36,borderRadius:"50%",
              border:`3px solid ${GOLD}`,borderTopColor:"transparent",
              animation:"spin 0.9s linear infinite",margin:"0 auto 14px",
            }}/>
            <p style={{color:TEXT2,fontSize:12}}>Loading your trades...</p>
          </div>
        ) : filtered.length===0 ? (
          <div style={{
            textAlign:"center",padding:"60px 0",
            background:CARD_BG,border:BORDER,borderRadius:16,
          }}>
            <p style={{fontSize:38,margin:"0 0 12px"}}>📭</p>
            <p style={{color:TEXT1,fontWeight:900,fontSize:16,margin:"0 0 5px"}}>
              {trades.length===0 ? "Wali trade lama galinin" : "Ma jiro natiijo ku haboon"}
            </p>
            <p style={{color:TEXT3,fontSize:12}}>
              {trades.length===0 ? "New Trade si aad u bilowdo" : "Filters beddel ama nadiifi"}
            </p>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map((trade,i)=>(
              <div key={trade.id}
                style={{animation:`fadeIn .22s ease ${Math.min(i,10)*0.035}s both`}}>
                <TradeCard trade={trade} onDelete={handleDelete} onOpen={setSelectedTrade}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}