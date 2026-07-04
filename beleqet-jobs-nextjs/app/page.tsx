/** Home page — landing page showcasing hero, stats, categories, featured jobs, and CTA. */
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedJobs from "@/components/FeaturedJobs";
import WhyChoose from "@/components/WhyChoose";
import CTABanner from "@/components/CTABanner";

/** Renders the full landing page by composing all homepage sections. */
export default function HomePage() {
  return (
    <>
      {/* Hero banner section */}
      <Hero />
      {/* Stats counter bar */}
      <StatsBar />
      {/* Job category grid */}
      <CategoryGrid />
      {/* Featured / trending job listings */}
      <FeaturedJobs />
      {/* "Why choose us" value proposition */}
      <WhyChoose />
      {/* Call-to-action banner */}
      <CTABanner />
    </>
  );
}
