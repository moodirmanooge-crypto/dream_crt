import { useState } from "react";
import emailjs from "@emailjs/browser";

// ─────────────────────────────────────────────
//  EMAILJS CONFIG  →  ku beddel kugaaga
//  1. aad emailjs.com  →  account samee (free)
//  2. Add Service  →  Gmail xidh  →  copy Service ID
//  3. Email Templates  →  template cusub samee:
//       To email:   dreamcrt89@gmail.com
//       Subject:    New Contact Message from {{from_name}}
//       Body:       Name: {{from_name}}
//                   Email: {{from_email}}
//                   Message: {{message}}
//  4. Account → API Keys → copy Public Key
// ─────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "service_eaepeef";   // ← beddel
const EMAILJS_TEMPLATE_ID = "template_fqgueuh";  // ← beddel
const EMAILJS_PUBLIC_KEY  = "dfBoXzz3m2mz5HCwN";   // ← beddel

export default function Contact() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      setError("Please fill all fields");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name:    name,
          email:   email,
          message: message,
          title:   name,
        },
        EMAILJS_PUBLIC_KEY
      );

      // Success
      setShowModal(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("EmailJS error:", err);
      setError("Failed to send message. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="text-white min-h-screen overflow-x-hidden"
      style={{ background: "#0d0d0d" }}
    >
      {/* ─── HEADER ─── */}
      <div
        className="px-5 md:px-20 py-10 md:py-16 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0d0d0d 0%, #1a1200 50%, #0d0d0d 100%)",
          borderBottom: "1px solid rgba(245,197,24,0.12)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: "600px", height: "300px",
            background: "radial-gradient(ellipse, rgba(245,197,24,0.07) 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
        <p
          className="text-xs md:text-sm font-bold uppercase tracking-widest mb-3"
          style={{ color: "#f5c518" }}
        >
          Get In Touch
        </p>
        <h1
          className="font-black uppercase mb-4"
          style={{ fontSize: "clamp(2rem, 6vw, 4rem)", lineHeight: 1.1 }}
        >
          Contact <span style={{ color: "#f5c518" }}>DREAM CRT</span>
        </h1>
        <p
          className="text-sm md:text-base max-w-xl mx-auto"
          style={{ color: "#64748b" }}
        >
          We're here to help. Reach out via email or WhatsApp and we'll get back to you as soon as possible.
        </p>
      </div>

      {/* ─── CONTACT CARDS ─── */}
      <section className="px-5 md:px-20 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* EMAIL CARD */}
          <a
            href="mailto:dreamcrt89@gmail.com"
            className="flex flex-col items-center justify-center gap-5 p-8 md:p-10 rounded-3xl text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(245,197,24,0.2)",
              textDecoration: "none",
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245,197,24,0.06)";
              e.currentTarget.style.border = "1px solid rgba(245,197,24,0.5)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.border = "1px solid rgba(245,197,24,0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl"
              style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)" }}
            >
              ✉️
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#64748b" }}>
                Send us an Email
              </p>
              <h3 className="text-lg md:text-xl font-black mb-2" style={{ color: "#ffffff" }}>
                Email Support
              </h3>
              <p className="text-sm md:text-base font-semibold" style={{ color: "#f5c518" }}>
                dreamcrt89@gmail.com
              </p>
              <p className="text-xs mt-2" style={{ color: "#475569" }}>We reply within 24 hours</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
              style={{ background: "#f5c518", color: "#000000" }}
            >
              →
            </div>
          </a>

          {/* WHATSAPP CARD */}
          <a
            href="https://wa.me/+252612515121"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-5 p-8 md:p-10 rounded-3xl text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(37,211,102,0.2)",
              textDecoration: "none",
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(37,211,102,0.04)";
              e.currentTarget.style.border = "1px solid rgba(37,211,102,0.5)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.border = "1px solid rgba(37,211,102,0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl"
              style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)" }}
            >
              💬
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#64748b" }}>
                Chat with us
              </p>
              <h3 className="text-lg md:text-xl font-black mb-2" style={{ color: "#ffffff" }}>
                WhatsApp Support
              </h3>
              <p className="text-sm md:text-base font-semibold" style={{ color: "#25d366" }}>
                +252 612 515 121
              </p>
              <p className="text-xs mt-2" style={{ color: "#475569" }}>Available 9AM – 9PM (EAT)</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
              style={{ background: "#25d366", color: "#000000" }}
            >
              →
            </div>
          </a>
        </div>
      </section>

      {/* ─── CONTACT FORM ─── */}
      <section className="px-5 md:px-20 pb-20 md:pb-28">
        <div
          className="max-w-2xl mx-auto p-6 md:p-10 rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(245,197,24,0.15)",
          }}
        >
          <h2
            className="text-xl md:text-2xl font-black text-center mb-2"
            style={{ color: "#ffffff" }}
          >
            Send a Message
          </h2>
          <p className="text-sm text-center mb-8" style={{ color: "#475569" }}>
            Fill the form below and we'll get back to you shortly.
          </p>

          <div className="space-y-4">
            {/* Error banner */}
            {error && (
              <div
                className="w-full p-3 rounded-xl text-sm font-semibold text-center"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
              >
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "#94a3b8" }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 rounded-xl outline-none text-white text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,197,24,0.2)" }}
                onFocus={(e) => { e.target.style.border = "1px solid rgba(245,197,24,0.6)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(245,197,24,0.2)"; }}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "#94a3b8" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl outline-none text-white text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,197,24,0.2)" }}
                onFocus={(e) => { e.target.style.border = "1px solid rgba(245,197,24,0.6)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(245,197,24,0.2)"; }}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "#94a3b8" }}>
                Message
              </label>
              <textarea
                placeholder="Write your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-xl outline-none text-white text-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(245,197,24,0.2)",
                  height: "140px",
                  resize: "vertical",
                }}
                onFocus={(e) => { e.target.style.border = "1px solid rgba(245,197,24,0.6)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(245,197,24,0.2)"; }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-base"
              style={{
                background: loading ? "rgba(245,197,24,0.5)" : "#f5c518",
                color: "#000000",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span
                    style={{
                      display: "inline-block",
                      width: "18px", height: "18px",
                      border: "3px solid #000",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Sending...
                </span>
              ) : (
                "Send Message ✉️"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ─── SUCCESS MODAL ─── */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-5"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md p-8 md:p-10 rounded-3xl text-center relative"
            style={{ background: "#111111", border: "1px solid rgba(245,197,24,0.35)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
              style={{
                background: "rgba(245,197,24,0.12)",
                border: "2px solid #f5c518",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            >
              ✅
            </div>

            <h2 className="text-2xl md:text-3xl font-black mb-3" style={{ color: "#f5c518" }}>
              Message Sent!
            </h2>
            <p className="text-sm md:text-base leading-relaxed mb-8" style={{ color: "#94a3b8" }}>
              Thank you for reaching out to{" "}
              <span style={{ color: "#f5c518", fontWeight: 800 }}>DREAM CRT</span>.
              Our team will get back to you within 24 hours. 🙌
            </p>

            <div className="flex flex-col gap-3 mb-6">
              <a
                href="mailto:dreamcrt89@gmail.com"
                className="flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm"
                style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", color: "#f5c518" }}
              >
                ✉️ dreamcrt89@gmail.com
              </a>
              <a
                href="https://wa.me/+252612515121"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm"
                style={{ background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.3)", color: "#25d366" }}
              >
                💬 WhatsApp: +252 612 515 121
              </a>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 rounded-xl font-black text-sm"
              style={{ background: "#f5c518", color: "#000000" }}
            >
              Close
            </button>
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(245,197,24,0.3); }
              50% { box-shadow: 0 0 0 12px rgba(245,197,24,0); }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}