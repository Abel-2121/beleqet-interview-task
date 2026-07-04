"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { api, type Job, type JobCategory } from "@/lib/api";
import JobCard from "@/components/JobCard";
import JobsFilterSidebar, { type FilterCategory } from "@/components/JobsFilterSidebar";

export default function JobsListing() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("loc") ?? "");
  const [category, setCategory] = useState<string>(searchParams.get("category") ?? "");
  const [type, setType] = useState<string>("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadJobsAndCategories();
  }, []);

  useEffect(() => {
    if (loading) return;
    loadJobs();
  }, [query, location, category, type, currentPage]);

  const loadJobsAndCategories = async () => {
    setLoading(true);
    try {
      const categoriesResponse = await api.getJobCategories();
      const categoriesData: FilterCategory[] = (Array.isArray(categoriesResponse) ? categoriesResponse : []).map((cat: JobCategory & { label?: string }) => ({
        id: cat.id,
        slug: cat.slug || cat.id,
        name: cat.label || cat.name || "Unknown",
        jobCount: cat.jobCount || 0,
      }));
      setCategories(categoriesData);
      await loadJobs();
    } catch (error) {
      console.error("Failed to load jobs and categories:", error);
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const params = {
        ...(query && { q: query }),
        ...(location && { location }),
        ...(category && { category }),
        ...(type && { type }),
        page: currentPage,
        limit: 20,
      };
      const response = await api.getJobs(params);
      setJobs(response.data);
      setTotalJobs(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      setJobs([]);
      setTotalJobs(0);
      setTotalPages(1);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setCurrentPage(1);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setCategory("");
    setType("");
    setCurrentPage(1);
  };

  const activeFilterCount = [category, type].filter(Boolean).length;
  const filtered = useMemo(() => jobs, [jobs]);

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <h1 className="text-pageH1">Search verified jobs from trusted employers.</h1>
        <p className="text-muted text-sm mt-2">
          {loading ? "Loading..." : `${totalJobs} jobs found`}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-2 flex flex-col sm:flex-row gap-2 mb-8">
        <div className="flex items-center flex-1 gap-2 px-3 py-2.5 rounded-xl focus-within:ring-2 focus-within:ring-brandGreen/20">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Job title, keyword or company"
            className="w-full text-sm text-ink placeholder:text-muted outline-none"
            disabled={loading}
          />
        </div>
        <div className="hidden sm:block w-px bg-border my-1" />
        <div className="flex items-center flex-1 gap-2 px-3 py-2.5 rounded-xl focus-within:ring-2 focus-within:ring-brandGreen/20">
          <MapPin className="h-4 w-4 text-muted shrink-0" />
          <input
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="Location"
            className="w-full text-sm text-ink placeholder:text-muted outline-none"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        <JobsFilterSidebar
          categories={categories}
          category={category}
          type={type}
          loading={loading}
          onCategoryChange={handleCategoryChange}
          onTypeChange={handleTypeChange}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />

        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
              <p className="text-ink font-semibold">No jobs match your filters</p>
              <p className="text-sm text-muted mt-1">Try adjusting your search or clearing filters.</p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-brandGreen hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {filtered.map((job) => (
                  <JobCard key={job.id} job={job} variant="listing" />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm bg-white border border-border rounded-lg hover:border-brandGreen disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? "bg-brandGreen text-white"
                              : "bg-white border border-border hover:border-brandGreen"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm bg-white border border-border rounded-lg hover:border-brandGreen disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
