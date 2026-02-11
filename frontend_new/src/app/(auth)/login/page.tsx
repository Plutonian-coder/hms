"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, GraduationCap, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
      setAuth(res.data.access_token, res.data.profile);
      toast.success("Identity Verified");
      router.push(`/${res.data.profile.role}`);
    } catch (err: any) {
      toast.error(err.message || "Access Denied");
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
      setAuth(res.data.access_token, res.data.profile);
      toast.success("Identity Verified");
      router.push("/student");
    } catch (err: any) {
      toast.error(err.message || "Access Denied");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="mb-8">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#CCFF00] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <GraduationCap className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-display font-black uppercase tracking-tighter">YABATECH HMS</span>
          </div>
          <h2 className="text-4xl font-display font-black uppercase tracking-tighter mb-2">Identify</h2>
          <p className="font-mono text-sm text-gray-500 uppercase tracking-wide">Enter credentials to access the grid.</p>
        </div>

        {/* Login mode toggle */}
        <div className="flex border-2 border-black p-1 mb-8 gap-1 bg-gray-100">
          <button
            onClick={() => setLoginMode("email")}
            className={cn(
              "flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 border-2",
              loginMode === "email"
                ? "bg-[#CCFF00] text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1"
                : "bg-transparent text-gray-500 border-transparent hover:bg-white hover:border-black"
            )}
          >
            Email Access
          </button>
          <button
            onClick={() => setLoginMode("matric")}
            className={cn(
              "flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 border-2",
              loginMode === "matric"
                ? "bg-[#CCFF00] text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1"
                : "bg-transparent text-gray-500 border-transparent hover:bg-white hover:border-black"
            )}
          >
            Matric Access
          </button>
        </div>

        {loginMode === "email" ? (
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOU@EXAMPLE.COM"
                icon={<Mail className="w-5 h-5" />}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest">Password</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              variant="brutal"
              size="xl"
              className="w-full"
            >
              {isLoading ? "Authenticating..." : "Access System"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleMatricLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">Matriculation Number</label>
              <Input
                type="text"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                placeholder="F/ND/23/3210137"
                icon={<GraduationCap className="w-5 h-5" />}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">Surname</label>
              <Input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="ENTER SURNAME"
                icon={<User className="w-5 h-5" />}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              variant="brutal"
              size="xl"
              className="w-full"
            >
              {isLoading ? "Authenticating..." : "Access System"}
            </Button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
          <div className="text-center space-y-4">
            <p className="text-sm font-mono font-bold">
              NO CREDENTIALS?{" "}
              <Link href="/register" className="text-[#0047FF] hover:underline decoration-2 underline-offset-4">
                INITIATE REGISTRATION
              </Link>
            </p>
            <p>
              <Link href="/" className="text-xs text-gray-400 font-mono hover:text-black uppercase">
                [ View Allocation Status Publicly ]
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
