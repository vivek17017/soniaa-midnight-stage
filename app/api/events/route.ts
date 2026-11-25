import {portfolioRequest,isId,isTopic,json,readBody} from "@/lib/server-data";

export async function POST(request:Request) {
  try {
    const b = await readBody(request);
    if (!b || !isId(b.visit) || !isTopic(b.topic) || !["visit","story_open","form_start"].includes(String(b.event))) return json({error:"Invalid event."},400);
    if ((b.event === "visit" && b.topic !== "direct") || (b.event === "story_open" && b.topic === "direct")) return json({error:"Invalid topic."},400);
    await portfolioRequest("event", {visit:b.visit, event:b.event, topic:b.topic});
    return new Response(null,{status:204,headers:{"Cache-Control":"no-store"}});
  } catch { return json({error:"Unavailable."},503); }
}
