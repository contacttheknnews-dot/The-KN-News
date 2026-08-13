"use server";

// Public-facing server actions: newsletter, comments, contact, ad inquiries.
// All inputs are validated server-side and rate limited.

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendNotification } from "@/lib/mailer";

export type ActionResult = { ok: boolean; message: string };

async function clientKey(scope: string): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local";
  return `${scope}:${ip}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function subscribeNewsletter(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!rateLimit(await clientKey("newsletter"), 5)) {
    return { ok: false, message: "कृपया कुछ देर बाद पुनः प्रयास करें।" };
  }
  // honeypot field for bots
  if (formData.get("website")) return { ok: true, message: "धन्यवाद!" };
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "कृपया मान्य ईमेल दर्ज करें।" };
  }
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { active: true },
    create: { email },
  });
  await sendNotification("नया Newsletter Subscriber", [
    { label: "Email", value: email },
  ]);
  return {
    ok: true,
    message: "धन्यवाद! The KN News की ताज़ा खबरें अब आपके इनबॉक्स में पहुंचेंगी।",
  };
}

export async function submitComment(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!rateLimit(await clientKey("comment"), 5)) {
    return { ok: false, message: "कृपया कुछ देर बाद पुनः प्रयास करें।" };
  }
  if (formData.get("website")) return { ok: true, message: "धन्यवाद!" };
  const articleId = Number(formData.get("articleId"));
  const parentIdRaw = formData.get("parentId");
  const parentId = parentIdRaw ? Number(parentIdRaw) : null;
  const name = String(formData.get("name") || "").trim().slice(0, 60);
  const body = String(formData.get("body") || "").trim().slice(0, 2000);
  if (!Number.isInteger(articleId) || !name || body.length < 3) {
    return { ok: false, message: "कृपया नाम और टिप्पणी दोनों भरें।" };
  }
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });
  if (!article) return { ok: false, message: "लेख नहीं मिला।" };
  await prisma.comment.create({
    data: { articleId, parentId, name, body },
  });
  revalidatePath(`/news/${article.slug}`);
  return {
    ok: true,
    message: "टिप्पणी प्राप्त हुई। मॉडरेशन के बाद प्रकाशित की जाएगी।",
  };
}

export async function likeComment(commentId: number): Promise<void> {
  if (!rateLimit(await clientKey(`like:${commentId}`), 3)) return;
  await prisma.comment
    .update({ where: { id: commentId }, data: { likes: { increment: 1 } } })
    .catch(() => {});
}

export async function reportComment(commentId: number): Promise<void> {
  if (!rateLimit(await clientKey(`report:${commentId}`), 3)) return;
  await prisma.comment
    .update({ where: { id: commentId }, data: { reported: true } })
    .catch(() => {});
}

export async function submitContact(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!rateLimit(await clientKey("contact"), 3)) {
    return { ok: false, message: "कृपया कुछ देर बाद पुनः प्रयास करें।" };
  }
  if (formData.get("website")) return { ok: true, message: "धन्यवाद!" };
  const name = String(formData.get("name") || "").trim().slice(0, 80);
  const email = String(formData.get("email") || "").trim().slice(0, 120);
  const subject = String(formData.get("subject") || "").trim().slice(0, 150);
  const message = String(formData.get("message") || "").trim().slice(0, 3000);
  if (!name || !EMAIL_RE.test(email) || message.length < 5) {
    return { ok: false, message: "कृपया सभी आवश्यक फ़ील्ड सही भरें।" };
  }
  await prisma.contactMessage.create({ data: { name, email, subject, message } });
  await sendNotification(
    subject ? `Contact Enquiry: ${subject}` : "नई Contact Enquiry",
    [
      { label: "Name", value: name },
      { label: "Email", value: email },
      { label: "Subject", value: subject },
      { label: "Message", value: message },
    ],
    email
  );
  return { ok: true, message: "आपका संदेश प्राप्त हुआ। हम शीघ्र संपर्क करेंगे।" };
}

export async function submitAdInquiry(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!rateLimit(await clientKey("adinquiry"), 3)) {
    return { ok: false, message: "कृपया कुछ देर बाद पुनः प्रयास करें।" };
  }
  if (formData.get("website")) return { ok: true, message: "धन्यवाद!" };
  const name = String(formData.get("name") || "").trim().slice(0, 80);
  const company = String(formData.get("company") || "").trim().slice(0, 120);
  const email = String(formData.get("email") || "").trim().slice(0, 120);
  const phone = String(formData.get("phone") || "").trim().slice(0, 20);
  const requirement = String(formData.get("requirement") || "").trim().slice(0, 120);
  const budget = String(formData.get("budget") || "").trim().slice(0, 60);
  const message = String(formData.get("message") || "").trim().slice(0, 3000);
  if (!name || !EMAIL_RE.test(email)) {
    return { ok: false, message: "कृपया नाम और मान्य ईमेल दर्ज करें।" };
  }
  await prisma.adInquiry.create({
    data: { name, company, email, phone, requirement, budget, message },
  });
  await sendNotification(
    "नई Advertise With Us Enquiry",
    [
      { label: "Name", value: name },
      { label: "Company", value: company },
      { label: "Email", value: email },
      { label: "Phone", value: phone },
      { label: "Requirement", value: requirement },
      { label: "Budget", value: budget },
      { label: "Message", value: message },
    ],
    email
  );
  return {
    ok: true,
    message: "धन्यवाद! हमारी Advertising Team शीघ्र ही आपसे संपर्क करेगी।",
  };
}
