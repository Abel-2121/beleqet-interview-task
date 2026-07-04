import emailjs from '@emailjs/browser';

// EmailJS credentials from environment variables
const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

/** Check whether all required EmailJS environment variables are set. */
export function isEmailJsConfigured(): boolean {
  return Boolean(serviceId && templateId && publicKey);
}

/** Send an email via the configured EmailJS service/template. */
export async function sendEmailJs(
  templateParams: Record<string, string>,
): Promise<void> {
  if (!isEmailJsConfigured()) {
    throw new Error('EmailJS is not configured');
  }
  await emailjs.send(serviceId, templateId, templateParams, publicKey);
}
