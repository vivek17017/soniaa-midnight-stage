import type { Topic } from "./portfolio";

let visitId: string | undefined;
export function visit() {
  if (visitId) return visitId;
  try {
    visitId = sessionStorage.getItem("soniaa.visit") || crypto.randomUUID();
    sessionStorage.setItem("soniaa.visit", visitId);
  } catch { visitId = crypto.randomUUID(); }
  return visitId;
}
const recorded = new Set<string>();
export function track(event: "visit" | "story_open" | "form_start", topic: Topic = "direct") {
  const key = event + "/" + topic;
  if (recorded.has(key)) return;
  recorded.add(key);
  void fetch("/api/events", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({event, topic, visit:visit()}), keepalive:true})
    .then(response => { if (!response.ok) recorded.delete(key); })
    .catch(() => recorded.delete(key));
}
