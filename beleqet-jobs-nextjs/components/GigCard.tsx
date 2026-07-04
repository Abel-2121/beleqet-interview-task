import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Calendar,
  Clock,
  Tag,
  Users,
  Zap,
} from "lucide-react";
import type { FreelanceJob } from "@/lib/api";

// Cycling colour themes for gig cards
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

type GigCardData = FreelanceJob & {
  budgetMin?: number;
  budgetMax?: number;
  deadlineDays?: number;
  pricingType?: string;
  _count?: { bids: number };
  bidCount?: number;
  category?: { label?: string; name?: string; slug?: string };
  client?: { firstName?: string; lastName?: string };
};

// Format posted date to relative time string
const formatDate = (dateString?: string) => {
  if (!dateString) return "Recently posted";
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "1d ago";
  return `${diffInDays}d ago`;
};

// Calculate remaining days or return deadline status
const formatDeadline = (gig: GigCardData) => {
  if (gig.deadlineDays != null) {
    if (gig.deadlineDays === 0) return "Due today";
    if (gig.deadlineDays === 1) return "1 day left";
    return `${gig.deadlineDays} days left`;
  }
  if (!gig.deadline) return "Flexible deadline";
  const deadline = new Date(gig.deadline);
  const diffInDays = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffInDays < 0) return "Expired";
  if (diffInDays === 0) return "Due today";
  if (diffInDays === 1) return "Due tomorrow";
  return `${diffInDays} days left`;
};

// Format budget range, fixed amount, or fallback message
const formatBudget = (gig: GigCardData) => {
  if (gig.budgetMin != null && gig.budgetMax != null) {
    return `${gig.budgetMin.toLocaleString()} – ${gig.budgetMax.toLocaleString()} ETB`;
  }
  if (gig.budget) {
    return `${gig.budget.toLocaleString()} ETB`;
  }
  return "Budget negotiable";
};

const getBidCount = (gig: GigCardData) =>
  gig.bidCount ?? gig._count?.bids ?? gig.bids?.length ?? 0;

const getClientName = (gig: GigCardData) => {
  if (gig.client?.firstName || gig.client?.lastName) {
    return `${gig.client.firstName ?? ""} ${gig.client.lastName ?? ""}`.trim();
  }
  return "Verified client";
};

/** Freelance gig card with gradient header, budget, deadline, skills, and bid count. */
export default function GigCard({
  gig,
  index = 0,
}: {
  gig: GigCardData;
  index?: number;
}) {
  const theme = CARD_THEMES[index % CARD_THEMES.length];
  const categoryLabel = gig.category?.label || gig.category?.name;
  const bidCount = getBidCount(gig);
  const clientName = getClientName(gig);
  const pricingLabel = gig.pricingType || gig.budgetType || "Fixed price";

  return (
    <Link
      href={`/freelance/${gig.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brandGreen/30 hover:shadow-cardHover"
    >
      <div className={`relative bg-gradient-to-br ${theme.gradient} px-4 pt-4 pb-5`}>
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#041603_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="relative flex items-start justify-between gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${theme.badge}`}>
            <Zap className="h-3 w-3" />
            {categoryLabel || "Freelance"}
          </span>
          <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold text-muted backdrop-blur-sm">
            {pricingLabel}
          </span>
        </div>

        <h3 className="relative mt-3 line-clamp-2 text-lg font-bold leading-snug text-ink group-hover:text-brandGreen">
          {gig.title}
        </h3>
        <p className="relative mt-1 text-xs font-medium text-muted/90">{clientName}</p>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm text-muted">{gig.description}</p>

        {gig.skills && gig.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {gig.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-full bg-pageBg px-2 py-0.5 text-[10px] font-medium text-muted"
              >
                <Tag className="h-2.5 w-2.5" />
                {skill}
              </span>
            ))}
            {gig.skills.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] text-muted">+{gig.skills.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-brandGreen/5 px-2.5 py-1.5 text-xs font-bold text-brandGreen">
          <Banknote className="h-3.5 w-3.5" />
          {formatBudget(gig)}
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-muted">
          <span className="flex items-center gap-2">
            <Calendar className={`h-3.5 w-3.5 shrink-0 ${theme.accent}`} />
            {formatDeadline(gig)}
          </span>
          <span className="flex items-center gap-2">
            <Clock className={`h-3.5 w-3.5 shrink-0 ${theme.accent}`} />
            Posted {formatDate(gig.createdAt)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
            <Users className="h-3.5 w-3.5" />
            {bidCount > 0 ? `${bidCount} bid${bidCount !== 1 ? "s" : ""}` : "Be the first to bid"}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-bold text-ink transition-colors ${theme.cta}`}>
            View gig
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
