import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { BrainCircuit, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // 👇 Get previous page or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
   const res = await authService.login(email, password);

console.log("LOGIN RESPONSE:", res); // 🔍 DEBUG

const token = res.token;
const user = res.user;

if (!token) {
  throw new Error("Token not received");
}

    login(user, token);

      toast.success("Logged in successfully!");

      navigate(from, { replace: true });

    } catch (err) {
      setError("Invalid email or password");
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg px-8 py-10">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <BrainCircuit className="text-emerald-600" size={26} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-xl font-semibold text-slate-800">
          Welcome back
        </h1>
        <p className="text-center text-sm text-slate-500 mt-1">
          Sign in to continue your journey
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">
              Email
            </label>
            <div className="relative">
              <Mail
                size={18}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  focusedField === "email"
                    ? "text-emerald-500"
                    : "text-slate-400"
                }`}
              />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  focusedField === "password"
                    ? "text-emerald-500"
                    : "text-slate-400"
                }`}
              />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : <>Sign in <ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>

        <p className="text-[11px] text-slate-400 text-center mt-3">
          By continuing, you agree to our Terms & Privacy Policy
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
