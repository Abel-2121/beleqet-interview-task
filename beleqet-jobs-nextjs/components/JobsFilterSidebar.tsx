"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  ChevronDown,
  Home,
  Laptop,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Timer,
  Users,
} from "lucide-react";

export interface FilterCategory {
  id: string;
  slug: string;
  name: string;
  jobCount: number;
}

interface JobsFilterSidebarProps {
  categories: FilterCategory[];
  category: string;
  type: string;
  loading: boolean;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

// Available job type filters with icons
const jobTypes = [
  { value: "FULL_TIME", label: "Full Time", icon: Briefcase },
  { value: "PART_TIME", label: "Part Time", icon: Timer },
  { value: "REMOTE", label: "Remote", icon: Laptop },
  { value: "HYBRID", label: "Hybrid", icon: Home },
  { value: "CONTRACT", label: "Contract", icon: Users },
];

/** Sidebar with category search/filter and job type pill selectors. */
export default function JobsFilterSidebar({
  categories,
  category,
  type,
  loading,
  onCategoryChange,
  onTypeChange,
  onClearFilters,
  activeFilterCount,
}: JobsFilterSidebarProps) {
  const [categorySearch, setCategorySearch] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [typesOpen, setTypesOpen] = useState(true);

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, categorySearch]);

  const selectedCategoryName = categories.find(
    (c) => (c.slug || c.id) === category,
  )?.name;

  return (
    <aside className="lg:sticky lg:top-24 space-y-4">
      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-brandGreen to-darkGreen px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <h2 className="text-sm font-semibold tracking-wide">Filters</h2>
            </div>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-white/80">Narrow results by category and work type</p>
        </div>

        {(category || type) && (
          <div className="border-b border-border px-5 py-3 bg-pageBg/60">
            <div className="flex flex-wrap gap-2">
              {category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brandGreen/10 px-3 py-1 text-xs font-medium text-brandGreen">
                  <Building2 className="h-3 w-3" />
                  {selectedCategoryName || category}
                </span>
              )}
              {type && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brandGreen/10 px-3 py-1 text-xs font-medium text-brandGreen">
                  {jobTypes.find((t) => t.value === type)?.label || type}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClearFilters}
              disabled={loading}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brandGreen transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          </div>
        )}

        <div className="p-5 space-y-6">
          <section>
            <button
              type="button"
              onClick={() => setCategoriesOpen((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-semibold text-ink mb-3"
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brandGreen" />
                Category
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted transition-transform ${categoriesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {categoriesOpen && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                  <input
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full rounded-xl border border-border bg-pageBg/50 py-2 pl-9 pr-3 text-xs text-ink placeholder:text-muted outline-none focus:border-brandGreen focus:ring-2 focus:ring-brandGreen/20"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  <FilterOption
                    active={category === ""}
                    disabled={loading}
                    onClick={() => onCategoryChange("")}
                    label="All Categories"
                    count={categories.reduce((sum, c) => sum + (c.jobCount || 0), 0)}
                  />
                  {filteredCategories.map((cat) => (
                    <FilterOption
                      key={cat.id}
                      active={category === (cat.slug || cat.id)}
                      disabled={loading}
                      onClick={() => onCategoryChange(cat.slug || cat.id)}
                      label={cat.name}
                      count={cat.jobCount || 0}
                    />
                  ))}
                  {filteredCategories.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted">No categories match your search.</p>
                  )}
                </div>
              </div>
            )}
          </section>

          <div className="h-px bg-border" />

          <section>
            <button
              type="button"
              onClick={() => setTypesOpen((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-semibold text-ink mb-3"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brandGreen" />
                Job Type
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted transition-transform ${typesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {typesOpen && (
              <div className="flex flex-wrap gap-2">
                <TypePill
                  active={type === ""}
                  disabled={loading}
                  onClick={() => onTypeChange("")}
                  label="All"
                />
                {jobTypes.map(({ value, label, icon: Icon }) => (
                  <TypePill
                    key={value}
                    active={type === value}
                    disabled={loading}
                    onClick={() => onTypeChange(value)}
                    label={label}
                    icon={<Icon className="h-3 w-3" />}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </aside>
  );
}

/** Single category filter row with active state and job count badge. */
function FilterOption({
  active,
  disabled,
  onClick,
  label,
  count,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
        active
          ? "bg-brandGreen text-white shadow-sm"
          : "text-ink hover:bg-pageBg"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className={`truncate pr-2 ${active ? "font-medium" : ""}`}>{label}</span>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          active ? "bg-white/20 text-white" : "bg-pageBg text-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/** Pill-style toggle button for job type filters. */
function TypePill({
  active,
  disabled,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-brandGreen bg-brandGreen text-white shadow-sm"
          : "border-border bg-white text-muted hover:border-brandGreen/40 hover:text-brandGreen"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {icon}
      {label}
    </button>
  );
}
