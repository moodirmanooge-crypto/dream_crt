import { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  auth
} from "../firebase/config";

import {
  useNavigate
} from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {

    if (!email || !password) {

      alert("Please fill all fields");

      return;

    }

    try {

      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login Successful");

      navigate("/");

    } catch (error) {

      alert(error.message);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-black flex items-center justify-center px-5 relative overflow-hidden">

      {/* BACKGROUND GLOW */}

      <div className="absolute w-[700px] h-[700px] bg-yellow-500/10 rounded-full blur-3xl -left-40 top-20"></div>

      <div className="absolute w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-3xl right-0 bottom-0"></div>

      {/* LOGIN CARD */}

      <div className="relative z-10 w-full max-w-2xl border border-yellow-500 rounded-[40px] bg-[#050505] shadow-2xl shadow-yellow-500/10 p-10 md:p-16">

        {/* TOP LIGHT */}

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[3px] bg-yellow-400 rounded-full shadow-lg shadow-yellow-400"></div>

        {/* LOGO */}

        <div className="flex flex-col items-center">

          <h1 className="text-6xl font-black text-yellow-400">

            DREAM CRT

          </h1>

          <p className="text-slate-400 mt-2 tracking-[6px] uppercase">

            Learn • Grow • Achieve

          </p>

        </div>

        {/* TITLE */}

        <div className="text-center mt-12">

          <h1 className="text-5xl font-bold text-white">

            WELCOME TO DREAM CRT

          </h1>

          <p className="text-slate-400 mt-4 text-lg">

            Login to continue your learning journey

          </p>

        </div>

        {/* EMAIL */}

        <div className="mt-12">

          <label className="flex items-center gap-3 text-yellow-400 mb-4 text-lg font-semibold">

            <FaEnvelope />

            Email Address

          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-yellow-500 rounded-2xl p-5 text-white outline-none focus:border-yellow-300 transition"
          />

        </div>

        {/* PASSWORD */}

        <div className="mt-8">

          <label className="flex items-center gap-3 text-yellow-400 mb-4 text-lg font-semibold">

            <FaLock />

            Password

          </label>

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-yellow-500 rounded-2xl p-5 text-white outline-none focus:border-yellow-300 transition"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-yellow-400 text-xl"
            >

              {showPassword ? <FaEyeSlash /> : <FaEye />}

            </button>

          </div>

        </div>

        {/* REMEMBER */}

        <div className="flex items-center justify-between mt-8 text-sm md:text-base">

          <label className="flex items-center gap-3 text-slate-300">

            <input type="checkbox" />

            Remember me

          </label>

          <button className="text-yellow-400 hover:text-yellow-300">

            Forgot Password?

          </button>

        </div>

        {/* BUTTON */}

        <button
          onClick={login}
          disabled={loading}
          className="w-full mt-10 bg-yellow-500 hover:bg-yellow-400 text-black text-2xl font-black py-5 rounded-2xl transition"
        >

          {loading ? "LOADING..." : "LOGIN"}

        </button>

        {/* SIGNUP */}

        <div className="flex items-center gap-4 my-10">

          <div className="flex-1 h-[1px] bg-yellow-500/20"></div>

          <span className="text-slate-400">
            OR
          </span>

          <div className="flex-1 h-[1px] bg-yellow-500/20"></div>

        </div>

        <a
          href="/register"
          className="w-full block text-center border border-yellow-500 text-white py-5 rounded-2xl text-xl hover:bg-yellow-500 hover:text-black transition"
        >

          Don’t have an account?
          <span className="text-yellow-400 font-bold">
            {" "}Sign Up
          </span>

        </a>

      </div>

    </div>

  );

}