import { useState } from "react";

export default function Payment() {

  const [selected, setSelected] =
    useState("10K");

  const accounts = [
    {
      name: "10K Challenge",
      price: "$49",
      target: "$1,000",
      drawdown: "$500",
    },
    {
      name: "25K Challenge",
      price: "$99",
      target: "$2,500",
      drawdown: "$1,250",
    },
    {
      name: "50K Challenge",
      price: "$199",
      target: "$5,000",
      drawdown: "$2,500",
    },
  ];

  return (

    <div
      className="min-h-screen p-8"
      style={{
        background: "#000",
      }}
    >

      <h1
        className="text-5xl font-black mb-10"
        style={{
          color: "#FFD700",
        }}
      >

        Funded Accounts

      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {accounts.map((acc) => (

          <div
            key={acc.name}
            className="rounded-3xl p-8 border"
            style={{
              background: "#111",
              borderColor:
                "rgba(255,255,255,0.1)",
            }}
          >

            <h1 className="text-3xl font-black text-white">

              {acc.name}

            </h1>

            <p className="text-yellow-400 text-5xl font-black mt-5">

              {acc.price}

            </p>

            <div className="mt-6 space-y-3">

              <p className="text-gray-300">

                Profit Target:
                <span className="text-green-400">
                  {" "}
                  {acc.target}
                </span>

              </p>

              <p className="text-gray-300">

                Max Drawdown:
                <span className="text-red-400">
                  {" "}
                  {acc.drawdown}
                </span>

              </p>

            </div>

            <button
              className="w-full py-4 rounded-2xl mt-8 font-black text-xl"
              style={{
                background: "#FFD700",
                color: "#000",
              }}
            >

              Activate Account

            </button>

          </div>

        ))}

      </div>

    </div>

  );

}