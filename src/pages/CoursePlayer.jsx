import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc, getDocs, collection, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaLock, FaPlay, FaCheckCircle, FaMoneyBillWave,
  FaUser, FaEnvelope, FaShieldAlt, FaStar, FaArrowRight, FaClock,
  FaFilePdf, FaVideo, FaListUl,
} from "react-icons/fa";

// ── Bundle map ──
const BUNDLE_CATEGORIES = {
  "basic-forex-course":      ["basic_forex"],
  "crt-course-60":           ["crt_course", "basic_forex"],
  "premium-mentorship-100":  ["mentorship", "crt_course", "basic_forex", "copy_trading"],
  "copy-trading-services":   ["copy_trading"],
};

// ── Device fingerprint ──
const getDeviceFingerprint = () => {
  const nav = window.navigator;
  const scr = window.screen;
  const raw = [nav.userAgent, nav.language, scr.colorDepth, scr.width + "x" + scr.height, nav.platform, new Date().getTimezoneOffset()].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash = hash & hash; }
  return Math.abs(hash).toString(36);
};

// ── Anti-screenshot CSS injection ──
const injectProtectionStyles = () => {
  const styleId = "dream-crt-protection";
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .protected-content {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
    }
    .protected-content video { pointer-events: auto; }
    .protected-content canvas {
      -webkit-user-drag: none !important;
      -moz-user-drag: none !important;
      user-drag: none !important;
    }
    .watermark-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 10; overflow: hidden; }
    .watermark-text {
      position: absolute; color: rgba(245, 197, 24, 0.12);
      font-size: 13px; font-weight: 900; font-family: monospace;
      white-space: nowrap; transform: rotate(-30deg);
      letter-spacing: 2px; user-select: none; pointer-events: none;
    }
    .record-shield {
      position: fixed; inset: 0; background: #000; z-index: 999999;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 14px; text-align: center; padding: 24px;
    }
    .record-shield h2 { color: #f5c518; font-size: 22px; font-weight: 900; font-family: monospace; letter-spacing: 1px; }
    .record-shield p { color: #bbb; font-size: 14px; max-width: 340px; line-height: 1.6; }
    @media print {
      .protected-content { display: none !important; }
      body::before {
        content: "⛔ DREAM CRT — Printing Not Allowed";
        display: block; text-align: center; font-size: 32px; color: red; padding: 100px;
      }
    }
  `;
  document.head.appendChild(style);
};

// ── Watermark grid generator ──
const WatermarkOverlay = ({ email }) => {
  const marks = [];
  const cols = 3, rows = 6;
  const now = new Date().toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      marks.push(
        <span key={`${r}-${c}`} className="watermark-text" style={{
          top: `${(r / rows) * 100 + 5}%`,
          left: `${(c / cols) * 100 - 5}%`,
        }}>
          {email || "DREAM CRT"} • {now}
        </span>
      );
    }
  }
  return <div className="watermark-overlay">{marks}</div>;
};

// ── Secure PDF Viewer ──
const SecurePdfViewer = ({ pdfUrl, email }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadPdfJs = () =>
      new Promise((resolve, reject) => {
        if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => resolve(window.pdfjsLib);
        script.onerror = () => reject(new Error("PDF.js load failed"));
        document.body.appendChild(script);
      });

    const renderPdf = async () => {
      setLoading(true);
      setError("");
      try {
        const pdfjsLib = await loadPdfJs();
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const pdf = await pdfjsLib.getDocument({ url: pdfUrl, withCredentials: false }).promise;
        if (cancelled) return;
        setNumPages(pdf.numPages);

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.6 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.maxWidth = `${viewport.width}px`;
          canvas.style.display = "block";
          canvas.style.margin = "0 auto 12px";
          canvas.style.borderRadius = "8px";
          canvas.style.userSelect = "none";
          canvas.style.pointerEvents = "none";

          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;

          if (cancelled) return;
          container.appendChild(canvas);
        }
        setLoading(false);
      } catch (err) {
        console.log("PDF render error:", err);
        if (!cancelled) {
          setError(`PDF lama soo bandhigi karo. (${err?.message || err})`);
          setLoading(false);
        }
      }
    };

    renderPdf();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl shadow-black"
      style={{ position: "relative", border: "1px solid rgba(255,255,255,0.08)", background: "#1a1a1a" }}
      onContextMenu={e => e.preventDefault()}
      onDragStart={e => e.preventDefault()}
    >
      <WatermarkOverlay email={email} />
      <div ref={containerRef} style={{ maxHeight: "80vh", overflowY: "auto", padding: "16px", userSelect: "none", WebkitUserSelect: "none" }} />
      {loading && (
        <div className="w-full flex items-center justify-center" style={{ minHeight: 300 }}>
          <p className="text-gray-500 text-sm">⏳ PDF loading...</p>
        </div>
      )}
      {error && (
        <div className="w-full flex items-center justify-center px-4 text-center" style={{ minHeight: 300 }}>
          <p className="text-gray-500 text-sm">⚠️ {error}</p>
        </div>
      )}
      {!loading && !error && (
        <div className="text-center pb-3 text-gray-600 text-xs">{numPages} bog</div>
      )}
    </div>
  );
};

export default function CoursePlayer() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const contentRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [deviceLocked, setDeviceLocked] = useState(false);
  const [sending, setSending] = useState(false);
  const [paid, setPaid] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);

  const [courseTitle, setCourseTitle] = useState("Dream Crt Master Class");
  const [courseVideo, setCourseVideo] = useState("");
  const [coursePdf, setCoursePdf] = useState("");
  const [coursePrice, setCoursePrice] = useState("25");
  const [courseCategory, setCourseCategory] = useState("");
  const [activeTab, setActiveTab] = useState("video");

  // ── Playlist lessons + active lesson index ──
  const [lessons, setLessons] = useState([]);          // [{ title, vdoVideoId, fileURL, order }]
  const [activeLesson, setActiveLesson] = useState(0);

  // ── VdoCipher ID-ga lesson-ka hadda socda ──
  const [vdoVideoId, setVdoVideoId] = useState("");

  const [vdoOtp, setVdoOtp] = useState("");
  const [vdoPlaybackInfo, setVdoPlaybackInfo] = useState("");
  const [vdoLoading, setVdoLoading] = useState(false);

  const [recordShield, setRecordShield] = useState(false);
  const [shieldReason, setShieldReason] = useState("");

  // ── Soo deji api.js ee VdoCipher hal mar ──
  useEffect(() => {
    if (document.getElementById("vdocipher-api-script")) return;
    const script = document.createElement("script");
    script.id = "vdocipher-api-script";
    script.src = "https://player.vdocipher.com/v2/api.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // ── Marka lesson-ka la beddelo → cusboonaysii vdoVideoId + video URL ──
  useEffect(() => {
    if (lessons.length === 0) return;
    const les = lessons[activeLesson] || lessons[0];
    setVdoVideoId(les?.vdoVideoId || "");
    setCourseVideo(les?.fileURL || "");
    // Reset OTP marka lesson la beddelo
    setVdoOtp("");
    setVdoPlaybackInfo("");
  }, [activeLesson, lessons]);

  // ── Soo qaado OTP + playbackInfo marka access la siiyo AMA lesson la beddelo ──
  useEffect(() => {
    if (!hasAccess || !vdoVideoId) return;
    let cancelled = false;

    const fetchVdoCredentials = async () => {
      setVdoLoading(true);
      try {
        // ── Cloud Function URL-ka dream-crt project-ka ──
        const res = await fetch(`https://getvdootp-gpyfwiymaa-uc.a.run.app?videoId=${vdoVideoId}`);
        const data = await res.json();
        if (cancelled) return;
        setVdoOtp(data.otp || "");
        setVdoPlaybackInfo(data.playbackInfo || "");
      } catch (err) {
        console.log("VdoCipher OTP fetch error:", err);
      }
      if (!cancelled) setVdoLoading(false);
    };
    fetchVdoCredentials();
    return () => { cancelled = true; };
  }, [hasAccess, vdoVideoId]);

  const [copyAlert, setCopyAlert] = useState(false);
  const alertTimerRef = useRef(null);

  const showCopyAlert = () => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setCopyAlert(true);
    alertTimerRef.current = setTimeout(() => setCopyAlert(false), 3000);
  };

  const triggerShield = (reason) => {
    setShieldReason(reason || "");
    setRecordShield(true);
    if (videoRef.current) { try { videoRef.current.pause(); } catch (e) {} }
  };
  const clearShield = () => { setRecordShield(false); setShieldReason(""); };

  // ── Protection setup ──
  useEffect(() => {
    if (!hasAccess) return;

    injectProtectionStyles();

    const blockCopy = (e) => { e.preventDefault(); e.clipboardData?.setData("text/plain", ""); showCopyAlert(); };
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);

    const blockKeys = (e) => {
      const k = (e.key || "").toLowerCase();
      if (e.key === "PrintScreen") { e.preventDefault(); navigator.clipboard?.writeText(""); triggerShield("Screenshot-ka waa la xanibay"); showCopyAlert(); }
      if (e.shiftKey && (e.metaKey || e.getModifierState?.("Meta")) && k === "s") { e.preventDefault(); triggerShield("Screen capture-ka waa la xanibay"); }
      if ((e.metaKey || e.getModifierState?.("Meta")) && k === "g") { e.preventDefault(); triggerShield("Screen record-ka waa la xanibay"); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === "s" || k === "r")) { e.preventDefault(); triggerShield("Screen record-ka waa la xanibay"); showCopyAlert(); }
      if ((e.ctrlKey || e.metaKey) && k === "a") { e.preventDefault(); showCopyAlert(); }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (k === "p" || k === "s")) { e.preventDefault(); }
      if (e.key === "F12") { e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === "i" || k === "j")) { e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && k === "u") { e.preventDefault(); }
    };
    document.addEventListener("keydown", blockKeys);

    // ── getDisplayMedia monitor (screen share block) ──
    let originalGDM = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        originalGDM = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getDisplayMedia = async () => {
          triggerShield("Screen sharing-ka waa la xanibay");
          return Promise.reject(new DOMException("Screen capture blocked", "NotAllowedError"));
        };
      }
    } catch (e) { /* ignore */ }

    const handleVisibility = () => { if (document.hidden) triggerShield("Content-ku waa qarsoon yahay markaad ka baxdo bogga"); else clearShield(); };
    const handleBlur = () => triggerShield("Content-ku waa qarsoon yahay markaad ka baxdo bogga");
    const handleFocus = () => { if (!document.hidden) clearShield(); };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    const blockContext = (e) => { e.preventDefault(); };
    contentRef.current?.addEventListener("contextmenu", blockContext);

    return () => {
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      contentRef.current?.removeEventListener("contextmenu", blockContext);
      try { if (originalGDM && navigator.mediaDevices) navigator.mediaDevices.getDisplayMedia = originalGDM; } catch (e) {}
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, [hasAccess]);

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

  // ════════════════════════════════════════════════════════════════
  //  MUHIIM: vdoVideoId-ga wuxuu ku jiraa lessons[] gudaha (Playlist),
  //  maaha top-level. Sidaas darteed halkan waxaan ka soo qaadeynaa
  //  lesson kasta vdoVideoId + fileURL. Haddii course-ku uu Playlist
  //  yahay → lessons[0] ka bilow. Haddii kale → top-level fields.
  // ════════════════════════════════════════════════════════════════
  const setCourseData = (data) => {
    setCourseTitle(data.title || "Dream Crt Master Class");
    setCoursePrice(String(data.price || "25"));
    setCourseCategory(data.category || "");
    setCoursePdf(data.pdfURL || "");

    if (data.type === "Playlist" && Array.isArray(data.lessons) && data.lessons.length > 0) {
      // ── Playlist: ka soo qaado dhammaan lessons-ka (leh vdoVideoId gaar ah) ──
      const sorted = [...data.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
      const mapped = sorted.map((l, i) => ({
        title: l.title || `Lesson ${i + 1}`,
        vdoVideoId: l.vdoVideoId || "",
        fileURL: l.fileURL || "",
        order: l.order || i,
      }));
      setLessons(mapped);
      setActiveLesson(0);
      // Haddii lesson-ka koowaad uusan video lahayn laakiin PDF jiro → PDF tab
      if (!mapped[0].vdoVideoId && !mapped[0].fileURL && data.pdfURL) setActiveTab("pdf");
    } else {
      // ── Course keliya (maaha playlist): top-level vdoVideoId / fileURL ──
      const single = [{
        title: data.title || "Lesson",
        vdoVideoId: data.vdoVideoId || "",
        fileURL: data.fileURL || "",
        order: 0,
      }];
      setLessons(single);
      setActiveLesson(0);
      if (!single[0].vdoVideoId && !single[0].fileURL && data.pdfURL) setActiveTab("pdf");
    }
  };

  const fetchCourseOnly = async () => {
    try {
      if (id) {
        const snap = await getDoc(doc(db, "courses", id));
        if (snap.exists()) setCourseData(snap.data());
      }
    } catch (err) { console.log(err); }
  };

  const fetchCourseAndCheckAccess = async (userEmail) => {
    try {
      let courseData = null;
      if (id) {
        const snap = await getDoc(doc(db, "courses", id));
        if (snap.exists()) { courseData = snap.data(); setCourseData(courseData); }
      }

      const categoryToPayId = {
        "basic_forex":  "basic-forex-course",
        "crt_course":   "crt-course-60",
        "mentorship":   "premium-mentorship-100",
        "copy_trading": "copy-trading-services",
      };

      if (courseData && Number(courseData.price) === 0) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      const key1 = `${userEmail}_${id}`;
      const payId = courseData ? categoryToPayId[courseData.category] : null;
      const key2 = payId ? `${userEmail}_${payId}` : null;

      let accessDocId = null;
      let accessData = null;

      const snap1 = await getDoc(doc(db, "courseAccess", key1));
      if (snap1.exists() && snap1.data().approved === true) {
        accessDocId = key1; accessData = snap1.data();
      } else if (key2) {
        const snap2 = await getDoc(doc(db, "courseAccess", key2));
        if (snap2.exists() && snap2.data().approved === true) {
          accessDocId = key2; accessData = snap2.data();
        }
      }

      if (!accessDocId && courseData) {
        const allAccessSnap = await getDocs(collection(db, "courseAccess"));
        const userApproved = allAccessSnap.docs.filter(
          d => d.data().email === userEmail && d.data().approved === true
        );
        for (const d of userApproved) {
          const dData = d.data();
          if (dData.courseId === payId) { accessDocId = d.id; accessData = dData; break; }
          if (dData.courseId === id) { accessDocId = d.id; accessData = dData; break; }
          if (courseData.category) {
            const refCourseSnap = await getDoc(doc(db, "courses", dData.courseId));
            if (refCourseSnap.exists() && refCourseSnap.data().category === courseData.category) {
              accessDocId = d.id; accessData = dData; break;
            }
          }
        }
      }

      if (accessData && accessDocId) {
        const currentFp = getDeviceFingerprint();
        const savedFp = accessData.deviceFingerprint;
        if (!savedFp) {
          await updateDoc(doc(db, "courseAccess", accessDocId), {
            deviceFingerprint: currentFp, deviceRegisteredAt: Date.now(),
          });
          setHasAccess(true);
        } else if (savedFp === currentFp) {
          setHasAccess(true);
        } else {
          setDeviceLocked(true);
        }
      }
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!phone || !email) { alert("Fadlan buuxi dhammaan meelaha"); return; }
    setSending(true);
    try {
      const payIdMap = {
        "basic_forex":  "basic-forex-course",
        "crt_course":   "crt-course-60",
        "mentorship":   "premium-mentorship-100",
        "copy_trading": "copy-trading-services",
      };
      const payId = payIdMap[courseCategory] || id;
      const categoriesToUnlock = BUNDLE_CATEGORIES[payId] || [courseCategory];
      const coursesSnap = await getDocs(collection(db, "courses"));
      const allCourses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      await setDoc(doc(db, "courseAccess", `${email}_${id}`), {
        email, phone, courseId: id, courseName: courseTitle,
        paid: true, approved: false, createdAt: Date.now(),
      });

      for (const cat of categoriesToUnlock) {
        const matched = allCourses.find(c => c.category === cat);
        if (matched && matched.id !== id) {
          await setDoc(doc(db, "courseAccess", `${email}_${matched.id}`), {
            email, phone, courseId: matched.id,
            courseName: matched.title || cat,
            paid: true, approved: false, bundledWith: id, createdAt: Date.now(),
          });
        }
      }
      setPaid(true);
    } catch (err) { alert(err.message); }
    setSending(false);
  };

  // ── Ma jiraa muuqaal la daawan karo (video ama vdo) ──
  const hasAnyVideo = lessons.some(l => l.vdoVideoId || l.fileURL);
  const currentLesson = lessons[activeLesson] || lessons[0] || {};
  const isPlaylist = lessons.length > 1;

  // ─── LOADING ──────────────────────────────────────────────
  if (loading) return (
    <div style={{ background: "#0d0d0d" }} className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#f5c518", borderTopColor: "transparent" }} />
        <p className="text-white font-semibold tracking-widest text-sm uppercase">Loading...</p>
      </div>
    </div>
  );

  // ─── DEVICE LOCKED ────────────────────────────────────────
  if (deviceLocked) return (
    <div style={{ background: "#0d0d0d" }} className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "rgba(255,71,87,0.08)", border: "2px solid #ff4757" }}>
          <FaLock className="text-5xl" style={{ color: "#ff4757" }} />
        </div>
        <h1 className="text-white text-3xl font-black mb-4">Device <span style={{ color: "#ff4757" }}>Locked</span></h1>
        <p className="text-gray-400 text-base mb-4">Course-kan device kale ayaa lagu diwaan-geliyay. Kaliya device-kii aad ku iibsatay ayaad ku daawan kartaa.</p>
        <div className="rounded-2xl p-5 text-sm text-left mb-6" style={{ background: "rgba(248, 247, 247, 0.06)", border: "1px solid rgba(255,71,87,0.2)" }}>
          <p className="font-bold mb-2" style={{ color: "#ff4757" }}>⚠️ Xasuusin:</p>
          <p className="text-gray-400">Haddaad device-kaaga bedeshay ama browser kale isticmaaleysid, fadlan admin-ka kala xiriir si loo cusboonaysiiyo.
            digniin adminku wuu arki doonaa hadii device kii hore uu weli jiro marka divice ka ha ahaado mid sisax ah ubaxay
          </p>
        </div>
        <a href="https://wa.me/252613887399" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", textDecoration: "none" }}>
          💬 Admin kala xiriir
        </a>
      </div>
    </div>
  );

  // ─── PAID / PENDING ───────────────────────────────────────
  if (paid) return (
    <div style={{ background: "#0d0d0d" }} className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mx-auto w-28 h-28 mb-8">
          <div className="absolute inset-0 rounded-full border-4 animate-ping opacity-30" style={{ borderColor: "#f5c518" }} />
          <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ background: "rgba(245,197,24,0.08)", border: "2px solid #f5c518" }}>
            <FaClock className="text-5xl" style={{ color: "#f5c518" }} />
          </div>
        </div>
        <h1 className="text-white text-4xl font-black mb-3">Order <span style={{ color: "#f5c518" }}>Received!</span></h1>
        <p className="text-gray-400 text-lg mb-2">Waad ku mahadsan tahay!</p>
        <p className="text-gray-500 text-sm mb-6">Order-kaagu waa la helay. Admin-ku wuu fiirin doonaa oo course-ka wuu kuu furi doonaa.</p>
        <div className="mb-8 rounded-2xl p-6 text-left" style={{ background: "#111111", border: "1px solid rgba(245,197,24,0.2)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FaShieldAlt style={{ color: "#f5c518" }} />
            <span className="text-white font-bold text-sm uppercase tracking-widest">Receipt</span>
          </div>
          {[{ label: "Course", value: courseTitle }, { label: "Email", value: email }, { label: "Number", value: phone }, { label: "Amount", value: `$${coursePrice}` }].map((r, i) => (
            <div key={i} className="flex justify-between text-sm py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-gray-500">{r.label}</span>
              <span className="text-white font-semibold truncate max-w-[200px]">{r.value}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm pt-3">
            <span className="text-gray-500">Status</span>
            <span className="font-bold" style={{ color: "#f5c518" }}>⏳ Pending Approval</span>
          </div>
        </div>
        <div className="rounded-2xl p-5 text-sm text-left" style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.2)" }}>
          <p className="font-bold mb-1" style={{ color: "#f5c518" }}>⚠️ Xasuusin:</p>
          <p className="text-gray-400">Admin-ku wuu fiirin doonaa order-kaaga. Marka la approve gareeyo, course-ka isla markiiba wuu kuu furmayaa.</p>
        </div>
      </div>
    </div>
  );

  // ─── MAIN UI ──────────────────────────────────────────────
  return (
    <div style={{ background: "#0d0d0d" }} className="min-h-screen text-white">

      {/* ── Screen-record / focus-loss BLACKOUT SHIELD ── */}
      {recordShield && (
        <div className="record-shield">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-2"
            style={{ background: "rgba(245,197,24,0.08)", border: "2px solid #f5c518" }}>
            <FaShieldAlt className="text-4xl" style={{ color: "#f5c518" }} />
          </div>
          <h2>⛔ CONTENT PROTECTED</h2>
          <p>{shieldReason || "Screen recording / capture-ka waa la xanibay."}</p>
          <p style={{ color: "#777", fontSize: "12px" }}>Ku noqo bogga oo iska daa duubista — © Dream CRT Academy</p>
        </div>
      )}

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
        <div className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest" style={{ border: "1px solid rgba(245,197,24,0.5)", color: "#f5c518" }}>Premium</div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {!hasAccess ? (
          // ─── PAYMENT GATE ──────────────────────────────
          <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[80vh]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest" style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", color: "#f5c518" }}>
                <FaLock className="text-xs" /> Locked Course
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight">
                Unlock Your<br /><span style={{ color: "#f5c518" }}>Forex</span><br />Mastery
              </h1>
              <p className="text-gray-500 text-base leading-relaxed max-w-sm">
                Course-kan ku baran dhammaan xeeladaha Forex trading. Pay ka dib, admin-ku wuu approve garayaa oo course-ka wuu furmayaa.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { icon: <FaPlay />, label: "HD Videos", sub: "Muqaallo cad" },
                  { icon: <FaCheckCircle />, label: "Lifetime", sub: "Weligaa geli" },
                  { icon: <FaShieldAlt />, label: "Secure Pay", sub: "EVC Plus" },
                  { icon: <FaStar />, label: "Pro Level", sub: "Xeel dheer" },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="text-xl mb-2" style={{ color: "#f5c518" }}>{item.icon}</div>
                    <p className="text-white font-bold text-sm">{item.label}</p>
                    <p className="text-gray-600 text-xs">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl p-8 shadow-2xl" style={{ background: "#080808", border: "1px solid rgba(245,197,24,0.12)" }}>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Course Price</p>
                  <p className="text-white text-5xl font-black">${coursePrice}<span className="text-gray-600 text-lg font-normal ml-1">/ once</span></p>
                </div>
                <div className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", color: "#f5c518" }}>One-time</div>
              </div>
              <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.25)" }}>
                <p className="font-black text-sm mb-2" style={{ color: "#f5c518" }}>📋 TILMAAN LACAG BIXINTA:</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  KUDIR LACAGTA COURSE KA NUMARKAAN{" "}
                  <span className="font-black" style={{ color: "#f5c518" }}>252612515121</span>{" "}
                  KASOO QAAD SCREENSHORT KADIBNA KU SOODIR WhatsApp NUMBARKEENA. 252613887399
                </p>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Email Address</label>
                  <div className="flex items-center rounded-xl px-4 gap-3" style={{ background: "#000", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <FaEnvelope style={{ color: "#f5c518" }} className="flex-shrink-0" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                      className="bg-transparent outline-none w-full py-4 text-white placeholder-gray-700 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">EVC Number</label>
                  <div className="flex items-center rounded-xl px-4 gap-3" style={{ background: "#000", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <FaUser style={{ color: "#f5c518" }} className="flex-shrink-0" />
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="61xxxxxxx"
                      className="bg-transparent outline-none w-full py-4 text-white placeholder-gray-700 text-sm" />
                  </div>
                </div>
              </div>
              <button onClick={handlePayment} disabled={sending}
                className="w-full disabled:opacity-60 disabled:cursor-not-allowed rounded-2xl py-4 font-black text-black text-base flex items-center justify-center gap-3"
                style={{ background: "#f5c518" }}>
                {sending ? <><div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />Processing...</>
                  : <><FaMoneyBillWave />Confirm Order<FaArrowRight className="text-sm" /></>}
              </button>
              <div className="mt-5 flex items-center justify-center gap-2 text-gray-700 text-xs">
                <FaShieldAlt /><span>Secure • EVC Plus • Dream Crt</span>
              </div>
            </div>
          </div>

        ) : (
          // ─── CONTENT PLAYER ────────────────────────────
          <div ref={contentRef} className="protected-content">

            {copyAlert && (
              <div style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)", background: "#fff",
                border: "2px solid #f5c518", borderRadius: "12px", padding: "14px 28px",
                display: "flex", alignItems: "center", gap: "10px", zIndex: 99999,
                boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              }}>
                <span style={{ fontSize: "20px" }}>⚠️</span>
                <span style={{ color: "#b00020", fontWeight: 800, fontSize: "14px", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                  ALERT: Content is protected !!
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#f5c518" }}>Premium Course</p>
                <h1 className="text-4xl font-black tracking-tight">{courseTitle}</h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {isPlaylist ? currentLesson.title : "Access granted • Wax barashada ku bilow"}
                </p>
              </div>
              <div className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2" style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.3)", color: "#f5c518" }}>
                <FaCheckCircle /> Access Granted
              </div>
            </div>

            {/* Tab switcher (Video / PDF) */}
            {hasAnyVideo && coursePdf && (
              <div className="flex gap-3 mb-4">
                {[
                  { id: "video", icon: <FaVideo />, label: "Video" },
                  { id: "pdf",   icon: <FaFilePdf />, label: "PDF" },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={{
                      background: activeTab === tab.id ? "#f5c518" : "rgba(255,255,255,0.05)",
                      color: activeTab === tab.id ? "#000" : "#888",
                      border: activeTab === tab.id ? "none" : "1px solid rgba(255,255,255,0.1)",
                    }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Layout: video + playlist sidebar ── */}
            <div className={isPlaylist ? "grid lg:grid-cols-[1fr_320px] gap-5" : ""}>

              {/* Video / PDF area */}
              <div>
                {(activeTab === "video" || !coursePdf) && hasAnyVideo && (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl shadow-black" style={{ position: "relative", border: "1px solid rgba(255,255,255,0.08)", background: "#000" }}>
                    <WatermarkOverlay email={email} />
                    {currentLesson.vdoVideoId ? (
                      vdoLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-gray-500 text-sm">⏳ Video loading...</p>
                        </div>
                      ) : vdoOtp && vdoPlaybackInfo ? (
                        <iframe
                          key={vdoOtp}
                          src={`https://player.vdocipher.com/v2/?otp=${vdoOtp}&playbackInfo=${vdoPlaybackInfo}`}
                          style={{ border: 0, width: "100%", height: "100%" }}
                          allow="encrypted-media"
                          allowFullScreen
                          title={currentLesson.title || courseTitle}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center px-4 text-center">
                          <p className="text-gray-500 text-sm">⚠️ Video-ga lama soo bandhigi karo. Fadlan dib u eeg backend-ka OTP/playbackInfo.</p>
                        </div>
                      )
                    ) : currentLesson.fileURL ? (
                      <video
                        ref={videoRef}
                        key={currentLesson.fileURL}
                        src={currentLesson.fileURL}
                        controls
                        controlsList="nodownload"
                        onContextMenu={e => e.preventDefault()}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center px-4 text-center">
                        <p className="text-gray-500 text-sm">⚠️ Lesson-kan muuqaal ma laha.</p>
                      </div>
                    )}
                  </div>
                )}

                {(activeTab === "pdf" || !hasAnyVideo) && coursePdf && (
                  <SecurePdfViewer pdfUrl={coursePdf} email={email} />
                )}
              </div>

              {/* Playlist sidebar (kaliya haddii lessons badan yihiin) */}
              {isPlaylist && (activeTab === "video" || !coursePdf) && (
                <div className="rounded-2xl p-3" style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)", maxHeight: "70vh", overflowY: "auto" }}>
                  <div className="flex items-center gap-2 px-2 py-3 mb-1">
                    <FaListUl style={{ color: "#f5c518" }} />
                    <span className="text-white font-bold text-sm uppercase tracking-wide">Lessons ({lessons.length})</span>
                  </div>
                  {lessons.map((les, i) => (
                    <button key={i} onClick={() => setActiveLesson(i)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-left transition-all"
                      style={{
                        background: activeLesson === i ? "rgba(245,197,24,0.1)" : "transparent",
                        border: activeLesson === i ? "1px solid rgba(245,197,24,0.4)" : "1px solid transparent",
                      }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: activeLesson === i ? "#f5c518" : "rgba(255,255,255,0.06)" }}>
                        {activeLesson === i
                          ? <FaPlay className="text-black text-xs" />
                          : <span className="text-gray-400 text-xs font-bold">{i + 1}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: activeLesson === i ? "#f5c518" : "#ddd" }}>
                          {les.title}
                        </p>
                        <p className="text-xs text-gray-600">{les.vdoVideoId ? "🔒 DRM Video" : les.fileURL ? "Video" : "—"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-gray-700 text-xs justify-center">
              <FaShieldAlt />
              <span>Content-gan waa protected • downloading laguma ogola • © Dream CRT Academy</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}