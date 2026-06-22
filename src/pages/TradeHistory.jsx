import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, deleteDoc, doc, orderBy,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaArrowUp, FaArrowDown, FaTrash, FaSearch, FaFilter,
  FaTimes, FaChartLine, FaSortAmountDown, FaSortAmountUp,
  FaCheckCircle, FaTimesCircle, FaMinus, FaCircle,
  FaExpandAlt, FaImage, FaBrain,
} from "react-icons/fa";

// ── THEME ─────────────────────────────────────────────────────────────
const GOLD     = "#f5c518";
const GOLD_DIM = "rgba(245,197,24,0.12)";
const GOLD_DIM2= "rgba(245,197,24,0.06)";
const GOLD_BORDER = "1px solid rgba(245,197,24,0.22)";
const MAIN_BG  = "#080808";
const CARD_BG  = "#111111";
const CARD2    = "#181818";
const CARD3    = "#1e1e1e";
const BORDER   = "1px solid rgba(255,255,255,0.06)";
const TEXT1    = "#ffffff";
const TEXT2    = "#888888";
const TEXT3    = "#444444";
const GREEN    = "#22c55e";
const RED      = "#ef4444";
const BLUE     = "#3b82f6";

const CURRENCY_PAIRS = [
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD",
  "GBPJPY","EURJPY","EURGBP","XAUUSD","XAGUSD","US30","NAS100","SPX500","BTCUSD","ETHUSD",
];

// ── STATUS CONFIG ──────────────────────────────────────────────────────
const STATUS_CFG = {
  Win:        { color: GREEN, bg: "rgba(34,197,94,0.12)",  icon: <FaCheckCircle />, label: "WIN" },
  Loss:       { color: RED,   bg: "rgba(239,68,68,0.12)",  icon: <FaTimesCircle />, label: "LOSS" },
  Breakeven:  { color: GOLD,  bg: "rgba(245,197,24,0.12)", icon: <FaMinus />,       label: "BE" },
  Open:       { color: BLUE,  bg: "rgba(59,130,246,0.12)", icon: <FaCircle />,      label: "OPEN" },
};

// ── IMAGE LIGHTBOX ─────────────────────────────────────────────────────
function Lightbox({ url, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.96)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(255,255,255,0.1)", border: "none",
          color: TEXT1, borderRadius: "50%", width: 36, height: 36,
          cursor: "pointer", fontSize: 16, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <FaTimes />
      </button>
      <img
        src={url} alt="Chart Setup"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "92vw", maxHeight: "88vh", borderRadius: 14, objectFit: "contain" }}
      />
    </div>
  );
}

