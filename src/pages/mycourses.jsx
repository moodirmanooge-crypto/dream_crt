import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config.js";
import { onAuthStateChanged } from "firebase/auth";
import { FaPlay, FaLock, FaCheckCircle, FaStar, FaShieldAlt } from "react-icons/fa";

export default function MyCourses() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadMyCourses(currentUser.email);
      } else {
        // Login ma lihid — u dir login page
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  const loadMyCourses = async (userEmail) => {
    try {
      // 1. Dhammaan courses-ka soo qaado
      const coursesSnap = await getDocs(collection(db, "courses"));
      const courses = coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // 2. Hubi course kasta hadduu user-ku gatay
      const purchased = [];
      for (const course of courses) {
        const accessKey = `${userEmail}_${course.id}`;
        const accessRef = doc(db, "courseAccess", accessKey);
        const accessSnap = await getDoc(accessRef);
        if (accessSnap.exists()) {
          purchased.push(course);
        }
      }

      setAllCourses(courses);
      setMyCourses(purchased);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  // ─── LOADING ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-semibold tracking-widest text-sm uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">

      {/* HEADER */}
      <div className="border-b border-white/5 bg-[#050505] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
            <FaStar className="text-white text-sm" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl leading-none">Haleel Forex</h1>
            <p className="text-red-500 text-xs font-semibold tracking-wider uppercase">Trading Academy</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-gray-400 text-sm">
            {user?.email}
          </div>
          <a
            href="/"
            className="border border-white/10 hover:border-red-600/50 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            ← Home
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* PAGE TITLE */}
        <div className="mb-10">
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2">Your Library</p>
          <h1 className="text-4xl font-black tracking-tight">My Courses</h1>
          <p className="text-gray-600 mt-2 text-sm">
            {myCourses.length} course{myCourses.length !== 1 ? "s" : ""} inaad gatay
          </p>
        </div>

        {/* MY COURSES — GATAY */}
        {myCourses.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              <FaCheckCircle className="text-green-400" />
              <h2 className="text-white font-black text-xl">Courses-kaaga</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {myCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl overflow-hidden border border-green-500/20 bg-[#080808] hover:border-green-500/40 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-48 bg-black overflow-hidden">
                    <video
                      src={course.fileURL + "#t=0.5"}
                      className="w-full h-full object-cover pointer-events-none"
                      preload="metadata"
                      muted
                    />
                    {/* Green "Unlocked" overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-12 h-12 bg-green-500/90 rounded-full flex items-center justify-center">
                        <FaPlay className="text-white text-sm ml-0.5" />
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1">
                      <FaCheckCircle className="text-xs" />
                      Unlocked
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-white font-black text-lg leading-tight">{course.title}</h3>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{course.description}</p>

                    <button
                      onClick={() => { window.location.href = `/course/${course.id}`; }}
                      className="mt-5 w-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-200 rounded-xl py-3 font-black text-white text-sm flex items-center justify-center gap-2"
                    >
                      <FaPlay className="text-xs" />
                      Watch Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Ma galin wax course ah
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaLock className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-white text-2xl font-black mb-3">Course waad gatid</h2>
            <p className="text-gray-600 mb-8">Weli courses ma gatid. Courses-ka browse gareey oo mid iibso.</p>
            <a
              href="/#courses"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors px-8 py-3 rounded-xl font-black text-white"
            >
              Browse Courses
            </a>
          </div>
        )}

        {/* DHAMMAAN COURSES — Available */}
        {allCourses.length > 0 && (
          <>
            <div className="border-t border-white/5 pt-10">
              <div className="flex items-center gap-2 mb-6">
                <FaLock className="text-gray-600" />
                <h2 className="text-gray-500 font-black text-xl">Available Courses</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCourses
                  .filter((c) => !myCourses.find((m) => m.id === c.id))
                  .map((course) => (
                    <div
                      key={course.id}
                      className="rounded-2xl overflow-hidden border border-white/5 bg-[#080808] hover:border-red-900/40 transition-colors opacity-70 hover:opacity-100"
                    >
                      {/* Thumbnail locked */}
                      <div className="relative w-full h-48 bg-black overflow-hidden">
                        <video
                          src={course.fileURL + "#t=0.5"}
                          className="w-full h-full object-cover pointer-events-none"
                          preload="metadata"
                          muted
                        />
                        <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 bg-red-600/80 rounded-full flex items-center justify-center">
                            <FaLock className="text-white text-sm" />
                          </div>
                          <span className="text-white text-xs font-bold uppercase tracking-widest opacity-70">Locked</span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-white font-black text-lg leading-tight">{course.title}</h3>
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{course.description}</p>
                        <div className="mt-5 flex items-center justify-between">
                          <span className="text-red-500 font-black text-2xl">${course.price}</span>
                          <button
                            onClick={() => { window.location.href = `/course/${course.id}`; }}
                            className="bg-[#111] hover:bg-red-600 border border-white/10 hover:border-red-600 transition-all duration-200 px-5 py-2.5 rounded-xl font-black text-white text-sm"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t border-white/5 mt-20 px-6 py-6 flex items-center justify-center gap-2 text-gray-700 text-xs">
        <FaShieldAlt />
        <span>Haleel Forex Trading Academy • Premium Courses</span>
      </div>

    </div>
  );
}