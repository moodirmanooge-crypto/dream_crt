import {
  FaChartBar,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaEnvelope,
  FaGlobe,
  FaCoins,
  FaWallet,
  FaChartLine,
} from "react-icons/fa";

export default function TradingTemplate() {

  const trades = [

    {
      pair: "EUR/USD",
      session: "NY",
      result: "+$173",
      rr: "3.47",
      type: "LONG",
    },

    {
      pair: "GBP/USD",
      session: "LON",
      result: "+$517",
      rr: "5.17",
      type: "SHORT",
    },

    {
      pair: "BTC/USD",
      session: "ASIA",
      result: "-$100",
      rr: "-1",
      type: "LONG",
    },

    {
      pair: "XAU/USD",
      session: "NY",
      result: "+$238",
      rr: "4.76",
      type: "LONG",
    },

  ];

  return (

    <div className="min-h-screen bg-[#f3f3f3] p-10">

      <div className="max-w-7xl mx-auto bg-white rounded-[35px] shadow-xl overflow-hidden">

        <div className="grid lg:grid-cols-3">

          {/* LEFT SIDE */}

          <div className="lg:col-span-2 p-10 border-r border-zinc-200">

            <div className="flex items-center gap-5 mb-10">

              <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center">

                <FaChartBar className="text-4xl text-zinc-700" />

              </div>

              <div>

                <h1 className="text-5xl font-black text-zinc-800">

                  Trading Journal

                </h1>

                <p className="text-zinc-500 text-lg mt-2">

                  Professional Forex Analytics Dashboard

                </p>

              </div>

            </div>

            {/* TOP MENU */}

            <div className="flex gap-8 border-y border-zinc-200 py-5 text-zinc-500 font-semibold overflow-auto">

              <button className="hover:text-black transition">

                Trade

              </button>

              <button className="hover:text-black transition">

                Gallery

              </button>

              <button className="hover:text-black transition">

                Trading Calendar

              </button>

              <button className="hover:text-black transition">

                Economic Calendar

              </button>

              <button className="hover:text-black transition">

                Models

              </button>

              <button className="hover:text-black transition">

                Notes

              </button>

            </div>

            {/* TABLE */}

            <div className="overflow-auto mt-10">

              <table className="w-full">

                <thead>

                  <tr className="text-left text-zinc-500 border-b border-zinc-200">

                    <th className="py-4">Pair</th>
                    <th>Session</th>
                    <th>P/L</th>
                    <th>RR</th>
                    <th>Direction</th>

                  </tr>

                </thead>

                <tbody>

                  {trades.map((trade, index) => (

                    <tr
                      key={index}
                      className="border-b border-zinc-100 hover:bg-zinc-50 transition"
                    >

                      <td className="py-5 font-bold text-zinc-700">

                        {trade.pair}

                      </td>

                      <td className="text-zinc-500">

                        {trade.session}

                      </td>

                      <td
                        className={`font-bold ${
                          trade.result.includes("+")
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >

                        {trade.result}

                      </td>

                      <td className="text-zinc-700">

                        {trade.rr}

                      </td>

                      <td>

                        <span
                          className={`px-4 py-2 rounded-xl text-sm font-bold ${
                            trade.type === "LONG"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >

                          {trade.type}

                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="p-10">

            <h1 className="text-4xl font-black text-zinc-800">

              Trading Journal

            </h1>

            <div className="mt-10">

              <h2 className="text-zinc-400 font-bold uppercase tracking-wide">

                Categories

              </h2>

              <div className="flex flex-wrap gap-4 mt-5">

                <div className="px-5 py-3 rounded-2xl border border-zinc-300 flex items-center gap-3">

                  <FaWallet className="text-teal-600" />

                  <span className="font-semibold text-zinc-700">

                    Personal Finance

                  </span>

                </div>

                <div className="px-5 py-3 rounded-2xl border border-zinc-300 flex items-center gap-3">

                  <FaChartLine className="text-teal-600" />

                  <span className="font-semibold text-zinc-700">

                    Trading Journal

                  </span>

                </div>

                <div className="px-5 py-3 rounded-2xl border border-zinc-300 flex items-center gap-3">

                  <FaCoins className="text-teal-600" />

                  <span className="font-semibold text-zinc-700">

                    Investing

                  </span>

                </div>

              </div>

            </div>

            {/* CREATOR */}

            <div className="mt-14">

              <h2 className="text-zinc-400 font-bold uppercase tracking-wide">

                About This Creator

              </h2>

              <div className="space-y-5 mt-6 text-zinc-700">

                <div className="flex items-center gap-4">

                  <FaEnvelope />

                  <span>

                    support@dreamcrt.com

                  </span>

                </div>

                <div className="flex items-center gap-4">

                  <FaGlobe />

                  <span>

                    www.dreamcrt.com

                  </span>

                </div>

                <div className="flex items-center gap-4">

                  <FaTwitter />

                  <span>

                    Twitter

                  </span>

                </div>

              </div>

            </div>

            {/* SHARE */}

            <div className="mt-14">

              <h2 className="text-zinc-400 font-bold uppercase tracking-wide">

                Share This Template

              </h2>

              <div className="flex gap-6 mt-6 text-4xl text-zinc-600">

                <FaTwitter className="hover:text-black cursor-pointer transition" />

                <FaLinkedin className="hover:text-black cursor-pointer transition" />

                <FaFacebook className="hover:text-black cursor-pointer transition" />

                <FaEnvelope className="hover:text-black cursor-pointer transition" />

              </div>

            </div>

            <div className="mt-16 text-zinc-400">

              Last updated last year

            </div>

            <button className="mt-5 text-zinc-700 underline font-semibold">

              Terms and Conditions

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}