import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
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

  useEffect(() => {
    fetchCourses();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setEmail(currentUser.email || "");
    });
    return () => unsubscribe();
  }, []);

  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
    if (!fullName || !email || !message) {
      alert("Please fill all fields");
      return;
    }
    try {
      await addDoc(collection(db, "journalRequests"), {
        fullName,
        email,
        type,
        message,
        status: "Pending",
        createdAt: Date.now(),
      });
      alert("Submitted Successfully");
      setFullName("");
      setMessage("");
      setType("Trading Lessons");
      setShowJournalForm(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleJournalNav = () => {
    setMenuOpen(false);
    if (!user) {
      window.location.href = "/login";
    } else {
      window.location.href = "/journal";
    }
  };

  return (
    <div
      className="text-white min-h-screen overflow-x-hidden"
      style={{ background: "#0d0d0d" }}
    >
      {/* ─────────── NAVBAR ─────────── */}
      <nav
        className="flex items-center justify-between px-5 md:px-10 py-4 sticky top-0 z-50"
        style={{
          background: "rgba(13,13,13,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <span
            className="font-black text-xl md:text-2xl tracking-tight"
            style={{ color: "#f5c518" }}
          >
            DREAM CRT
          </span>
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex gap-6 lg:gap-8 text-sm font-semibold">
          {[
            { label: "Home", href: "#home", active: true },
            { label: "Courses", href: "#courses" },
            { label: "Categories", href: "#courses" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition"
              style={
                link.active
                  ? { color: "#f5c518", borderBottom: "2px solid #f5c518", paddingBottom: "2px" }
                  : { color: "#d1d5db" }
              }
              onMouseEnter={(e) => { if (!link.active) e.target.style.color = "#f5c518"; }}
              onMouseLeave={(e) => { if (!link.active) e.target.style.color = "#d1d5db"; }}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={handleJournalNav}
            className="transition"
            style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "inherit", fontWeight: "inherit" }}
            onMouseEnter={(e) => { e.target.style.color = "#f5c518"; }}
            onMouseLeave={(e) => { e.target.style.color = "#d1d5db"; }}
          >
            Journal Trading
          </button>
          <a
            href="/mycourses"
            className="transition"
            style={{ color: "#d1d5db" }}
            onMouseEnter={(e) => { e.target.style.color = "#f5c518"; }}
            onMouseLeave={(e) => { e.target.style.color = "#d1d5db"; }}
          >
            My Courses
          </a>
        </div>

        {/* DESKTOP AUTH + MOBILE HAMBURGER */}
        <div className="flex items-center gap-3">
          {/* Desktop auth */}
          <div className="hidden md:flex gap-3 items-center">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                    style={{
                      background: "rgba(245,197,24,0.15)",
                      border: "1px solid rgba(245,197,24,0.5)",
                    }}
                  >
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ color: "#f5c518" }}>{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm"
                  style={{ background: "#f5c518", color: "#000000" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-5 py-2 rounded-lg font-semibold text-sm"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="px-5 py-2 rounded-lg font-bold text-sm"
                  style={{ background: "#f5c518", color: "#000000" }}
                >
                  Sign Up
                </a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-1.5"
            style={{ border: "1px solid rgba(245,197,24,0.3)", background: "rgba(245,197,24,0.05)" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              style={{
                display: "block", width: "20px", height: "2px",
                background: "#f5c518",
                transition: "transform 0.2s",
                transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none",
              }}
            />
            <span
              style={{
                display: "block", width: "20px", height: "2px",
                background: "#f5c518",
                transition: "opacity 0.2s",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: "block", width: "20px", height: "2px",
                background: "#f5c518",
                transition: "transform 0.2s",
                transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU DRAWER */}
      {menuOpen && (
        <div
          className="md:hidden fixed top-[65px] left-0 right-0 z-40 px-5 py-6 flex flex-col gap-4"
          style={{
            background: "rgba(13,13,13,0.98)",
            borderBottom: "1px solid rgba(245,197,24,0.15)",
          }}
        >
          {[
            { label: "Home", href: "#home" },
            { label: "Courses", href: "#courses" },
            { label: "Categories", href: "#courses" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "My Courses", href: "/mycourses" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-semibold py-2"
              style={{
                color: "#d1d5db",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={handleJournalNav}
            className="text-base font-semibold py-2 text-left"
            style={{
              color: "#d1d5db",
              background: "none", border: "none", cursor: "pointer",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            Journal Trading
          </button>

          {/* Mobile auth */}
          <div className="flex flex-col gap-3 pt-2">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black"
                    style={{ background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.5)" }}
                  >
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "#f5c518" }}>{user.email}</span>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: "#f5c518", color: "#000000" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-center"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}
                >
                  Login
                </a>
                <a
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full py-3 rounded-xl font-bold text-sm text-center"
                  style={{ background: "#f5c518", color: "#000000" }}
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─────────── HERO ─────────── */}
      <section
        id="home"
        className="relative flex flex-col overflow-hidden"
        style={{
          minHeight: "calc(100vh - 65px)",
          background: "linear-gradient(135deg, #0d0d0d 0%, #1a1200 50%, #0d0d0d 100%)",
        }}
      >
        {/* Gold radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: "min(900px, 100vw)",
              height: "min(900px, 100vw)",
              background: "radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 65%)",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-5 md:px-16 text-center py-16">
          <div className="max-w-4xl w-full">
            <h1
              className="font-black leading-tight mb-6 uppercase"
              style={{ fontSize: "clamp(2rem, 7vw, 5.5rem)", letterSpacing: "-0.01em" }}
            >
              <span style={{ color: "#ffffff", display: "block" }}>Learn Premium Skills</span>
              <span style={{ color: "#f5c518", display: "block" }}>From DREAM CRT</span>
            </h1>
            <p
              className="text-base md:text-lg leading-relaxed mb-10 mx-auto"
              style={{ color: "#94a3b8", maxWidth: "560px" }}
            >
              Access high-quality premium courses taught by professional instructors
              around the world.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <a
                href="#courses"
                className="flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl font-black text-sm md:text-base"
                style={{ background: "#f5c518", color: "#000000" }}
              >
                🎓 Start Learning
              </a>
              <a
                href="#courses"
                className="flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base"
                style={{
                  border: "1px solid rgba(245,197,24,0.4)",
                  color: "#f5c518",
                  background: "rgba(245,197,24,0.05)",
                }}
              >
                ▶ Explore Courses
              </a>
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div
          className="relative z-10 mx-5 md:mx-16 mb-8 md:mb-10"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {[
              { icon: "👥", value: "10K+", label: "Students" },
              { icon: "📚", value: "50+", label: "Premium Courses" },
              { icon: "📊", value: "95%", label: "Success Rate" },
              { icon: "🏆", value: "5+", label: "Years Experience" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 md:px-6 md:py-4 rounded-xl"
                style={{
                  background: "rgba(245,197,24,0.05)",
                  border: "1px solid rgba(245,197,24,0.15)",
                }}
              >
                <div
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-base md:text-lg flex-shrink-0"
                  style={{ background: "rgba(245,197,24,0.12)", border: "1px solid rgba(245,197,24,0.3)" }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div className="font-black text-lg md:text-xl" style={{ color: "#f5c518" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold" style={{ color: "#64748b" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── FEATURE CARDS ─────────── */}
      <section className="px-5 md:px-20 pb-16 md:pb-20 pt-10 md:pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {[
            { icon: "📖", title: "Forex Basics 25$", desc: "Learn the fundamentals of Forex Trading from beginner to advanced level." },
            { icon: "📡", title: "Live Signals", desc: "Access premium trading signals and daily market analysis updates." },
            { icon: "👥", title: "Mentorship 59", desc: "Join a professional trading community with expert mentorship support." },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-5 p-5 md:p-6 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(245,197,24,0.15)",
              }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl text-2xl flex-shrink-0"
                style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)" }}
              >
                {item.icon}
              </div>
              <div>
                <h3 className="font-black text-base md:text-lg mb-2" style={{ color: "#ffffff" }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                  {item.desc}
                </p>
                <div
                  className="mt-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ border: "1px solid rgba(245,197,24,0.4)", color: "#f5c518" }}
                >
                  ›
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── TRUST BAR ─────────── */}
      <div
        className="mx-5 md:mx-20 mb-16 md:mb-20 px-5 md:px-8 py-4 md:py-5 rounded-2xl flex flex-wrap justify-around gap-4 md:gap-6 items-center"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(245,197,24,0.1)",
        }}
      >
        {[
          { icon: "🛡️", label: "Trusted Education" },
          { icon: "📈", label: "Proven Strategies" },
          { icon: "👤", label: "Expert Mentors" },
          { icon: "🏆", label: "Results Driven" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 md:gap-3">
            <span className="text-lg md:text-xl">{item.icon}</span>
            <span className="text-xs md:text-sm font-semibold" style={{ color: "#94a3b8" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* ─────────── COURSES ─────────── */}
      <section id="courses" className="px-5 md:px-20 py-16 md:py-24">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-12 md:mb-20">
          Latest<span style={{ color: "#f5c518" }}> Courses</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(245,197,24,0.2)",
              }}
            >
              <video
                src={course.fileURL}
                className="w-full object-cover pointer-events-none"
                style={{ height: "clamp(180px, 40vw, 240px)" }}
                muted
                playsInline
                preload="metadata"
              />
              <div className="p-5 md:p-8">
                <h3 className="text-xl md:text-2xl font-black">{course.title}</h3>
                <p className="mt-3 md:mt-4 text-sm md:text-base leading-relaxed" style={{ color: "#64748b" }}>
                  {course.description}
                </p>
                <div className="flex items-center justify-between mt-6 md:mt-8">
                  <span className="text-2xl md:text-3xl font-black" style={{ color: "#f5c518" }}>
                    ${course.price}
                  </span>
                  <button
                    onClick={() => { window.location.href = `/course/${course.id}`; }}
                    className="px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-sm"
                    style={{ background: "#f5c518", color: "#000000" }}
                  >
                    Buy Course
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── ABOUT ─────────── */}
      <section id="about" className="px-5 md:px-20 py-20 md:py-32 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-6">
          About<span style={{ color: "#f5c518" }}> DREAM CRT </span>
        </h2>
        <p
          className="text-base md:text-xl max-w-4xl mx-auto leading-loose"
          style={{ color: "#64748b" }}
        >
          DREAM CRT is a global premium learning platform where students can learn
          professional skills through high-quality paid video courses from industry experts worldwide.
        </p>
      </section>

      {/* ─────────── CONTACT ─────────── */}
      <section
        id="contact"
        className="px-5 md:px-20 py-16 md:py-24 text-center"
        style={{ borderTop: "1px solid rgba(245,197,24,0.12)" }}
      >
        <h2 className="text-3xl md:text-4xl font-black mb-6">Contact Us</h2>
        <p className="text-base md:text-xl" style={{ color: "#64748b" }}>
          support@dreamcrt.com
        </p>
      </section>

      {/* ─────────── JOURNAL MODAL ─────────── */}
      {showJournalForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <div
            className="w-full max-w-2xl p-6 md:p-10 rounded-3xl relative max-h-[90vh] overflow-y-auto"
            style={{ background: "#111111", border: "1px solid rgba(245,197,24,0.3)" }}
          >
            <button
              onClick={() => setShowJournalForm(false)}
              className="absolute top-4 right-4 text-2xl"
              style={{ color: "#f5c518", background: "none", border: "none", cursor: "pointer" }}
            >
              ✕
            </button>
            <h2
              className="text-2xl md:text-4xl font-black text-center mb-8 md:mb-10"
              style={{ color: "#f5c518" }}
            >
              Journal Trading
            </h2>
            <div className="space-y-4 md:space-y-5">
              <input
                type="text"
                placeholder="Enter Your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-4 rounded-xl outline-none text-white text-base"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,197,24,0.25)" }}
              />
              <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl outline-none text-white text-base"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,197,24,0.25)" }}
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-4 rounded-xl outline-none text-white text-base"
                style={{ background: "#111111", border: "1px solid rgba(245,197,24,0.25)" }}
              >
                <option>Trading Lessons</option>
                <option>Trading Journal</option>
                <option>Back Testing</option>
              </select>
              <textarea
                placeholder="Write Your Message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-xl outline-none text-white h-32 md:h-36 text-base"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,197,24,0.25)", resize: "vertical" }}
              />
              <button
                onClick={submitJournal}
                className="w-full py-3 md:py-4 rounded-xl text-lg md:text-xl font-black"
                style={{ background: "#f5c518", color: "#000000" }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}