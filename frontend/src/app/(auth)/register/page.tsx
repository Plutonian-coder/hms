"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, GraduationCap, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    matric_number: "",
    first_name: "",
    last_name: "",
    gender: "male",
    level: "100",
    department: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        email: formData.email,
        password: formData.password,
        matric_number: formData.matric_number,
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender,
        level: parseInt(formData.level),
        department: formData.department,
        phone: formData.phone,
      });
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">YABATECH HMS</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
          <p className="text-gray-500 mt-1">Register for hostel accommodation</p>
        </div>

        {/* Steps indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? "bg-lime-500" : "bg-lime-200"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => updateField("first_name", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => updateField("last_name", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                <input
                  type="text"
                  value={formData.matric_number}
                  onChange={(e) => updateField("matric_number", e.target.value)}
                  placeholder="YABATECH/2024/ND/CSC/001"
                  className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="08012345678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
              </div>

              <motion.button
                type="button"
                onClick={() => setStep(2)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-xl shadow-lg shadow-lime-600/20 transition-colors"
              >
                Continue
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => updateField("level", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2.5 rounded-xl border border-lime-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-lime-300 text-lime-700 font-semibold rounded-xl hover:bg-lime-50 transition-colors"
                >
                  Back
                </button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-3 bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-xl shadow-lg shadow-lime-600/20 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Register"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-lime-600 font-semibold hover:text-lime-700">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
