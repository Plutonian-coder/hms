"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"email" | "matric">("email");
  const [matricNumber, setMatricNumber] = useState("");
  const [surname, setSurname] = useState("");
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res: any = await api.post("/auth/login", { email, password });
      setAuth(res.data.token, res.data.user);
      toast.success("Welcome back!");
      router.push(`/${res.data.user.role}`);
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatricLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res: any = await api.post("/auth/student-login", {
        matric_number: matricNumber,
        surname,
      });
      setAuth(res.data.token, res.data.user);
      toast.success("Welcome back!");
      router.push("/student");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">YABATECH HMS</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-1">Sign in to your account to continue</p>
        </div>

        {/* Login mode toggle */}
        <div className="flex bg-lime-100/50 rounded-xl p-1 mb-6">
          <button
            onClick={() => setLoginMode("email")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              loginMode === "email"
                ? "bg-white text-lime-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Email Login
          </button>
          <button
            onClick={() => setLoginMode("matric")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              loginMode === "matric"
                ? "bg-white text-lime-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Matric Login
          </button>
        </div>

        {loginMode === "email" ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-lime-200 bg-white/70 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-xl shadow-lg shadow-lime-600/20 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleMatricLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Matric Number</label>
              <input
                type="text"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                placeholder="YABATECH/2024/ND/CSC/001"
                className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Surname</label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Enter your surname"
                className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-xl shadow-lg shadow-lime-600/20 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in with Matric"}
            </motion.button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-lime-600 font-semibold hover:text-lime-700">
              Register
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
            Check allocation status without login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
