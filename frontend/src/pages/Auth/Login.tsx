import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import {
  FaShieldAlt,
  FaHandsHelping,
  FaUser,
  FaArrowRight,
  FaLock,
  FaEnvelope,
} from "react-icons/fa";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || "Failed to log in.");
    }
  };

  const handleQuickLogin = async (role: "citizen" | "volunteer" | "admin") => {
    setError("");
    setLoading(true);
    const success = await quickLoginAs(role);
    setLoading(false);

    if (success) {
      if (role === "admin") navigate("/dashboard");
      else if (role === "volunteer") navigate("/volunteer/dashboard");
      else navigate("/citizen/dashboard");
    } else {
      setError("Demo login failed. Please ensure the backend is running.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-xl shadow-black/[0.04] border border-black/[0.06]">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-md shadow-blue-500/20 mb-4">
                <FaShieldAlt className="text-2xl" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h1>
              <p className="text-sm text-gray-500 mt-1.5">
                Sign in to your ResQNet disaster coordination account
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FaEnvelope className="text-sm" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-black/[0.08] rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FaLock className="text-sm" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-black/[0.08] rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gray-900 hover:bg-black active:scale-[0.99] text-white text-sm font-semibold rounded-2xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In"}
                {!loading && <FaArrowRight className="text-xs" />}
              </button>
            </form>

            {/* Quick Demo Login Cards */}
            <div className="mt-8 pt-6 border-t border-black/[0.06]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center mb-3">
                ⚡ Quick Demo One-Click Access
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin")}
                  className="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60 text-purple-800 text-center transition group flex flex-col items-center"
                >
                  <FaShieldAlt className="text-sm mb-1 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold">Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("volunteer")}
                  className="p-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200/60 text-blue-800 text-center transition group flex flex-col items-center"
                >
                  <FaHandsHelping className="text-sm mb-1 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold">Volunteer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("citizen")}
                  className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 text-emerald-800 text-center transition group flex flex-col items-center"
                >
                  <FaUser className="text-sm mb-1 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold">Citizen</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 mt-8">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        © 2026 ResQNet. Professional Disaster Coordination Platform.
      </footer>
    </div>
  );
};

export default Login;
