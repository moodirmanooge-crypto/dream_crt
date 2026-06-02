import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  addDoc
} from "firebase/firestore";

import {
  db,
  auth
} from "../firebase/config";

import {
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  FaCode,
  FaMobileAlt,
  FaChartLine,
  FaPaintBrush,
  FaBullhorn,
  FaShieldAlt
} from "react-icons/fa";

export default function Home() {

  const [courses, setCourses] = useState([]);

  const [user, setUser] = useState(null);

  const [showJournalForm, setShowJournalForm] = useState(false);

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [type, setType] = useState("Trading Lessons");

  const [message, setMessage] = useState("");

  useEffect(() => {

    fetchCourses();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

      setUser(currentUser);

      if (currentUser) {

        setEmail(currentUser.email);

      }

    });

    return () => unsubscribe();

  }, []);

  const fetchCourses = async () => {

    const querySnapshot = await getDocs(
      collection(db, "courses")
    );

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCourses(data);

  };

  const logout = async () => {

    await signOut(auth);

    alert("Logged Out");

  };

  const submitJournal = async () => {

    try {

      await addDoc(collection(db, "journalRequests"), {

        fullName,
        email,
        type,
        message,

        status: "Pending",

        createdAt: Date.now()

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

  return (

    <div className="bg-black text-white min-h-screen overflow-x-hidden">

      {/* NAVBAR */}

      <nav className="flex items-center justify-between px-10 py-5 border-b border-yellow-500/20 sticky top-0 bg-black/95 backdrop-blur-md z-50">

        <h1 className="text-4xl font-black text-yellow-400 tracking-wide">

          DREAM CRT

        </h1>

        <div className="hidden md:flex gap-8 text-lg font-semibold">

          <a href="#home" className="hover:text-yellow-400 transition">
            Home
          </a>

          <a href="#courses" className="hover:text-yellow-400 transition">
            Courses
          </a>

          <a href="#categories" className="hover:text-yellow-400 transition">
            Categories
          </a>

          <a href="#about" className="hover:text-yellow-400 transition">
            About
          </a>

          <a href="#contact" className="hover:text-yellow-400 transition">
            Contact
          </a>

          <a
            href="/community"
            className="hover:text-yellow-400 transition"
          >
            Community
          </a>

       <button

  onClick={() => {

    if (!user) {

      window.location.href = "/login";

    } else {

      window.location.href = "/profile";

    }

  }}

  className="hover:text-yellow-400 transition"

>

  Journal Trading

</button>

        </div>

        <div className="flex gap-4 items-center">

          {user ? (

            <>

              <div className="hidden md:block text-yellow-400 font-semibold">

                {user.email}

              </div>

              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-400 px-6 py-3 rounded-xl font-bold transition"
              >

                Logout

              </button>

            </>

          ) : (

            <>

              <a
                href="/login"
                className="border border-yellow-500 px-5 py-3 rounded-xl hover:bg-yellow-500 hover:text-black transition font-semibold"
              >
                Login
              </a>

              <a
                href="/register"
                className="bg-yellow-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-yellow-400 transition"
              >
                Sign Up
              </a>

            </>

          )}

        </div>

      </nav>

      {/* HERO */}

      <section
        id="home"
        className="relative py-32 px-10 text-center overflow-hidden"
      >

        <div className="absolute w-[700px] h-[700px] bg-yellow-500/10 rounded-full blur-3xl -top-60 left-0"></div>

        <div className="absolute w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-3xl right-0 bottom-0"></div>

        <div className="relative z-10">

          <h1 className="text-7xl md:text-8xl font-black leading-tight max-w-6xl mx-auto">

            Learn Premium Skills

            <br />

            <span className="text-yellow-400">

              From DREAM CRT

            </span>

          </h1>

          <p className="text-slate-400 text-2xl mt-10 max-w-3xl mx-auto leading-relaxed">

            Access high-quality premium courses taught by professional instructors around the world.

          </p>

          <div className="flex justify-center gap-6 mt-12 flex-wrap">

            <a
              href="#courses"
              className="bg-yellow-500 text-black px-10 py-5 rounded-2xl text-xl font-black hover:bg-yellow-400 transition"
            >
              Explore Courses
            </a>

            <button className="border border-yellow-500 px-10 py-5 rounded-2xl text-xl hover:bg-yellow-500 hover:text-black transition font-semibold">

              Watch Demo

            </button>

          </div>

        </div>

      </section>

      {/* CATEGORIES */}

      <section
        id="categories"
        className="px-10 py-24"
      >

        <h1 className="text-6xl font-black text-center mb-20">

          Popular

          <span className="text-yellow-400">

            {" "}Categories

          </span>

        </h1>

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8">

          <div className="bg-zinc-900 p-10 rounded-3xl text-center border border-yellow-500/20">
            <FaCode className="text-6xl text-yellow-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold">
              Web Development
            </h1>
          </div>

          <div className="bg-zinc-900 p-10 rounded-3xl text-center border border-yellow-500/20">
            <FaMobileAlt className="text-6xl text-yellow-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold">
              Mobile Apps
            </h1>
          </div>

          <div className="bg-zinc-900 p-10 rounded-3xl text-center border border-yellow-500/20">
            <FaChartLine className="text-6xl text-yellow-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold">
              Data Science
            </h1>
          </div>

          <div className="bg-zinc-900 p-10 rounded-3xl text-center border border-yellow-500/20">
            <FaPaintBrush className="text-6xl text-yellow-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold">
              UI/UX Design
            </h1>
          </div>

          <div className="bg-zinc-900 p-10 rounded-3xl text-center border border-yellow-500/20">
            <FaBullhorn className="text-6xl text-yellow-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold">
              Marketing
            </h1>
          </div>

          <div className="bg-zinc-900 p-10 rounded-3xl text-center border border-yellow-500/20">
            <FaShieldAlt className="text-6xl text-yellow-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold">
              Cyber Security
            </h1>
          </div>

        </div>

      </section>

      {/* COURSES */}

      <section
        id="courses"
        className="px-10 py-24"
      >

        <h1 className="text-6xl font-black text-center mb-20">

          Latest

          <span className="text-yellow-400">

            {" "}Courses

          </span>

        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

          {courses.map(course => (

            <div
              key={course.id}
              className="bg-zinc-900 rounded-3xl overflow-hidden border border-yellow-500/20 hover:border-yellow-400 hover:scale-105 transition duration-300"
            >

              <video
                src={course.fileURL}
                className="w-full h-60 object-cover"
                controls
                controlsList="nodownload"
                disablePictureInPicture
              />

              <div className="p-8">

                <h1 className="text-3xl font-black">

                  {course.title}

                </h1>

                <p className="text-slate-400 mt-5 text-lg leading-relaxed">

                  {course.description}

                </p>

                <div className="flex items-center justify-between mt-8">

                  <h1 className="text-4xl font-black text-yellow-400">

                    ${course.price}

                  </h1>

                  <button
                    onClick={() => {
                      alert("Payment System Coming Next");
                    }}
                    className="bg-yellow-500 text-black px-6 py-4 rounded-2xl font-black hover:bg-yellow-400 transition"
                  >

                    Buy Course

                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* ABOUT */}

      <section
        id="about"
        className="px-10 py-32 text-center"
      >

        <h1 className="text-6xl font-black">

          About

          <span className="text-yellow-400">

            {" "}DREAM CRT

          </span>

        </h1>

        <p className="text-slate-400 text-2xl max-w-5xl mx-auto mt-10 leading-loose">

          DREAM CRT is a global premium learning platform where students can learn professional skills through high-quality paid video courses from industry experts worldwide.

        </p>

      </section>

      {/* CONTACT */}

      <section
        id="contact"
        className="px-10 py-24 text-center border-t border-yellow-500/20"
      >

        <h1 className="text-5xl font-black">

          Contact Us

        </h1>

        <p className="text-slate-400 mt-8 text-2xl">

          support@dreamcrt.com

        </p>

      </section>

      {/* JOURNAL TRADING MODAL */}

      {showJournalForm && (

        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-5">

          <div className="bg-zinc-900 border border-yellow-500/30 rounded-3xl w-full max-w-2xl p-10 relative">

            <button
              onClick={() => setShowJournalForm(false)}
              className="absolute top-5 right-5 text-2xl text-red-500"
            >
              ✕
            </button>

            <h1 className="text-5xl font-black text-yellow-400 text-center mb-10">

              Journal Trading

            </h1>

            <div className="space-y-6">

              <input
                type="text"
                placeholder="Enter Your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black border border-yellow-500/30 p-5 rounded-2xl outline-none"
              />

              <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-yellow-500/30 p-5 rounded-2xl outline-none"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-black border border-yellow-500/30 p-5 rounded-2xl outline-none"
              >

                <option>
                  Trading Lessons
                </option>

                <option>
                  Trading Journal
                </option>

                <option>
                  Back Testing
                </option>

              </select>

              <textarea
                placeholder="Write Your Message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-black border border-yellow-500/30 p-5 rounded-2xl outline-none h-40"
              />

              <button
                onClick={submitJournal}
                className="w-full bg-yellow-500 text-black py-5 rounded-2xl text-2xl font-black hover:bg-yellow-400 transition"
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