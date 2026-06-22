import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, deleteDoc, doc, updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaArrowUp, FaArrowDown, FaTrash, FaSearch, FaFilter,
  FaTimes, FaChartLine, FaSortAmountDown, FaSortAmountUp,
  FaExpandAlt, FaImage, FaHome, FaCalendarAlt, FaEdit,
  FaUser, FaEnvelope, FaIdCard, FaDollarSign, FaBoxOpen,
  FaBullseye, FaShieldAlt, FaBalanceScale, FaChartBar,
  FaPercentage, FaGlobe, FaBrain, FaLink, FaExternalLinkAlt,
} from "react-icons/fa";

// ── THEME ─────────────────────────────────────────────────────────────
const GOLD      = "#f5c518";
const GOLD_DIM  = "rgba(245,197,24,0.13)";
const GOLD_DIM2 = "rgba(245,197,24,0.06)";
const GOLD_BOR  = "1px solid rgba(245,197,24,0.3)";
const GOLD_BOR2 = "1px solid rgba(245,197,24,0.15)";
const MAIN_BG   = "#060606";
const CARD_BG   = "#0e0e0e";
const CARD2     = "#141414";
const CARD3     = "#1a1a1a";
const BORDER    = "1px solid rgba(255,255,255,0.06)";
const TEXT1     = "#ffffff";
const TEXT2     = "#888888";
const TEXT3     = "#3a3a3a";
const GREEN     = "#22c55e";
const RED       = "#ef4444";
const BLUE      = "#3b82f6";
const PURPLE    = "#a855f7";
const ORANGE    = "#f97316";

const CURRENCY_PAIRS = [
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD",
  "GBPJPY","EURJPY","EURGBP","XAUUSD","XAGUSD","US30","NAS100",
  "SPX500","BTCUSD","ETHUSD",
];

const STATUS_CFG = {
  Win:       { color: GREEN,  bg:"rgba(34,197,94,0.12)",  glow:"rgba(34,197,94,0.18)",   icon:"✅", label:"WIN" },
  Loss:      { color: RED,    bg:"rgba(239,68,68,0.12)",  glow:"rgba(239,68,68,0.18)",   icon:"❌", label:"LOSS" },
  Breakeven: { color: GOLD,   bg:"rgba(245,197,24,0.12)", glow:"rgba(245,197,24,0.18)",  icon:"➖", label:"B/E" },
  Open:      { color: BLUE,   bg:"rgba(59,130,246,0.12)", glow:"rgba(59,130,246,0.18)",  icon:"●",  label:"OPEN" },
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
      position:"fixed",inset:0,zIndex:400,
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
        style={{
          maxWidth:"92vw",maxHeight:"88vh",borderRadius:16,
          border:GOLD_BOR,boxShadow:"0 0 80px rgba(245,197,24,0.25)",
          objectFit:"contain",
        }}
      />
    </div>
  );
}

