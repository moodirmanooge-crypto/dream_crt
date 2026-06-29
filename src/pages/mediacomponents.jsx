import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

// ── FACEBOOK-STYLE MEDIA GRID ─────────────────────────────────────────
export function MediaGrid({ mediaItems, onImageClick }) {
  if (!mediaItems || mediaItems.length === 0) return null;
  const count = mediaItems.length;

  const cellStyle = (extra = {}) => ({
    overflow: "hidden", position: "relative",
    background: "#0a0f1e", cursor: "pointer", ...extra,
  });
  const imgStyle = {
    width: "100%", height: "100%", objectFit: "cover",
    display: "block", transition: "transform 0.2s",
  };
  const hoverScale = (e) => {
    const img = e.currentTarget.querySelector("img");
    if (img) img.style.transform = "scale(1.04)";
  };
  const hoverReset = (e) => {
    const img = e.currentTarget.querySelector("img");
    if (img) img.style.transform = "scale(1)";
  };

  // ── 1 sawir ──
  if (count === 1) {
    const item = mediaItems[0];
    return (
      <div style={{ marginBottom: 9, padding: "0 10px" }}>
        {item.type === "video"
          ? <video src={item.url} controls style={{ width: "100%", maxHeight: 340, objectFit: "cover", display: "block", borderRadius: 10 }} />
          : <div style={cellStyle({ maxHeight: 340, borderRadius: 10 })} onClick={() => onImageClick(0)} onMouseEnter={hoverScale} onMouseLeave={hoverReset}>
              <img src={item.url} alt="" style={{ ...imgStyle, maxHeight: 340 }} />
            </div>}
      </div>
    );
  }

  // ── 2 sawiro ──
  if (count === 2) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, height: 260, marginBottom: 9, padding: "0 10px" }}>
        {mediaItems.map((item, i) => (
          <div key={i} style={cellStyle({ borderRadius: i === 0 ? "10px 0 0 10px" : "0 10px 10px 0" })}
            onClick={() => onImageClick(i)} onMouseEnter={hoverScale} onMouseLeave={hoverReset}>
            {item.type === "video"
              ? <video src={item.url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <img src={item.url} alt="" style={imgStyle} />}
          </div>
        ))}
      </div>
    );
  }

  // ── 3 sawiro ──
  if (count === 3) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "175px 175px", gap: 2, marginBottom: 9, padding: "0 10px" }}>
        <div style={cellStyle({ gridRow: "1 / 3", borderRadius: "10px 0 0 10px" })}
          onClick={() => onImageClick(0)} onMouseEnter={hoverScale} onMouseLeave={hoverReset}>
          <img src={mediaItems[0].url} alt="" style={imgStyle} />
        </div>
        {[1, 2].map(i => (
          <div key={i} style={cellStyle({ borderRadius: i === 1 ? "0 10px 0 0" : "0 0 10px 0" })}
            onClick={() => onImageClick(i)} onMouseEnter={hoverScale} onMouseLeave={hoverReset}>
            <img src={mediaItems[i].url} alt="" style={imgStyle} />
          </div>
        ))}
      </div>
    );
  }

  // ── 4 sawiro ──
  if (count === 4) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "175px 175px", gap: 2, marginBottom: 9, padding: "0 10px" }}>
        {mediaItems.map((item, i) => (
          <div key={i} style={cellStyle({
            borderRadius: i===0?"10px 0 0 0":i===1?"0 10px 0 0":i===2?"0 0 0 10px":"0 0 10px 0"
          })} onClick={() => onImageClick(i)} onMouseEnter={hoverScale} onMouseLeave={hoverReset}>
            <img src={item.url} alt="" style={imgStyle} />
          </div>
        ))}
      </div>
    );
  }

  // ── 5+ sawiro ──
  const visible = mediaItems.slice(0, 5);
  const remaining = count - 5;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "185px 145px", gap: 2, marginBottom: 9, padding: "0 10px" }}>
      <div style={cellStyle({ gridColumn: "1 / 3", gridRow: "1 / 2", borderRadius: "10px 0 0 0" })}
        onClick={() => onImageClick(0)} onMouseEnter={hoverScale} onMouseLeave={hoverReset}>
        <img src={visible[0].url} alt="" style={imgStyle} />
      </div>
      <div style={cellStyle({ gridColumn: "3 / 4", gridRow: "1 / 2", borderRadius: "0 10px 0 0" })}
        onClick={() => onImageClick(1)} onMouseEnter={hoverScale} onMouseLeave={hoverReset}>
        <img src={visible[1].url} alt="" style={imgStyle} />
      </div>
      {visible.slice(2, 5).map((item, i) => (
        <div key={i + 2} style={cellStyle({
          position: "relative",
          borderRadius: i===0?"0 0 0 10px":i===2?"0 0 10px 0":"none"
        })} onClick={() => onImageClick(i + 2)} onMouseEnter={hoverScale} onMouseLeave={hoverReset}>
          <img src={item.url} alt="" style={imgStyle} />
          {i === 2 && remaining > 0 && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.65)",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "0 0 10px 0"
            }}>
              <span style={{ color: "#fff", fontSize: 26, fontWeight: 900 }}>+{remaining}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── IMAGE LIGHTBOX ─────────────────────────────────────────────────────
export function ImageLightbox({ items, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const total = items.length;

  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % total);
      if (e.key === "ArrowLeft")  setIdx(i => (i - 1 + total) % total);
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [total, onClose]);

  const item = items[idx];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 110,
      background: "rgba(0,0,0,0.97)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", display: "flex", alignItems: "center" }}>

        {total > 1 && (
          <button onClick={() => setIdx(i => (i - 1 + total) % total)} style={{
            position: "absolute", left: -60, top: "50%", transform: "translateY(-50%)",
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.12)", border: "none",
            color: "#fff", fontSize: 26, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>‹</button>
        )}

        {item.type === "video"
          ? <video src={item.url} controls autoPlay style={{ maxWidth: "88vw", maxHeight: "88vh", borderRadius: 12 }} />
          : <img src={item.url} alt="" style={{ maxWidth: "88vw", maxHeight: "88vh", borderRadius: 12, objectFit: "contain" }} />
        }

        {total > 1 && (
          <button onClick={() => setIdx(i => (i + 1) % total)} style={{
            position: "absolute", right: -60, top: "50%", transform: "translateY(-50%)",
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.12)", border: "none",
            color: "#fff", fontSize: 26, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>›</button>
        )}

        <button onClick={onClose} style={{
          position: "absolute", top: -50, right: 0,
          background: "rgba(255,255,255,0.12)", border: "none",
          color: "#fff", fontSize: 18, cursor: "pointer",
          borderRadius: "50%", width: 38, height: 38,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}><FaTimes /></button>

        {total > 1 && (
          <div style={{
            position: "absolute", bottom: -42, left: "50%", transform: "translateX(-50%)",
            color: "#bbb", fontSize: 12,
            background: "rgba(0,0,0,0.5)", padding: "3px 16px", borderRadius: 20
          }}>{idx + 1} / {total}</div>
        )}
      </div>
    </div>
  );
}