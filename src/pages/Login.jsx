import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

function Login() {
  const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [isSignup, setIsSignup] = useState(false); 

  const login = async () => {
  try {
    setLoading(true);

    await signInWithEmailAndPassword(auth, email, password);

    navigate("/dashboard");
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

const signup = async () => {
  try {
    setLoading(true);

    await createUserWithEmailAndPassword(auth, email, password);

    navigate("/dashboard");
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

   return (
  <div className="min-h-screen flex bg-[#08111F]">

    {/* LEFT PANEL */}
    <div className="w-full lg:w-1/2 flex items-center justify-center px-8 lg:px-20">

      <div className="w-full max-w-md">

        <Link
          to="/"
          className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-12"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">

          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-red-400"></div>

          <h1 className="text-white text-3xl font-bold">
            DoseTwin
          </h1>

        </div>

        <h2 className="text-5xl font-bold text-white mb-3">
          Welcome back
        </h2>

        <p className="text-slate-400 mb-10">
          Log in to see your dispenser's live twin.
        </p>

        {/* EMAIL */}

        <label className="text-slate-400 text-sm">EMAIL</label>

        <div className="flex items-center bg-[#111C2C] rounded-xl px-4 mt-2 mb-6">

          <Mail className="text-slate-500" size={18} />

          <input
            className="bg-transparent outline-none w-full p-4 text-white"
            placeholder="you@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

        </div>

        {/* PASSWORD */}

        <div className="flex justify-between">

          <label className="text-slate-400 text-sm">
            PASSWORD
          </label>

          <button
            className="text-cyan-400 text-sm"
            type="button"
          >
            Forgot password?
          </button>

        </div>

        <div className="flex items-center bg-[#111C2C] rounded-xl px-4 mt-2">

          <Lock className="text-slate-500" size={18} />

          <input
            className="bg-transparent outline-none w-full p-4 text-white"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={()=>setShowPassword(!showPassword)}
          >

            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}

          </button>

        </div>

        {/* BUTTON */}

        <button
          onClick={isSignup ? signup : login}
          disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-cyan-400 to-teal-400 py-4 rounded-full font-semibold text-xl hover:scale-[1.02] transition"
        >

          {loading
            ? "Please wait..."
            : isSignup
            ? "Create Account"
            : "Log In"}

        </button>

        {/* SWITCH */}

        <div className="text-center mt-8 text-slate-400">

          {isSignup ? "Already have an account?" : "New to DoseTwin?"}

          <button
            className="ml-2 text-cyan-400"
            onClick={()=>setIsSignup(!isSignup)}
          >

            {isSignup ? "Login" : "Set up a dispenser"}

          </button>

        </div>

      </div>

    </div>

    {/* RIGHT PANEL */}

    <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#0A1724]">

      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(#2c3e50_1px,transparent_1px),linear-gradient(90deg,#2c3e50_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="flex flex-col justify-center items-center w-full">

        <div className="w-44 h-44 rounded-full bg-gradient-to-r from-cyan-400 to-red-400 shadow-[0_0_80px_rgba(34,211,238,0.4)]"></div>

        <h2 className="text-white text-4xl font-semibold text-center max-w-xl mt-16 leading-relaxed px-10">
          "The first time I trusted an app to tell me if Dad took his meds."
        </h2>

        <p className="tracking-[5px] text-slate-500 mt-8 uppercase">
          Family Caregiver
        </p>

      </div>

    </div>

  </div>
);
}

export default Login;