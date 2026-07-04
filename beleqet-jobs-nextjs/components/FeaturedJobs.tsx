'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { api, type Job, getApplicationCount } from "@/lib/api";
import FeaturedJobCard from "./FeaturedJobCard";
import RevealOnScroll from "./RevealOnScroll";
import { fadeLeft, fadeRight } from "@/lib/motion";

const POPULAR_LIMIT = 4;

// Sort jobs by application count, featured status, then recency
function pickPopularJobs(jobs: Job[]): Job[] {
  return [...jobs]
    .sort((a, b) => {
      const appsDiff = getApplicationCount(b) - getApplicationCount(a);
      if (appsDiff !== 0) return appsDiff;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, POPULAR_LIMIT);
}

/** Section displaying the top popular featured jobs in a 4-column grid. */
export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedJobs();
  }, []);

  // Fetch featured jobs and fall back to regular jobs if fewer than limit
  const loadFeaturedJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      let response = await api.getJobs({ limit: 20, page: 1, featured: true });
      let items = response.data.filter((job) => job.featured);

      if (items.length < POPULAR_LIMIT) {
        response = await api.getJobs({ limit: 20, page: 1 });
        const seen = new Set(items.map((job) => job.id));
        const extras = response.data.filter((job) => !seen.has(job.id));
        items = [...items, ...extras];
      }

      setJobs(pickPopularJobs(items));
    } catch (err) {
      console.error("Failed to load featured jobs:", err);
      setError("Failed to load featured jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white border-y border-border">
      <div className="container-page py-14">
        <div className="flex items-end justify-between mb-8">
          <RevealOnScroll variants={fadeRight}>
            <div>
              <h2 className="text-sectionH2">Featured Jobs</h2>
              <p className="text-muted text-sm mt-1">
                Top {POPULAR_LIMIT} popular openings — most applied roles from trusted employers.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll variants={fadeLeft} delay={0.1}>
            <motion.div whileHover={{ x: 4 }} className="hidden sm:block shrink-0">
              <Link href="/jobs" className="inline-flex items-center gap-1 text-sm font-semibold text-brandGreen hover:underline">
                View all jobs <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </RevealOnScroll>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: POPULAR_LIMIT }).map((_, i) => (
              <div key={i} className="h-[320px] rounded-2xl border border-border bg-pageBg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              type="button"
              onClick={loadFeaturedJobs}
              className="px-4 py-2 bg-brandGreen text-white rounded-lg hover:bg-darkGreen transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted">No featured jobs available at the moment.</p>
            <Link href="/post-job" className="text-brandGreen hover:underline text-sm mt-2 inline-block">
              Post the first job →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {jobs.map((job, index) => (
              <FeaturedJobCard key={job.id} job={job} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
