import {
  FaChartLine,
  FaGlobe,
  FaBrain,
  FaBolt,
  FaUsers,
  FaArrowTrendUp,
} from "react-icons/fa6";

import {
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
export default function About() {

  const features = [

    {
      icon: <FaChartLine />,
      title: "Professional Forex Trading",
      desc: "Learn advanced forex strategies, price action, smart money concepts, and institutional trading systems."
    },

    {
      icon: <FaBrain />,
      title: "AI Trading Tools",
      desc: "Use AI-powered trading analysis and smart journal systems to improve your trading decisions."
    },

    {
      icon: <FaShieldAlt />,
      title: "Risk Management",
      desc: "Master powerful risk management techniques used by professional prop firm traders worldwide."
    },

    {
      icon: <FaGlobe />,
      title: "Global Trading Community",
      desc: "Connect with traders from around the world and grow together inside the DREAM CRT ecosystem."
    },

  ];

  const stats = [

    {
      number: "10K+",
      title: "Active Students",
    },

    {
      number: "150+",
      title: "Premium Lessons",
    },

    {
      number: "95%",
      title: "Student Satisfaction",
    },

    {
      number: "24/7",
      title: "Community Support",
    },

  ];

  return (

    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* HERO */}

      <section className="relative px-8 md:px-20 py-32 overflow-hidden">

        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-yellow-500/10 blur-3xl rounded-full"></div>

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 blur-3xl rounded-full"></div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">

          <div className="inline-flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 px-6 py-3 rounded-full mb-10">

            <FaBolt className="text-yellow-400 text-xl" />

            <span className="text-yellow-400 font-bold tracking-wide">

              DREAM CRT FOREX ACADEMY

            </span>

          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-tight">

            About

            <span className="text-yellow-400">

              {" "}DREAM CRT

            </span>

          </h1>

          <p className="text-white text-2xl leading-relaxed mt-10 max-w-4xl mx-auto">

        Dream CRT ACADEMY Waa  ACADEMY _dii ugu horreeysay ee bulshada Soomaaliyeed u soo bandhigta CRT Strategy. Ka dib markii aan si guul leh u tababaray 500+ arday oo aan siiyey koorsooyin bilaash ah, waxaan ogaanay  caqabadda ugu weyn ee haysata dadka Forex-ka: ka barta baraha bulshada (Self-study) waxay leedahay jahwareer iyo safar aad u dheer. Koorsooyinkayaga  gaarka ah (Premium Courses) waxay kuu soo gaabinayayaan  safarkaas dheer. Uma baahnid inaad keligaa ku dhex wareerto suuqan baaxadda leh; halkan waxaad ka heleysaa hagid toos ah, nidaam saxan oo diyaarsan, iyo caawin joogto ah oo kugu hagta guusha
          </p>

        </div>

      </section>

      {/* ABOUT CONTENT */}

      <section className="px-8 md:px-20 py-20">

        <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">

          {/* LEFT */}

          <div>

            <h1 className="text-5xl md:text-6xl font-black leading-tight">

              We Build

              <span className="text-yellow-400">

                {" "}Professional Traders

              </span>

            </h1>

            <p className="text-white text-xl leading-loose mt-8">

              At DREAM CRT, our mission is to help traders become consistently profitable by combining education, psychology, discipline, and advanced trading technology.

            </p>

            <p className="text-white text-xl leading-loose mt-6">

              We teach professional forex trading concepts including market structure, liquidity, smart money concepts, risk-to-reward systems, and institutional trading strategies used by elite traders worldwide.

            </p>

            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-4">

                <FaCheckCircle className="text-green-400 text-2xl" />

                <span className="text-xl">

                  Advanced Forex Trading Education

                </span>

              </div>

              <div className="flex items-center gap-4">

                <FaCheckCircle className="text-green-400 text-2xl" />

                <span className="text-xl">

                  AI Trading Journal & Analytics

                </span>

              </div>

              <div className="flex items-center gap-4">

                <FaCheckCircle className="text-green-400 text-2xl" />

                <span className="text-xl">

                  Professional Risk Management

                </span>

              </div>

              <div className="flex items-center gap-4">

                <FaCheckCircle className="text-green-400 text-2xl" />

                <span className="text-xl">

                  Global Forex Community Access

                </span>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="relative">

            <div className="absolute inset-0 bg-yellow-500/10 blur-3xl rounded-full"></div>

            <div className="relative bg-zinc-900 border border-yellow-500/20 rounded-[40px] p-10">

              <div className="flex items-center justify-between mb-10">

                <div>

                  <h1 className="text-4xl font-black text-yellow-400">

                    DREAM CRT

                  </h1>

                  <p className="text-white mt-2">

                    AI Forex Trading Platform

                  </p>

                </div>

                <div className="w-20 h-20 rounded-3xl bg-yellow-500 flex items-center justify-center">

                <FaArrowTrendUp className="text-black text-4xl" />

                </div>

              </div>

              <div className="grid grid-cols-2 gap-6">

                {stats.map((item, index) => (

                  <div
                    key={index}
                    className="bg-black border border-zinc-800 rounded-3xl p-8 text-center"
                  >

                    <h1 className="text-5xl font-black text-yellow-400">

                      {item.number}

                    </h1>

                    <p className="text-white mt-4 text-lg">

                      {item.title}

                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FEATURES */}

      <section className="px-8 md:px-20 py-24">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-20">

            <h1 className="text-6xl font-black">

              Why Choose

              <span className="text-yellow-400">

                {" "}DREAM CRT

              </span>

            </h1>

            <p className="text-white text-2xl mt-8 max-w-4xl mx-auto">

              Everything you need to grow as a modern forex trader in one professional ecosystem.

            </p>

          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

            {features.map((item, index) => (

              <div
                key={index}
                className="bg-zinc-900 border border-yellow-500/20 rounded-[35px] p-10 hover:border-yellow-400 hover:-translate-y-2 transition duration-300"
              >

                <div className="w-20 h-20 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 text-4xl mb-8">

                  {item.icon}

                </div>

                <h1 className="text-3xl font-black mb-5">

                  {item.title}

                </h1>

                <p className="text-white text-lg leading-relaxed">

                  {item.desc}

                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* COMMUNITY */}

      <section className="px-8 md:px-20 py-32">

        <div className="max-w-6xl mx-auto bg-zinc-900 border border-yellow-500/20 rounded-[50px] p-14 text-center relative overflow-hidden">

          <div className="absolute top-0 left-0 w-full h-full bg-yellow-500/5"></div>

          <div className="relative z-10">

            <div className="w-28 h-28 rounded-full bg-yellow-500 mx-auto flex items-center justify-center mb-10">

              <FaUsers className="text-black text-5xl" />

            </div>

            <h1 className="text-6xl font-black leading-tight">

              Join The Future Of

              <span className="text-yellow-400">

                {" "}Forex Trading

              </span>

            </h1>

            <p className="text-white text-2xl mt-10 max-w-4xl mx-auto leading-relaxed">

              Start your trading journey with DREAM CRT and gain access to professional trading education, premium tools, AI systems, and a powerful trading community.

            </p>

            <div className="flex justify-center gap-6 mt-14 flex-wrap">

              <a
                href="/register"
                className="bg-yellow-500 text-black px-10 py-5 rounded-2xl text-2xl font-black hover:bg-yellow-400 transition"
              >

                Get Started

              </a>

              <a
                href="/community"
                className="border border-yellow-500 px-10 py-5 rounded-2xl text-2xl hover:bg-yellow-500 hover:text-black transition font-bold"
              >

                Join Community

              </a>

            </div>

          </div>

        </div>

      </section>

    </div>

  );

}