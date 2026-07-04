"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Laptop,
  Megaphone,
  Landmark,
  HeartPulse,
  GraduationCap,
  Cog,
  MoreHorizontal,
  ArrowRight,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { api, type JobCategory } from "@/lib/api";
import RevealOnScroll from "@/components/RevealOnScroll";
import { fadeLeft, fadeRight, shelfItem } from "@/lib/motion";

const iconMap: Record<string, LucideIcon> = {
  laptop: Laptop,
  megaphone: Megaphone,
  landmark: Landmark,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  cog: Cog,
  "more-horizontal": MoreHorizontal,
};

const CARD_THEMES = [
  {
    gradient: "from-brandGreen/20 via-success/10 to-cyanAccent/20",
    iconBg: "bg-gradient-to-br from-brandGreen to-darkGreen",
    badge: "bg-brandGreen/10 text-brandGreen",
  },
  {
    gradient: "from-cyanAccent/20 via-brandGreen/10 to-success/20",
    iconBg: "bg-gradient-to-br from-cyanAccent to-brandGreen",
    badge: "bg-cyanAccent/10 text-cyanAccent",
  },
  {
    gradient: "from-orangeAccent/15 via-brandGreen/10 to-success/15",
    iconBg: "bg-gradient-to-br from-orangeAccent to-brandGreen",
    badge: "bg-orangeAccent/10 text-orangeAccent",
  },
  {
    gradient: "from-purpleAccent/15 via-brandGreen/10 to-cyanAccent/15",
    iconBg: "bg-gradient-to-br from-purpleAccent to-brandGreen",
    badge: "bg-purpleAccent/10 text-purpleAccent",
  },
];

const getIconFromCategoryName = (name: string | undefined): string => {
  if (!name) return "more-horizontal";
  const lower = name.toLowerCase();
  if (lower.includes("tech") || lower.includes("software") || lower.includes("it")) return "laptop";
  if (lower.includes("marketing") || lower.includes("advertising") || lower.includes("sales")) return "megaphone";
  if (lower.includes("finance") || lower.includes("banking") || lower.includes("accounting")) return "landmark";
  if (lower.includes("health") || lower.includes("medical")) return "heart-pulse";
  if (lower.includes("education") || lower.includes("teaching")) return "graduation-cap";
  if (lower.includes("engineering") || lower.includes("construction")) return "cog";
  return "more-horizontal";
};

type CategoryItem = JobCategory & { name: string };

export default function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const shelfRef = useRef(null);
  const shelfInView = useInView(shelfRef, { once: true, margin: "-60px" });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesResponse = await api.getJobCategories();
      const categoriesData: CategoryItem[] = (Array.isArray(categoriesResponse) ? categoriesResponse : [])
        .map((cat: JobCategory & { label?: string }) => ({
          id: cat.id,
          slug: cat.slug,
          name: cat.label || cat.name || "Unknown",
          jobCount: cat.jobCount || 0,
        }))
        .sort((a, b) => (b.jobCount || 0) - (a.jobCount || 0))
        .slice(0, 4);

      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Failed to load job categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-page py-14">
      <div className="flex items-end justify-between mb-2">
        <RevealOnScroll variants={fadeRight}>
          <div>
            <h2 className="text-sectionH2">Browse Jobs by Category</h2>
            <p className="text-muted text-sm mt-1">
              Top industries hiring right now — explore the most active categories on Beleqet.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll variants={fadeLeft} delay={0.1}>
          <motion.div whileHover={{ x: 4 }} className="hidden sm:block shrink-0">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-xs font-bold text-brandGreen hover:text-darkGreen hover:underline uppercase tracking-wide"
            >
              View all categories <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </RevealOnScroll>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandGreen" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            type="button"
            onClick={loadCategories}
            className="px-4 py-2 bg-brandGreen text-white rounded-lg hover:bg-darkGreen transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted">No categories available at the moment.</p>
        </div>
      ) : (
        <motion.div
          ref={shelfRef}
          className="flex gap-6 mt-8 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory -mx-1 px-1"
          initial="hidden"
          animate={shelfInView || categories.length > 0 ? "visible" : "hidden"}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18, delayChildren: 0.12 } } }}
        >
          {categories.map((cat, index) => {
            const iconName = getIconFromCategoryName(cat.name);
            const Icon = iconMap[iconName] ?? MoreHorizontal;
            const theme = CARD_THEMES[index % CARD_THEMES.length];
            const jobCount = cat.jobCount ?? 0;

            return (
              <motion.div key={cat.id} variants={shelfItem} className="snap-start shrink-0">
                <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25 }}>
                  <Link
                    href={`/jobs?category=${cat.slug || cat.id}`}
                    className="group relative block min-w-[280px] w-[280px] bg-white rounded-2xl border border-border shadow-sm overflow-hidden p-4 hover:shadow-cardHover transition-shadow"
                  >
                  <motion.div
                    className={`relative h-36 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center mb-4 overflow-hidden`}
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#041603_1px,transparent_1px)] [background-size:20px_20px]" />
                    <motion.div
                      className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${theme.iconBg} text-white shadow-lg`}
                      whileHover={{ rotate: 6, scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    >
                      <Icon className="h-8 w-8" />
                    </motion.div>
                  </motion.div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5 gap-2">
                      <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider truncate">
                        {cat.slug?.replace(/-/g, " ") || "Industry"}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 ${theme.badge}`}>
                        {jobCount} {jobCount === 1 ? "job" : "jobs"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-ink group-hover:text-brandGreen transition-colors line-clamp-2">
                      {cat.name}
                    </h3>

                    <p className="text-xs text-muted mt-1 flex items-center gap-1">
                      <Briefcase className="h-3 w-3 shrink-0" />
                      Verified openings from trusted employers
                    </p>

                    <p className="text-sm font-extrabold text-brandGreen mt-3 flex items-center gap-1">
                      Browse jobs
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                  </Link>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}
