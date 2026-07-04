"use client";

import { useRef } from "react";
import { ShieldCheck, Zap, BellRing, Send, Smartphone } from "lucide-react";
import { motion, useInView } from "framer-motion";
import RevealOnScroll from "./RevealOnScroll";
import { fadeUp } from "@/lib/motion";

// Trust features displayed as animated cards
const features = [
  { icon: ShieldCheck, title: "Trusted Platform", desc: "All jobs are verified for your security." },
  { icon: Zap, title: "Fast & Easy", desc: "Search and apply in just a few clicks." },
  { icon: BellRing, title: "Real-time Updates", desc: "Get instant alerts every step." },
  { icon: Send, title: "Telegram Alerts", desc: "Get instant job alerts on Telegram." },
];

/** Section highlighting platform trust factors with animated feature cards. */
export default function WhyChoose() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="container-page py-14">
      <RevealOnScroll variants={fadeUp}>
        <h2 className="text-sectionH2 mb-8">Why Choose Beleqet?</h2>
      </RevealOnScroll>

      <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="rounded-xl border border-border bg-white p-5"
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, boxShadow: "0 16px 32px rgba(4,22,3,0.08)" }}
          >
            <motion.span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brandGreen/10 text-brandGreen mb-3"
              whileHover={{ scale: 1.1, rotate: 6 }}
            >
              <f.icon className="h-4.5 w-4.5" />
            </motion.span>
            <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
            <p className="text-xs text-muted mt-1">{f.desc}</p>
          </motion.div>
        ))}

        <motion.div
          className="rounded-xl bg-primary text-white p-5 flex flex-col justify-between"
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.65, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.02 }}
        >
          <div>
            <motion.span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 mb-3"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Smartphone className="h-4.5 w-4.5" />
            </motion.span>
            <h3 className="text-sm font-semibold">Search on the go!</h3>
            <p className="text-xs text-white/60 mt-1">Access thousands of jobs anytime, anywhere.</p>
          </div>
          <div className="flex flex-col gap-1.5 mt-4 text-[11px]">
            <span className="rounded-md bg-white/10 px-2.5 py-1.5 text-center">▶ Google Play</span>
            <span className="rounded-md bg-white/10 px-2.5 py-1.5 text-center"> App Store</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
