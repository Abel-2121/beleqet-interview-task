/** 404 page — shown when a route does not match any page. */
import Link from "next/link";

/** Renders a centered 404 message with a "Back to Home" link. */
export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      {/* Error code */}
      <p className="text-brandGreen font-extrabold text-sm">404</p>
      <h1 className="text-pageH1 mt-2">Page not found</h1>
      <p className="text-muted mt-3">The page you&apos;re looking for doesn&apos;t exist.</p>
      {/* Navigation back to homepage */}
      <Link href="/" className="inline-block mt-6 rounded-full bg-brandGreen text-white text-sm font-semibold px-6 py-3 hover:bg-darkGreen transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
