import { redirect } from "next/navigation";

/** Redirect to /dashboard/freelance — bids are managed inside the freelance dashboard */
export default function BidsPage() {
  redirect("/dashboard/freelance");
}
