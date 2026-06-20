import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const register = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(userCred.user, { displayName: name });
      alert("Account Created Successfully");
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

      {/* REGISTER CARD */}
      <div className="relative z-10 w-full max-w-2xl border border-yellow-500 rounded-[40px] bg-[#050505] shadow-2xl shadow-yellow-500/10 p-10 md:p-16">

        {/* TOP LIGHT */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[3px] bg-yellow-400 rounded-full shadow-lg shadow-yellow-400"></div>

        {/* LOGO */}
        <div className="flex flex-col items-center">
          <h1 className="text-6xl font-black text-yellow-400">DREAM CRT</h1>
          <p className="text-slate-400 mt-2 tracking-[6px] uppercase">Learn • Grow • Achieve</p>
        </div>

        {/* TITLE */}
        <div className="text-center mt-10">
          <h1 className="text-5xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-4 text-lg">Join the community and start learning</p>
        </div>

        {/* FULL NAME */}
        <div className="mt-10">
          <label className="flex items-center gap-3 text-yellow-400 mb-4 text-lg font-semibold">
            <FaUser />
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black border border-yellow-500 rounded-2xl p-5 text-white outline-none focus:border-yellow-300 transition placeholder-slate-600"
          />
        </div>

        {/* EMAIL */}
        <div className="mt-8">
          <label className="flex items-center gap-3 text-yellow-400 mb-4 text-lg font-semibold">
            <FaEnvelope />
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            className="w-full bg-black border border-yellow-500 rounded-2xl p-5 text-white outline-none focus:border-yellow-300 transition placeholder-slate-600"
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-yellow-500 rounded-2xl p-5 text-white outline-none focus:border-yellow-300 transition placeholder-slate-600"
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

        {/* CONFIRM PASSWORD */}
        <div className="mt-8">
          <label className="flex items-center gap-3 text-yellow-400 mb-4 text-lg font-semibold">
            <FaLock />
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black border border-yellow-500 rounded-2xl p-5 text-white outline-none focus:border-yellow-300 transition placeholder-slate-600"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-yellow-400 text-xl"
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={register}
          disabled={loading}
          className="w-full mt-10 bg-yellow-500 hover:bg-yellow-400 text-black text-2xl font-black py-5 rounded-2xl transition"
        >
          {loading ? "CREATING..." : "CREATE ACCOUNT"}
        </button>

        {/* LOGIN LINK */}
        <div className="flex items-center gap-4 my-10">
          <div className="flex-1 h-[1px] bg-yellow-500/20"></div>
          <span className="text-slate-400">OR</span>
          <div className="flex-1 h-[1px] bg-yellow-500/20"></div>
        </div>

        <a
          href="/login"
          className="w-full block text-center border border-yellow-500 text-white py-5 rounded-2xl text-xl hover:bg-yellow-500 hover:text-black transition"
        >
          Already have an account?
          <span className="text-yellow-400 font-bold"> Sign In</span>
        </a>

      </div>
    </div>
  );
}