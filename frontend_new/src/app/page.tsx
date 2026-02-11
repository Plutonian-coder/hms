"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Search, Building2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [matricNumber, setMatricNumber] = useState("");
  const [allocation, setAllocation] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNumber.trim()) return;
    setIsSearching(true);
    setSearched(true);
    setAllocation(null);
    try {
      const res: any = await api.get(`/public/allocation/${encodeURIComponent(matricNumber)}`);
      setAllocation(res.data);
    } catch {
      setAllocation(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-paper font-sans text-black overflow-x-hidden selection:bg-brand-lime selection:text-black">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b-2 border-black bg-brand-paper">
        <div className="flex justify-between items-center h-20 px-6 md:px-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-lime border-2 border-black flex items-center justify-center">
              <span className="font-display font-bold text-lg">H</span>
            </div>
            <span className="font-display font-black text-xl tracking-tighter uppercase">HMS.OS</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden md:flex">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 border-b-2 border-black bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="text-7xl md:text-9xl font-display font-black uppercase leading-[0.8] tracking-tighter mb-12 text-center md:text-left"
          >
            Hostel<br />
            Management<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lime to-brand-blue">System</span>
          </motion.h1>

          <div className="grid md:grid-cols-2 gap-12 items-end">
            <motion.p
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl font-medium leading-tight max-w-md"
            >
              The official accommodation portal for YABATECH students. Secure your space, check status, and manage your stay.
            </motion.p>

            <div className="flex gap-4">
              <Link href="/register" className="w-full md:w-auto">
                <Button size="xl" variant="brutal" className="w-full md:w-auto flex items-center gap-2">
                  Apply Now <ArrowRight className="w-6 h-6" />
                </Button>
              </Link>
              <Link href="/login" className="w-full md:w-auto">
                <Button size="xl" variant="outline" className="w-full md:w-auto">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-b-2 border-black bg-brand-lime overflow-hidden py-4">
        <div className="animate-marquee whitespace-nowrap flex gap-8">
          {Array(10).fill("YABATECH HOSTEL PORTAL • SECURE ACCOMMODATION • STUDENT LIFE •").map((text, i) => (
            <span key={i} className="text-2xl font-display font-bold uppercase tracking-widest">{text}</span>
          ))}
        </div>
      </div>

      {/* Allocation Checker */}
      <section className="py-24 px-6 md:px-12 bg-brand-paper border-b-2 border-black">
        <div className="max-w-4xl mx-auto">
          <div className="brutalist-card p-8 md:p-12 relative">
            <div className="absolute top-0 right-0 p-4 bg-black text-white font-mono text-xs uppercase font-bold border-l-2 border-b-2 border-black">
              Live Status
            </div>

            <h2 className="text-4xl md:text-5xl font-display font-black uppercase mb-6">Check Allocation</h2>
            <p className="text-xl mb-8 font-medium text-gray-600">Enter your matric number to view your hostel details instantly.</p>

            <form onSubmit={handleLookup} className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <Input
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  placeholder="Enter Matric Number (e.g. F/ND/23/3210137)"
                  className="text-lg py-6"
                />
              </div>
              <Button type="submit" size="lg" disabled={isSearching} className="h-auto">
                {isSearching ? "Searching..." : "Check Status"}
              </Button>
            </form>

            {searched && !isSearching && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-brand-lime/20 border-2 border-black p-6"
              >
                {allocation ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-8 h-8 text-black" />
                      <h3 className="text-2xl font-display font-bold uppercase">Allocation Found</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-white border-2 border-black">
                        <span className="block text-xs font-bold uppercase text-gray-500 mb-1">Hostel</span>
                        <span className="font-bold text-lg">{allocation.hostel_name}</span>
                      </div>
                      <div className="p-4 bg-white border-2 border-black">
                        <span className="block text-xs font-bold uppercase text-gray-500 mb-1">Room</span>
                        <span className="font-bold text-lg">{allocation.room_number}</span>
                      </div>
                      <div className="p-4 bg-white border-2 border-black">
                        <span className="block text-xs font-bold uppercase text-gray-500 mb-1">Bed</span>
                        <span className="font-bold text-lg">{allocation.bed_space_number}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xl font-bold uppercase text-brand-rose">No allocation found</p>
                    <p className="font-medium">Please verify your matric number.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b-2 border-black">
        <div className="p-12 border-b-2 md:border-b-0 md:border-r-2 border-black bg-white hover:bg-brand-lime transition-colors duration-300 group">
          <h3 className="text-3xl font-display font-black uppercase mb-4 group-hover:translate-x-2 transition-transform">01. Register</h3>
          <p className="text-lg font-medium">Create your student profile using your matriculation number. Fast and secure.</p>
        </div>
        <div className="p-12 border-b-2 md:border-b-0 md:border-r-2 border-black bg-white hover:bg-brand-rose hover:text-white transition-colors duration-300 group">
          <h3 className="text-3xl font-display font-black uppercase mb-4 group-hover:translate-x-2 transition-transform">02. Apply</h3>
          <p className="text-lg font-medium">Select your preferred hostel and submit your application for the current session.</p>
        </div>
        <div className="p-12 bg-white hover:bg-brand-blue hover:text-white transition-colors duration-300 group">
          <h3 className="text-3xl font-display font-black uppercase mb-4 group-hover:translate-x-2 transition-transform">03. Move In</h3>
          <p className="text-lg font-medium">Get your digital clearance and move into your allocated room seamlessly.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end">
          <div>
            <h2 className="text-8xl font-display font-black text-brand-lime opacity-50 select-none">HMS</h2>
            <p className="text-xl font-mono mt-4">YABATECH HOSTEL PORTAL V2.0</p>
          </div>
          <div className="flex flex-col items-end gap-2 mt-8 md:mt-0">
            <Link href="/login" className="text-lg font-bold uppercase hover:text-brand-lime hover:underline">Admin Login</Link>
            <Link href="/login" className="text-lg font-bold uppercase hover:text-brand-lime hover:underline">Warden Login</Link>
            <span className="text-gray-500 mt-4">© 2025 Yaba College of Technology</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
