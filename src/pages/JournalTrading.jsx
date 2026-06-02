import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  db,
  auth
} from "../firebase/config";

import {
  FaChartLine,
  FaHistory,
  FaBrain,
  FaChartPie,
  FaUpload,
  FaCog,
  FaSearch,
  FaBell,
  FaPlus,
  FaSave,
} from "react-icons/fa";

export default function JournalTrading() {

  const [trades, setTrades] = useState([]);

  const [tradeData, setTradeData] = useState({

    pair: "",
    type: "BUY",
    entry: "",
    sl: "",
    tp: "",
    lot: "",
    risk: "",
    strategy: "",
    result: "",
    emotion: "",
    notes: "",

  });

  useEffect(() => {

    fetchTrades();

  }, []);

  const fetchTrades = async () => {

    const user = auth.currentUser;

    if (!user) return;

    const q = query(

      collection(db, "trades"),

      where("userId", "==", user.uid)

    );

    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTrades(data);

  };

  const submitTrade = async () => {

    try {

      const user = auth.currentUser;

      if (!user) {

        alert("Please Login");

        return;

      }

      await addDoc(collection(db, "trades"), {

        ...tradeData,

        userId: user.uid,

        userEmail: user.email,

        createdAt: Date.now(),

      });

      alert("Trade Saved Successfully");

      setTradeData({

        pair: "",
        type: "BUY",
        entry: "",
        sl: "",
        tp: "",
        lot: "",
        risk: "",
        strategy: "",
        result: "",
        emotion: "",
        notes: "",

      });

      fetchTrades();

    } catch (error) {

      alert(error.message);

    }

  };

  const totalTrades = trades.length;

  const wins = trades.filter(
    trade => trade.result === "WIN"
  ).length;

  const winRate = totalTrades
    ? Math.round((wins / totalTrades) * 100)
    : 0;

  return (

    <div className="min-h-screen bg-black text-white flex overflow-hidden">

      {/* SIDEBAR */}

      <div className="w-[280px] bg-zinc-950 border-r border-yellow-500/20 p-6 hidden lg:block">

        <h1 className="text-4xl font-black text-yellow-400 mb-12">

          DREAM CRT

        </h1>

        <div className="space-y-5">

          <button className="flex items-center gap-4 w-full bg-yellow-500 text-black p-4 rounded-2xl font-bold">

            <FaChartPie />

            Dashboard

          </button>

          <button className="flex items-center gap-4 w-full hover:bg-zinc-900 p-4 rounded-2xl transition">

            <FaHistory />

            Journal

          </button>

          <button className="flex items-center gap-4 w-full hover:bg-zinc-900 p-4 rounded-2xl transition">

            <FaChartLine />

            Backtesting

          </button>

          <button className="flex items-center gap-4 w-full hover:bg-zinc-900 p-4 rounded-2xl transition">

            <FaBrain />

            Psychology

          </button>

          <button className="flex items-center gap-4 w-full hover:bg-zinc-900 p-4 rounded-2xl transition">

            <FaCog />

            Settings

          </button>

        </div>

      </div>

      {/* MAIN */}

      <div className="flex-1 overflow-y-auto">

        {/* TOPBAR */}

        <div className="flex items-center justify-between px-10 py-6 border-b border-yellow-500/20">

          <div>

            <h1 className="text-4xl font-black text-yellow-400">

              Trading Journal

            </h1>

            <p className="text-slate-400 mt-2">

              Welcome Back Trader

            </p>

          </div>

          <div className="flex items-center gap-5">

            <div className="bg-zinc-900 p-4 rounded-xl">

              <FaSearch />

            </div>

            <div className="bg-zinc-900 p-4 rounded-xl relative">

              <FaBell />

              <div className="absolute -top-1 -right-1 bg-yellow-500 w-3 h-3 rounded-full"></div>

            </div>

          </div>

        </div>

        {/* STATS */}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 p-10">

          <div className="bg-zinc-900 p-8 rounded-3xl">

            <h1 className="text-slate-400 text-lg">

              Total Trades

            </h1>

            <h1 className="text-5xl font-black mt-4 text-yellow-400">

              {totalTrades}

            </h1>

          </div>

          <div className="bg-zinc-900 p-8 rounded-3xl">

            <h1 className="text-slate-400 text-lg">

              Win Rate

            </h1>

            <h1 className="text-5xl font-black mt-4 text-green-400">

              {winRate}%

            </h1>

          </div>

          <div className="bg-zinc-900 p-8 rounded-3xl">

            <h1 className="text-slate-400 text-lg">

              Monthly Profit

            </h1>

            <h1 className="text-5xl font-black mt-4 text-yellow-400">

              ${trades.reduce(
                (a, b) => a + Number(b.result || 0),
                0
              )}

            </h1>

          </div>

          <div className="bg-zinc-900 p-8 rounded-3xl">

            <h1 className="text-slate-400 text-lg">

              Risk Reward

            </h1>

            <h1 className="text-5xl font-black mt-4 text-cyan-400">

              1:3

            </h1>

          </div>

        </div>

        {/* FORM */}

        <div className="px-10">

          <div className="bg-zinc-900 rounded-3xl p-10">

            <div className="flex items-center justify-between mb-10">

              <h1 className="text-4xl font-black text-yellow-400">

                Trade Entry Form

              </h1>

              <button className="bg-yellow-500 text-black px-6 py-3 rounded-2xl font-black flex items-center gap-3">

                <FaPlus />

                New Trade

              </button>

            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <input
                type="text"
                placeholder="Pair"
                value={tradeData.pair}
                onChange={(e)=>setTradeData({
                  ...tradeData,
                  pair: e.target.value
                })}
                className="bg-black p-5 rounded-2xl outline-none"
              />

              <select
                value={tradeData.type}
                onChange={(e)=>setTradeData({
                  ...tradeData,
                  type: e.target.value
                })}
                className="bg-black p-5 rounded-2xl outline-none"
              >

                <option>BUY</option>

                <option>SELL</option>

              </select>

              <input
                type="text"
                placeholder="Strategy"
                value={tradeData.strategy}
                onChange={(e)=>setTradeData({
                  ...tradeData,
                  strategy: e.target.value
                })}
                className="bg-black p-5 rounded-2xl outline-none"
              />

              <input
                type="text"
                placeholder="Result"
                value={tradeData.result}
                onChange={(e)=>setTradeData({
                  ...tradeData,
                  result: e.target.value
                })}
                className="bg-black p-5 rounded-2xl outline-none"
              />

            </div>

            <textarea
              placeholder="Notes"
              value={tradeData.notes}
              onChange={(e)=>setTradeData({
                ...tradeData,
                notes: e.target.value
              })}
              className="w-full h-40 bg-black p-5 rounded-2xl outline-none mt-8"
            />

            <button
              onClick={submitTrade}
              className="mt-10 bg-yellow-500 text-black px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3"
            >

              <FaSave />

              Save Trade

            </button>

          </div>

        </div>

        {/* HISTORY */}

        <div className="px-10 py-10">

          <div className="bg-zinc-900 rounded-3xl p-10">

            <h1 className="text-4xl font-black text-yellow-400 mb-10">

              Trade History

            </h1>

            {trades.length === 0 ? (

              <div className="text-center text-slate-400 text-2xl py-20">

                No Trades Yet

              </div>

            ) : (

              <div className="space-y-5">

                {trades.map((trade) => (

                  <div
                    key={trade.id}
                    className="bg-black p-6 rounded-2xl flex justify-between"
                  >

                    <div>

                      <h1 className="text-2xl font-black text-yellow-400">

                        {trade.pair}

                      </h1>

                      <p className="text-slate-400 mt-2">

                        {trade.strategy}

                      </p>

                    </div>

                    <div className="text-right">

                      <h1 className="text-2xl font-black">

                        {trade.result}

                      </h1>

                      <p className="text-slate-400 mt-2">

                        {trade.type}

                      </p>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}