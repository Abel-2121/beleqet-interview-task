import { Suspense } from "react";
import JobsListing from "@/components/JobsListing";

export const metadata = {
  title: "Find Jobs | Beleqet Jobs",
};

/** Public jobs listing page with search, filters, and paginated results */
export default function JobsPage() {
  return (
    <Suspense fallback={<div className="container-page py-20 text-center text-muted">Loading jobs…</div>}>
      <JobsListing />
    </Suspense>
  );
}
