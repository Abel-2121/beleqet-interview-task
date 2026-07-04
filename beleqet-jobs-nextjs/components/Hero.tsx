"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Search, MapPin, ShieldCheck, BellRing, Send } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { popularSearches } from "@/lib/mockData";
import MobilePreview from "./MobilePreview";

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.3]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("loc", location);
    router.push(`/jobs?${params.toString()}`);
  }

  const trustItems = [
    { icon: ShieldCheck, color: "text-success", title: "Verified & Trusted", desc: "100% verified job listings" },
    { icon: BellRing, color: "text-cyanAccent", title: "Real-time Alerts", desc: "Get instant job updates" },
    { icon: Send, color: "text-cyanAccent", title: "Telegram Notifications", desc: "Never miss an opportunity" },
  ];

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-gradient-to-br from-primary via-primary2 to-darkGreen text-white"
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.25),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(56,189,248,0.18),transparent_45%)]" />

      <motion.div
        className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-success/20 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 right-0 w-[360px] h-[360px] rounded-full bg-cyanAccent/15 blur-[90px] pointer-events-none"
        animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container-page relative pt-8 md:pt-12 pb-16 md:pb-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.span
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-bold tracking-wider text-white/90 mb-4"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Ethiopia&apos;s trusted job platform
          </motion.span>

          <motion.h1
            className="text-hero"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
          >
            Find Your Next{" "}
            <motion.span
              className="text-success inline-block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.35 }}
            >
              Opportunity
            </motion.span>{" "}
            Faster.
          </motion.h1>

          <motion.p
            className="mt-5 text-white/70 max-w-md text-base leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.42 }}
          >
            Discover thousands of verified job opportunities across Ethiopia. Search, apply, and get hired faster with
            the Beleqet Vacancy Platform.
          </motion.p>

          <motion.form
            onSubmit={handleSearch}
            className="mt-8 bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-cardHover"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center flex-1 gap-2 px-3 py-2 rounded-xl">
              <Search className="h-4 w-4 text-muted shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Job title, keyword or company"
                className="w-full text-sm text-ink placeholder:text-muted outline-none"
              />
            </div>
            <div className="hidden sm:block w-px bg-border my-1" />
            <div className="flex items-center flex-1 gap-2 px-3 py-2 rounded-xl">
              <MapPin className="h-4 w-4 text-muted shrink-0" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location e.g. Addis Ababa"
                className="w-full text-sm text-ink placeholder:text-muted outline-none"
              />
            </div>
            <motion.button
              type="submit"
              className="shrink-0 inline-flex items-center justify-center rounded-xl bg-brandGreen px-6 py-3 text-sm font-semibold text-white hover:bg-darkGreen transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Search Jobs
            </motion.button>
          </motion.form>

          <motion.div
            className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <span>Popular Searches:</span>
            {popularSearches.map((term, i) => (
              <motion.button
                key={term}
                onClick={() => router.push(`/jobs?q=${encodeURIComponent(term)}`)}
                className="rounded-full border border-white/15 px-3 py-1 hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.06 }}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.12)" }}
                whileTap={{ scale: 0.97 }}
              >
                {term}
              </motion.button>
            ))}
          </motion.div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {trustItems.map((item, i) => (
              <motion.div
                key={item.title}
                className="flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 px-3 py-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.1, duration: 0.55 }}
                whileHover={{ y: -3, backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
                <div className="text-xs leading-tight">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-white/50">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="relative hidden md:block"
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <MobilePreview />
        </motion.div>
      </motion.div>
    </section>
  );
}