// ── TRADE DETAIL MODAL ─────────────────────────────────────────────────
function TradeDetailModal({ trade, onClose }) {
  const [lightbox, setLightbox] = useState(false);
  const pl = Number(trade.profit_loss || 0);
  const sc = STATUS_CFG[trade.status] || STATUS_CFG.Open;

  const Row = ({ label, value, valueColor }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0", borderBottom: BORDER,
    }}>
      <span style={{ color: TEXT2, fontSize: 12 }}>{label}</span>
      <span style={{ color: valueColor || TEXT1, fontWeight: 700, fontSize: 13 }}>{value || "—"}</span>
    </div>
  );

  return (
    <>
      {lightbox && <Lightbox url={trade.setupImageURL} onClose={() => setLightbox(false)} />}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.92)", backdropFilter: "blur(14px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 520, maxHeight: "88vh",
            borderRadius: 20, background: CARD_BG, border: GOLD_BORDER,
            overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 0 60px rgba(245,197,24,0.1)",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "18px 22px", borderBottom: BORDER,
            background: `linear-gradient(135deg, ${GOLD_DIM}, ${GOLD_DIM2})`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: trade.direction === "BUY" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                border: `1px solid ${trade.direction === "BUY" ? GREEN : RED}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {trade.direction === "BUY"
                  ? <FaArrowUp style={{ color: GREEN, fontSize: 16 }} />
                  : <FaArrowDown style={{ color: RED, fontSize: 16 }} />}
              </div>
              <div>
                <h2 style={{ color: TEXT1, fontWeight: 900, fontSize: 20, margin: 0 }}>{trade.pair}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                  <span style={{
                    color: trade.direction === "BUY" ? GREEN : RED,
                    fontWeight: 700, fontSize: 11,
                    background: trade.direction === "BUY" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    padding: "2px 8px", borderRadius: 5,
                  }}>{trade.direction}</span>
                  <span style={{
                    color: sc.color, fontWeight: 700, fontSize: 11,
                    background: sc.bg, padding: "2px 8px", borderRadius: 5,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    {sc.icon} {sc.label}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {trade.profit_loss !== "" && trade.profit_loss !== undefined && (
                <p style={{
                  color: pl >= 0 ? GREEN : RED,
                  fontWeight: 900, fontSize: 24, margin: "0 0 2px",
                  letterSpacing: "-1px",
                }}>
                  {pl >= 0 ? "+" : ""}${pl}
                </p>
              )}
              {trade.rrr && (
                <span style={{ color: GOLD, fontSize: 11, fontWeight: 700 }}>RR 1:{trade.rrr}</span>
              )}
              <button
                onClick={onClose}
                style={{
                  display: "block", marginLeft: "auto", marginTop: 6,
                  color: TEXT2, background: "none", border: "none",
                  cursor: "pointer", fontSize: 14,
                }}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ overflowY: "auto", flex: 1, padding: "4px 0" }}>
            <div style={{ padding: "0 22px" }}>
              {/* Trade Details */}
              <p style={{
                color: TEXT3, fontSize: 9, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                margin: "16px 0 4px",
              }}>📊 Trade Details</p>
              <Row label="Entry Price"  value={trade.entryPrice}  />
              <Row label="Stop Loss"    value={trade.stopLoss}    valueColor={RED} />
              <Row label="Take Profit"  value={trade.takeProfit}  valueColor={GREEN} />
              <Row label="Lot Size"     value={trade.lotSize}     />
              <Row label="Pips"         value={trade.pips ? `${trade.pips} pips` : null} />
              <Row label="Strategy"     value={trade.strategy}    valueColor={GOLD} />
              <Row label="Session"      value={trade.session}     />
              <Row
                label="Date"
                value={new Date(trade.createdAt).toLocaleString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              />
            </div>

            {/* Emotion */}
            {trade.emotion && (
              <div style={{ padding: "12px 22px" }}>
                <p style={{
                  color: TEXT3, fontSize: 9, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px",
                }}>🧘 Xaalad Maskaxeed</p>
                <span style={{
                  background: GOLD_DIM, border: GOLD_BORDER,
                  borderRadius: 8, padding: "6px 14px",
                  color: GOLD, fontSize: 13, fontWeight: 700,
                }}>
                  {trade.emotion}
                </span>
              </div>
            )}

            {/* Psychology Notes */}
            {trade.notes_psychology && (
              <div style={{ padding: "0 22px 12px" }}>
                <p style={{
                  color: TEXT3, fontSize: 9, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px",
                }}>🧠 Psychology Notes</p>
                <div style={{
                  background: GOLD_DIM2, borderLeft: `3px solid ${GOLD}`,
                  borderRadius: "0 10px 10px 0", padding: "12px 14px",
                }}>
                  <p style={{ color: "#cccccc", fontSize: 13, margin: 0, lineHeight: 1.65 }}>
                    {trade.notes_psychology}
                  </p>
                </div>
              </div>
            )}

            {/* Chart Screenshot */}
            {trade.setupImageURL && (
              <div style={{ padding: "0 22px 22px" }}>
                <p style={{
                  color: TEXT3, fontSize: 9, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px",
                }}>📸 Chart Setup</p>
                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setLightbox(true)}>
                  <img
                    src={trade.setupImageURL} alt="Chart"
                    style={{
                      width: "100%", maxHeight: 200,
                      objectFit: "cover", borderRadius: 12,
                      border: GOLD_BORDER, display: "block",
                    }}
                  />
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)",
                    borderRadius: 12, display: "flex", alignItems: "center",
                    justifyContent: "center", opacity: 0, transition: "opacity .2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <FaExpandAlt style={{ color: "#fff", fontSize: 22 }} />
                  </div>
                </div>
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
  const pl = Number(trade.profit_loss || 0);
  const sc = STATUS_CFG[trade.status] || STATUS_CFG.Open;
  const hasPsych = !!trade.notes_psychology;
  const hasImage = !!trade.setupImageURL;

  return (
    <div
      style={{
        background: CARD_BG, border: BORDER, borderRadius: 14,
        padding: "16px 18px", cursor: "pointer",
        transition: "border-color .2s, transform .15s",
      }}
      onClick={() => onOpen(trade)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(245,197,24,0.28)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Top Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Left: direction icon + pair */}
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            background: trade.direction === "BUY" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${trade.direction === "BUY" ? GREEN : RED}25`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {trade.direction === "BUY"
              ? <FaArrowUp style={{ color: GREEN, fontSize: 14 }} />
              : <FaArrowDown style={{ color: RED, fontSize: 14 }} />}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ color: TEXT1, fontWeight: 900, fontSize: 15 }}>{trade.pair}</span>
              <span style={{
                color: trade.direction === "BUY" ? GREEN : RED,
                fontSize: 9, fontWeight: 800,
                background: trade.direction === "BUY" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                padding: "2px 7px", borderRadius: 5,
              }}>{trade.direction}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
              <span style={{ color: TEXT3, fontSize: 10 }}>E: <span style={{ color: TEXT2 }}>{trade.entryPrice || "—"}</span></span>
              <span style={{ color: TEXT3, fontSize: 10 }}>SL: <span style={{ color: RED, opacity: 0.7 }}>{trade.stopLoss || "—"}</span></span>
              <span style={{ color: TEXT3, fontSize: 10 }}>TP: <span style={{ color: GREEN, opacity: 0.7 }}>{trade.takeProfit || "—"}</span></span>
            </div>
          </div>
        </div>

        {/* Right: status + P&L */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{
            color: sc.color, fontSize: 9, fontWeight: 800,
            background: sc.bg, padding: "3px 10px", borderRadius: 6,
            display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end",
          }}>
            {sc.icon} {sc.label}
          </span>
          {trade.profit_loss !== "" && trade.profit_loss !== undefined && (
            <p style={{
              color: pl >= 0 ? GREEN : RED,
              fontWeight: 900, fontSize: 18, margin: "5px 0 0",
              letterSpacing: "-0.5px",
            }}>
              {pl >= 0 ? "+" : ""}${pl}
            </p>
          )}
          {trade.rrr && (
            <p style={{ color: GOLD, fontSize: 10, fontWeight: 700, margin: "2px 0 0" }}>
              RR 1:{trade.rrr}
            </p>
          )}
        </div>
      </div>

      {/* Mid Row: tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 11 }}>
        {trade.strategy && (
          <span style={{
            background: CARD2, border: BORDER, borderRadius: 6,
            color: GOLD, fontSize: 10, fontWeight: 700, padding: "3px 9px",
          }}>📊 {trade.strategy}</span>
        )}
        {trade.session && (
          <span style={{
            background: CARD2, border: BORDER, borderRadius: 6,
            color: TEXT2, fontSize: 10, padding: "3px 9px",
          }}>🕐 {trade.session}</span>
        )}
        {trade.lotSize && (
          <span style={{
            background: CARD2, border: BORDER, borderRadius: 6,
            color: TEXT2, fontSize: 10, padding: "3px 9px",
          }}>📦 {trade.lotSize} lot</span>
        )}
        {trade.pips && (
          <span style={{
            background: CARD2, border: BORDER, borderRadius: 6,
            color: TEXT2, fontSize: 10, padding: "3px 9px",
          }}>📏 {trade.pips} pips</span>
        )}
        {trade.emotion && (
          <span style={{
            background: GOLD_DIM, border: GOLD_BORDER, borderRadius: 6,
            color: GOLD, fontSize: 10, fontWeight: 700, padding: "3px 9px",
          }}>🧘 {trade.emotion}</span>
        )}
        {hasPsych && (
          <span style={{
            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 6, color: BLUE, fontSize: 10, padding: "3px 9px",
            display: "flex", alignItems: "center", gap: 4,
          }}><FaBrain size={8} /> Notes</span>
        )}
        {hasImage && (
          <span style={{
            background: "rgba(255,255,255,0.04)", border: BORDER,
            borderRadius: 6, color: TEXT3, fontSize: 10, padding: "3px 9px",
            display: "flex", alignItems: "center", gap: 4,
          }}><FaImage size={8} /> Screenshot</span>
        )}
      </div>

      {/* Psychology notes preview */}
      {trade.notes_psychology && (
        <div style={{
          marginTop: 10, borderLeft: `2px solid ${GOLD}`,
          paddingLeft: 10, background: GOLD_DIM2, borderRadius: "0 8px 8px 0",
          padding: "8px 10px 8px 12px",
        }}>
          <p style={{ color: TEXT3, fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>🧠 Psychology</p>
          <p style={{
            color: TEXT2, fontSize: 11, margin: 0, lineHeight: 1.55,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {trade.notes_psychology}
          </p>
        </div>
      )}

      {/* Bottom Row: date + delete */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 11, paddingTop: 10, borderTop: BORDER,
      }}>
        <span style={{ color: TEXT3, fontSize: 10 }}>
          {new Date(trade.createdAt).toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(trade.id); }}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            color: TEXT3, background: "none", border: "none",
            fontSize: 10, cursor: "pointer", padding: "3px 7px",
            borderRadius: 6, transition: "color .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = RED}
          onMouseLeave={e => e.currentTarget.style.color = TEXT3}
        >
          <FaTrash size={9} /> Delete
        </button>
      </div>
    </div>
  );
}

