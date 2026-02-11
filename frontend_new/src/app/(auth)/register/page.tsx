"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, GraduationCap, Phone, User, Building, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
      toast.error("PASSWORDS DO NOT MATCH");
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
      toast.success("REGISTRATION SUCCESSFUL. PROCEED TO LOGIN.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "REGISTRATION FAILED");
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
        <div className="mb-6">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#CCFF00] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <GraduationCap className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-display font-black uppercase tracking-tighter">YABATECH HMS</span>
          </div>
          <h2 className="text-4xl font-display font-black uppercase tracking-tighter mb-2">New Entry</h2>
          <p className="font-mono text-sm text-gray-500 uppercase tracking-wide">Register for hostel accommodation allocation.</p>
        </div>

        {/* Steps indicator */}
        <div className="flex gap-1 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="h-2 flex-1 relative bg-gray-200 border border-black">
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-300",
                  s <= step ? "bg-[#CCFF00]" : "bg-transparent"
                )}
              />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest">First Name</label>
                  <Input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => updateField("first_name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Last Name</label>
                  <Input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => updateField("last_name", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Matric Number</label>
                <Input
                  type="text"
                  value={formData.matric_number}
                  onChange={(e) => updateField("matric_number", e.target.value)}
                  placeholder="F/ND/23/3210137"
                  icon={<GraduationCap className="w-5 h-5" />}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="YOU@EXAMPLE.COM"
                  icon={<Mail className="w-5 h-5" />}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Phone Number</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="08012345678"
                  icon={<Phone className="w-5 h-5" />}
                />
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                variant="brutal"
                size="xl"
                className="w-full mt-4"
              >
                PROCEED TO NEXT STEP
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className={cn(
                      "w-full bg-white border-b-2 border-black py-3 px-2 text-base font-medium text-black focus:outline-none focus:border-[#CCFF00] focus:bg-[#CCFF00]/10 transition-all duration-200 rounded-none uppercase"
                    )}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => updateField("level", e.target.value)}
                    className={cn(
                      "w-full bg-white border-b-2 border-black py-3 px-2 text-base font-medium text-black focus:outline-none focus:border-[#CCFF00] focus:bg-[#CCFF00]/10 transition-all duration-200 rounded-none uppercase"
                    )}
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Department</label>
                <Input
                  type="text"
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  placeholder="E.G. COMPUTER SCIENCE"
                  icon={<BookOpen className="w-5 h-5" />}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="MIN 8 CHARACTERS"
                    icon={<Lock className="w-5 h-5" />}
                    required
                    minLength={8}
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

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Confirm Password</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="RE-ENTER PASSWORD"
                  icon={<Lock className="w-5 h-5" />}
                  required
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-black text-black font-bold uppercase tracking-wider hover:bg-black hover:text-[#CCFF00] transition-all"
                >
                  Back
                </button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="brutal"
                  size="xl"
                  className="flex-1"
                >
                  {isLoading ? "CREATING..." : "COMPLETE REGISTRATION"}
                </Button>
              </div>
            </motion.div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
          <div className="text-center">
            <p className="text-sm font-mono font-bold">
              ALREADY REGISTERED?{" "}
              <Link href="/login" className="text-[#0047FF] hover:underline decoration-2 underline-offset-4">
                ACCESS SYSTEM
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
