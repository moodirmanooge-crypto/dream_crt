import { useAuth } from "../context/AuthContext";

import { Link } from "react-router-dom";

import {
  FaChartLine,
  FaBook,
  FaBrain,
  FaHistory,
} from "react-icons/fa";

export default function TraderProfile() {

  const { currentUser, userData } = useAuth();

  return (

    <div className="min-h-screen bg-black text-white flex">

      {/* SIDEBAR */}

      <div className="w-[280px] bg-zinc-950 border-r border-yellow-500/20 min-h-screen p-8">

        <h1 className="text-5xl font-black text-yellow-400 leading-tight">

          DREAM
          <br />
          CRT

        </h1>

        <div className="space-y-5 mt-20">

          <Link
            to="/profile"
            className="flex items-center gap-4 bg-yellow-500 text-black px-6 py-5 rounded-2xl font-black"
          >

            <FaChartLine />

            Dashboard

          </Link>

          <Link
            to="/journal"
            className="flex items-center gap-4 bg-zinc-900 px-6 py-5 rounded-2xl font-bold hover:bg-yellow-500 hover:text-black transition"
          >

            <FaBook />

            Journal

          </Link>

          <button
            className="flex items-center gap-4 bg-zinc-900 px-6 py-5 rounded-2xl font-bold hover:bg-yellow-500 hover:text-black transition w-full"
          >

            <FaHistory />

            Backtesting

          </button>

          <button
            className="flex items-center gap-4 bg-zinc-900 px-6 py-5 rounded-2xl font-bold hover:bg-yellow-500 hover:text-black transition w-full"
          >

            <FaBrain />

            Psychology

          </button>

        </div>

      </div>

      {/* CONTENT */}

      <div className="flex-1 p-12">

        <div className="bg-zinc-900 border border-yellow-500/20 rounded-3xl p-10">

          <div className="flex items-center gap-8">

            <div className="w-40 h-40 rounded-full bg-yellow-500"></div>

            <div>

              <h1 className="text-6xl font-black text-yellow-400">

                {userData?.name || "Trader"}

              </h1>

              <p className="text-slate-400 text-2xl mt-4">

                {currentUser?.email}

              </p>

              <p className="text-xl mt-6">

                Strategy:
                <span className="text-yellow-400 ml-3">

                  {userData?.strategy || "Not Set"}

                </span>

              </p>

            </div>

          </div>

          {/* STATS */}

          <div className="grid md:grid-cols-4 gap-8 mt-16">

            <div className="bg-black p-8 rounded-3xl border border-yellow-500/20">

              <h1 className="text-slate-400 text-xl">

                Total Trades

              </h1>

              <h1 className="text-6xl font-black text-yellow-400 mt-6">

                {userData?.totalTrades || 0}

              </h1>

            </div>

            <div className="bg-black p-8 rounded-3xl border border-yellow-500/20">

              <h1 className="text-slate-400 text-xl">

                Win Rate

              </h1>

              <h1 className="text-6xl font-black text-green-400 mt-6">

                {userData?.winRate || 0}%

              </h1>

            </div>

            <div className="bg-black p-8 rounded-3xl border border-yellow-500/20">

              <h1 className="text-slate-400 text-xl">

                Followers

              </h1>

              <h1 className="text-6xl font-black text-cyan-400 mt-6">

                {userData?.followers || 0}

              </h1>

            </div>

            <div className="bg-black p-8 rounded-3xl border border-yellow-500/20">

              <h1 className="text-slate-400 text-xl">

                Following

              </h1>

              <h1 className="text-6xl font-black text-pink-400 mt-6">

                {userData?.following || 0}

              </h1>

            </div>

          </div>

          {/* QUICK ACTIONS */}

          <div className="grid md:grid-cols-3 gap-8 mt-20">

            <Link
              to="/journal"
              className="bg-yellow-500 text-black p-8 rounded-3xl text-center font-black text-2xl hover:bg-yellow-400 transition"
            >

              Open Journal

            </Link>

            <button className="bg-zinc-800 p-8 rounded-3xl text-2xl font-black hover:bg-yellow-500 hover:text-black transition">

              Backtesting

            </button>

            <Link
              to="/community"
              className="bg-zinc-800 p-8 rounded-3xl text-2xl font-black hover:bg-yellow-500 hover:text-black transition text-center"
            >

              Community

            </Link>

          </div>

        </div>

      </div>

    </div>

  );

}