"use client";

import { useRef } from "react";
import { Send } from "lucide-react";
import { motion, useInView } from "framer-motion";

/** Call-to-action banner promoting the Telegram job alert channel with scroll animation. */
export default function CTABanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="container-page pb-14" ref={ref}>
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-darkGreen text-white px-6 py-10 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6"
        initial={{ opacity: 0, y: 48 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="absolute right-0 top-0 w-72 h-72 bg-success/10 rounded-full blur-[80px] pointer-events-none"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="flex items-center gap-4 relative z-10">
          <motion.span
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-cyanAccent/20 text-cyanAccent shrink-0"
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Send className="h-5 w-5" />
          </motion.span>
          <div>
            <h3 className="text-lg font-bold">Never Miss an Opportunity</h3>
            <p className="text-sm text-white/70 mt-0.5">
              Join the Beleqet Telegram channel and get instant job alerts delivered directly to your phone.
            </p>
          </div>
        </div>

        <motion.a
          href="https://t.me"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 shrink-0 inline-flex items-center rounded-full bg-white text-primary px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition-colors"
          whileHover={{ scale: 1.05, x: 2 }}
          whileTap={{ scale: 0.97 }}
        >
          Join Telegram Channel →
        </motion.a>
      </motion.div>
    </section>
  );
}
