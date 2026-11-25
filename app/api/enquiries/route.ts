import { after } from "next/server";
import {portfolioRequest, json, parseEnquiry, readBody} from "@/lib/server-data";
import {notifyEnquiry} from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const raw = await readBody(request);
    if (!raw) return json({error:"Send a valid enquiry from this form."}, 400);
    if (raw.website) return json({error:"Please clear the extra field and try again."}, 400);
    const entry = parseEnquiry(raw);
    if (!entry) return json({error:"Check your name, email, topic, and message (5–4,000 characters)."},422);
    const {id} = entry;
    const saved = await portfolioRequest<"created" | "duplicate" | "conflict" | "limited">("save",entry);
    if (saved === "duplicate") return json({saved:true, reference:id});
    if (saved === "conflict") return json({error:"This enquiry reference is already in use. Please edit your message and try again."},409);
    if (saved === "limited") return json({error:"Several messages have already been saved. Please try later or connect on LinkedIn."},429);
    if (saved !== "created") throw new Error("Unexpected enquiry status");
    after(async () => {
  try {
    await notifyEnquiry(id);
  } catch {
    console.error("Notification attempt unavailable. The enquiry remains saved.");
  }
});
    return json({saved:true,reference:id},201);
  } catch { return json({error:"The enquiry could not be confirmed. Your draft is still here. Please try again."},503); }
}
