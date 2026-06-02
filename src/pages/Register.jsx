import { useState } from "react";

import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../firebase/config";

export default function Register() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const register = async () => {

    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Account Created Successfully");

    } catch (error) {

      alert(error.message);

    }

  };

  return (

    <div className="min-h-screen bg-slate-950 flex items-center justify-center">

      <div className="bg-slate-900 p-10 rounded-3xl w-[400px]">

        <h1 className="text-4xl font-bold text-cyan-400 mb-6">
          DREAM CRT
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          className="w-full p-4 rounded-xl mb-4 text-black"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="w-full p-4 rounded-xl mb-4 text-black"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={register}
          className="bg-cyan-500 w-full p-4 rounded-xl text-white font-bold"
        >
          Create Account
        </button>

      </div>

    </div>

  );

}