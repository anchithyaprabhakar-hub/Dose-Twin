import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login Successful");
    } catch (err) {
      alert(err.message);
    }
  };

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account Created");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-white gap-4">
      <h1 className="text-4xl font-bold">DoseTwin Login</h1>

      <input
        className="p-3 rounded text-black w-80"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="p-3 rounded text-black w-80"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={login}
        className="bg-cyan-500 px-6 py-3 rounded w-80"
      >
        Login
      </button>

      <button
        onClick={signup}
        className="bg-green-500 px-6 py-3 rounded w-80"
      >
        Create Account
      </button>
    </div>
  );
}

export default Login;