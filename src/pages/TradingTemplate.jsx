import { useState } from "react";
import {
  FaChartBar,
  FaTwitter,
  FaEnvelope,
  FaGlobe,
  FaWallet,
  FaCoins,
  FaChartLine,
  FaTrophy,
  FaBolt,
  FaCalendarAlt,
  FaStickyNote,
  FaCamera,
} from "react-icons/fa";

const trades = [
  { pair: "EUR/USD", session: "NY", pl: "+$173", rr: "3.47R", direction: "LONG", time: "09:42 AM", status: "WIN" },
  { pair: "GBP/USD", session: "LON", pl: "+$517", rr: "5.17R", direction: "SHORT", time: "07:15 AM", status: "WIN" },
  { pair: "BTC/USD", session: "ASIA", pl: "-$100", rr: "-1.00R", direction: "LONG", time: "02:30 AM", status: "LOSS" },
  { pair: "XAU/USD", session: "NY", pl: "+$238", rr: "4.76R", direction: "LONG", time: "11:05 AM", status: "WIN" },
];

const sessionColors = {
  NY: { bg: "#1a2535", text: "#60a5fa", border: "#1e3a5f" },
  LON: { bg: "#1e2a1e", text: "#4ade80", border: "#1a3d1a" },
  ASIA: { bg: "#2a1f1e", text: "#fb923c", border: "#3d2418" },
};

const navItems = [
  { label: "Trade", icon: FaChartBar },
  { label: "Gallery", icon: FaCamera },
  { label: "Calendar", icon: FaCalendarAlt },
  { label: "Economic", icon: FaBolt },
  { label: "Models", icon: FaChartLine },
  { label: "Notes", icon: FaStickyNote },
];

