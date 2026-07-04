"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Calendar, DollarSign } from "lucide-react";
import { api, type FreelanceJob, type JobCategory } from "@/lib/api";
import GigCard from "@/components/GigCard";

export default function FreelanceListing() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<string>("");
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [daysLeft, setDaysLeft] = useState<string>("");

  // State for API data
  const [gigs, setGigs] = useState<FreelanceJob[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalGigs, setTotalGigs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);

  // Load gigs and categories from API
  useEffect(() => {
    loadGigsAndCategories();
  }, []);

  // Reload gigs when filters change
  useEffect(() => {
    if (loading) return;
    loadGigs();
  }, [query, category, minBudget, maxBudget, daysLeft, currentPage]);

  const loadGigsAndCategories = async () => {
    setLoading(true);
    try {
      // Load categories
      const categoriesResponse = await api.getJobCategories();
      const categoriesData = (Array.isArray(categoriesResponse) ? categoriesResponse : []).map((cat: any) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.label || cat.name || 'Unknown',
        jobCount: cat.jobCount || 0,
      }));
      setCategories(categoriesData);

      // Load initial gigs
      await loadGigs();
    } catch (error) {
      console.error('Failed to load gigs and categories:', error);
      setGigs([]);
      setTotalGigs(0);
    } finally {
      setLoading(false);
    }
  };

  const loadGigs = async () => {
    try {
      const searchParams = {
        ...(query && { q: query }),
        ...(category && { category }),
        ...(minBudget && { minBudget: Number(minBudget) }),
        ...(maxBudget && { maxBudget: Number(maxBudget) }),
        page: currentPage,
        limit: 20,
      };

      const response = await api.getFreelanceJobs(searchParams);
      setGigs(response.data || []);
      setTotalGigs(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to load freelance jobs:', error);
      setGigs([]);
      setTotalGigs(0);
      setTotalPages(1);
    }
  };

  // Handle search input changes
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinBudget(value);
    } else {
      setMaxBudget(value);
    }
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return gigs;
  }, [gigs]);

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <h1 className="text-pageH1">Find freelance projects & gigs</h1>
        <p className="text-muted text-sm mt-2">
          {loading ? 'Loading...' : `${totalGigs} gigs available`}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-2 flex flex-col sm:flex-row gap-2 mb-8">
        <div className="flex items-center flex-1 gap-2 px-3 py-2.5 rounded-xl">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Project title, keyword or skill"
            className="w-full text-sm text-ink placeholder:text-muted outline-none"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-5">
            <button
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              className="flex items-center gap-2 text-sm font-semibold text-ink mb-4 w-full hover:text-brandGreen transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" /> 
              <span>Category</span>
              <span className="ml-auto text-xs text-muted">
                {isCategoriesExpanded ? '▼' : '▶'}
              </span>
            </button>
            {isCategoriesExpanded && (
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange("")}
                  disabled={loading}
                  className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    category === "" ? "bg-brandGreen/10 text-brandGreen font-semibold" : "text-muted hover:bg-pageBg"
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  All Categories
                </button>
                {categories.slice(0, 10).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug || cat.id)}
                    disabled={loading}
                    className={`flex w-full items-center justify-between text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      category === (cat.slug || cat.id) ? "bg-brandGreen/10 text-brandGreen font-semibold" : "text-muted hover:bg-pageBg"
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs">{cat.jobCount || 0}</span>
                  </button>
                ))}
                {categories.length > 10 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted hover:text-brandGreen py-2">
                      + {categories.length - 10} more categories
                    </summary>
                    <div className="space-y-2 mt-2">
                      {categories.slice(10).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryChange(cat.slug || cat.id)}
                          disabled={loading}
                          className={`flex w-full items-center justify-between text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                            category === (cat.slug || cat.id) ? "bg-brandGreen/10 text-brandGreen font-semibold" : "text-muted hover:bg-pageBg"
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span>{cat.name}</span>
                          <span className="text-xs">{cat.jobCount || 0}</span>
                        </button>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Range
            </h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="minBudget" className="text-xs text-muted mb-1 block">
                  Minimum
                </label>
                <input
                  id="minBudget"
                  type="number"
                  value={minBudget}
                  onChange={(e) => handleBudgetChange('min', e.target.value)}
                  placeholder="Min budget"
                  className="w-full px-2 py-2 text-sm border border-border rounded-lg outline-none focus:border-brandGreen"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="maxBudget" className="text-xs text-muted mb-1 block">
                  Maximum
                </label>
                <input
                  id="maxBudget"
                  type="number"
                  value={maxBudget}
                  onChange={(e) => handleBudgetChange('max', e.target.value)}
                  placeholder="Max budget"
                  className="w-full px-2 py-2 text-sm border border-border rounded-lg outline-none focus:border-brandGreen"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Deadline
            </h3>
            <select
              value={daysLeft}
              onChange={(e) => {
                setDaysLeft(e.target.value);
                setCurrentPage(1);
              }}
              disabled={loading}
              className="w-full px-2 py-2 text-sm border border-border rounded-lg outline-none focus:border-brandGreen"
            >
              <option value="">Any deadline</option>
              <option value="7">Due in 7 days</option>
              <option value="14">Due in 14 days</option>
              <option value="30">Due in 30 days</option>
            </select>
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
              <p className="text-ink font-semibold">No gigs match your filters</p>
              <p className="text-sm text-muted mt-1">Try adjusting your search or clearing filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filtered.map((gig, index) => (
                  <GigCard key={gig.id} gig={gig} index={index} />
                ))}
              </div>
              
              {/* Pagination */}
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
                              ? 'bg-brandGreen text-white'
                              : 'bg-white border border-border hover:border-brandGreen'
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
