import emailjs from '@emailjs/browser';

const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

export function isEmailJsConfigured(): boolean {
  return Boolean(serviceId && templateId && publicKey);
}

export async function sendEmailJs(
  templateParams: Record<string, string>,
): Promise<void> {
  if (!isEmailJsConfigured()) {
    throw new Error('EmailJS is not configured');
  }
  await emailjs.send(serviceId, templateId, templateParams, publicKey);
}
