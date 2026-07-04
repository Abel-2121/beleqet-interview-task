import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Briefcase,
  Flame,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import type { Job } from "@/lib/api";
import { getApplicationCount, jobType as getJobType } from "@/lib/api";

// Cycling colour themes for popular-rank cards
const CARD_THEMES = [
  {
    gradient: "from-brandGreen/25 via-success/10 to-cyanAccent/20",
    accent: "text-brandGreen",
    badge: "bg-brandGreen/10 text-brandGreen",
    cta: "group-hover:text-brandGreen",
  },
  {
    gradient: "from-cyanAccent/25 via-brandGreen/10 to-success/15",
    accent: "text-cyanAccent",
    badge: "bg-cyanAccent/10 text-cyanAccent",
    cta: "group-hover:text-cyanAccent",
  },
  {
    gradient: "from-orangeAccent/20 via-brandGreen/10 to-success/10",
    accent: "text-orangeAccent",
    badge: "bg-orangeAccent/10 text-orangeAccent",
    cta: "group-hover:text-orangeAccent",
  },
  {
    gradient: "from-purpleAccent/20 via-brandGreen/10 to-cyanAccent/15",
    accent: "text-purpleAccent",
    badge: "bg-purpleAccent/10 text-purpleAccent",
    cta: "group-hover:text-purpleAccent",
  },
];

// Normalise API job type to display-friendly label
const formatJobType = (type: string) => {
  const map: Record<string, string> = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    CONTRACT: "Contract",
  };
  return map[type] || type;
};

// Format salary range or single bound as display string
const formatSalary = (job: Job) => {
  if (!job.salaryMin && !job.salaryMax) return null;
  if (job.salaryMin && job.salaryMax) {
    return `${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()} ETB`;
  }
  if (job.salaryMin) return `From ${job.salaryMin.toLocaleString()} ETB`;
  return `Up to ${job.salaryMax?.toLocaleString()} ETB`;
};

const companyInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "B";

/** Ranked featured job card with gradient header, company info, salary, and applicant count. */
export default function FeaturedJobCard({
  job,
  rank,
}: {
  job: Job;
  rank: number;
}) {
  const theme = CARD_THEMES[(rank - 1) % CARD_THEMES.length];
  const companyName = job.company?.name ?? "Company";
  const companyLogo = job.company?.logoUrl;
  const categoryLabel = job.category?.label || job.category?.name;
  const applicants = getApplicationCount(job);
  const salary = formatSalary(job);
  const type = formatJobType(getJobType(job));

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brandGreen/30 hover:shadow-cardHover"
    >
      <div className={`relative h-28 bg-gradient-to-br ${theme.gradient} px-4 pt-4`}>
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#041603_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="relative flex items-start justify-between gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${theme.badge}`}>
            <Flame className="h-3 w-3" />
            Popular #{rank}
          </span>
          {job.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold text-brandGreen backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
        </div>

        <div className="relative mt-4 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow-md">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="h-full w-full object-cover" />
            ) : (
              <span className={`text-lg font-extrabold ${theme.accent}`}>
                {companyInitial(companyName)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted/80">
              {companyName}
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-base font-bold leading-snug text-ink group-hover:text-brandGreen">
              {job.title}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {categoryLabel && (
          <span className="mb-3 inline-flex w-fit rounded-full bg-pageBg px-2.5 py-1 text-[10px] font-semibold text-muted">
            {categoryLabel}
          </span>
        )}

        <div className="space-y-2 text-xs text-muted">
          <span className="flex items-center gap-2">
            <MapPin className={`h-3.5 w-3.5 shrink-0 ${theme.accent}`} />
            <span className="truncate">{job.location}</span>
          </span>
          <span className="flex items-center gap-2">
            <Briefcase className={`h-3.5 w-3.5 shrink-0 ${theme.accent}`} />
            {type}
          </span>
        </div>

        {salary && (
          <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-brandGreen/5 px-2.5 py-1.5 text-xs font-bold text-brandGreen">
            <Banknote className="h-3.5 w-3.5" />
            {salary}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
            <Users className="h-3.5 w-3.5" />
            {applicants > 0 ? `${applicants} applied` : "Be an early applicant"}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-bold text-ink transition-colors ${theme.cta}`}>
            View
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
