import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaLock, FaPlay, FaCheckCircle, FaMoneyBillWave,
  FaUser, FaEnvelope, FaShieldAlt, FaStar, FaArrowRight, FaClock,
} from "react-icons/fa";

export default function CoursePlayer() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [paid, setPaid] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);

  const [courseTitle, setCourseTitle] = useState("Dream Crt Master Class");
  const [courseVideo, setCourseVideo] = useState("");
  const [coursePrice, setCoursePrice] = useState("25");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || "");
        fetchCourseAndCheckAccess(currentUser.email);
      } else {
        fetchCourseOnly();
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [id]);

  const fetchCourseOnly = async () => {
    try {
      if (id) {
        const courseRef = doc(db, "courses", id);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          const data = courseSnap.data();
          setCourseTitle(data.title || "Dream Crt Master Class");
          setCourseVideo(data.fileURL || "");
          setCoursePrice(data.price || "25");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCourseAndCheckAccess = async (userEmail) => {
    try {
      if (id) {
        const courseRef = doc(db, "courses", id);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          const data = courseSnap.data();
          setCourseTitle(data.title || "Dream Crt Master Class");
          setCourseVideo(data.fileURL || "");
          setCoursePrice(data.price || "25");
        }
      }

      // Access check — approved kaliya
      const accessKey = `${userEmail}_${id}`;
      const accessRef = doc(db, "courseAccess", accessKey);
      const accessSnap = await getDoc(accessRef);
      if (accessSnap.exists() && accessSnap.data().approved === true) {
        setHasAccess(true);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!phone || !email) {
      alert("Fadlan buuxi dhammaan meelaha");
      return;
    }
    setSending(true);
    try {
      const accessKey = `${email}_${id}`;
      await setDoc(doc(db, "courseAccess", accessKey), {
        email,
        phone,
        courseId: id,
        courseName: courseTitle,
        paid: true,
        approved: false,
        createdAt: Date.now(),
      });
      setPaid(true);
      setSending(false);
    } catch (err) {
      alert(err.message);
      setSending(false);
    }
  };

  // ─── LOADING ───────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: "#0d0d0d" }} className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#f5c518", borderTopColor: "transparent" }} />
          <p className="text-white font-semibold tracking-widest text-sm uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── SUCCESS / PENDING APPROVAL UI ────────────────────────
  if (paid) {
    return (
      <div style={{ background: "#0d0d0d" }} className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="relative mx-auto w-28 h-28 mb-8">
            <div className="absolute inset-0 rounded-full border-4 animate-ping opacity-30" style={{ borderColor: "#f5c518" }} />
            <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ background: "rgba(245,197,24,0.08)", border: "2px solid #f5c518" }}>
              <FaClock className="text-5xl" style={{ color: "#f5c518" }} />
            </div>
          </div>

          <h1 className="text-white text-4xl font-black mb-3 tracking-tight">
            Order <span style={{ color: "#f5c518" }}>Received!</span>
          </h1>
          <p className="text-gray-400 text-lg mb-2">Waad ku mahadsan tahay!</p>
          <p className="text-gray-500 text-sm mb-6">
            Order-kaagu waa la helay. Admin-ku wuu fiirin doonaa oo course-ka wuu kuu furi doonaa.
          </p>

          <div className="mb-8 rounded-2xl p-6 text-left" style={{ background: "#111111", border: "1px solid rgba(245,197,24,0.2)" }}>
            <div className="flex items-center gap-2 mb-4">
              <FaShieldAlt style={{ color: "#f5c518" }} />
              <span className="text-white font-bold text-sm uppercase tracking-widest">Receipt</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Course</span>
                <span className="text-white font-semibold">{courseTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="text-white font-semibold truncate max-w-[200px]">{email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Number</span>
                <span className="text-white font-semibold">{phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="text-white font-semibold">${coursePrice}</span>
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-bold" style={{ color: "#f5c518" }}>⏳ Pending Approval</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5 text-sm text-left" style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.2)" }}>
            <p className="font-bold mb-1" style={{ color: "#f5c518" }}>⚠️ Xasuusin:</p>
            <p className="text-gray-400">
              Admin-ku wuu fiirin doonaa order-kaaga. Marka la approve gareeyo, course-ka isla markiiba wuu kuu furmayaa.
              Fadlan dib u soo gal account-kaaga si aad u aragto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN UI ───────────────────────────────────────────────
  return (
    <div style={{ background: "#0d0d0d" }} className="min-h-screen text-white">
      {/* HEADER */}
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#080808" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#f5c518" }}>
            <FaStar className="text-black text-sm" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl leading-none">Dream Crt</h1>
            <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#f5c518" }}>Trading Academy</p>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest" style={{ border: "1px solid rgba(245,197,24,0.5)", color: "#f5c518" }}>
          Premium
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {!hasAccess ? (
          // ─── PAYMENT GATE ───────────────────────────────
          <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[80vh]">
            {/* LEFT */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest" style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", color: "#f5c518" }}>
                <FaLock className="text-xs" />
                Locked Course
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight">
                Unlock Your<br />
                <span style={{ color: "#f5c518" }}>Forex</span><br />
                Mastery
              </h1>
              <p className="text-gray-500 text-base leading-relaxed max-w-sm">
                Course-kan ku baran dhammaan xeeladaha Forex trading.
                Pay ka dib, admin-ku wuu approve garayaa oo course-ka wuu furmayaa.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { icon: <FaPlay />, label: "HD Videos", sub: "Muqaallo cad" },
                  { icon: <FaCheckCircle />, label: "Lifetime", sub: "Weligaa geli" },
                  { icon: <FaShieldAlt />, label: "Secure Pay", sub: "EVC Plus" },
                  { icon: <FaStar />, label: "Pro Level", sub: "Xeel dheer" },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-4 transition-colors" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="text-xl mb-2" style={{ color: "#f5c518" }}>{item.icon}</div>
                    <p className="text-white font-bold text-sm">{item.label}</p>
                    <p className="text-gray-600 text-xs">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — PAYMENT FORM */}
            <div className="rounded-3xl p-8 shadow-2xl" style={{ background: "#080808", border: "1px solid rgba(245,197,24,0.12)" }}>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Course Price</p>
                  <p className="text-white text-5xl font-black">
                    ${coursePrice}
                    <span className="text-gray-600 text-lg font-normal ml-1">/ once</span>
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", color: "#f5c518" }}>
                  One-time
                </div>
              </div>

              {/* PAYMENT NOTE */}
              <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.25)" }}>
                <p className="font-black text-sm mb-2" style={{ color: "#f5c518" }}>📋 TILMAAN LACAG BIXINTA:</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  KUDIR LACAGTA COURSE KA NUMARKAAN{" "}
                  <span className="font-black" style={{ color: "#f5c518" }}>252612515121</span>{" "}
                  KASOO QAAD SCREENSHORT KADIBNA KU SOODIR WhatsApp  NUMBARKEENA.
                  252613887399
                </p>
              </div>

              <div className="space-y-4">
                {/* EMAIL */}
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Email Address</label>
                  <div className="flex items-center rounded-xl px-4 gap-3" style={{ background: "#000", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <FaEnvelope style={{ color: "#f5c518" }} className="flex-shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="bg-transparent outline-none w-full py-4 text-white placeholder-gray-700 text-sm"
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">EVC Number</label>
                  <div className="flex items-center rounded-xl px-4 gap-3" style={{ background: "#000", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <FaUser style={{ color: "#f5c518" }} className="flex-shrink-0" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="61xxxxxxx"
                      className="bg-transparent outline-none w-full py-4 text-white placeholder-gray-700 text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={sending}
                className="mt-6 w-full disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 rounded-2xl py-4 font-black text-black text-base flex items-center justify-center gap-3"
                style={{ background: "#f5c518" }}
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaMoneyBillWave />
                    Confirm Order
                    <FaArrowRight className="text-sm" />
                  </>
                )}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-gray-700 text-xs">
                <FaShieldAlt />
                <span>Secure • EVC Plus • Dream Crt</span>
              </div>
            </div>
          </div>

        ) : (
          // ─── VIDEO PLAYER ────────────────────────────────
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#f5c518" }}>Premium Course</p>
                <h1 className="text-4xl font-black tracking-tight">{courseTitle}</h1>
                <p className="text-gray-600 mt-1 text-sm">Access granted • Wax barashada ku bilow</p>
              </div>
              <div className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2" style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.3)", color: "#f5c518" }}>
                <FaCheckCircle />
                Access Granted
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <video
                src={courseVideo}
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="w-full bg-black"
                style={{ height: "65vh" }}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 text-gray-700 text-xs justify-center">
              <FaShieldAlt />
              <span>Video-gan waa protected • downloading laguma ogola</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}