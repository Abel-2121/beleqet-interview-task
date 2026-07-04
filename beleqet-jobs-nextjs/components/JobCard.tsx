import Link from "next/link";
import {
  MapPin,
  Bookmark,
  Building2,
  Briefcase,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  Banknote,
} from "lucide-react";
import type { Job } from "@/lib/api";
import { jobType as getJobType, getApplicationCount } from "@/lib/api";

// Normalise API job type to display label
const formatJobType = (type: string) => {
  const typeMap: Record<string, string> = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    CONTRACT: "Contract",
  };
  return typeMap[type] || type;
};

// Convert createdAt to relative time string
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "1d ago";
  return `${diffInDays}d ago`;
};

const formatSalary = (job: Job) => {
  if (!job.salaryMin && !job.salaryMax) return null;
  if (job.salaryMin && job.salaryMax) {
    return `${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()} ETB`;
  }
  if (job.salaryMin) return `From ${job.salaryMin.toLocaleString()} ETB`;
  return `Up to ${job.salaryMax?.toLocaleString()} ETB`;
};

const companyInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "B";

/** Job listing card showing company, title, type, location, salary, and applicant count. */
export default function JobCard({
  job,
  variant = "default",
}: {
  job: Job;
  variant?: "default" | "listing";
}) {
  const company = job.company;
  const companyName = company?.name ?? "Company";
  const companyLogo = company?.logoUrl;
  const type = getJobType(job);
  const applicants = getApplicationCount(job);
  const salary = formatSalary(job);
  const categoryLabel = job.category?.label || job.category?.name;
  const isListing = variant === "listing";

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-brandGreen/40 hover:shadow-cardHover ${
        job.featured
          ? "border-brandGreen/30 shadow-sm ring-1 ring-brandGreen/10"
          : "border-border shadow-card"
      } ${isListing ? "p-6" : "p-5"}`}
    >
      {job.featured && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brandGreen via-success to-cyanAccent" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brandGreen/10 to-brandGreen/5 text-brandGreen ${
              isListing ? "h-12 w-12" : "h-10 w-10"
            }`}
          >
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold">{companyInitial(companyName)}</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {job.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brandGreen/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brandGreen">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </span>
              )}
              {categoryLabel && (
                <span className="rounded-full bg-pageBg px-2 py-0.5 text-[10px] font-medium text-muted">
                  {categoryLabel}
                </span>
              )}
            </div>
            <h3
              className={`mt-1.5 line-clamp-2 font-bold leading-snug text-ink group-hover:text-brandGreen ${
                isListing ? "text-lg" : "text-cardH3"
              }`}
            >
              {job.title}
            </h3>
            <p className="mt-1 text-sm text-muted">{companyName}</p>
          </div>
        </div>

        <Bookmark className="h-4 w-4 shrink-0 text-muted/40 transition-colors group-hover:text-brandGreen" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brandGreen/70" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 shrink-0 text-brandGreen/70" />
          {formatJobType(type)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0 text-brandGreen/70" />
          {formatTimeAgo(job.createdAt)}
        </span>
      </div>

      {salary && (
        <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-brandGreen/5 px-3 py-1.5 text-xs font-semibold text-brandGreen">
          <Banknote className="h-3.5 w-3.5" />
          {salary}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-3">
          {applicants > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <Users className="h-3 w-3" />
              {applicants} applicant{applicants !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brandGreen opacity-0 transition-opacity group-hover:opacity-100">
          View job
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