// ── SUMMARY BAR ────────────────────────────────────────────────────────
function SummaryBar({ trades }) {
  const closed = trades.filter(t => t.status !== "Open");
  const wins   = trades.filter(t => t.status === "Win").length;
  const losses = trades.filter(t => t.status === "Loss").length;
  const winRate = closed.length ? Math.round((wins / closed.length) * 100) : 0;
  const totalPnL = trades.reduce((a, t) => a + Number(t.profit_loss || 0), 0);
  const openCount = trades.filter(t => t.status === "Open").length;

  const items = [
    { label: "Trades",   value: trades.length,          color: TEXT1 },
    { label: "Win Rate", value: `${winRate}%`,           color: winRate >= 60 ? GREEN : winRate >= 40 ? GOLD : RED },
    { label: "Wins",     value: wins,                    color: GREEN },
    { label: "Losses",   value: losses,                  color: RED },
    { label: "Open",     value: openCount,               color: BLUE },
    { label: "Net P&L",  value: `${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`, color: totalPnL >= 0 ? GREEN : RED },
  ];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(6,1fr)",
      gap: 10, marginBottom: 18,
    }}>
      {items.map(item => (
        <div key={item.label} style={{
          background: CARD_BG, border: BORDER, borderRadius: 11,
          padding: "12px 14px", textAlign: "center",
        }}>
          <p style={{ color: TEXT2, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px" }}>{item.label}</p>
          <p style={{ color: item.color, fontWeight: 900, fontSize: 17, margin: 0 }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────
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
      const q = query(
        collection(db, "trades"),
        where("userId", "==", user.uid),
      );
      const unsubSnap = onSnapshot(q, snap => {
        setTrades(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      return unsubSnap;
    });
    return unsub;
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Trade delete garaynaa?")) return;
    await deleteDoc(doc(db, "trades", id));
  };

  const toggleSort = (key) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(false); }
  };

  // Filter + Search + Sort
  const filtered = trades
    .filter(t => {
      if (filterPair !== "All" && t.pair !== filterPair) return false;
      if (filterStatus !== "All" && t.status !== filterStatus) return false;
      if (filterSession !== "All" && t.session !== filterSession) return false;
      if (filterDir !== "All" && t.direction !== filterDir) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !t.pair?.toLowerCase().includes(s) &&
          !t.strategy?.toLowerCase().includes(s) &&
          !t.notes_psychology?.toLowerCase().includes(s) &&
          !t.emotion?.toLowerCase().includes(s)
        ) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let va, vb;
      if (sortBy === "date")   { va = a.createdAt; vb = b.createdAt; }
      else if (sortBy === "pnl")  { va = Number(a.profit_loss || 0); vb = Number(b.profit_loss || 0); }
      else if (sortBy === "pair") { va = a.pair; vb = b.pair; }
      else if (sortBy === "rrr")  { va = parseFloat(a.rrr || 0); vb = parseFloat(b.rrr || 0); }
      if (typeof va === "string") return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });

  const iS = {
    background: CARD2, color: TEXT1, padding: "8px 11px",
    borderRadius: 9, outline: "none", border: BORDER,
    fontSize: 12, cursor: "pointer",
  };

  const SortBtn = ({ label, key }) => (
    <button
      onClick={() => toggleSort(key)}
      style={{
        ...iS, display: "flex", alignItems: "center", gap: 5,
        color: sortBy === key ? GOLD : TEXT2,
        border: sortBy === key ? GOLD_BORDER : BORDER,
        background: sortBy === key ? GOLD_DIM : CARD2,
        fontWeight: sortBy === key ? 700 : 400,
      }}
    >
      {label}
      {sortBy === key
        ? (sortAsc ? <FaSortAmountUp size={9} /> : <FaSortAmountDown size={9} />)
        : <FaSortAmountDown size={9} style={{ opacity: 0.3 }} />}
    </button>
  );

  if (!currentUser) return (
    <div style={{
      minHeight: "100vh", background: MAIN_BG,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <FaChartLine style={{ color: GOLD, fontSize: 36, marginBottom: 12 }} />
        <p style={{ color: TEXT1, fontWeight: 900, fontSize: 16, margin: "0 0 6px" }}>Please Login</p>
        <p style={{ color: TEXT2, fontSize: 12 }}>Trade history-ga arag si aad u login gasho</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: MAIN_BG, color: TEXT1 }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
        ::-webkit-scrollbar { width: 3px }
        ::-webkit-scrollbar-track { background: ${MAIN_BG} }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px }
        select option { background: ${CARD2}; color: ${TEXT1} }
      `}</style>

      {selectedTrade && (
        <TradeDetailModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* Page Header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 24,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: GOLD_DIM, border: GOLD_BORDER,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FaChartLine style={{ color: GOLD, fontSize: 15 }} />
              </div>
              <h1 style={{ color: TEXT1, fontWeight: 900, fontSize: 26, margin: 0 }}>
                Trade History
              </h1>
            </div>
            <p style={{ color: TEXT2, fontSize: 12, margin: 0 }}>
              Dhammaan trade-yaadii aad galisay — click card si aad faahfaahin u aragto
            </p>
          </div>
          <div style={{
            background: GOLD_DIM, border: GOLD_BORDER,
            borderRadius: 10, padding: "8px 16px", textAlign: "center",
          }}>
            <p style={{ color: TEXT2, fontSize: 9, fontWeight: 700, textTransform: "uppercase", margin: "0 0 2px" }}>Filtered</p>
            <p style={{ color: GOLD, fontWeight: 900, fontSize: 20, margin: 0 }}>{filtered.length}</p>
          </div>
        </div>

        {/* Summary */}
        <SummaryBar trades={filtered} />

        {/* Search + Filters */}
        <div style={{
          background: CARD_BG, border: BORDER, borderRadius: 14,
          padding: "14px 16px", marginBottom: 16,
        }}>
          {/* Search + filter toggle + sort */}
          <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{
              flex: 1, minWidth: 180, display: "flex", alignItems: "center",
              gap: 8, background: CARD2, border: BORDER, borderRadius: 9, padding: "8px 13px",
            }}>
              <FaSearch style={{ color: TEXT3, fontSize: 11, flexShrink: 0 }} />
              <input
                type="text" placeholder="Raadi pair, strategy, notes..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1, background: "none", color: TEXT1,
                  border: "none", outline: "none", fontSize: 12,
                }}
              />
              {search && (
                <button onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", color: TEXT3, cursor: "pointer" }}>
                  <FaTimes size={10} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                ...iS, display: "flex", alignItems: "center", gap: 5,
                color: showFilters ? GOLD : TEXT2,
                border: showFilters ? GOLD_BORDER : BORDER,
                background: showFilters ? GOLD_DIM : CARD2,
                fontWeight: 600,
              }}
            >
              <FaFilter size={10} /> Filters
            </button>
            <SortBtn label="Date"  key="date" />
            <SortBtn label="P&L"   key="pnl" />
            <SortBtn label="Pair"  key="pair" />
            <SortBtn label="RR"    key="rrr" />
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4,1fr)",
              gap: 9, marginTop: 12, paddingTop: 12, borderTop: BORDER,
              animation: "fadeIn .2s ease",
            }}>
              <div>
                <label style={{ color: TEXT3, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>Pair</label>
                <select value={filterPair} onChange={e => setFilterPair(e.target.value)} style={{ ...iS, width: "100%" }}>
                  <option value="All">All Pairs</option>
                  {CURRENCY_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: TEXT3, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>Status</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...iS, width: "100%" }}>
                  <option value="All">All Status</option>
                  <option value="Open">🟢 Open</option>
                  <option value="Win">✅ Win</option>
                  <option value="Loss">❌ Loss</option>
                  <option value="Breakeven">➖ Breakeven</option>
                </select>
              </div>
              <div>
                <label style={{ color: TEXT3, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>Session</label>
                <select value={filterSession} onChange={e => setFilterSession(e.target.value)} style={{ ...iS, width: "100%" }}>
                  <option value="All">All Sessions</option>
                  <option value="Asian">🌏 Asian</option>
                  <option value="London">🇬🇧 London</option>
                  <option value="New York">🗽 New York</option>
                  <option value="Overlap">🔄 Overlap</option>
                </select>
              </div>
              <div>
                <label style={{ color: TEXT3, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>Direction</label>
                <select value={filterDir} onChange={e => setFilterDir(e.target.value)} style={{ ...iS, width: "100%" }}>
                  <option value="All">BUY & SELL</option>
                  <option value="BUY">↑ BUY only</option>
                  <option value="SELL">↓ SELL only</option>
                </select>
              </div>
              {(filterPair !== "All" || filterStatus !== "All" || filterSession !== "All" || filterDir !== "All") && (
                <button
                  onClick={() => { setFilterPair("All"); setFilterStatus("All"); setFilterSession("All"); setFilterDir("All"); }}
                  style={{
                    gridColumn: "span 4", padding: "7px 0", borderRadius: 8,
                    background: "none", border: `1px solid rgba(239,68,68,0.25)`,
                    color: RED, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  }}
                >
                  <FaTimes size={9} /> Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Trades List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              border: `3px solid ${GOLD}`, borderTopColor: "transparent",
              animation: "spin 1s linear infinite", margin: "0 auto 12px",
            }} />
            <p style={{ color: TEXT2, fontSize: 12 }}>Loading trades...</p>
            <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 0",
            background: CARD_BG, border: BORDER, borderRadius: 14,
          }}>
            <p style={{ fontSize: 36, margin: "0 0 10px" }}>📭</p>
            <p style={{ color: TEXT1, fontWeight: 900, fontSize: 15, margin: "0 0 5px" }}>
              {trades.length === 0 ? "Wali trade lama galinin" : "Ma jiro filter-ka ku haboon"}
            </p>
            <p style={{ color: TEXT3, fontSize: 12 }}>
              {trades.length === 0
                ? "Kor ka riix New Trade si aad u bilowdo"
                : "Filters-ka beddel ama nadiifi"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((trade, i) => (
              <div key={trade.id} style={{ animation: `fadeIn .25s ease ${Math.min(i, 8) * 0.04}s both` }}>
                <TradeCard
                  trade={trade}
                  onDelete={handleDelete}
                  onOpen={setSelectedTrade}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}