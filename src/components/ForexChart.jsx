import { useEffect, useState } from "react";

import {
  AdvancedRealTimeChart,
} from "react-ts-tradingview-widgets";

import {
  FaExpand,
  FaCompress,
  FaChartLine,
  FaSearchPlus,
  FaSearchMinus,
  FaWallet,
  FaRobot,
  FaFire,
  FaCheckCircle,
  FaDollarSign,
  FaLock,
} from "react-icons/fa";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase/config";

export default function ForexChart() {

  const [symbol, setSymbol] =
    useState("OANDA:XAUUSD");

  const [timeframe, setTimeframe] =
    useState("30");

  const [fullscreen, setFullscreen] =
    useState(false);

  const [chartHeight, setChartHeight] =
    useState(650);

  const [balance, setBalance] =
    useState(10000);

  const [profitTarget] =
    useState(12000);

  const [dailyLossLimit] =
    useState(500);

  const [accountStatus, setAccountStatus] =
    useState("ACTIVE");

  const [publishedTrades, setPublishedTrades] =
    useState([]);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [selectedAccount, setSelectedAccount] =
    useState("10K Challenge");

  const pairs = [
    {
      label: "GOLD",
      value: "OANDA:XAUUSD",
    },
    {
      label: "BTC",
      value: "BINANCE:BTCUSDT",
    },
    {
      label: "ETH",
      value: "BINANCE:ETHUSDT",
    },
    {
      label: "EURUSD",
      value: "FX:EURUSD",
    },
    {
      label: "GBPUSD",
      value: "FX:GBPUSD",
    },
    {
      label: "NAS100",
      value: "OANDA:NAS100USD",
    },
    {
      label: "US30",
      value: "FOREXCOM:DJI",
    },
  ];

  const saveChartSettings = async (
    newSymbol = symbol,
    newTimeframe = timeframe,
    newHeight = chartHeight
  ) => {

    const user = auth.currentUser;

    if (!user) return;

    try {

      await setDoc(

        doc(
          db,
          "chartSettings",
          user.uid
        ),

        {
          symbol: newSymbol,
          timeframe: newTimeframe,
          chartHeight: newHeight,
          updatedAt: Date.now(),
        }

      );

    } catch (err) {

      console.log(err);

    }

  };

  useEffect(() => {

    const loadSettings = async () => {

      const user =
        auth.currentUser;

      if (!user) return;

      try {

        const snap =
          await getDoc(

            doc(
              db,
              "chartSettings",
              user.uid
            )

          );

        if (
          snap.exists()
        ) {

          const data =
            snap.data();

          if (data.symbol)
            setSymbol(
              data.symbol
            );

          if (data.timeframe)
            setTimeframe(
              data.timeframe
            );

          if (data.chartHeight)
            setChartHeight(
              data.chartHeight
            );

        }

      } catch (err) {

        console.log(err);

      }

    };

    loadSettings();

  }, []);

  useEffect(() => {

    const user =
      auth.currentUser;

    if (!user) return;

    const q = query(
      collection(db, "trades"),
      where("userId", "==", user.uid)
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const fetchedTrades =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setPublishedTrades(
          fetchedTrades.reverse()
        );

        const total =
          fetchedTrades.reduce(
            (acc, trade) =>
              acc +
              Number(
                trade.profit_loss || 0
              ),
            0
          );

        const newBalance =
          10000 + total;

        setBalance(
          newBalance
        );

        if (
          newBalance <=
          10000 - dailyLossLimit
        ) {

          setAccountStatus(
            "BLOWN"
          );

        } else if (
          newBalance >=
          profitTarget
        ) {

          setAccountStatus(
            "PASSED"
          );

        } else {

          setAccountStatus(
            "ACTIVE"
          );

        }

      });

    return () =>
      unsubscribe();

  }, []);

  const increaseSize = () => {

    const newHeight =
      chartHeight + 120;

    setChartHeight(
      newHeight
    );

    saveChartSettings(
      symbol,
      timeframe,
      newHeight
    );

  };

  const decreaseSize = () => {

    if (
      chartHeight > 500
    ) {

      const newHeight =
        chartHeight - 120;

      setChartHeight(
        newHeight
      );

      saveChartSettings(
        symbol,
        timeframe,
        newHeight
      );

    }

  };

  const getAIAnalysis = () => {

    if (symbol.includes("XAU")) {

      alert(
        "AI Analysis\n\nBias: Bullish 📈\nSupport: 4460\nResistance: 4510"
      );

    } else {

      alert(
        "AI Analysis\n\nMarket consolidating."
      );

    }

  };

  const publishTrade = async () => {

    const user =
      auth.currentUser;

    if (!user) {

      alert(
        "Please Login First"
      );

      return;

    }

    const randomProfit =
      Math.floor(
        Math.random() * 400
      ) - 100;

    const tradeData = {

      pair: symbol,

      direction:
        randomProfit >= 0
          ? "BUY"
          : "SELL",

      status:
        randomProfit >= 0
          ? "Win"
          : "Loss",

      profit_loss:
        randomProfit,

      createdAt:
        Date.now(),

      userId:
        user.uid,

      userEmail:
        user.email,

      type:
        randomProfit >= 0
          ? "WIN"
          : "LOSS",

    };

    try {

      await addDoc(
        collection(
          db,
          "trades"
        ),
        tradeData
      );

      alert(
        "Trade Published Successfully ✅"
      );

    } catch (err) {

      alert(
        err.message
      );

    }

  };

  const activateChallenge = () => {

    if (!paymentAmount) {

      alert(
        "Enter Payment Amount"
      );

      return;

    }

    alert(
      `Challenge Activated ✅

Account: ${selectedAccount}

Payment: $${paymentAmount}`
    );

  };

  const totalProfit =
    publishedTrades.reduce(
      (acc, trade) =>
        acc +
        Number(
          trade.profit_loss || 0
        ),
      0
    );

  return (

    <div className="w-full">

      <div className="w-full min-h-screen bg-black">

        {/* TOP BAR */}

        <div
          className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 flex-wrap gap-4 sticky top-0 z-50 bg-black"
        >

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center">

              <FaChartLine className="text-white text-2xl" />

            </div>

            <div>

              <h1 className="text-4xl font-black text-white">

                DREAM CRT

              </h1>

              <p className="text-gray-400">

                AI PROP FIRM TERMINAL

              </p>

            </div>

          </div>

          <div className="flex items-center gap-3 flex-wrap">

            <select
              value={symbol}
              onChange={(e) => {

                setSymbol(
                  e.target.value
                );

                saveChartSettings(
                  e.target.value,
                  timeframe,
                  chartHeight
                );

              }}
              className="bg-black text-white border border-zinc-700 rounded-2xl px-5 py-4 outline-none font-bold"
            >

              {pairs.map((pair) => (

                <option
                  key={pair.value}
                  value={pair.value}
                >

                  {pair.label}

                </option>

              ))}

            </select>

            <button
              onClick={getAIAnalysis}
              className="px-6 h-14 rounded-2xl border border-zinc-700 text-white flex items-center gap-3 font-bold"
            >

              <FaRobot />

              AI

            </button>

            <button
              onClick={increaseSize}
              className="w-14 h-14 rounded-2xl border border-zinc-700 text-white flex items-center justify-center"
            >

              <FaSearchPlus />

            </button>

            <button
              onClick={decreaseSize}
              className="w-14 h-14 rounded-2xl border border-zinc-700 text-white flex items-center justify-center"
            >

              <FaSearchMinus />

            </button>

            <button
              onClick={() =>
                setFullscreen(
                  !fullscreen
                )
              }
              className="w-14 h-14 rounded-2xl border border-zinc-700 text-white flex items-center justify-center"
            >

              {fullscreen ? (
                <FaCompress />
              ) : (
                <FaExpand />
              )}

            </button>

          </div>

        </div>

        {/* STATS */}

        <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5 p-6">

          <div className="bg-zinc-950 rounded-3xl border border-zinc-800 p-6">

            <p className="text-gray-400">

              Balance

            </p>

            <h1 className="text-5xl font-black text-green-400 mt-3">

              ${balance.toFixed(2)}

            </h1>

          </div>

          <div className="bg-zinc-950 rounded-3xl border border-zinc-800 p-6">

            <p className="text-gray-400">

              Profit

            </p>

            <h1 className="text-5xl font-black text-cyan-400 mt-3">

              ${totalProfit.toFixed(2)}

            </h1>

          </div>

          <div className="bg-zinc-950 rounded-3xl border border-zinc-800 p-6">

            <p className="text-gray-400">

              Target

            </p>

            <h1 className="text-5xl font-black text-yellow-400 mt-3">

              ${profitTarget}

            </h1>

          </div>

          <div className="bg-zinc-950 rounded-3xl border border-zinc-800 p-6">

            <p className="text-gray-400">

              Account

            </p>

            <h1
              className={`text-4xl font-black mt-3 ${
                accountStatus === "PASSED"
                  ? "text-green-400"
                  : accountStatus === "BLOWN"
                  ? "text-red-500"
                  : "text-white"
              }`}
            >

              {accountStatus}

            </h1>

          </div>

        </div>

        {/* CHART */}

        <div
          className={`w-full px-6 ${
            fullscreen
              ? "fixed inset-0 z-[999999] bg-black p-0"
              : ""
          }`}
        >

          <div
            className={`overflow-hidden border border-zinc-800 ${
              fullscreen
                ? "rounded-none h-screen"
                : "rounded-3xl"
            }`}
            style={{
              background: "#000",
              width: "100%",
              height: fullscreen
                ? "100vh"
                : `${chartHeight}px`,
            }}
          >

            <AdvancedRealTimeChart
              interval={timeframe}
              theme="dark"
              symbol={symbol}
              timezone="Africa/Mogadishu"
              locale="en"
              width="100%"
              height="100%"
              hide_side_toolbar={false}
              allow_symbol_change={false}
              withdateranges={true}
              details={true}
              hotlist={false}
              calendar={true}
              autosize={true}
              style="1"
              enable_publishing={false}
              hide_top_toolbar={false}
              save_image={true}
              watchlist={false}
              studies={[
                "RSI@tv-basicstudies",
                "MACD@tv-basicstudies",
                "Volume@tv-basicstudies",
              ]}
            />

          </div>

        </div>

        {/* ACTIONS */}

        <div className="p-6 flex flex-wrap gap-4">

          <button
            onClick={publishTrade}
            className="px-8 py-4 rounded-2xl bg-white text-black font-black text-xl flex items-center gap-3"
          >

            <FaCheckCircle />

            Save Trade

          </button>

        </div>

        {/* PAYMENT */}

        <div className="p-6">

          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8">

            <div className="flex items-center gap-3 mb-8">

              <FaWallet className="text-green-400 text-3xl" />

              <h1 className="text-4xl font-black text-white">

                Activate Challenge

              </h1>

            </div>

            <div className="grid lg:grid-cols-3 gap-5">

              <select
                value={selectedAccount}
                onChange={(e) =>
                  setSelectedAccount(
                    e.target.value
                  )
                }
                className="bg-black border border-zinc-700 rounded-2xl px-5 py-5 text-white outline-none font-bold"
              >

                <option>
                  10K Challenge
                </option>

                <option>
                  25K Challenge
                </option>

                <option>
                  50K Challenge
                </option>

                <option>
                  100K Challenge
                </option>

              </select>

              <input
                type="number"
                placeholder="USD Payment"
                value={paymentAmount}
                onChange={(e) =>
                  setPaymentAmount(
                    e.target.value
                  )
                }
                className="bg-black border border-zinc-700 rounded-2xl px-5 py-5 text-white outline-none font-bold"
              />

              <button
                onClick={activateChallenge}
                className="rounded-2xl bg-white text-black font-black text-xl"
              >

                Pay & Activate

              </button>

            </div>

            <div className="mt-8 grid lg:grid-cols-3 gap-5">

              <div className="bg-black rounded-2xl border border-zinc-800 p-6">

                <div className="flex items-center gap-2 mb-3">

                  <FaDollarSign className="text-green-400" />

                  <h1 className="text-white font-black">

                    Profit Target

                  </h1>

                </div>

                <p className="text-gray-400 text-lg">

                  Reach ${profitTarget}

                </p>

              </div>

              <div className="bg-black rounded-2xl border border-zinc-800 p-6">

                <div className="flex items-center gap-2 mb-3">

                  <FaFire className="text-red-500" />

                  <h1 className="text-white font-black">

                    Max Daily Loss

                  </h1>

                </div>

                <p className="text-gray-400 text-lg">

                  ${dailyLossLimit}

                </p>

              </div>

              <div className="bg-black rounded-2xl border border-zinc-800 p-6">

                <div className="flex items-center gap-2 mb-3">

                  <FaLock className="text-cyan-400" />

                  <h1 className="text-white font-black">

                    Rules

                  </h1>

                </div>

                <p className="text-gray-400 text-lg">

                  If rules fail account burns.

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* HISTORY */}

        <div className="p-6 pb-20">

          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8">

            <h1 className="text-4xl font-black text-white mb-8">

              Trade History

            </h1>

            {publishedTrades.length === 0 ? (

              <div className="text-center text-gray-500 py-16 text-xl">

                No Published Trades

              </div>

            ) : (

              <div className="space-y-5">

                {publishedTrades.map(
                  (trade) => (

                    <div
                      key={trade.id}
                      className="bg-black rounded-3xl border border-zinc-800 p-6 flex items-center justify-between flex-wrap gap-5"
                    >

                      <div>

                        <h1 className="text-3xl font-black text-white">

                          {trade.pair}

                        </h1>

                        <p className="text-gray-500 mt-1">

                          Saved Trade

                        </p>

                      </div>

                      <div className="text-right">

                        <h1
                          className={`text-4xl font-black ${
                            Number(
                              trade.profit_loss
                            ) >= 0
                              ? "text-green-400"
                              : "text-red-500"
                          }`}
                        >

                          {Number(
                            trade.profit_loss
                          ) >= 0
                            ? "+"
                            : "-"}

                          $

                          {Math.abs(
                            Number(
                              trade.profit_loss
                            )
                          )}

                        </h1>

                        <p className="text-gray-500 mt-1">

                          {trade.direction}

                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}