import { env } from "cloudflare:workers";
import { intents, topicLabels, type Intent, type Topic } from "./portfolio";

export const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isId = (value: unknown): value is string => typeof value === "string" && uuid.test(value);
export const isTopic = (value: unknown): value is Topic => typeof value === "string" && Object.hasOwn(topicLabels, value);
export const isIntent = (value: unknown): value is Intent => typeof value === "string" && Object.hasOwn(intents, value);

type Operation = "event" | "save" | "claim" | "finish" | "report";
export async function portfolioRequest<T>(operation: Operation, payload: object = {}): Promise<T> {
  const base = env.SUPABASE_URL;
  const apiKey = env.SUPABASE_PUBLISHABLE_KEY;
  const serverToken = env.PORTFOLIO_DATABASE_TOKEN;
  if (!base || !apiKey || !serverToken) throw new Error("Portfolio storage is not configured");
  const response = await fetch(new URL("/rest/v1/rpc/portfolio_request", base), {
    method: "POST",
    headers: {"Content-Type": "application/json", apikey: apiKey, "x-portfolio-key": serverToken},
    body: JSON.stringify({operation, payload}),
    redirect: "manual",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    console.error("Portfolio storage request failed", operation, response.status);
    throw new Error("Portfolio storage unavailable");
  }
  return await response.json() as T;
}
export function json(value: unknown, status = 200) {
  return Response.json(value, {status, headers: {"Cache-Control": "private, no-store", "X-Content-Type-Options":"nosniff"}});
}
export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return null;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin && origin !== env.SITE_ORIGIN) return null;
  if (request.headers.get("sec-fetch-site") === "cross-site" || Number(request.headers.get("content-length")) > 16000) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks = [], decoder = new TextDecoder();
  let bytes = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    bytes += chunk.value.length;
    if (bytes > 16000) { await reader.cancel(); return null; }
    chunks.push(decoder.decode(chunk.value, {stream:true}));
  }
  try {
    const value = JSON.parse(chunks.join("") + decoder.decode());
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch { return null; }
}
export type Enquiry = {
  id: string; visit: string; name: string; email: string; topic: Topic; intent: Intent;
  message: string; created_at: number; notification: string; attempted_at: number;
};
export function parseEnquiry(data: Record<string, unknown>) {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  if (!isId(data.id) || !isId(data.visit) || !isTopic(data.topic) || !isIntent(data.intent)) return null;
  if (!name || name.length > 100 || /[\r\n]/.test(name)) return null;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (message.length < 5 || message.length > 4000) return null;
  return {id:data.id, visit:data.visit, topic:data.topic, intent:data.intent, name, email, message};
}
export function isOwner(user: {email: string} | null) {
  return Boolean(user?.email && env.REPORT_OWNER_EMAIL && user.email.toLowerCase() === env.REPORT_OWNER_EMAIL.toLowerCase());
}
