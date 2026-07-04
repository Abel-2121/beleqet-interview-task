/** About page — describes the Beleqet platform mission and ecosystem. */
export const metadata = { title: "About Us | Beleqet Jobs" };

/** Renders the "About Beleqet" information page with company background. */
export default function AboutPage() {
  return (
    <div className="container-page py-16 max-w-3xl">
      <h1 className="text-pageH1">About Beleqet</h1>
      {/* Mission statement */}
      <p className="text-muted mt-5 leading-relaxed">
        Beleqet is Ethiopia&apos;s job discovery platform, connecting job seekers with verified opportunities from
        trusted employers across the country. We built Beleqet to make job search faster, mobile-first, and
        connected to where Ethiopians already are — Telegram, Facebook, and the web.
      </p>
      {/* Ecosystem overview */}
      <p className="text-muted mt-4 leading-relaxed">
        Beyond job listings, the Beleqet ecosystem includes Beleqet Academy for digital skills training and a
        growing freelance marketplace, all designed around one goal: helping people find their next opportunity
        faster.
      </p>
    </div>
  );
}
