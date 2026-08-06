import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      alert("Login Successful");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.code + "\n" + err.message);
    }
  };

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      alert("Account Created");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.code + "\n" + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-white gap-4">
      <h1 className="text-4xl font-bold">DoseTwin Login</h1>

      <input
        className="p-3 rounded text-black w-80"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="p-3 rounded text-black w-80"
        type="password"
        placeholder="Password"
        value={password}
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