import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config.js";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("Trading Lessons");
  const [message, setMessage] = useState("");

  // ── Payment Modal state ───────────────────────────────────────────────────
  const [showPayModal, setShowPayModal] = useState(false);
  const [payPhone, setPayPhone] = useState("");
  const [payEmail, setPayEmail] = useState("");
  const [payCourseName, setPayCourseName] = useState("");
  const [payCourseId, setPayCourseId] = useState("");
  const [payCoursePrice, setPayCoursePrice] = useState("");
  const [paying, setPaying] = useState(false);
  const [payDone, setPayDone] = useState(false);

  useEffect(() => {
    fetchCourses();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setEmail(currentUser.email || "");
        setPayEmail(currentUser.email || "");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCourses(data);
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      alert("Logged Out");
    } catch (error) {
      alert(error.message);
    }
  };

  const submitJournal = async () => {
    if (!fullName || !email || !message) { alert("Please fill all fields"); return; }
    try {
      await addDoc(collection(db, "journalRequests"), {
        fullName, email, type, message, status: "Pending", createdAt: Date.now(),
      });
      alert("Submitted Successfully");
      setFullName(""); setMessage(""); setType("Trading Lessons"); setShowJournalForm(false);
    } catch (error) { alert(error.message); }
  };

  const handleJournalNav = () => {
    setMenuOpen(false);
    window.location.href = user ? "/journal" : "/login";
  };

  // ── Open payment modal for any service ───────────────────────────────────
  const openPayModal = (courseId, courseName, coursePrice) => {
    setPayCourseId(courseId);
    setPayCourseName(courseName);
    setPayCoursePrice(coursePrice);
    setPayDone(false);
    setPayPhone("");
    if (user) setPayEmail(user.email || "");
    setShowPayModal(true);
  };

  const handlePay = async () => {
    if (!payPhone || !payEmail) { alert("Fadlan buuxi dhammaan meelaha"); return; }
    setPaying(true);
    try {
      const accessKey = `${payEmail}_${payCourseId}`;
      await setDoc(doc(db, "courseAccess", accessKey), {
        email: payEmail, phone: payPhone, courseId: payCourseId,
        courseName: payCourseName, paid: true, approved: false, createdAt: Date.now(),
      });
      setPayDone(true);
    } catch (err) { alert(err.message); }
    setPaying(false);
  };

  // ── Services data ─────────────────────────────────────────────────────────
  const services = [
    {
      title: "Basic Forex Course 25$",
      subtitle: "Bilowga Ganacsiga",
      items: [
        "Waxa aad Heleysaa:",
        "📹 Casharro Video ah",
        "📚 Buug PDF ah",
        "🎥 Live Zoom sessions",
        "👨‍🏫 Macalin ku hago",
        "✅ Sixida casharada",
      ],
      benefit: "Faa'iidada: Waa aasaaska saxda ah ee aad ku baraneyso suuqa adigoo ka badbaadaya jahwareerka.",
      color: "#f5c518", colorDim: "rgba(245,197,24,0.12)", colorBorder: "rgba(245,197,24,0.25)",
      payId: "basic-forex-course", payPrice: "25",
    },
    {
      title: "CRT Course 60$",
      subtitle: "Barashada Xeeladda CRT (Mudo Kooban)",
      items: [
        "Waxa aad Heleysaa:",
        "💻 Zoom Live ah — casharro toos ah",
        "📚 Buug PDF ah — shaxanno & xeerar",
        "🎯 Sixid & Hagid Joogto ah",
        "✅ Khaladaadkaaga waa lagaa saxayaa",
      ],
      benefit: "⏱️ Uma baahnid bilooyin badan oo jahwareer ah; mudo kooban gudaheed waxaad ku baranaysaa CRT Strategy",
      color: "#a78bfa", colorDim: "rgba(167,139,250,0.12)", colorBorder: "rgba(167,139,250,0.25)",
      payId: "crt-course-60", payPrice: "60",
    },
    {
      title: "Premium Mentorship 100$",
      subtitle: "Hagidda Shakhsiyadeed & Maareynta",
      items: [
        "Waxa ku dhex jira",
        "🎥 Live Zoom joogto ah",
        "📚 Buug PDF ah",
        "🤝 Caawin gaar ah iyo",
        "📊 Maareynta Account Challenge",
      ],
      benefit: "Faa'iidada: Safarkaaga oo dhan oo aan ku barbar taaganahay iyo caawin toos ah si aad u gudubto akoonnada waaweyn",
      color: "#22c55e", colorDim: "rgba(34,197,94,0.12)", colorBorder: "rgba(34,197,94,0.25)",
      payId: "premium-mentorship-100", payPrice: "100",
    },
    {
      tag: "Maalgashi",
      title: "Copy Trading Services",
      subtitle: "Maalgashi Toos Ah",
      items: [
        "💳 Qaabka 1-aad: Is-qorid bille ah oo ah $50/Bishii.",
        "💰 Qaabka 2-aad: 25% oo laga gooyo oo keliya lacagta",
        "faa'iidada ah ee laguu sameeyo (Profit Share)",
        "🔄 Toos u raac xirfaddayda",
        "⏰ Waqti kuma baahnid",
      ],
      benefit: "Faa'iidada: Samee lacag adigoo raacaya xirfaddayda, xitaa haddii aadan haysan waqti aad adigu ku falanqeyso suuqa",
      color: "#f97316", colorDim: "rgba(249,115,22,0.12)", colorBorder: "rgba(249,115,22,0.25)",
      payId: "copy-trading-services", payPrice: "50",
    },
  ];

  // ── Only the FIRST course from Firestore ─────────────────────────────────
  const displayCourse = courses.length > 0 ? [courses[0]] : [];

  return (
    <div className="text-white min-h-screen overflow-x-hidden" style={{ background: "#0d0d0d" }}>

      {/* ─────────── NAVBAR ─────────── */}
      <nav className="flex items-center justify-between px-5 md:px-10 py-4 sticky top-0 z-50"
        style={{ background: "rgba(13,13,13,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="font-black text-xl md:text-2xl tracking-tight" style={{ color: "#f5c518" }}>DREAM CRT</span>
        </div>
        <div className="hidden md:flex gap-6 lg:gap-8 text-sm font-semibold">
          {[
            { label: "Home", href: "#home", active: true },
            { label: "Courses", href: "#courses" },
            { label: "Services", href: "#services" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ].map((link) => (
            <a key={link.label} href={link.href} className="transition"
              style={link.active ? { color: "#f5c518", borderBottom: "2px solid #f5c518", paddingBottom: "2px" } : { color: "#d1d5db" }}
              onMouseEnter={(e) => { if (!link.active) e.target.style.color = "#f5c518"; }}
              onMouseLeave={(e) => { if (!link.active) e.target.style.color = "#d1d5db"; }}>
              {link.label}
            </a>
          ))}
          <button onClick={handleJournalNav} className="transition"
            style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "inherit", fontWeight: "inherit" }}
            onMouseEnter={(e) => { e.target.style.color = "#f5c518"; }}
            onMouseLeave={(e) => { e.target.style.color = "#d1d5db"; }}>
            Trading Journal
          </button>
          <a href="/courses" className="transition" style={{ color: "#d1d5db" }}
            onMouseEnter={(e) => { e.target.style.color = "#f5c518"; }}
            onMouseLeave={(e) => { e.target.style.color = "#d1d5db"; }}> </a>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-3 items-center">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.5)" }}>
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ color: "#f5c518" }}>{user.email}</span>
                </div>
                <button onClick={logout} className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm"
                  style={{ background: "#f5c518", color: "#000000" }}>Logout</button>
              </>
            ) : (
              <>
                <a href="/login" className="px-5 py-2 rounded-lg font-semibold text-sm"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}>Login</a>
                <a href="/register" className="px-5 py-2 rounded-lg font-bold text-sm"
                  style={{ background: "#f5c518", color: "#000000" }}>Sign Up</a>
              </>
            )}
          </div>
          <button className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-1.5"
            style={{ border: "1px solid rgba(245,197,24,0.3)", background: "rgba(245,197,24,0.05)" }}
            onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span style={{ display: "block", width: "20px", height: "2px", background: "#f5c518", transition: "transform 0.2s", transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none" }} />
            <span style={{ display: "block", width: "20px", height: "2px", background: "#f5c518", transition: "opacity 0.2s", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: "20px", height: "2px", background: "#f5c518", transition: "transform 0.2s", transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden fixed top-[65px] left-0 right-0 z-40 px-5 py-6 flex flex-col gap-4"
          style={{ background: "rgba(13,13,13,0.98)", borderBottom: "1px solid rgba(245,197,24,0.15)" }}>
          {[
            { label: "Home", href: "#home" },
            { label: "Courses", href: "#courses" },
            { label: "Services", href: "#services" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
            
          ].map((link) => (
            <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
              className="text-base font-semibold py-2"
              style={{ color: "#d1d5db", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {link.label}
            </a>
          ))}
          <button onClick={handleJournalNav} className="text-base font-semibold py-2 text-left"
            style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            Trading Journal
          </button>
          <div className="flex flex-col gap-3 pt-2">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black"
                    style={{ background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.5)" }}>
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "#f5c518" }}>{user.email}</span>
                </div>
                <button onClick={() => { setMenuOpen(false); logout(); }} className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: "#f5c518", color: "#000000" }}>Logout</button>
              </>
            ) : (
              <>
                <a href="/login" onClick={() => setMenuOpen(false)} className="w-full py-3 rounded-xl font-semibold text-sm text-center"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}>Login</a>
                <a href="/register" onClick={() => setMenuOpen(false)} className="w-full py-3 rounded-xl font-bold text-sm text-center"
                  style={{ background: "#f5c518", color: "#000000" }}>Sign Up</a>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─────────── HERO ─────────── */}
      <section id="home" className="relative flex flex-col overflow-hidden"
        style={{ minHeight: "calc(100vh - 65px)", background: "linear-gradient(135deg, #0d0d0d 0%, #1a1200 50%, #0d0d0d 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", width: "min(900px, 100vw)", height: "min(900px, 100vw)", background: "radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 65%)", transform: "translate(-50%, -50%)" }} />
        </div>
        <div className="relative z-10 flex flex-1 items-center justify-center px-5 md:px-16 text-center py-16">
          <div className="max-w-4xl w-full">
            <h1 className="font-black leading-tight mb-6 uppercase" style={{ fontSize: "clamp(2rem, 7vw, 5.5rem)", letterSpacing: "-0.01em" }}>
              <span style={{ color: "#ffffff", display: "block" }}>Learn Premium Skills</span>
              <span style={{ color: "#f5c518", display: "block" }}>From DREAM CRT</span>
            </h1>
            <p className="text-base md:text-lg leading-relaxed mb-10 mx-auto" style={{ color: "#94a3b8", maxWidth: "560px" }}>
              Access high-quality premium courses taught by professional instructors around the world.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <a href="#courses" className="flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl font-black text-sm md:text-base"
                style={{ background: "#f5c518", color: "#000000" }}>🎓 Start Learning</a>
              <a href="#services" className="flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base"
                style={{ border: "1px solid rgba(245,197,24,0.4)", color: "#f5c518", background: "rgba(245,197,24,0.05)" }}>▶ Our Services</a>
            </div>
          </div>
        </div>
        <div className="relative z-10 mx-5 md:mx-16 mb-8 md:mb-10" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {[
              { icon: "👥", value: "1K+", label: "Students" },
              { icon: "📚", value: "50+", label: "Premium Courses" },
              { icon: "📊", value: "95%", label: "Success Rate" },
              { icon: "🏆", value: "2+", label: "Years Experience" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 md:px-6 md:py-4 rounded-xl"
                style={{ background: "rgba(245,197,24,0.05)", border: "1px solid rgba(245,197,24,0.15)" }}>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-base md:text-lg flex-shrink-0"
                  style={{ background: "rgba(245,197,24,0.12)", border: "1px solid rgba(245,197,24,0.3)" }}>
                  {stat.icon}
                </div>
                <div>
                  <div className="font-black text-lg md:text-xl" style={{ color: "#f5c518" }}>{stat.value}</div>
                  <div className="text-xs font-semibold" style={{ color: "#64748b" }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── SERVICES ─────────── */}
      <section id="services" className="px-5 md:px-20 py-20 md:py-28">
        <div className="text-center mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", color: "#f5c518" }}>
            ✦ Adeegyadayada
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Waxaan<span style={{ color: "#f5c518" }}> Ku Gacan </span>Siineynaa
          </h2>
          <p className="text-base md:text-lg mx-auto" style={{ color: "#fcfcfc", maxWidth: "520px" }}>
            Waxaan ahay mentorkii ugu horreeyay ee bulshada Soomaaliyeed u soo bandhiga CRT Strategy. Waxaan SI guul leh u tababaray 500+ arday oo aan siiyay free course , waxaan ogaaday in Is-baridda (Self-study) ay leedahay jahwareer iyo safar aad u dheer.
            Koorsooyinkayga gaarka ah (Premium Courses) waxay kuu soo gaabinayaan safarkaas dheer. Uma baahnid inaad keligaa wareerto; waxaad heleysaa hagid toos ah, system diyaarsan , iyo caawin joogto ah
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {services.map((svc, i) => (
            <div key={i} className="rounded-3xl p-7 md:p-9 flex flex-col gap-6 transition-all duration-300"
              style={{ background: svc.colorDim, border: `1px solid ${svc.colorBorder}`, position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 20px 50px ${svc.colorDim}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${svc.colorBorder}` }}>
                  <img src="/image.png" alt="DREAM CRT" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ background: "rgba(0,0,0,0.3)", color: svc.color }}>
                    {svc.tag}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black" style={{ color: "#ffffff" }}>{svc.title}</h3>
                  <p className="text-sm mt-1" style={{ color: svc.color, fontWeight: 600 }}>{svc.subtitle}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {svc.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm" style={{ color: "#e2e8f0" }}>
                    <span style={{ flexShrink: 0 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-4" style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${svc.colorBorder}` }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: svc.color }}>✦ Faa'iidada</p>
                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{svc.benefit}</p>
              </div>
              <button
                onClick={() => openPayModal(svc.payId, svc.title, svc.payPrice)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm w-fit"
                style={{ background: svc.color, color: "#000000", border: "none", cursor: "pointer" }}>
                Iibso/BUY →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── TRUST BAR ─────────── */}
      <div className="mx-5 md:mx-20 mb-16 md:mb-20 px-5 md:px-8 py-4 md:py-5 rounded-2xl flex flex-wrap justify-around gap-4 md:gap-6 items-center"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,197,24,0.1)" }}>
        {[
          { icon: "🛡️", label: "Trusted Education" },
          { icon: "📈", label: "Proven Strategies" },
          { icon: "👤", label: "Expert Mentors" },
          { icon: "🏆", label: "Results Driven" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 md:gap-3">
            <span className="text-lg md:text-xl">{item.icon}</span>
            <span className="text-xs md:text-sm font-semibold" style={{ color: "#94a3b8" }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ─────────── COURSES ─────────── */}
      <section id="courses" className="px-5 md:px-20 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", color: "#f5c518" }}>
            ✦ Courses
          </div>
          <h2 className="text-3xl md:text-5xl font-black">
            Latest<span style={{ color: "#f5c518" }}> Courses</span>
          </h2>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <p style={{ color: "#64748b" }}>Courses loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {displayCourse.map((course) => (
              <div key={course.id} className="rounded-3xl overflow-hidden transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,197,24,0.2)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(245,197,24,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                {course.thumbnailURL ? (
                  <img src={course.thumbnailURL} alt={course.title} className="w-full object-cover"
                    style={{ height: "clamp(180px, 40vw, 240px)" }} />
                ) : course.fileURL && course.type === "Video" ? (
                  <video src={course.fileURL} className="w-full object-cover pointer-events-none"
                    style={{ height: "clamp(180px, 40vw, 240px)" }} muted playsInline preload="metadata" />
                ) : (
                  <div className="w-full flex items-center justify-center"
                    style={{ height: "clamp(180px, 40vw, 240px)", background: "rgba(245,197,24,0.05)" }}>
                    <span style={{ fontSize: 64 }}>{course.type === "PDF" ? "📄" : course.type === "Playlist" ? "🎓" : "🎬"}</span>
                  </div>
                )}
                <div className="p-5 md:p-8">
                  {course.type && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                      style={{
                        background: course.type === "PDF" ? "rgba(255,71,87,0.15)" : course.type === "Playlist" ? "rgba(59,130,246,0.15)" : "rgba(245,158,11,0.15)",
                        color: course.type === "PDF" ? "#ff4757" : course.type === "Playlist" ? "#3b82f6" : "#f59e0b",
                      }}>
                      {course.type} {course.lessonCount ? `• ${course.lessonCount} Lessons` : ""}
                    </span>
                  )}
                  <h3 className="text-xl md:text-2xl font-black">{course.title}</h3>
                  {course.description && (
                    <p className="mt-3 md:mt-4 text-sm md:text-base leading-relaxed"
                      style={{ color: "#64748b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-6 md:mt-8">
                    <span className="text-2xl md:text-3xl font-black" style={{ color: "#f5c518" }}>
                      {Number(course.price) === 0 ? "FREE" : `$${course.price}`}
                    </span>
                    <button
                      onClick={() => {
                        if (Number(course.price) === 0) {
                          window.location.href = `/course/${course.id}`;
                        } else {
                          openPayModal(course.id, course.title, course.price);
                        }
                      }}
                      className="px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-sm transition-all"
                      style={{ background: "#f5c518", color: "#000000" }}>
                      {Number(course.price) === 0 ? "Access Free" : "Buy Course"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─────────── ABOUT ─────────── */}
      <section id="about" className="px-5 md:px-20 py-20 md:py-32 text-center"
        style={{ borderTop: "1px solid rgba(245,197,24,0.08)" }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", color: "#f5c518" }}>
          ✦ Nagu saabsan
        </div>
        <h2 className="text-3xl md:text-5xl font-black mb-6">About <span style={{ color: "#f5c518" }}>DREAM CRT</span></h2>
        <p className="text-base md:text-xl max-w-4xl mx-auto leading-loose" style={{ color: "#64748b" }}>
          DREAM CRT waa platform-ka barashada xirfadda aduunka oo dhan lagu aqoonsan yahay,
          halkaas oo ardaydu ku bartaan xeeladaha ganacsiga Forex iyadoo la isticmaalayo
          casharro video ah, PDF, iyo live sessions.
        </p>
      </section>

      {/* ─────────── CONTACT ─────────── */}
      <section id="contact" className="px-5 md:px-20 py-16 md:py-24 text-center"
        style={{ borderTop: "1px solid rgba(245,197,24,0.12)" }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", color: "#f5c518" }}>
          ✦ Xiriir
        </div>
        <h2 className="text-3xl md:text-4xl font-black mb-4">Contact Us</h2>
        <p className="text-base md:text-xl mb-8" style={{ color: "#64748b" }}>Su'aalo ma qabtaa? Nala soo xiriir!</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="mailto:dreamcrt89@gmail.com" className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.3)", color: "#f5c518" }}>
            📧 dreamcrt89@gmail.com
          </a>
          <a href="https://wa.me/252612515121" target="_blank" rel="noreferrer"
            className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
            💬 WhatsApp
          </a>
        </div>
      </section>

      {/* ─────────── JOURNAL MODAL ─────────── */}
      {showJournalForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="w-full max-w-2xl p-6 md:p-10 rounded-3xl relative max-h-[90vh] overflow-y-auto"
            style={{ background: "#111111", border: "1px solid rgba(245,197,24,0.3)" }}>
            <button onClick={() => setShowJournalForm(false)} className="absolute top-4 right-4 text-2xl"
              style={{ color: "#f5c518", background: "none", border: "none", cursor: "pointer" }}>✕</button>
            <h2 className="text-2xl md:text-4xl font-black text-center mb-8 md:mb-10" style={{ color: "#f5c518" }}>Trading Journal</h2>
            <div className="space-y-4 md:space-y-5">
              <input type="text" placeholder="Enter Your Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full p-4 rounded-xl outline-none text-white text-base"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,197,24,0.25)" }} />
              <input type="email" placeholder="Enter Your Email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl outline-none text-white text-base"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,197,24,0.25)" }} />
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full p-4 rounded-xl outline-none text-white text-base"
                style={{ background: "#111111", border: "1px solid rgba(245,197,24,0.25)" }}>
                <option>Trading Lessons</option>
                <option>Trading Journal</option>
                <option>Back Testing</option>
              </select>
              <textarea placeholder="Write Your Message..." value={message} onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-xl outline-none text-white h-32 md:h-36 text-base"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,197,24,0.25)", resize: "vertical" }} />
              <button onClick={submitJournal} className="w-full py-3 md:py-4 rounded-xl text-lg md:text-xl font-black"
                style={{ background: "#f5c518", color: "#000000" }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────── PAYMENT MODAL ─────────── */}
      {showPayModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowPayModal(false); setPayDone(false); } }}>
          <div className="w-full max-w-md rounded-3xl relative max-h-[90vh] overflow-y-auto"
            style={{ background: "#080808", border: "1px solid rgba(245,197,24,0.25)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-7 pb-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#f5c518" }}>💳 Lacag Bixin</p>
                <h2 className="text-white text-xl font-black">{payCourseName}</h2>
              </div>
              <button onClick={() => { setShowPayModal(false); setPayDone(false); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "none", cursor: "pointer" }}>✕</button>
            </div>

            <div className="px-7 py-6">
              {!payDone ? (
                <>
                  <div className="mb-6">
                    <p className="text-gray-600 text-xs mb-1">Course Price</p>
                    <p className="text-white text-4xl font-black">
                      ${payCoursePrice}
                      <span className="text-gray-600 text-base font-normal ml-1">/ hal mar</span>
                    </p>
                  </div>
                  <div className="rounded-2xl p-4 mb-6"
                    style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.25)" }}>
                    <p className="font-black text-sm mb-2" style={{ color: "#f5c518" }}>📋 TILMAAN LACAG BIXINTA:</p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      KUDIR LACAGTA COURSE KA NUMARKAAN{" "}
                      <span className="font-black" style={{ color: "#f5c518" }}>252613887399</span>{" "}
                      KASOO QAAD SCREENSHORT KADIBNA KU SOODIR WhatsApp NUMBARKEENA.
                      252613887399
                    </p>
                  </div>
                  <div className="mb-4">
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Email Address</label>
                    <input type="email" value={payEmail} onChange={(e) => setPayEmail(e.target.value)}
                      placeholder="your@email.com" className="w-full px-4 py-3.5 rounded-xl outline-none text-white text-sm"
                      style={{ background: "#000", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <div className="mb-6">
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">EVC Number</label>
                    <input type="text" value={payPhone} onChange={(e) => setPayPhone(e.target.value)}
                      placeholder="61xxxxxxx" className="w-full px-4 py-3.5 rounded-xl outline-none text-white text-sm"
                      style={{ background: "#000", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <button onClick={handlePay} disabled={paying}
                    className="w-full py-4 rounded-2xl font-black text-black text-base disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "#f5c518", border: "none", cursor: "pointer" }}>
                    {paying ? "Processing..." : "✅ Confirm Order"}
                  </button>
                  <p className="text-center text-xs mt-4" style={{ color: "#64748b" }}>🛡️ Secure • EVC Plus • Dream Crt</p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: "rgba(245,197,24,0.08)", border: "2px solid #f5c518" }}>
                    <span className="text-4xl">⏳</span>
                  </div>
                  <h3 className="text-white text-2xl font-black mb-2">Order <span style={{ color: "#f5c518" }}>Received!</span></h3>
                  <p className="text-gray-400 text-sm mb-5">
                    Order-kaagu waa la helay. Admin-ku wuu fiirin doonaa oo course-ka wuu kuu furi doonaa.
                  </p>
                  <div className="rounded-2xl p-5 text-left mb-5" style={{ background: "#111111", border: "1px solid rgba(245,197,24,0.2)" }}>
                    {[
                      { label: "Course", value: payCourseName },
                      { label: "Email", value: payEmail },
                      { label: "Number", value: payPhone },
                      { label: "Amount", value: `$${payCoursePrice}` },
                      { label: "Status", value: "⏳ Pending Approval", gold: true },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between text-sm py-2"
                        style={{ borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                        <span style={{ color: "#64748b" }}>{row.label}</span>
                        <span className="font-semibold truncate max-w-[180px]"
                          style={{ color: row.gold ? "#f5c518" : "#ffffff" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl p-4 text-sm text-left"
                    style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.2)" }}>
                    <p className="font-bold mb-1" style={{ color: "#f5c518" }}>⚠️ Xasuusin:</p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Marka la approve gareeyo, course-ka isla markiiba wuu kuu furmayaa.
                      Fadlan dib u soo gal account-kaaga si aad u aragto.
                    </p>
                  </div>
                  <button onClick={() => { setShowPayModal(false); setPayDone(false); }}
                    className="mt-5 w-full py-3 rounded-xl font-bold text-sm"
                    style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", color: "#f5c518", cursor: "pointer" }}>
                    Xir / Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}