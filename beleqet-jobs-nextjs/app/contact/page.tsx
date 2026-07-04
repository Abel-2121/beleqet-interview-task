/** Contact page — contact form with company details and EmailJS integration. */
"use client";

import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { sendEmailJs, isEmailJsConfigured } from "@/lib/emailjs";

/** Renders the contact page with a form and company contact info sidebar. */
export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  /** Handles form submission — validates EmailJS config and sends the message. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEmailJsConfigured()) {
      setError("Email service is not configured. Please email support@beleqet.com directly.");
      return;
    }

    try {
      setSending(true);
      await sendEmailJs({
        user_name: name,
        reply_to: email,
        to_email: "support@beleqet.com",
        subject: `Contact form: ${name}`,
        message: `From: ${name} (${email})\n\n${message}`,
      });
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-page py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Left column — contact info */}
      <div>
        <h1 className="text-pageH1">Get in touch</h1>
        <p className="text-muted mt-4 leading-relaxed">
          Have a question about a job listing, your account, or partnering with Beleqet? Send us a message and our
          team will get back to you.
        </p>

        {/* Contact details with icons */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 text-sm text-ink">
            <MapPin className="h-4 w-4 text-brandGreen" /> Addis Ababa, Ethiopia
          </div>
          <div className="flex items-center gap-3 text-sm text-ink">
            <Mail className="h-4 w-4 text-brandGreen" /> support@beleqet.com
          </div>
          <div className="flex items-center gap-3 text-sm text-ink">
            <Send className="h-4 w-4 text-brandGreen" /> Beleqet Telegram Channel
          </div>
        </div>
      </div>

      {/* Right column — contact form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-white p-7 space-y-4"
      >
        {submitted ? (
          // Success message after submission
          <p className="text-sm text-brandGreen font-semibold">Thanks — your message has been sent.</p>
        ) : (
          <>
            {error && (
              // Error alert
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
            {/* Name input */}
            <div>
              <label className="text-xs font-semibold text-ink">Full Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen"
              />
            </div>
            {/* Email input */}
            <div>
              <label className="text-xs font-semibold text-ink">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen"
              />
            </div>
            {/* Message textarea */}
            <div>
              <label className="text-xs font-semibold text-ink">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen"
              />
            </div>
            {/* Submit button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-full bg-brandGreen text-white text-sm font-semibold py-3 hover:bg-darkGreen transition-colors disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