export default function TradingTemplate() {
  const [activeNav, setActiveNav] = useState("Trade");

  const stats = [
    { label: "Total P/L", value: "+$828", sub: "This Week", positive: true },
    { label: "Win Rate", value: "75%", sub: "3 of 4 Trades", positive: true },
    { label: "Best RR", value: "5.17R", sub: "GBP/USD Short", positive: true },
    { label: "Drawdown", value: "-$100", sub: "Max Loss", positive: false },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0c10 100%)",
      padding: "28px",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        .trow:hover { background: rgba(212,175,55,0.04) !important; }
        .navbtn:hover { background: rgba(212,175,55,0.08) !important; color: #d4af37 !important; }
        .navbtn.active { background: rgba(212,175,55,0.12) !important; color: #d4af37 !important; border-color: rgba(212,175,55,0.3) !important; }
        .catcard:hover { border-color: rgba(212,175,55,0.5) !important; background: rgba(212,175,55,0.06) !important; }
        .social-row:hover .social-icon { color: #d4af37 !important; }
        .pill-long { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.25); }
        .pill-short { background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.25); }
        .win-badge { background: rgba(52,211,153,0.08); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
        .loss-badge { background: rgba(248,113,113,0.08); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0f0f17; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
      `}</style>

      <div style={{
        maxWidth: "1300px",
        margin: "0 auto",
        background: "#111118",
        borderRadius: "24px",
        border: "1px solid #1e1e2e",
        overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.06)",
      }}>

        {/* TOP GOLD ACCENT BAR */}
        <div style={{
          height: "3px",
          background: "linear-gradient(90deg, transparent 0%, #8b6914 20%, #d4af37 50%, #8b6914 80%, transparent 100%)",
        }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px" }}>

          {/* ═══════════════ LEFT MAIN COLUMN ═══════════════ */}
          <div style={{ padding: "36px 40px", borderRight: "1px solid #1e1e2e" }}>

            {/* HEADER */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "36px" }}>
              <div style={{
                width: "60px", height: "60px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #1a1612 0%, #2a2116 100%)",
                border: "1px solid rgba(212,175,55,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 0 20px rgba(212,175,55,0.08)",
              }}>
                <FaChartBar style={{ fontSize: "26px", color: "#d4af37" }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: "28px", fontWeight: "800", margin: 0, lineHeight: 1,
                  background: "linear-gradient(135deg, #f0e6c0 0%, #d4af37 50%, #a07828 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                }}>Trading Journal</h1>
                <p style={{
                  margin: "6px 0 0", fontSize: "13px", color: "#4a4a6a",
                  fontWeight: "500", letterSpacing: "0.08em", textTransform: "uppercase",
                }}>Professional Forex Analytics</p>
              </div>

              {/* DATE BADGE */}
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{
                  fontSize: "12px", color: "#4a4a6a", fontWeight: "500",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>Today</div>
                <div style={{ fontSize: "15px", color: "#8a8aaa", fontWeight: "600", marginTop: "2px" }}>
                  Mon, Jun 08
                </div>
              </div>
            </div>

            {/* ── STATS ROW ── */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px", marginBottom: "32px",
            }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  background: "#0d0d16",
                  border: "1px solid #1e1e2e",
                  borderRadius: "14px",
                  padding: "16px 18px",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                    background: s.positive
                      ? "linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(248,113,113,0.5), transparent)",
                  }} />
                  <div style={{ fontSize: "11px", color: "#4a4a6a", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>{s.label}</div>
                  <div style={{
                    fontSize: "22px", fontWeight: "800", lineHeight: 1,
                    color: s.positive ? "#34d399" : "#f87171",
                    fontFamily: "'DM Mono', monospace",
                  }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#3a3a55", marginTop: "6px", fontWeight: "500" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ── NAV TABS ── */}
            <div style={{
              display: "flex", gap: "6px",
              background: "#0d0d16",
              border: "1px solid #1e1e2e",
              borderRadius: "14px",
              padding: "6px",
              marginBottom: "28px",
              overflowX: "auto",
            }}>
              {navItems.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className={`navbtn ${activeNav === label ? "active" : ""}`}
                  onClick={() => setActiveNav(label)}
                  style={{
                    display: "flex", alignItems: "center", gap: "7px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1px solid transparent",
                    background: "transparent",
                    color: "#4a4a6a",
                    fontSize: "13px", fontWeight: "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                    fontFamily: "inherit",
                  }}
                >
                  <Icon style={{ fontSize: "13px" }} />
                  {label}
                </button>
              ))}
            </div>

            {/* ── TRADES TABLE ── */}
            <div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "16px",
              }}>
                <h2 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#6a6a8a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Recent Trades
                </h2>
                <span style={{
                  fontSize: "11px", color: "#d4af37", fontWeight: "600",
                  background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: "20px", padding: "3px 10px",
                }}>4 trades today</span>
              </div>

              {/* TABLE HEADER */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1.2fr 1fr 1fr 1fr",
                padding: "10px 18px",
                borderBottom: "1px solid #1a1a28",
                marginBottom: "4px",
              }}>
                {["Pair", "Session", "P / L", "R:R", "Direction", "Status"].map(h => (
                  <span key={h} style={{ fontSize: "11px", color: "#3a3a55", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>

              {/* TABLE ROWS */}
              {trades.map((t, i) => (
                <div
                  key={i}
                  className="trow"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1.2fr 1fr 1fr 1fr",
                    alignItems: "center",
                    padding: "16px 18px",
                    borderRadius: "12px",
                    marginBottom: "4px",
                    background: "#0d0d16",
                    border: "1px solid #17172a",
                    transition: "all 0.15s ease",
                    cursor: "default",
                  }}
                >
                  {/* PAIR */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: t.status === "WIN" ? "#34d399" : "#f87171",
                      boxShadow: t.status === "WIN" ? "0 0 6px rgba(52,211,153,0.6)" : "0 0 6px rgba(248,113,113,0.6)",
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "800", color: "#e0e0f0", letterSpacing: "0.02em" }}>{t.pair}</div>
                      <div style={{ fontSize: "11px", color: "#3a3a55", fontFamily: "'DM Mono', monospace", marginTop: "1px" }}>{t.time}</div>
                    </div>
                  </div>

                  {/* SESSION */}
                  <div>
                    <span style={{
                      fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
                      padding: "4px 10px", borderRadius: "6px",
                      background: sessionColors[t.session].bg,
                      color: sessionColors[t.session].text,
                      border: `1px solid ${sessionColors[t.session].border}`,
                    }}>{t.session}</span>
                  </div>

                  {/* P/L */}
                  <div style={{
                    fontSize: "16px", fontWeight: "800",
                    color: t.pl.includes("+") ? "#34d399" : "#f87171",
                    fontFamily: "'DM Mono', monospace",
                  }}>{t.pl}</div>

                  {/* RR */}
                  <div style={{
                    fontSize: "14px", fontWeight: "600",
                    color: t.rr.includes("-") ? "#f87171" : "#8a8aaa",
                    fontFamily: "'DM Mono', monospace",
                  }}>{t.rr}</div>

                  {/* DIRECTION */}
                  <div>
                    <span
                      className={t.direction === "LONG" ? "pill-long" : "pill-short"}
                      style={{
                        display: "inline-block",
                        fontSize: "11px", fontWeight: "800",
                        padding: "4px 12px", borderRadius: "6px",
                        letterSpacing: "0.06em",
                      }}
                    >{t.direction}</span>
                  </div>

                  {/* STATUS */}
                  <div>
                    <span
                      className={t.status === "WIN" ? "win-badge" : "loss-badge"}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        fontSize: "11px", fontWeight: "700",
                        padding: "4px 10px", borderRadius: "6px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      <span style={{ fontSize: "8px" }}>{t.status === "WIN" ? "▲" : "▼"}</span>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════════ RIGHT SIDEBAR ═══════════════ */}
          <aside style={{
            padding: "36px 28px",
            background: "#0d0d14",
            display: "flex", flexDirection: "column", gap: "28px",
          }}>

            {/* PROFILE CARD */}
            <div style={{
              background: "linear-gradient(135deg, #13111a 0%, #161220 100%)",
              border: "1px solid rgba(212,175,55,0.15)",
              borderRadius: "18px",
              padding: "24px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Gold glow top-right */}
              <div style={{
                position: "absolute", top: "-30px", right: "-30px",
                width: "100px", height: "100px",
                background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div style={{
                  width: "50px", height: "50px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #1e1a10, #2a2516)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", fontWeight: "900",
                  color: "#d4af37",
                  fontFamily: "'DM Sans', sans-serif",
                }}>DC</div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#e0e0f0" }}>Dream CRT</div>
                  <div style={{ fontSize: "12px", color: "#4a4a6a", marginTop: "2px", fontWeight: "500" }}>Pro Trader</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <FaTrophy style={{ color: "#d4af37", fontSize: "18px" }} />
                </div>
              </div>

              {/* Mini stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "Trades", value: "4" },
                  { label: "Win Rate", value: "75%" },
                  { label: "Total R", value: "+12.4R" },
                  { label: "Profit", value: "+$828" },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: "#0d0d16",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    border: "1px solid #1a1a28",
                  }}>
                    <div style={{ fontSize: "10px", color: "#3a3a55", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                    <div style={{
                      fontSize: "16px", fontWeight: "800",
                      color: item.value.includes("+") ? "#d4af37" : "#8a8aaa",
                      fontFamily: "'DM Mono', monospace", marginTop: "4px",
                    }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CATEGORIES */}
            <div>
              <h3 style={{
                margin: "0 0 14px",
                fontSize: "11px", color: "#3a3a55", fontWeight: "700",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>Categories</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { icon: FaWallet, label: "Personal Finance", sub: "Budget & savings", accent: "#60a5fa" },
                  { icon: FaChartLine, label: "Trading Journal", sub: "Trades & analysis", accent: "#d4af37" },
                  { icon: FaCoins, label: "Investing", sub: "Portfolio & assets", accent: "#34d399" },
                ].map(({ icon: Icon, label, sub, accent }, i) => (
                  <div
                    key={i}
                    className="catcard"
                    style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "14px 16px",
                      background: "#0d0d16",
                      border: "1px solid #1a1a28",
                      borderRadius: "14px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{
                      width: "38px", height: "38px",
                      borderRadius: "10px",
                      background: `${accent}12`,
                      border: `1px solid ${accent}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon style={{ fontSize: "16px", color: accent }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#c0c0d8" }}>{label}</div>
                      <div style={{ fontSize: "11px", color: "#3a3a55", marginTop: "1px" }}>{sub}</div>
                    </div>
                    <div style={{ marginLeft: "auto", color: "#2a2a3a", fontSize: "14px" }}>›</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CONTACT */}
            <div>
              <h3 style={{
                margin: "0 0 14px",
                fontSize: "11px", color: "#3a3a55", fontWeight: "700",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>Contact</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { icon: FaEnvelope, text: "dreamcrt89@gmail.com", accent: "#60a5fa" },
                  { icon: FaGlobe, text: "www.dreamcrt.com", accent: "#34d399" },
                  { icon: FaTwitter, text: "@dreamcrt", accent: "#38bdf8" },
                ].map(({ icon: Icon, text, accent }, i) => (
                  <div key={i} className="social-row" style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "11px 14px",
                    borderRadius: "12px",
                    background: "transparent",
                    border: "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}>
                    <Icon className="social-icon" style={{ fontSize: "14px", color: "#3a3a55", transition: "color 0.15s ease", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "#4a4a6a", fontWeight: "500" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM GOLD DIVIDER + BRAND */}
            <div style={{ marginTop: "auto" }}>
              <div style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)",
                marginBottom: "16px",
              }} />
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                <div style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: "#d4af37",
                  boxShadow: "0 0 6px rgba(212,175,55,0.6)",
                }} />
                <span style={{
                  fontSize: "11px", color: "#2e2e44", fontWeight: "700",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                }}>Dream CRT · 2026</span>
                <div style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: "#d4af37",
                  boxShadow: "0 0 6px rgba(212,175,55,0.6)",
                }} />
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}