// ── TRADE DETAIL MODAL (sawirka style-kiisa) ──────────────────────────
function TradeDetailModal({ trade, onClose, onDelete }) {
  const [lightbox, setLightbox]   = useState(false);
  const [imgErr, setImgErr]       = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [deleting, setDeleting]   = useState(false);

  const pl      = Number(trade.profit_loss || 0);
  const sc      = STATUS_CFG[trade.status] || STATUS_CFG.Open;
  const emoColor= EMO_COLOR[trade.emotion] || GOLD;
  const hasValidPL = trade.profit_loss !== "" && trade.profit_loss !== undefined && trade.profit_loss !== null;
  const profitPct  = trade.entryPrice && hasValidPL
    ? ((pl / (Number(trade.entryPrice) * Number(trade.lotSize || 1))) * 100).toFixed(2)
    : null;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleDelete = async () => {
    if (!window.confirm("Trade permanently delete garaynaa?")) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "trades", trade.id));
      onClose();
    } catch(e) { alert("Delete failed: " + e.message); setDeleting(false); }
  };

  // ── Stat mini card (grid top area)
  const StatBox = ({ icon, label, value, color, iconBg }) => (
    <div style={{
      background:CARD2, borderRadius:12, padding:"13px 14px",
      border:BORDER, display:"flex", flexDirection:"column", gap:6,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <div style={{
          width:28,height:28,borderRadius:8,
          background:iconBg||"rgba(255,255,255,0.06)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:12,
        }}>{icon}</div>
        <span style={{color:TEXT3,fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em"}}>
          {label}
        </span>
      </div>
      <span style={{color:color||TEXT1,fontWeight:900,fontSize:18,letterSpacing:"-0.5px"}}>
        {value || "—"}
      </span>
    </div>
  );

  // ── Info row (detail table)
  const InfoRow = ({ icon, label, value, color, link }) => {
    if (!value && value !== 0) return null;
    return (
      <div style={{
        display:"flex",alignItems:"flex-start",gap:10,
        padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{
          width:28,height:28,borderRadius:8,flexShrink:0,
          background:"rgba(255,255,255,0.04)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:12,marginTop:1,
        }}>{icon}</div>
        <div style={{flex:1}}>
          <p style={{color:TEXT3,fontSize:9,fontWeight:800,
            textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 2px"}}>
            {label}
          </p>
          {link ? (
            <a href={value} target="_blank" rel="noopener noreferrer"
              onClick={e=>e.stopPropagation()}
              style={{
                color:BLUE,fontWeight:700,fontSize:13,
                display:"flex",alignItems:"center",gap:5,textDecoration:"none",
              }}>
              View Image <FaExternalLinkAlt size={10}/>
            </a>
          ) : (
            <p style={{color:color||TEXT1,fontWeight:700,fontSize:13,margin:0}}>
              {value}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {lightbox && trade.setupImageURL && (
        <Lightbox url={trade.setupImageURL} onClose={()=>setLightbox(false)} />
      )}
      <div onClick={onClose} style={{
        position:"fixed",inset:0,zIndex:300,
        background:"rgba(0,0,0,0.9)",backdropFilter:"blur(20px)",
        display:"flex",alignItems:"center",justifyContent:"center",
        padding:"16px",overflowY:"auto",
        animation:"fadeIn .2s ease",
      }}>
        <div onClick={e=>e.stopPropagation()} style={{
          width:"100%",maxWidth:520,
          borderRadius:24,
          background:CARD_BG,
          border:`1px solid rgba(245,197,24,0.35)`,
          overflow:"hidden",
          boxShadow:`0 0 0 1px rgba(245,197,24,0.1), 0 50px 100px rgba(0,0,0,0.9)`,
          position:"relative",
          margin:"auto",
        }}>
          {/* Gold glow border top */}
          <div style={{
            position:"absolute",top:0,left:0,right:0,height:2,
            background:`linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            opacity:0.6,
          }}/>

          {/* ── HEADER ── */}
          <div style={{
            padding:"20px 22px 16px",
            background:`linear-gradient(180deg, rgba(245,197,24,0.06) 0%, rgba(0,0,0,0) 100%)`,
            borderBottom:BORDER,
          }}>
            {/* Status + Date row */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{
                display:"inline-flex",alignItems:"center",gap:6,
                background:sc.bg,border:`1px solid ${sc.color}30`,
                borderRadius:8,padding:"5px 12px",
              }}>
                <div style={{
                  width:7,height:7,borderRadius:"50%",
                  background:sc.color,
                  boxShadow:`0 0 6px ${sc.color}`,
                  animation: trade.status==="Open" ? "pulse 2s infinite" : "none",
                }}/>
                <span style={{color:sc.color,fontWeight:800,fontSize:11,letterSpacing:"0.06em"}}>
                  {sc.label}
                </span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <FaCalendarAlt style={{color:TEXT3,fontSize:10}}/>
                <span style={{color:TEXT2,fontSize:11}}>
                  {new Date(trade.createdAt).toLocaleString("en-US",{
                    day:"numeric",month:"short",year:"numeric",
                    hour:"2-digit",minute:"2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Pair + Direction + P&L */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <h1 style={{color:TEXT1,fontWeight:900,fontSize:30,margin:0,letterSpacing:"-1px"}}>
                    {trade.pair}
                  </h1>
                  {trade.pair==="XAUUSD" && <span style={{fontSize:18}}>⭐</span>}
                </div>
                <p style={{color:TEXT3,fontSize:11,margin:0}}>
                  {trade.pair==="XAUUSD"?"Gold vs US Dollar":
                   trade.pair==="GBPUSD"?"British Pound vs US Dollar":
                   trade.pair==="EURUSD"?"Euro vs US Dollar":
                   trade.pair==="NAS100"?"Nasdaq 100 Index":
                   trade.pair==="US30"?"Dow Jones Industrial":
                   trade.pair==="BTCUSD"?"Bitcoin vs US Dollar":
                   trade.pair}
                </p>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{
                  display:"flex",alignItems:"center",gap:6,
                  justifyContent:"flex-end",marginBottom:6,
                }}>
                  <span style={{
                    color:trade.direction==="BUY"?GREEN:RED,
                    fontWeight:900,fontSize:20,letterSpacing:"0.05em",
                  }}>{trade.direction}</span>
                  {trade.direction==="BUY"
                    ? <FaArrowUp style={{color:GREEN,fontSize:16}}/>
                    : <FaArrowDown style={{color:RED,fontSize:16}}/>}
                </div>
                {hasValidPL && (
                  <p style={{
                    color:pl>=0?GREEN:RED,fontWeight:900,
                    fontSize:26,margin:0,letterSpacing:"-1px",lineHeight:1,
                  }}>{pl>=0?"+":""}${pl}</p>
                )}
              </div>
            </div>

            {/* Emotion + Strategy + Psychology tags */}
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:14}}>
              {trade.emotion && (
                <div style={{
                  display:"inline-flex",alignItems:"center",gap:6,
                  background:emoColor+"18",border:`1px solid ${emoColor}35`,
                  borderRadius:8,padding:"5px 12px",
                }}>
                  <span style={{color:emoColor,fontWeight:700,fontSize:12}}>{trade.emotion}</span>
                </div>
              )}
              {trade.notes_psychology && (
                <div style={{
                  display:"inline-flex",alignItems:"center",gap:6,
                  background:"rgba(168,85,247,0.1)",border:"1px solid rgba(168,85,247,0.25)",
                  borderRadius:8,padding:"5px 12px",
                }}>
                  <FaBrain style={{color:PURPLE,fontSize:10}}/>
                  <span style={{color:PURPLE,fontWeight:700,fontSize:11}}>PSYCHOLOGY</span>
                  <span style={{color:"#ccc",fontSize:11}}>{trade.notes_psychology}</span>
                </div>
              )}
              {trade.strategy && (
                <div style={{
                  display:"inline-flex",alignItems:"center",gap:6,
                  background:GOLD_DIM,border:GOLD_BOR2,
                  borderRadius:8,padding:"5px 12px",
                }}>
                  <span style={{color:TEXT2,fontSize:10,fontWeight:700}}>STRATEGY</span>
                  <span style={{color:GOLD,fontWeight:900,fontSize:13}}>{trade.strategy}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── SCROLLABLE BODY ── */}
          <div style={{overflowY:"auto",maxHeight:"60vh"}}>

            {/* Stats Grid 2x4 */}
            <div style={{padding:"16px 18px 0"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
                <StatBox
                  icon={<FaDollarSign style={{color:GREEN}}/>}
                  label="Entry Price"
                  value={trade.entryPrice}
                  color={TEXT1}
                  iconBg="rgba(34,197,94,0.1)"
                />
                <StatBox
                  icon={<FaBoxOpen style={{color:BLUE}}/>}
                  label="Lot Size"
                  value={trade.lotSize}
                  color={TEXT1}
                  iconBg="rgba(59,130,246,0.1)"
                />
                <StatBox
                  icon={<FaBullseye style={{color:GREEN}}/>}
                  label="Take Profit"
                  value={trade.takeProfit}
                  color={trade.takeProfit&&Number(trade.takeProfit)<0?RED:GREEN}
                  iconBg="rgba(34,197,94,0.1)"
                />
                <StatBox
                  icon={<FaShieldAlt style={{color:RED}}/>}
                  label="Stop Loss"
                  value={trade.stopLoss}
                  color={RED}
                  iconBg="rgba(239,68,68,0.1)"
                />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
                <StatBox
                  icon={<FaBalanceScale style={{color:PURPLE}}/>}
                  label="RRR"
                  value={trade.rrr&&trade.rrr!=="0"?trade.rrr:null}
                  color={PURPLE}
                  iconBg="rgba(168,85,247,0.1)"
                />
                <StatBox
                  icon={<FaChartBar style={{color:ORANGE}}/>}
                  label="Pips"
                  value={trade.pips||null}
                  color={ORANGE}
                  iconBg="rgba(249,115,22,0.1)"
                />
                <StatBox
                  icon={<FaChartLine style={{color:hasValidPL?pl>=0?GREEN:RED:TEXT3}}/>}
                  label="Profit / Loss"
                  value={hasValidPL?`${pl>=0?"+":""}$${pl}`:null}
                  color={hasValidPL?pl>=0?GREEN:RED:TEXT3}
                  iconBg={hasValidPL?pl>=0?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)":"rgba(255,255,255,0.04)"}
                />
                <StatBox
                  icon={<FaPercentage style={{color:GOLD}}/>}
                  label="Profit %"
                  value={profitPct?`${profitPct}%`:null}
                  color={profitPct&&Number(profitPct)>=0?GREEN:RED}
                  iconBg="rgba(245,197,24,0.1)"
                />
              </div>
            </div>

            {/* Details info grid */}
            <div style={{
              margin:"0 18px 14px",
              background:CARD2,borderRadius:14,
              padding:"14px 16px",border:BORDER,
            }}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"}}>
                <InfoRow icon={<FaArrowUp style={{color:GREEN}}/>}   label="Direction"     value={trade.direction}        color={trade.direction==="BUY"?GREEN:RED} />
                <InfoRow icon={<FaGlobe style={{color:BLUE}}/>}      label="Session"       value={trade.session||null} />
                <InfoRow icon={<FaBrain style={{color:PURPLE}}/>}    label="Emotion"       value={trade.emotion||null}    color={emoColor} />
                <InfoRow icon={<FaImage style={{color:GOLD}}/>}      label="Setup Image URL" value={trade.setupImageURL||null} link={true} />
                <InfoRow icon={<FaBrain style={{color:PURPLE}}/>}    label="Psychology"    value={trade.notes_psychology||null} color="#d4d4d4" />
                <InfoRow icon={<FaBalanceScale style={{color:GOLD}}/>} label="Notes (Psychology)" value={trade.notes_psychology||null} color="#d4d4d4" />
                <InfoRow icon={<FaLink style={{color:TEXT2}}/>}      label="Pair"          value={trade.pair} />
                <InfoRow icon={<FaCalendarAlt style={{color:TEXT2}}/>} label="Created At"  value={new Date(trade.createdAt).toLocaleString("en-US",{
                  day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",
                })} />
              </div>
            </div>

            {/* User Info */}
            {(trade.userName || trade.userEmail || trade.userId) && (
              <div style={{
                margin:"0 18px 14px",
                background:CARD2,borderRadius:14,
                padding:"12px 16px",border:BORDER,
                display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,
              }}>
                {trade.userName && (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{
                      width:28,height:28,borderRadius:8,
                      background:"rgba(34,197,94,0.1)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      <FaUser style={{color:GREEN,fontSize:11}}/>
                    </div>
                    <div>
                      <p style={{color:TEXT3,fontSize:8,fontWeight:800,
                        textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 2px"}}>USER</p>
                      <p style={{color:TEXT1,fontWeight:700,fontSize:12,margin:0}}>{trade.userName}</p>
                    </div>
                  </div>
                )}
                {trade.userEmail && (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{
                      width:28,height:28,borderRadius:8,
                      background:"rgba(59,130,246,0.1)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      <FaEnvelope style={{color:BLUE,fontSize:11}}/>
                    </div>
                    <div>
                      <p style={{color:TEXT3,fontSize:8,fontWeight:800,
                        textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 2px"}}>EMAIL</p>
                      <p style={{color:TEXT1,fontWeight:700,fontSize:11,margin:0}}>{trade.userEmail}</p>
                    </div>
                  </div>
                )}
                {trade.userId && (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{
                      width:28,height:28,borderRadius:8,
                      background:"rgba(168,85,247,0.1)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      <FaIdCard style={{color:PURPLE,fontSize:11}}/>
                    </div>
                    <div>
                      <p style={{color:TEXT3,fontSize:8,fontWeight:800,
                        textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 2px"}}>USER ID</p>
                      <p style={{color:TEXT1,fontWeight:700,fontSize:9,margin:0,
                        wordBreak:"break-all",lineHeight:1.4}}>{trade.userId}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chart Setup Image */}
            <div style={{margin:"0 18px 18px"}}>
              <div style={{
                display:"flex",justifyContent:"space-between",
                alignItems:"center",marginBottom:10,
              }}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <FaImage style={{color:GOLD,fontSize:12}}/>
                  <span style={{color:TEXT2,fontSize:10,fontWeight:800,
                    textTransform:"uppercase",letterSpacing:"0.1em"}}>
                    CHART SETUP IMAGE
                  </span>
                </div>
                {trade.setupImageURL && !imgErr && (
                  <button onClick={()=>setLightbox(true)} style={{
                    display:"flex",alignItems:"center",gap:4,
                    background:GOLD_DIM,border:GOLD_BOR2,borderRadius:6,
                    color:GOLD,fontSize:10,fontWeight:700,
                    padding:"4px 9px",cursor:"pointer",
                  }}><FaExpandAlt size={8}/> Full Screen</button>
                )}
              </div>
              {trade.setupImageURL ? (
                imgErr ? (
                  <div style={{
                    background:CARD2,borderRadius:14,border:BORDER,
                    padding:"30px 0",textAlign:"center",
                  }}>
                    <FaImage style={{color:TEXT3,fontSize:28,marginBottom:8}}/>
                    <p style={{color:TEXT3,fontSize:12,margin:"0 0 8px"}}>Image could not load</p>
                    <a href={trade.setupImageURL} target="_blank" rel="noopener noreferrer"
                      style={{color:BLUE,fontSize:11,display:"flex",alignItems:"center",
                        gap:4,justifyContent:"center",textDecoration:"none"}}>
                      Open in browser <FaExternalLinkAlt size={9}/>
                    </a>
                  </div>
                ) : (
                  <div style={{
                    borderRadius:14,overflow:"hidden",
                    border:GOLD_BOR2,cursor:"pointer",
                    position:"relative",background:CARD2,
                    minHeight:imgLoaded?0:120,
                  }} onClick={()=>setLightbox(true)}>
                    {!imgLoaded && (
                      <div style={{
                        position:"absolute",inset:0,
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}>
                        <div style={{
                          width:24,height:24,borderRadius:"50%",
                          border:`2px solid ${GOLD}`,borderTopColor:"transparent",
                          animation:"spin 0.8s linear infinite",
                        }}/>
                      </div>
                    )}
                    <img
                      src={trade.setupImageURL}
                      alt="Chart Setup"
                      referrerPolicy="no-referrer"
                      onLoad={()=>setImgLoaded(true)}
                      onError={()=>setImgErr(true)}
                      style={{
                        width:"100%",display:"block",
                        objectFit:"cover",maxHeight:260,
                        opacity:imgLoaded?1:0,
                        transition:"opacity .3s",
                      }}
                    />
                    {imgLoaded && (
                      <div style={{
                        position:"absolute",inset:0,
                        background:"rgba(0,0,0,0)",transition:"background .2s",
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.4)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0)"}
                      >
                        <FaExpandAlt style={{
                          color:"#fff",fontSize:24,
                          filter:"drop-shadow(0 2px 6px #000)",
                        }}/>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div style={{
                  background:CARD2,borderRadius:14,border:BORDER,
                  padding:"24px 0",textAlign:"center",
                }}>
                  <FaImage style={{color:TEXT3,fontSize:24,marginBottom:6}}/>
                  <p style={{color:TEXT3,fontSize:11,margin:0}}>No chart image uploaded</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display:"grid",gridTemplateColumns:"1fr 1fr 1fr",
              gap:10,padding:"0 18px 22px",
            }}>
              <button style={{
                display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                padding:"13px 0",borderRadius:12,fontWeight:800,fontSize:12,
                cursor:"pointer",border:"none",letterSpacing:"0.04em",
                background:BLUE,color:"#fff",
                boxShadow:`0 4px 16px rgba(59,130,246,0.3)`,
              }}>
                <FaArrowUp size={12}/> OPEN TRADE
              </button>
              <button style={{
                display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                padding:"13px 0",borderRadius:12,fontWeight:800,fontSize:12,
                cursor:"pointer",background:"none",letterSpacing:"0.04em",
                border:GOLD_BOR2,color:GOLD,
              }}>
                <FaEdit size={12}/> EDIT TRADE
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                  padding:"13px 0",borderRadius:12,fontWeight:800,fontSize:12,
                  cursor:"pointer",background:"none",letterSpacing:"0.04em",
                  border:"1px solid rgba(239,68,68,0.3)",color:RED,
                  opacity:deleting?0.6:1,
                }}>
                <FaTrash size={11}/> {deleting?"DELETING...":"DELETE TRADE"}
              </button>
            </div>
          </div>

          {/* Close X */}
          <button onClick={onClose} style={{
            position:"absolute",top:14,right:14,
            background:"rgba(255,255,255,0.06)",border:BORDER,
            color:TEXT2,borderRadius:8,width:28,height:28,
            cursor:"pointer",display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:11,zIndex:10,
          }}><FaTimes /></button>
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
      onClick={()=>onOpen(trade)}
      onMouseEnter={e=>{
        e.currentTarget.style.borderColor="rgba(245,197,24,0.3)";
        e.currentTarget.style.transform="translateY(-2px)";
        e.currentTarget.style.boxShadow="0 10px 36px rgba(0,0,0,0.7)";
      }}
      onMouseLeave={e=>{
        e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";
        e.currentTarget.style.transform="none";
        e.currentTarget.style.boxShadow="none";
      }}
    >
      {/* Status color stripe */}
      <div style={{
        position:"absolute",left:0,top:0,bottom:0,
        width:3,background:sc.color,opacity:0.8,
      }}/>

      <div style={{padding:"15px 18px 14px 21px"}}>
        {/* Row 1 */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
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
              <div style={{display:"flex",gap:10,marginTop:5,flexWrap:"wrap"}}>
                {trade.entryPrice&&<span style={{color:TEXT3,fontSize:10}}>E: <span style={{color:TEXT2}}>{trade.entryPrice}</span></span>}
                {trade.stopLoss&&<span style={{color:TEXT3,fontSize:10}}>SL: <span style={{color:RED,opacity:0.8}}>{trade.stopLoss}</span></span>}
                {trade.takeProfit&&<span style={{color:TEXT3,fontSize:10}}>TP: <span style={{color:GREEN,opacity:0.8}}>{trade.takeProfit}</span></span>}
              </div>
            </div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <span style={{
              color:sc.color,fontSize:9,fontWeight:800,
              background:sc.bg,padding:"3px 10px",borderRadius:6,
              border:`1px solid ${sc.color}30`,display:"inline-block",
            }}>{sc.icon} {sc.label}</span>
            {hasValidPL&&(
              <p style={{color:pl>=0?GREEN:RED,fontWeight:900,fontSize:20,margin:"5px 0 0",letterSpacing:"-0.5px"}}>
                {pl>=0?"+":""}${pl}
              </p>
            )}
            {trade.rrr&&trade.rrr!=="0"&&(
              <p style={{color:GOLD,fontSize:10,fontWeight:700,margin:"3px 0 0"}}>RR 1:{trade.rrr}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
          {trade.strategy&&(
            <span style={{background:GOLD_DIM,border:GOLD_BOR2,borderRadius:6,
              color:GOLD,fontSize:9,fontWeight:800,padding:"3px 9px"}}>📊 {trade.strategy}</span>
          )}
          {trade.session&&trade.session!==""&&(
            <span style={{background:CARD2,border:BORDER,borderRadius:6,
              color:TEXT2,fontSize:9,padding:"3px 9px"}}>🕐 {trade.session}</span>
          )}
          {trade.lotSize&&(
            <span style={{background:CARD2,border:BORDER,borderRadius:6,
              color:TEXT2,fontSize:9,padding:"3px 9px"}}>📦 {trade.lotSize} lot</span>
          )}
          {trade.pips&&trade.pips!==""&&(
            <span style={{background:CARD2,border:BORDER,borderRadius:6,
              color:TEXT2,fontSize:9,padding:"3px 9px"}}>📏 {trade.pips} pips</span>
          )}
          {trade.emotion&&(
            <span style={{
              background:emoColor+"15",border:`1px solid ${emoColor}30`,
              borderRadius:6,color:emoColor,fontSize:9,fontWeight:700,padding:"3px 9px",
            }}>{trade.emotion}</span>
          )}
        </div>

        {/* Psychology preview */}
        {trade.notes_psychology&&(
          <div style={{
            background:GOLD_DIM2,borderLeft:`2px solid ${GOLD}50`,
            borderRadius:"0 8px 8px 0",padding:"8px 12px",marginBottom:10,
          }}>
            <p style={{color:TEXT3,fontSize:8,fontWeight:800,
              textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 3px"}}>🧠 Psychology</p>
            <p style={{color:TEXT2,fontSize:11,margin:0,lineHeight:1.55,
              display:"-webkit-box",WebkitLineClamp:2,
              WebkitBoxOrient:"vertical",overflow:"hidden"}}>
              {trade.notes_psychology}
            </p>
          </div>
        )}

        {/* Chart image */}
        {trade.setupImageURL&&!imgErr&&(
          <div style={{
            borderRadius:10,overflow:"hidden",marginBottom:10,
            position:"relative",background:CARD2,
            minHeight:imgLoaded?0:72,
          }}>
            {!imgLoaded&&(
              <div style={{position:"absolute",inset:0,display:"flex",
                alignItems:"center",justifyContent:"center",background:CARD2}}>
                <div style={{width:18,height:18,borderRadius:"50%",
                  border:`2px solid ${GOLD}`,borderTopColor:"transparent",
                  animation:"spin 0.8s linear infinite"}}/>
              </div>
            )}
            <img
              src={trade.setupImageURL}
              alt="Chart"
              referrerPolicy="no-referrer"
              onLoad={()=>setImgLoaded(true)}
              onError={()=>setImgErr(true)}
              style={{
                width:"100%",maxHeight:160,objectFit:"cover",
                display:"block",opacity:imgLoaded?1:0,transition:"opacity .3s",
              }}
            />
            {imgLoaded&&(
              <div style={{position:"absolute",bottom:6,right:6,
                background:"rgba(0,0,0,0.65)",borderRadius:5,
                padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
                <FaImage style={{color:GOLD,fontSize:8}}/>
                <span style={{color:TEXT2,fontSize:9}}>Chart Setup</span>
              </div>
            )}
          </div>
        )}

        {/* Date + Delete */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          paddingTop:9,borderTop:BORDER}}>
          <span style={{color:TEXT3,fontSize:10,display:"flex",alignItems:"center",gap:5}}>
            <FaCalendarAlt size={8}/>
            {new Date(trade.createdAt).toLocaleString("en-US",{
              month:"short",day:"numeric",year:"numeric",
              hour:"2-digit",minute:"2-digit",
            })}
          </span>
          <button
            onClick={e=>{e.stopPropagation();onDelete(trade.id);}}
            style={{display:"flex",alignItems:"center",gap:4,
              color:TEXT3,background:"none",border:"none",
              fontSize:10,cursor:"pointer",padding:"3px 8px",
              borderRadius:6,transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.color=RED;e.currentTarget.style.background="rgba(239,68,68,0.08)";}}
            onMouseLeave={e=>{e.currentTarget.style.color=TEXT3;e.currentTarget.style.background="none";}}
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
  const winRate  = closed.length?Math.round((wins/closed.length)*100):0;
  const totalPnL = trades.reduce((a,t)=>a+Number(t.profit_loss||0),0);
  const rrs      = trades.filter(t=>t.rrr&&parseFloat(t.rrr)>0);
  const avgRR    = rrs.length?(rrs.reduce((a,t)=>a+parseFloat(t.rrr),0)/rrs.length).toFixed(2):"–";

  const stats = [
    {label:"Trades",   value:trades.length, color:TEXT1,  sub:`${openCnt} open`},
    {label:"Win Rate", value:`${winRate}%`,  color:winRate>=60?GREEN:winRate>=40?GOLD:RED, sub:`${wins}W / ${losses}L`},
    {label:"Net P&L",  value:`${totalPnL>=0?"+":""}$${totalPnL.toFixed(2)}`, color:totalPnL>=0?GREEN:RED, sub:"total"},
    {label:"Avg RR",   value:avgRR!=="–"?`1:${avgRR}`:"–", color:GOLD, sub:"risk/reward"},
    {label:"Wins",     value:wins,   color:GREEN, sub:"closed"},
    {label:"Losses",   value:losses, color:RED,   sub:"closed"},
  ];

  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:20}}>
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

// ── MAIN ──────────────────────────────────────────────────────────────
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

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, user=>{
      setCurrentUser(user);
      if (!user){setTrades([]);setLoading(false);return;}
      const q = query(collection(db,"trades"),where("userId","==",user.uid));
      const unsubSnap = onSnapshot(q,snap=>{
        setTrades(snap.docs.map(d=>({id:d.id,...d.data()})));
        setLoading(false);
      });
      return unsubSnap;
    });
    return unsub;
  },[]);

  const handleDelete = async (id)=>{
    if (!window.confirm("Trade delete garaynaa?")) return;
    try{await deleteDoc(doc(db,"trades",id));}
    catch(e){alert("Delete failed: "+e.message);}
  };

  const toggleSort = (key)=>{
    if(sortBy===key) setSortAsc(p=>!p);
    else{setSortBy(key);setSortAsc(false);}
  };

  const filtered = trades
    .filter(t=>{
      if(filterPair!=="All"    && t.pair!==filterPair)      return false;
      if(filterStatus!=="All"  && t.status!==filterStatus)  return false;
      if(filterSession!=="All" && t.session!==filterSession) return false;
      if(filterDir!=="All"     && t.direction!==filterDir)  return false;
      if(search){
        const s=search.toLowerCase();
        return(
          t.pair?.toLowerCase().includes(s)||
          t.strategy?.toLowerCase().includes(s)||
          t.notes_psychology?.toLowerCase().includes(s)||
          t.emotion?.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .sort((a,b)=>{
      let va,vb;
      if     (sortBy==="date"){va=a.createdAt;vb=b.createdAt;}
      else if(sortBy==="pnl") {va=Number(a.profit_loss||0);vb=Number(b.profit_loss||0);}
      else if(sortBy==="pair"){va=a.pair||"";vb=b.pair||"";}
      else if(sortBy==="rrr") {va=parseFloat(a.rrr||0);vb=parseFloat(b.rrr||0);}
      if(typeof va==="string") return sortAsc?va.localeCompare(vb):vb.localeCompare(va);
      return sortAsc?va-vb:vb-va;
    });

  const hasFilters = filterPair!=="All"||filterStatus!=="All"||filterSession!=="All"||filterDir!=="All";
  const iS={background:CARD2,color:TEXT1,padding:"8px 12px",borderRadius:9,outline:"none",border:BORDER,fontSize:12,cursor:"pointer"};

  if(!currentUser) return(
    <div style={{minHeight:"100vh",background:MAIN_BG,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:16,background:GOLD_DIM,border:GOLD_BOR,
          display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <FaChartLine style={{color:GOLD,fontSize:22}}/>
        </div>
        <p style={{color:TEXT1,fontWeight:900,fontSize:16,margin:"0 0 6px"}}>Please Login</p>
        <p style={{color:TEXT2,fontSize:12,marginBottom:20}}>Trade history-ga si aad u aragto waa inaad login gasho</p>
        <a href="/login" style={{background:GOLD,color:"#000",padding:"10px 24px",
          borderRadius:10,fontWeight:900,textDecoration:"none",fontSize:13}}>Go to Login</a>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:MAIN_BG,color:TEXT1}}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:${MAIN_BG}}
        ::-webkit-scrollbar-thumb{background:#252525;border-radius:3px}
        select option{background:${CARD2};color:${TEXT1}}
        input::placeholder{color:#333}
      `}</style>

      {selectedTrade&&(
        <TradeDetailModal
          trade={selectedTrade}
          onClose={()=>setSelectedTrade(null)}
          onDelete={handleDelete}
        />
      )}

      <div style={{maxWidth:1060,margin:"0 auto",padding:"26px 22px"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:5}}>
              <div style={{width:38,height:38,borderRadius:11,background:GOLD_DIM,border:GOLD_BOR,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
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
            <a href="/journal" style={{display:"flex",alignItems:"center",gap:6,
              padding:"9px 16px",borderRadius:10,fontWeight:700,color:"#000",
              fontSize:12,border:"none",background:GOLD,textDecoration:"none"}}>
              + New Trade
            </a>
            <a href="/journal" style={{display:"flex",alignItems:"center",gap:6,
              padding:"9px 14px",borderRadius:10,fontWeight:700,color:TEXT2,
              fontSize:12,border:BORDER,background:CARD_BG,textDecoration:"none"}}>
              <FaHome size={11}/> Dashboard
            </a>
          </div>
        </div>

        <SummaryBar trades={filtered}/>

        {/* Filters */}
        <div style={{background:CARD_BG,border:BORDER,borderRadius:14,padding:"13px 15px",marginBottom:14}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",
              gap:8,background:CARD2,border:BORDER,borderRadius:9,padding:"8px 12px"}}>
              <FaSearch style={{color:TEXT3,fontSize:11,flexShrink:0}}/>
              <input type="text"
                placeholder="Raadi pair, strategy, notes, emotion..."
                value={search} onChange={e=>setSearch(e.target.value)}
                style={{flex:1,background:"none",color:TEXT1,border:"none",outline:"none",fontSize:12}}
              />
              {search&&(
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
              {hasFilters&&<span style={{position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:GOLD}}/>}
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
                {sortBy===key?(sortAsc?<FaSortAmountUp size={9}/>:<FaSortAmountDown size={9}/>)
                  :<FaSortAmountDown size={9} style={{opacity:0.2}}/>}
              </button>
            ))}
            <div style={{background:GOLD_DIM,border:GOLD_BOR2,borderRadius:8,padding:"6px 12px",textAlign:"center"}}>
              <span style={{color:GOLD,fontWeight:900,fontSize:14}}>{filtered.length}</span>
              <span style={{color:TEXT3,fontSize:9,marginLeft:4}}>found</span>
            </div>
          </div>
          {showFilters&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginTop:12,
              paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.04)",animation:"fadeIn .2s ease"}}>
              {[
                {label:"Pair",val:filterPair,set:setFilterPair,opts:[["All","All Pairs"],...CURRENCY_PAIRS.map(p=>[p,p])]},
                {label:"Status",val:filterStatus,set:setFilterStatus,opts:[["All","All Status"],["Open","🟢 Open"],["Win","✅ Win"],["Loss","❌ Loss"],["Breakeven","➖ Breakeven"]]},
                {label:"Session",val:filterSession,set:setFilterSession,opts:[["All","All Sessions"],["Asian","🌏 Asian"],["London","🇬🇧 London"],["New York","🗽 New York"],["Overlap","🔄 Overlap"]]},
                {label:"Direction",val:filterDir,set:setFilterDir,opts:[["All","BUY & SELL"],["BUY","↑ BUY only"],["SELL","↓ SELL only"]]},
              ].map(({label,val,set,opts})=>(
                <div key={label}>
                  <label style={{color:TEXT3,fontSize:8,fontWeight:800,
                    textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:5}}>{label}</label>
                  <select value={val} onChange={e=>set(e.target.value)} style={{...iS,width:"100%"}}>
                    {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
              {hasFilters&&(
                <button onClick={()=>{setFilterPair("All");setFilterStatus("All");setFilterSession("All");setFilterDir("All");}}
                  style={{gridColumn:"span 4",padding:"7px 0",borderRadius:8,background:"none",
                    border:"1px solid rgba(239,68,68,0.2)",color:RED,fontSize:11,fontWeight:700,
                    cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  <FaTimes size={9}/> Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* List */}
        {loading?(
          <div style={{textAlign:"center",padding:"70px 0"}}>
            <div style={{width:36,height:36,borderRadius:"50%",
              border:`3px solid ${GOLD}`,borderTopColor:"transparent",
              animation:"spin 0.9s linear infinite",margin:"0 auto 14px"}}/>
            <p style={{color:TEXT2,fontSize:12}}>Loading your trades...</p>
          </div>
        ):filtered.length===0?(
          <div style={{textAlign:"center",padding:"60px 0",background:CARD_BG,border:BORDER,borderRadius:16}}>
            <p style={{fontSize:38,margin:"0 0 12px"}}>📭</p>
            <p style={{color:TEXT1,fontWeight:900,fontSize:16,margin:"0 0 5px"}}>
              {trades.length===0?"Wali trade lama galinin":"Ma jiro natiijo ku haboon"}
            </p>
            <p style={{color:TEXT3,fontSize:12}}>
              {trades.length===0?"New Trade si aad u bilowdo":"Filters beddel ama nadiifi"}
            </p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map((trade,i)=>(
              <div key={trade.id} style={{animation:`fadeIn .22s ease ${Math.min(i,10)*0.035}s both`}}>
                <TradeCard trade={trade} onDelete={handleDelete} onOpen={setSelectedTrade}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}